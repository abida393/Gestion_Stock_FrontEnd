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
        <div className="w-full min-h-screen bg-gray-50 p-6 md:p-10">

            {/* Fil d'ariane */}
            <nav className="flex text-xs text-gray-400 mb-6 gap-2">
                <Link to="/alerts" className="hover:text-blue-500 transition-colors">Alertes</Link> <span>&gt;</span> <span className="font-bold text-blue-900">Configuration des Seuils</span>
            </nav>

            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1e293b]">Configurer les seuils d'alerte</h1>
                    <p className="text-gray-500 mt-2">Définissez les points de déclenchement automatiques pour votre inventaire global.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par SKU ou catégorie..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                </div>
            </header>

            {/* Info Box */}
            <div className="bg-blue-50/50 border-l-4 border-blue-500 p-6 rounded-r-2xl mb-10 flex gap-4 items-start">
                <div className="bg-blue-500 p-1.5 rounded-full text-white">
                    <Info size={16} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-blue-900">Automatisation des alertes activée</h4>
                    <p className="text-xs text-blue-700/80 leading-relaxed mt-1">
                        Les seuils sont actuellement synchronisés avec le moteur logistique global. Les modifications manuelles seront prioritaires pendant 30 jours, sauf indication contraire dans les paramètres système.
                    </p>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5">Produit & Catégorie</th>
                            <th className="px-8 py-5 text-center">Stock Actuel</th>
                            <th className="px-8 py-5 text-center">Seuil Min.</th>
                            <th className="px-8 py-5 text-center">Statut Auto</th>
                            <th className="px-8 py-5">Dernière MAJ</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-all">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden border border-gray-100"></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{p.name}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{p.cat}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.stock < p.threshold ? 'bg-red-50 text-red-500' : 'bg-teal-50 text-teal-600'
                                        }`}>
                                        {p.stock.toLocaleString()} unités
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <input
                                            type="number"
                                            defaultValue={p.threshold}
                                            className="w-20 p-2 bg-gray-100 border border-transparent rounded-lg text-center font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        />
                                        <span className="text-[10px] font-bold text-gray-300 uppercase">pcs</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${p.status === 'OK' ? 'bg-teal-500' : p.status === 'CRITIQUE' ? 'bg-red-500' : 'bg-amber-500'
                                            }`}></div>
                                        <span className={`text-[10px] font-black ${p.status === 'OK' ? 'text-teal-600' : p.status === 'CRITIQUE' ? 'text-red-600' : 'text-amber-600'
                                            }`}>
                                            {p.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-xs font-bold text-slate-400">{p.lastUpdate}</td>
                                <td className="px-8 py-6 text-right">
                                    <button className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${p.id % 2 === 0 ? 'bg-[#0a192f] text-white' : 'text-teal-600 hover:bg-teal-50'
                                        }`}>
                                        Sauvegarder
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="p-6 bg-gray-50/50 flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span>Affichage 1-4 de 128 articles</span>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-white rounded-lg"><ChevronLeft size={16} /></button>
                        <button className="w-8 h-8 bg-[#1e293b] text-white rounded-lg">1</button>
                        <button className="p-2 hover:bg-white rounded-lg"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Floating Action Bar (Unsaved Changes) */}
            {hasChanges && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] bg-white border border-gray-100 shadow-2xl rounded-3xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-slide-up">
                    <div className="flex items-center gap-4">
                        <div className="bg-teal-50 text-teal-600 p-3 rounded-2xl">
                            <RotateCcw size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">Modifications non sauvegardées</h4>
                            <p className="text-[10px] text-gray-400">Vous avez modifié 2 paramètres de seuil sur la liste.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors" onClick={() => setHasChanges(false)}>Abandonner</button>
                        <button className="bg-[#0a192f] text-white px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-3 hover:bg-slate-800 shadow-lg shadow-slate-200">
                            <Save size={18} /> Sauvegarder tout
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ThresholdConfig;