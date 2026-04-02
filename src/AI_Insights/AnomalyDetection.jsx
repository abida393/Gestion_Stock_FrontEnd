import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldAlert, Activity, AlertTriangle,
    Search, Play, Calendar, Download,
    MoreVertical, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

const AnomalyDetection = () => {
    // États pour le backend
    const [anomalies, setAnomalies] = useState([
        { id: 1, date: "24 Oct, 14:02", product: "Titanium Rod 45mm", type: "SORTIE MASSIVE", qty: "4,500 unités", score: 94, user: "J. Doe" },
        { id: 2, date: "23 Oct, 09:15", product: "Ethanol Grade B", type: "ÉCART INV.", qty: "+25 unités", score: 72, user: "Système_Auto" },
        { id: 3, date: "22 Oct, 11:40", product: "Microchip XC-22", type: "HEURE INHAB.", qty: "1,200 unités", score: 45, user: "M. Smith" },
    ]);

    return (
        <div className="w-full min-h-screen bg-gray-50 p-6 md:p-10">

            {/* Fil d'ariane */}
            <nav className="flex text-xs text-gray-400 mb-6 gap-2">
                <Link to="/ai-insights" className="hover:text-blue-500 transition-colors">Analyses IA</Link> <span>&gt;</span> <span className="font-bold text-blue-900">Détection d'Anomalies</span>
            </nav>

            <header className="mb-8">
                <h1 className="text-3xl font-black text-[#1e293b] flex items-center gap-3">
                    IA — <span className="text-blue-600 font-extrabold uppercase tracking-tighter">Détection d'Anomalies</span>
                </h1>
            </header>

            {/* Hero Banner */}
            <div className="w-full bg-[#1e293b] rounded-[2rem] p-8 mb-10 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-2xl font-bold mb-2">Détection d'Anomalies Augmentée</h2>
                    <p className="text-slate-400 leading-relaxed">
                        Nos moteurs neuronaux surveillent actuellement plus de 42 000 mouvements.
                        Le Deep Learning identifie les irrégularités de flux, les pics de volume inattendus et les comportements utilisateurs inhabituels.
                    </p>
                </div>
                <div className="absolute top-8 right-8 bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs font-bold uppercase tracking-widest">Moteur Actif</p>
                </div>
            </div>

            {/* Barre de contrôle */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-10 flex flex-col lg:flex-row items-end gap-6">
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Portée des produits</label>
                    <select className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Toutes les catégories</option>
                    </select>
                </div>
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Période d'analyse</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" value="30 derniers jours" readOnly className="w-full pl-12 p-4 bg-gray-50 rounded-xl border-none font-bold text-slate-700 cursor-default" />
                    </div>
                </div>
                <button className="bg-[#1e293b] text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95">
                    <Zap size={18} fill="currentColor" /> Lancer la détection
                </button>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Mouvements Analysés</p>
                        <Activity className="text-blue-500" size={20} />
                    </div>
                    <h3 className="text-4xl font-black text-slate-800">124 802</h3>
                    <p className="text-xs text-green-500 font-bold mt-2">↑ 12% depuis le dernier cycle</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Anomalies Détectées</p>
                        <AlertTriangle className="text-amber-500" size={20} />
                    </div>
                    <h3 className="text-4xl font-black text-slate-800">14</h3>
                    <p className="text-xs text-gray-400 font-bold mt-2">Réparties sur 8 catégories</p>
                </div>
                <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] font-black text-red-400 uppercase">Risque Critique</p>
                        <ShieldAlert className="text-red-500" size={20} />
                    </div>
                    <h3 className="text-4xl font-black text-red-600">03</h3>
                    <p className="text-xs text-red-500 font-bold mt-2">Nécessite une revue immédiate</p>
                </div>
            </div>

            {/* Liste des anomalies */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Liste des Anomalies Détectées</h2>
                    <div className="flex gap-2">
                        <button className="p-2 bg-gray-50 text-gray-400 rounded-lg"><Download size={20} /></button>
                        <button className="p-2 bg-gray-50 text-gray-400 rounded-lg"><MoreVertical size={20} /></button>
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr>
                            <th className="px-8 py-5">Date</th>
                            <th className="px-8 py-5">Produit</th>
                            <th className="px-8 py-5">Type</th>
                            <th className="px-8 py-5">Quantité</th>
                            <th className="px-8 py-5">Score de risque</th>
                            <th className="px-8 py-5">Utilisateur</th>
                            <th className="px-8 py-5">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {anomalies.map((a) => (
                            <tr key={a.id} className="hover:bg-gray-50/50 transition-all">
                                <td className="px-8 py-6 text-sm font-bold text-slate-500">{a.date}</td>
                                <td className="px-8 py-6">
                                    <span className="text-sm font-bold text-slate-800">{a.product}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[9px] font-black bg-red-50 text-red-500 px-3 py-1 rounded-full">{a.type}</span>
                                </td>
                                <td className="px-8 py-6 text-sm font-bold text-slate-600">{a.qty}</td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-gray-100 h-1.5 rounded-full w-24">
                                            <div className={`h-full rounded-full ${a.score > 80 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${a.score}%` }}></div>
                                        </div>
                                        <span className="text-xs font-black text-slate-800">{a.score}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-xs font-bold text-slate-500">{a.user}</td>
                                <td className="px-8 py-6">
                                    <button className="bg-[#1e293b] text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600">Revoir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination */}
                <div className="p-6 bg-gray-50/50 flex justify-between items-center text-xs font-bold text-gray-400">
                    <span>Affichage de 3 sur 14 anomalies détectées</span>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-slate-800 flex items-center gap-1"><ChevronLeft size={14} /> Précédent</button>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-slate-800 flex items-center gap-1">Suivant <ChevronRight size={14} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnomalyDetection;