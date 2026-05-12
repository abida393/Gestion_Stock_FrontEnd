import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    Info, Search, Save, RotateCcw,
    ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';
import productService from '../services/productService';
import api from '../services/api';

const ITEMS_PER_PAGE = 10;

const getStatus = (stock, seuil) => {
    if (stock === 0)          return 'CRITIQUE';
    if (stock < seuil)        return 'BAS';
    if (stock < seuil * 1.2)  return 'AVERT.';
    return 'OK';
};

const ThresholdConfig = () => {
    const [products,    setProducts]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [saving,      setSaving]      = useState(false);
    const [search,      setSearch]      = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    // Map<productId, newThreshold> — tracks unsaved edits
    const [edits, setEdits] = useState({});

    /* ── fetch products ── */
    useEffect(() => {
        productService.getAll()
            .then(data => {
                let list = [];
                if (Array.isArray(data))                list = data;
                else if (data?.data?.data)              list = data.data.data;
                else if (data?.data)                    list = data.data;
                setProducts(list);
            })
            .catch(() => toast.error('Impossible de charger les produits.'))
            .finally(() => setLoading(false));
    }, []);

    /* ── derived data ── */
    const filtered = products.filter(p =>
        (p.nom ?? p.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (p.sku ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const hasChanges = Object.keys(edits).length > 0;

    /* ── handlers ── */
    const handleThresholdChange = (id, value) => {
        setEdits(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveOne = async (id) => {
        const newSeuil = edits[id];
        if (newSeuil === undefined) return;
        try {
            await api.put(`/produits/${id}`, { seuil_minimum: Number(newSeuil) });
            setProducts(prev => prev.map(p => p.id === id
                ? { ...p, seuil_minimum: Number(newSeuil), seuil_min: Number(newSeuil) }
                : p
            ));
            setEdits(prev => { const n = { ...prev }; delete n[id]; return n; });
            toast.success('Seuil mis à jour.');
        } catch {
            toast.error('Erreur lors de la mise à jour.');
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        let ok = 0, fail = 0;
        for (const [id, seuil] of Object.entries(edits)) {
            try {
                await api.put(`/produits/${id}`, { seuil_minimum: Number(seuil) });
                setProducts(prev => prev.map(p => Number(p.id) === Number(id)
                    ? { ...p, seuil_minimum: Number(seuil), seuil_min: Number(seuil) }
                    : p
                ));
                ok++;
            } catch { fail++; }
        }
        setEdits({});
        setSaving(false);
        if (fail === 0) toast.success(`${ok} seuil${ok > 1 ? 's' : ''} sauvegardé${ok > 1 ? 's' : ''}.`);
        else            toast.error(`${ok} sauvegardés, ${fail} erreur${fail > 1 ? 's' : ''}.`);
    };

    /* ─────────────────────── render ── */
    return (
        <div className="w-full animate-in fade-in duration-500 pb-24">
            {/* Breadcrumb */}
            <nav className="flex text-[9px] text-slate-400 mb-6 gap-2 font-black uppercase tracking-[0.2em]">
                <Link to="/alerts" className="hover:text-blue-500 transition-colors">Alertes</Link>
                <span className="text-slate-200">/</span>
                <span className="text-slate-500">Configuration</span>
            </nav>

            <header className="mb-6 flex flex-col md:flex-row justify-end items-center gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 shadow-sm text-[13px]"
                    />
                </div>
            </header>

            {/* Info Box */}
            <div className="bg-blue-50/50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-8 flex gap-3 items-start">
                <div className="bg-blue-500 p-1 rounded-full text-white"><Info size={14} /></div>
                <div>
                    <h4 className="text-xs font-bold text-blue-900">Automatisation des alertes active</h4>
                    <p className="text-[11px] text-blue-700/80 leading-relaxed mt-0.5">
                        Modifiez les seuils minimum directement dans le tableau ci-dessous et sauvegardez en un clic.
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Produit</th>
                                <th className="px-6 py-4 text-center">Stock</th>
                                <th className="px-6 py-4 text-center">Seuil Min.</th>
                                <th className="px-6 py-4 text-center">Statut</th>
                                <th className="px-6 py-4">MAJ</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[13px]">
                            {loading && (
                                <tr><td colSpan={6} className="px-6 py-14 text-center">
                                    <Loader2 className="w-6 h-6 text-slate-300 animate-spin inline" />
                                </td></tr>
                            )}
                            {!loading && paginated.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-14 text-center text-slate-400 italic text-sm">
                                    Aucun produit trouvé.
                                </td></tr>
                            )}
                            {!loading && paginated.map(p => {
                                const stock     = p.stock_actuel ?? p.stock ?? p.quantite ?? 0;
                                const seuil     = edits[p.id] !== undefined ? Number(edits[p.id]) : (p.seuil_minimum ?? p.seuil_min ?? 0);
                                const origSeuil = p.seuil_minimum ?? p.seuil_min ?? 0;
                                const status    = getStatus(stock, seuil);
                                const changed   = edits[p.id] !== undefined;

                                return (
                                    <tr key={p.id} className={`hover:bg-slate-50/50 transition-all border-none ${changed ? 'bg-amber-50/30' : ''}`}>
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-black uppercase">
                                                    {(p.nom ?? p.name ?? '?')[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{p.nom ?? p.name}</p>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-tight">
                                                        {p.sku ?? '—'} • {p.categorie?.nom ?? p.categorie?.name ?? '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                                stock < origSeuil
                                                    ? 'bg-red-50 text-red-500 border border-red-100'
                                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            }`}>
                                                {stock.toLocaleString('fr-FR')} u.
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={edits[p.id] !== undefined ? edits[p.id] : origSeuil}
                                                    onChange={e => handleThresholdChange(p.id, e.target.value)}
                                                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-[12px]"
                                                />
                                                <span className="text-[8px] font-black text-slate-300 uppercase">pcs</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    status === 'OK'      ? 'bg-emerald-500' :
                                                    status === 'AVERT.'  ? 'bg-blue-400' :
                                                    status === 'BAS'     ? 'bg-amber-500' : 'bg-red-500'
                                                }`} />
                                                <span className={`text-[9px] font-black uppercase tracking-wider ${
                                                    status === 'OK'      ? 'text-emerald-600' :
                                                    status === 'AVERT.'  ? 'text-blue-500' :
                                                    status === 'BAS'     ? 'text-amber-600' : 'text-red-600'
                                                }`}>{status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-[11px] font-bold text-slate-400">
                                            {p.updated_at
                                                ? new Date(p.updated_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            {changed ? (
                                                <button
                                                    onClick={() => handleSaveOne(p.id)}
                                                    className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md transition-all bg-[#1e293b] text-white hover:bg-black"
                                                >
                                                    Sauver
                                                </button>
                                            ) : (
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50">
                    <span>
                        {filtered.length === 0 ? '0 produit' :
                            `Articles ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / ${filtered.length}`}
                    </span>
                    <div className="flex gap-1.5 items-center">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1 hover:bg-white rounded-md transition-colors disabled:opacity-40"
                        ><ChevronLeft size={14} /></button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(n => (
                            <button
                                key={n}
                                onClick={() => setCurrentPage(n)}
                                className={`w-7 h-7 rounded-md text-[10px] font-black transition-all ${
                                    currentPage === n ? 'bg-[#1e293b] text-white shadow-sm' : 'hover:bg-white text-slate-500'
                                }`}
                            >{n}</button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1 hover:bg-white rounded-md transition-colors disabled:opacity-40"
                        ><ChevronRight size={14} /></button>
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            {hasChanges && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] bg-white border border-slate-200 shadow-2xl rounded-xl p-3 flex flex-col md:flex-row justify-between items-center gap-4 animate-in slide-in-from-bottom-4 duration-500 z-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-50 text-amber-500 p-2 rounded-lg"><RotateCcw size={18} /></div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 tracking-tight">Modifications en attente</h4>
                            <p className="text-[10px] text-slate-400">{Object.keys(edits).length} seuil{Object.keys(edits).length > 1 ? 's' : ''} modifié{Object.keys(edits).length > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                            onClick={() => setEdits({})}
                        >Annuler</button>
                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="bg-[#1e293b] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-black shadow-md transition-all disabled:opacity-60"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Sauvegarder tout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThresholdConfig;