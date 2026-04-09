import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Info, Search, Save, RotateCcw,
    ChevronLeft, ChevronRight, AlertCircle, CheckCircle2
} from 'lucide-react';

const ThresholdConfig = () => {
    // Simulation de données (À remplacer par ton API Laravel)
    const [products, setProducts] = useState([
        { id: 1, name: "UltraGlide Velocity X1", cat: "Chaussures / Athlétisme", stock: 1240, threshold: 250, status: "OK", lastUpdate: "12 Oct, 14:20" },
        { id: 2, name: "Zenith Chrono Black", cat: "Accessoires / Premium", stock: 12, threshold: 45, status: "CRITIQUE", lastUpdate: "À l'instant" },
        { id: 3, name: "SonicBeam H1 ANC", cat: "Électronique / Audio", stock: 85, threshold: 100, status: "BAS", lastUpdate: "11 Oct, 09:15" },
        { id: 4, name: "Classic Canvas Low", cat: "Chaussures / Casual", stock: 542, threshold: 150, status: "OK", lastUpdate: "10 Oct, 18:30" },
    ]);

    const [hasChanges, setHasChanges] = useState(true); // Pour afficher la barre de sauvegarde en bas

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
                        placeholder="Rechercher..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 shadow-sm text-[13px]"
                    />
                </div>
            </header>

            {/* Info Box */}
            <div className="bg-blue-50/50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-8 flex gap-3 items-start">
                <div className="bg-blue-500 p-1 rounded-full text-white">
                    <Info size={14} />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-blue-900">Automatisation des alertes active</h4>
                    <p className="text-[11px] text-blue-700/80 leading-relaxed mt-0.5">
                        Les seuils sont synchronisés avec le moteur logistique. Les modifications manuelles sont prioritaires temporairement.
                    </p>
                </div>
            </div>

            {/* Table Section */}
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
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-all border-none">
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-slate-100 rounded-lg border border-slate-200"></div>
                                            <div>
                                                <p className="font-bold text-slate-800">{p.name}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-tight">{p.cat}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-center">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${p.stock < p.threshold ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            }`}>
                                            {p.stock.toLocaleString()} u.
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <input
                                                type="number"
                                                defaultValue={p.threshold}
                                                className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-[12px]"
                                            />
                                            <span className="text-[8px] font-black text-slate-300 uppercase">pcs</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'OK' ? 'bg-emerald-500' : p.status === 'CRITIQUE' ? 'bg-red-500' : 'bg-amber-500'
                                                }`}></div>
                                            <span className={`text-[9px] font-black uppercase tracking-wider ${p.status === 'OK' ? 'text-emerald-600' : p.status === 'CRITIQUE' ? 'text-red-600' : 'text-amber-600'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-[11px] font-bold text-slate-400">{p.lastUpdate}</td>
                                    <td className="px-6 py-3.5 text-right">
                                        <button className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md transition-all ${p.id % 2 === 0 ? 'bg-[#1e293b] text-white' : 'text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-100'
                                            }`}>
                                            Sauver
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50">
                    <span>Articles 1-4 / 128</span>
                    <div className="flex gap-1.5">
                        <button className="p-1 hover:bg-white rounded-md transition-colors"><ChevronLeft size={14} /></button>
                        <button className="w-7 h-7 bg-[#1e293b] text-white rounded-md shadow-sm">1</button>
                        <button className="p-1 hover:bg-white rounded-md transition-colors"><ChevronRight size={14} /></button>
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            {hasChanges && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] bg-white border border-slate-200 shadow-2xl rounded-xl p-3 flex flex-col md:flex-row justify-between items-center gap-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-50 text-amber-500 p-2 rounded-lg">
                            <RotateCcw size={18} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 tracking-tight">Modifications en attente</h4>
                            <p className="text-[10px] text-slate-400">2 seuils modifiés</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors" onClick={() => setHasChanges(false)}>Annuler</button>
                        <button className="bg-[#1e293b] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-black shadow-md transition-all">
                            <Save size={16} /> Sauvegarder tout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThresholdConfig;