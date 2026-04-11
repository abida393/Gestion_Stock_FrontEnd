import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Search, Filter,
    Download, Calendar, FileText, ChevronLeft, ChevronRight,
    ArrowDownLeft, ArrowUpRight, ShieldCheck, Loader2
} from 'lucide-react';
import movementService from '../services/movementService';
import productService from '../services/productService';

const MovementHistory = () => {
    const [filterType, setFilterType] = useState('Tous');
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('Tous');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchMovements = async (type) => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (type === 'ENTRÉE') {
                data = await movementService.getEntries();
            } else if (type === 'SORTIE') {
                data = await movementService.getExits();
            } else {
                data = await movementService.getAll();
            }
            let list = [];
            if (Array.isArray(data)) list = data;
            else if (data?.data && Array.isArray(data.data)) list = data.data;
            else if (data?.data?.data && Array.isArray(data.data.data)) list = data.data.data;
            setMovements(list);
        } catch (error) {
            console.error("API error or normalization error:", error);
            setError("Impossible de charger les mouvements.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovements(filterType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterType]);

    useEffect(() => {
        productService.getAll().then((data) => {
            setProducts(Array.isArray(data) ? data : (data.data ?? []));
        }).catch(() => {});
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterType, selectedProduct, startDate, endDate]);

    // Normalise API movement shape
    const normalise = (m) => {
        const isEntry = (m.type ?? '').toLowerCase().includes('entree') || (m.type ?? '').toLowerCase().includes('entrée') || (m.type ?? '').toLowerCase() === 'in';
        const rawDate = m.date || m.date_mouvement || m.created_at;
        return {
            id: m.id,
            product_id: m.produit_id ?? m.product?.id ?? m.produit?.id,
            rawDate: rawDate,
            date: rawDate ? new Date(rawDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            time: rawDate ? new Date(rawDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—',
            product: m.product?.nom ?? m.product?.name ?? m.produit?.nom ?? m.produit?.name ?? '—',
            sku: m.product?.sku ?? m.produit?.sku ?? m.sku ?? '—',
            type: isEntry ? 'ENTRÉE' : 'SORTIE',
            qty: isEntry ? `+${m.quantite ?? m.quantity}` : `-${m.quantite ?? m.quantity}`,
            after: m.stock_apres ?? m.stock_after ?? '—',
            user: m.user?.name ?? m.user?.nom ?? m.utilisateur?.name ?? m.utilisateur?.nom ?? '—',
            note: m.note ?? m.reference ?? '',
        };
    };

    const allNormalised = movements.map(normalise);

    const filteredMovements = allNormalised.filter(m => {
        if (selectedProduct !== 'Tous' && m.product_id?.toString() !== selectedProduct.toString()) return false;
        
        if (startDate && m.rawDate) {
            if (new Date(m.rawDate) < new Date(startDate)) return false;
        }
        if (endDate && m.rawDate) {
            const endD = new Date(endDate);
            endD.setHours(23, 59, 59, 999);
            if (new Date(m.rawDate) > endD) return false;
        }
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filteredMovements.length / itemsPerPage));
    const displayedMovements = filteredMovements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExport = () => {
        const headers = ['Date', 'Heure', 'Produit', 'SKU', 'Type', 'Quantité', 'Stock Final', 'Utilisateur', 'Note'];
        const rows = filteredMovements.map(m => [
            m.date, m.time, m.product, m.sku, m.type, m.qty, m.after, m.user, m.note
        ]);
        const csvContent = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mouvements_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };



    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Action Bar */}
            <header className="mb-6 flex justify-end">
                <Link 
                    to="/movements" 
                    className="flex items-center gap-2 bg-[#1e293b] text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-slate-800 transition-all active:scale-95"
                >
                    <Plus size={16} /> Nouveau Mouvement
                </Link>
            </header>

            {/* Toolbar - Filtres & Recherche */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 mb-6 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                        value={selectedProduct} 
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none text-[13px]"
                    >
                        <option value="Tous">Tous les produits</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.nom ?? p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {['Tous', 'ENTRÉE', 'SORTIE'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === t ? 'bg-[#1e293b] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex flex-col">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-0.5 ml-1">De</label>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus-within:border-blue-400 transition-all">
                            <Calendar size={13} className="text-slate-400 shrink-0" />
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)} 
                                className="bg-transparent outline-none text-slate-700 text-[12px] font-semibold cursor-pointer w-[120px]"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-0.5 ml-1">À</label>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus-within:border-blue-400 transition-all">
                            <Calendar size={13} className="text-slate-400 shrink-0" />
                            <input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)} 
                                className="bg-transparent outline-none text-slate-700 text-[12px] font-semibold cursor-pointer w-[120px]"
                            />
                        </div>
                    </div>
                    {(startDate || endDate) && (
                        <button 
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="mt-3 text-[9px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors tracking-widest"
                        >
                            Effacer
                        </button>
                    )}
                </div>

                <button onClick={handleExport} className="bg-[#1e293b] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all">
                    <Download size={16} /> Exporter
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-3">Date/Heure</th>
                                <th className="px-6 py-3">Produit</th>
                                <th className="px-6 py-3 text-center">Type</th>
                                <th className="px-6 py-3 text-center">Quantité</th>
                                <th className="px-6 py-3 text-center">Stock Final</th>
                                <th className="px-6 py-3">Utilisateur</th>
                                <th className="px-6 py-3 text-right">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && (
                                <tr><td colSpan={7} className="px-6 py-10 text-center"><Loader2 className="w-6 h-6 text-slate-400 animate-spin inline" /></td></tr>
                            )}
                            {!loading && error && (
                                <tr><td colSpan={7} className="px-6 py-6 text-center text-sm text-red-500 font-medium">{error}</td></tr>
                            )}
                            {!loading && !error && displayedMovements.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 text-slate-200" />
                                            <p className="text-sm font-bold text-slate-400">Aucun mouvement trouvé</p>
                                            <p className="text-xs text-slate-300">Modifiez vos filtres ou ajoutez un nouveau mouvement.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!loading && !error && displayedMovements.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-3.5">
                                        <p className="text-[13px] font-black text-slate-800">{m.date}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{m.time}</p>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <p className="text-[13px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors cursor-pointer">{m.product}</p>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-tight">SKU: {m.sku}</p>
                                    </td>
                                    <td className="px-6 py-3.5 text-center">
                                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${m.type === 'ENTRÉE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                                            {m.type}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-3.5 text-center font-black text-[15px] ${m.qty.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {m.qty}
                                    </td>
                                    <td className="px-6 py-3.5 text-center font-bold text-slate-500 text-[13px]">{m.after}</td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-slate-100 rounded-full border border-slate-200"></div>
                                            <span className="text-[11px] font-bold text-slate-600">{m.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        {m.note ? (
                                            <button 
                                                title={m.note} 
                                                className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-all shadow-sm border border-blue-100"
                                            >
                                                <FileText size={16} />
                                            </button>
                                        ) : (
                                            <span className="text-[9px] font-black uppercase text-slate-300">Aucune</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Dynamique */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <p>
                        {filteredMovements.length === 0 ? 'Aucun résultat' : 
                         `${filteredMovements.length} mouvement${filteredMovements.length > 1 ? 's' : ''} • Page ${currentPage} sur ${totalPages}`}
                    </p>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 hover:bg-white rounded-md transition-colors disabled:opacity-50"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            
                            {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                                const p = i + 1;
                                return (
                                    <button 
                                        key={p} 
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-7 h-7 rounded-md text-[10px] font-black transition-all ${currentPage === p ? 'bg-[#1e293b] text-white shadow-sm' : 'hover:bg-white text-slate-600'}`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            
                            {totalPages > 3 && <span className="px-1 text-slate-300">...</span>}
                            {totalPages > 3 && (
                                <button 
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={`w-7 h-7 rounded-md text-[10px] font-black transition-all ${currentPage === totalPages ? 'bg-[#1e293b] text-white shadow-sm' : 'hover:bg-white text-slate-600'}`}
                                >
                                    {totalPages}
                                </button>
                            )}
                            
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 hover:bg-white rounded-md transition-colors disabled:opacity-50"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Audit Status */}
            <div className="mt-6 bg-slate-50 border border-dashed border-slate-200 px-5 py-3 rounded-lg flex items-center justify-between text-[11px] font-bold text-slate-500">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="text-emerald-500" size={16} />
                    <span>Mouvements tracés et sécurisés</span>
                </div>
                <button className="text-emerald-700 font-black uppercase tracking-wider hover:underline">Auditer</button>
            </div>
        </div>
    );
};

export default MovementHistory;