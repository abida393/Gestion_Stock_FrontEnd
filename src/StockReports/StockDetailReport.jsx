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
        <div className="w-full min-h-screen bg-gray-50 p-6 md:p-10">

            {/* Header avec Fil d'ariane */}
            <header className="mb-8">
                {/* Fil d'ariane (Breadcrumb) */}
                <nav className="flex text-[10px] text-gray-400 mb-6 gap-2 font-bold uppercase tracking-widest">
                    <Link to="/reports" className="hover:text-blue-600 transition-colors">Centre de Rapports</Link> <span>/</span> <span className="text-blue-900">Analyse Détaillée du Stock</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800">Évolution du Stock & Top Produits</h1>
            </header>

            {/* Barres de Filtres Supérieure */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Période</label>
                    <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500">
                        <option>30 derniers jours</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Produit</label>
                    <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500">
                        <option>4 produits sélectionnés</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Catégorie</label>
                    <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Toutes les catégories</option>
                    </select>
                </div>
                <button className="bg-[#1e293b] text-white px-6 py-3 rounded-xl font-bold text-sm mt-5 flex items-center gap-2 hover:bg-slate-800 transition-all">
                    <RefreshCw size={16} /> Mettre à jour
                </button>
            </div>

            {/* Zone Graphique Principal (Stock over time) */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Évolution de la quantité de stock</h2>
                        <p className="text-xs text-gray-400">Agrégation quotidienne des niveaux de stock totaux</p>
                    </div>
                    <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1e293b]"></div> Entrepôt Principal</span>
                        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-teal-500"></div> Stockage Secondaire</span>
                    </div>
                </div>
                {/* Placeholder pour le graphique (Canvas/SVG) */}
                <div className="h-64 w-full bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-gray-300 italic">
                    [ Graphique de zone : Évolution du Stock ]
                </div>
            </div>

            {/* Grille : Distribution & Top 10 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Distribution par catégorie */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-8">Distribution du stock par catégorie</h2>
                    <div className="flex items-center justify-around">
                        <div className="relative w-40 h-40 rounded-full border-[12px] border-teal-500 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-slate-800">14.2k</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Unités Totales</span>
                        </div>
                        <div className="space-y-3">
                            {['Électronique', 'Industriel', 'Matières Premières', 'Autres'].map((cat, i) => (
                                <div key={i} className="flex items-center gap-10 justify-between w-48 text-xs font-bold">
                                    <span className="text-gray-400 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-900' : i === 1 ? 'bg-teal-500' : i === 2 ? 'bg-amber-400' : 'bg-blue-200'}`}></div>
                                        {cat}
                                    </span>
                                    <span className="text-slate-800">{45 - (i * 10)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top 10 Products */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Top 10 produits par volume de mouvement</h2>
                    <div className="space-y-4">
                        {['Intel Core i9', 'Nvidia RTX 4090', 'Samsung 990 Pro'].map((prod, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-700">{prod}</span>
                                    <span className="text-teal-600">4,281 unités</span>
                                </div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full">
                                    <div className="bg-teal-600 h-full rounded-full" style={{ width: `${90 - (i * 15)}%` }}></div>
                                </div>
                            </div>
                        ))}
                        <button className="w-full text-center text-teal-600 text-xs font-bold mt-4 hover:underline">Voir la liste complète (10 articles)</button>
                    </div>
                </div>
            </div>

            {/* Tableau Final : Stock Variation Detail */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Détail de la variation de stock</h2>
                    <div className="flex gap-4">
                        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><Download size={20} /></button>
                        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><Filter size={20} /></button>
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr>
                            <th className="px-8 py-4">Produit</th>
                            <th className="px-8 py-4">Catégorie</th>
                            <th className="px-8 py-4">Stock Initial</th>
                            <th className="px-8 py-4 text-center">Mouvements</th>
                            <th className="px-8 py-4">Stock Final</th>
                            <th className="px-8 py-4 text-right">Variation %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-all">
                                <td className="px-8 py-5 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{p.name}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-medium">{p.sku}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">{p.cat}</span>
                                </td>
                                <td className="px-8 py-5 font-bold text-slate-600">{p.opening.toLocaleString()}</td>
                                <td className={`px-8 py-5 font-bold text-center ${p.movements > 0 ? 'text-teal-600' : 'text-red-500'}`}>
                                    {p.movements > 0 ? `+${p.movements}` : p.movements}
                                </td>
                                <td className="px-8 py-5 font-black text-slate-800">{p.closing.toLocaleString()}</td>
                                <td className="px-8 py-5 text-right">
                                    <div className={`flex items-center justify-end gap-1 font-bold ${p.trend === 'up' ? 'text-teal-600' : 'text-red-500'}`}>
                                        {p.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {p.variation}%
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination */}
                <div className="p-6 bg-gray-50/50 flex justify-between items-center text-xs font-bold text-gray-400">
                    <span>Affichage de 3 sur 152 produits</span>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-slate-800">Précédent</button>
                        <button className="px-4 py-2 bg-[#1e293b] text-white rounded-lg hover:bg-slate-800">Page Suivante</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockDetailReport;