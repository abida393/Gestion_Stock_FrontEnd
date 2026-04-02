import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Minus, Scale, Search, Filter,
    Download, Calendar, FileText, ChevronLeft, ChevronRight,
    ArrowDownLeft, ArrowUpRight, ShieldCheck
} from 'lucide-react';

const MovementHistory = () => {
    // États pour les filtres (Prêt pour le Backend)
    const [filterType, setFilterType] = useState('Tous');

    // Données simulées (À remplacer par ton API Laravel)
    const movements = [
        { id: 1, date: "24 Oct, 2023", time: "14:22", product: "Processeur X-100", sku: "PR-1024", type: "ENTRÉE", qty: "+250", after: "1 420", user: "Mohamed Amine" },
        { id: 2, date: "24 Oct, 2023", time: "11:05", product: "Unité de Refroidissement", sku: "QC-992", type: "SORTIE", qty: "-45", after: "12", user: "Sarah Jenkins" },
        { id: 3, date: "23 Oct, 2023", time: "09:15", product: "Boîtier Nano Graphene", sku: "CA-8812", type: "ENTRÉE", qty: "+1 200", after: "5 600", user: "David Chen" },
    ];

    return (
        <div className="w-full min-h-screen bg-gray-50 p-4 md:p-10">

            {/* Header Title with Back Link */}
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Historique des Flux</h1>
                    <p className="text-gray-500 mt-2 text-lg">Suivi immuable de toutes les activités d'inventaire.</p>
                </div>
                <Link 
                    to="/movements" 
                    className="flex items-center gap-2 bg-[#1e293b] text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-slate-800 transition-all active:scale-95"
                >
                    <Plus size={20} /> Nouveau Mouvement
                </Link>
            </header>

            {/* Header Stats - 3 colonnes larges */}

            {/* Toolbar - Filtres & Recherche */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8 flex flex-wrap items-center gap-6">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                        <option>Tous les produits</option>
                    </select>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {['Tous', 'ENTRÉE', 'SORTIE'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filterType === t ? 'bg-[#1e293b] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold text-slate-600">
                    <Calendar size={16} /> 01 Oct, 2023 - 31 Oct, 2023
                </div>

                <button className="bg-[#1e293b] text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all ml-auto">
                    <Download size={18} /> Exporter
                </button>
            </div>

            {/* Table Section - Full Width */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr>
                            <th className="px-8 py-5">Date/Heure</th>
                            <th className="px-8 py-5">Produit</th>
                            <th className="px-8 py-5 text-center">Type</th>
                            <th className="px-8 py-5 text-center">Quantité</th>
                            <th className="px-8 py-5 text-center">Stock Final</th>
                            <th className="px-8 py-5">Utilisateur</th>
                            <th className="px-8 py-5 text-right">Note</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {movements.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50/50 transition-all group">
                                <td className="px-8 py-6">
                                    <p className="text-sm font-black text-slate-800">{m.date}</p>
                                    <p className="text-[10px] text-gray-400">{m.time}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-sm font-bold text-teal-800 underline decoration-teal-100 underline-offset-4 cursor-pointer">{m.product}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">SKU: {m.sku}</p>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${m.type === 'ENTRÉE' ? 'bg-teal-100 text-teal-600' : 'bg-red-50 text-red-500'}`}>
                                        {m.type}
                                    </span>
                                </td>
                                <td className={`px-8 py-6 text-center font-black text-lg ${m.qty.startsWith('+') ? 'text-teal-600' : 'text-red-500'}`}>
                                    {m.qty}
                                </td>
                                <td className="px-8 py-6 text-center font-bold text-slate-600">{m.after}</td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                                        <span className="text-xs font-bold text-slate-700">{m.user}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="text-gray-300 hover:text-slate-600 transition-colors">
                                        <FileText size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Large */}
                <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center text-[11px] font-bold text-gray-400">
                    <p>Affichage 1-20 de 214 mouvements</p>
                    <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-white rounded-lg"><ChevronLeft size={16} /></button>
                        <button className="w-8 h-8 bg-[#1e293b] text-white rounded-lg">1</button>
                        <button className="w-8 h-8 hover:bg-white rounded-lg">2</button>
                        <button className="w-8 h-8 hover:bg-white rounded-lg">3</button>
                        <span className="px-2">...</span>
                        <button className="w-8 h-8 hover:bg-white rounded-lg">11</button>
                        <button className="p-2 hover:bg-white rounded-lg"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Audit Banner Footer */}
            <div className="mt-8 bg-gray-100/50 border border-dashed border-gray-200 p-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
                <ShieldCheck className="text-teal-600" size={18} />
                Tous les mouvements sont tracés et immuables. <span className="text-teal-700 font-bold underline cursor-pointer">Télécharger le certificat d'audit</span>
            </div>

        </div>
    );
};

export default MovementHistory;