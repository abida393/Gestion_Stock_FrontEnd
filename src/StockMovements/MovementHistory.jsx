import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Search, Filter,
    Download, Calendar, FileText, ChevronLeft, ChevronRight,
    ArrowDownLeft, ArrowUpRight, ShieldCheck, Loader2
} from 'lucide-react';
import movementService from '../services/movementService';

const MovementHistory = () => {
    const [filterType, setFilterType] = useState('Tous');
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            const list = Array.isArray(data) ? data : (data.data ?? []);
            setMovements(list);
        } catch {
            setError("Impossible de charger les mouvements.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovements(filterType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterType]);

    // Normalise API movement shape
    const normalise = (m) => {
        const isEntry = (m.type ?? '').toLowerCase().includes('entree') || (m.type ?? '').toLowerCase().includes('entrée') || (m.type ?? '').toLowerCase() === 'in';
        return {
            id: m.id,
            date: m.date ? new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            time: m.date ? new Date(m.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—',
            product: m.product?.nom ?? m.product?.name ?? m.produit ?? '—',
            sku: m.product?.sku ?? m.sku ?? '—',
            type: isEntry ? 'ENTRÉE' : 'SORTIE',
            qty: isEntry ? `+${m.quantite ?? m.quantity}` : `-${m.quantite ?? m.quantity}`,
            after: m.stock_apres ?? m.stock_after ?? '—',
            user: m.user?.name ?? m.user?.nom ?? m.utilisateur ?? '—',
        };
    };

    const displayedMovements = movements.map(normalise);



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
                    <select className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none text-[13px]">
                        <option>Tous les produits</option>
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

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg text-[11px] font-bold text-slate-600">
                    <Calendar size={14} /> 01 Oct - 31 Oct, 2023
                </div>

                <button className="bg-[#1e293b] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all">
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
                                        <button className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-all">
                                            <FileText size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <p>Page 1 sur 11</p>
                    <div className="flex items-center gap-1.5">
                        <button className="p-1.5 hover:bg-white rounded-md transition-colors"><ChevronLeft size={14} /></button>
                        {[1, 2, 3].map(p => (
                            <button key={p} className={`w-7 h-7 rounded-md text-[10px] font-black transition-all ${p === 1 ? 'bg-[#1e293b] text-white shadow-sm' : 'hover:bg-white text-slate-600'}`}>{p}</button>
                        ))}
                        <span className="px-1 text-slate-300">...</span>
                        <button className="w-7 h-7 hover:bg-white rounded-md text-[10px] font-black text-slate-600">11</button>
                        <button className="p-1.5 hover:bg-white rounded-md transition-colors"><ChevronRight size={14} /></button>
                    </div>
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