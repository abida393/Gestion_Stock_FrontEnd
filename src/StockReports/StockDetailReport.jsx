import React from 'react';
import { Link } from 'react-router-dom';
import {
    Download, Filter, ChevronLeft, ChevronRight,
    TrendingUp, TrendingDown, Bell, Search, RefreshCw
} from 'lucide-react';

const StockDetailReport = () => {
    // Simulation de données pour le tableau (Backend Ready)
    const products = [
        { id: 1, name: "Intel Core i9-13900K", sku: "CPU-INT-0913", cat: "Electronics", opening: 1420, movements: 280, closing: 1700, variation: 19.7, trend: 'up' },
        { id: 2, name: "Nvidia RTX 4090 FE", sku: "GPU-NVI-4090", cat: "Electronics", opening: 850, movements: -120, closing: 730, variation: 14.1, trend: 'down' },
        { id: 3, name: "Precision Bearing X2", sku: "IND-BEA-X200", cat: "Industrial", opening: 4500, movements: 15, closing: 4515, variation: 0.3, trend: 'up' },
    ];

    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex text-[9px] text-slate-400 mb-6 gap-2 font-black uppercase tracking-[0.2em]">
                <Link to="/reports" className="hover:text-blue-600 transition-colors">Rapports</Link> 
                <span className="text-slate-200">/</span> 
                <span className="text-slate-500">Analyse Détaillée</span>
            </nav>

            {/* Barres de Filtres Supérieure */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 mb-6 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[180px]">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Période</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none">
                        <option>30 derniers jours</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[180px]">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Produits</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none">
                        <option>4 articles sélectionnés</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[180px]">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Catégorie</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none">
                        <option>Toutes les catégories</option>
                    </select>
                </div>
                <button className="bg-[#1e293b] text-white px-5 py-2 rounded-lg font-bold text-xs mt-3.5 flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md">
                    <RefreshCw size={14} /> Actualiser
                </button>
            </div>

            {/* Zone Graphique Principal */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6 font-medium">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-base font-bold text-slate-800 tracking-tight">Analyse de l'Évolution des Stocks</h2>
                        <p className="text-[11px] text-slate-400">Niveaux cumulés sur l'ensemble des dépôts</p>
                    </div>
                    <div className="flex gap-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#1e293b]"></div> Principal</span>
                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div> Secondaire</span>
                    </div>
                </div>
                <div className="h-56 w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs italic">
                    [ Graphique de tendance : Fluctuations journalières ]
                </div>
            </div>

            {/* Grille : Distribution & Top 10 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-base font-bold text-slate-800 mb-6 tracking-tight">Répartition par Catégorie</h2>
                    <div className="flex items-center justify-around gap-4">
                        <div className="relative w-32 h-32 rounded-full border-[10px] border-teal-500 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-slate-800">14.2k</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Articles</span>
                        </div>
                        <div className="space-y-2.5">
                            {['Électronique', 'Industriel', 'Matières P.', 'Autres'].map((cat, i) => (
                                <div key={i} className="flex items-center gap-6 justify-between w-40 text-[11px] font-bold">
                                    <span className="text-slate-400 flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-blue-900' : i === 1 ? 'bg-teal-500' : i === 2 ? 'bg-amber-400' : 'bg-blue-200'}`}></div>
                                        {cat}
                                    </span>
                                    <span className="text-slate-800">{45 - (i * 10)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-base font-bold text-slate-800 mb-5 tracking-tight">Mouvements Majeurs (Top 10)</h2>
                    <div className="space-y-3.5">
                        {['Intel Core i9', 'Nvidia RTX 4090', 'Samsung 990 Pro'].map((prod, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-[11px] font-bold">
                                    <span className="text-slate-600">{prod}</span>
                                    <span className="text-teal-600">4,281 u.</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                    <div className="bg-teal-500 h-full rounded-full" style={{ width: `${90 - (i * 15)}%` }}></div>
                                </div>
                            </div>
                        ))}
                        <button className="w-full text-center text-teal-600 text-[11px] font-black uppercase tracking-wider mt-2 hover:bg-slate-50 py-1.5 rounded-md transition-colors">Liste complète des articles</button>
                    </div>
                </div>
            </div>

            {/* Tableau Final */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white">
                    <h2 className="text-[15px] font-bold text-slate-800">Détail des Variations de Stock</h2>
                    <div className="flex gap-2 text-slate-400">
                        <button className="p-1.5 hover:bg-slate-50 rounded-md transition-colors"><Download size={16} /></button>
                        <button className="p-1.5 hover:bg-slate-50 rounded-md transition-colors"><Filter size={16} /></button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3">Produit</th>
                            <th className="px-6 py-3">Catégorie</th>
                            <th className="px-6 py-3">Stock Initial</th>
                            <th className="px-6 py-3 text-center">Flux</th>
                            <th className="px-6 py-3">Stock Final</th>
                            <th className="px-6 py-3 text-right">Variation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {products.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-all group border-none">
                                <td className="px-6 py-3.5 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 rounded-md border border-slate-200"></div>
                                    <div>
                                        <p className="text-[13px] font-bold text-slate-800">{p.name}</p>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-tight">{p.sku}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-3.5">
                                    <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-wider">{p.cat}</span>
                                </td>
                                <td className="px-6 py-3.5 font-bold text-slate-500 text-[13px]">{p.opening.toLocaleString()}</td>
                                <td className={`px-6 py-3.5 font-black text-center text-[13px] ${p.movements > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {p.movements > 0 ? `+${p.movements}` : p.movements}
                                </td>
                                <td className="px-6 py-3.5 font-black text-slate-800 text-[13px]">{p.closing.toLocaleString()}</td>
                                <td className="px-6 py-3.5 text-right">
                                    <div className={`flex items-center justify-end gap-1 text-[11px] font-black uppercase tracking-wider ${p.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {p.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {p.variation}%
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50">
                    <span>Page 1 sur 24</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 transition-colors">Précédent</button>
                        <button className="px-3 py-1.5 bg-[#1e293b] text-white rounded-md hover:bg-black shadow-sm transition-colors">Suivant</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockDetailReport;