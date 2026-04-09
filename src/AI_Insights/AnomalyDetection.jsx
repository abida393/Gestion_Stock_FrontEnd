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
        <div className="w-full animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex text-[9px] text-slate-400 mb-6 gap-2 font-black uppercase tracking-[0.2em]">
                <Link to="/ai-insights" className="hover:text-blue-500 transition-colors">Analyses IA</Link> 
                <span className="text-slate-200">/</span> 
                <span className="text-slate-500">Anomalies</span>
            </nav>

            {/* Hero Banner */}
            <div className="w-full bg-[#1e293b] rounded-xl p-6 mb-8 text-white relative overflow-hidden shadow-lg border border-slate-700">
                <div className="relative z-10 max-w-xl">
                    <h2 className="text-xl font-bold mb-1.5 tracking-tight">Détection d'Anomalies</h2>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        Moteurs neuronaux actifs. Surveillance continue des flux logistiques pour identifier les irrégularités et pics inhabituels.
                    </p>
                </div>
                <div className="absolute top-6 right-6 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Analyste Actif</p>
                </div>
            </div>

            {/* Barre de contrôle */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Catégorie</label>
                    <select className="w-full px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 text-[13px] appearance-none">
                        <option>Toutes les catégories</option>
                    </select>
                </div>
                <div className="flex-1 w-full">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Période d'analyse</label>
                    <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" value="30 derniers jours" readOnly className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-700 cursor-default text-[13px]" />
                    </div>
                </div>
                <button className="bg-[#1e293b] text-white px-8 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-md">
                    <Zap size={16} fill="currentColor" /> Lancer
                </button>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Mouvements</p>
                        <Activity className="text-blue-500" size={16} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">124 802</h3>
                    <p className="text-[10px] text-emerald-500 font-bold mt-1 tracking-tight">↑ 12% cycle précédent</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Anomalies</p>
                        <AlertTriangle className="text-amber-500" size={16} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">14</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tight">8 catégories actives</p>
                </div>
                <div className="bg-red-50/50 p-5 rounded-xl border border-red-100">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-wider">Risques</p>
                        <ShieldAlert className="text-red-500" size={16} />
                    </div>
                    <h3 className="text-2xl font-black text-red-600">03</h3>
                    <p className="text-[10px] text-red-500 font-bold mt-1 tracking-tight">Action requise</p>
                </div>
            </div>

            {/* Liste des anomalies */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                    <h2 className="text-[15px] font-bold text-slate-800">Alertes Récentes</h2>
                    <div className="flex gap-1.5 text-slate-400">
                        <button className="p-1.5 hover:bg-slate-50 rounded-md transition-colors"><Download size={16} /></button>
                        <button className="p-1.5 hover:bg-slate-50 rounded-md transition-colors"><MoreVertical size={16} /></button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Produit</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Quantité</th>
                                <th className="px-6 py-3">Risque</th>
                                <th className="px-6 py-3">Agent</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {anomalies.map((a) => (
                                <tr key={a.id} className="hover:bg-slate-50/50 transition-all border-none group">
                                    <td className="px-6 py-4 text-[13px] font-medium text-slate-400">{a.date}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-bold text-slate-700">{a.product}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[9px] font-black bg-red-50 text-red-500 px-2 py-0.5 rounded-md uppercase tracking-wide">{a.type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-[13px] font-bold text-slate-500">{a.qty}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-slate-100 h-1 rounded-full w-20">
                                                <div className={`h-full rounded-full ${a.score > 80 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${a.score}%` }}></div>
                                            </div>
                                            <span className="text-[11px] font-black text-slate-700">{a.score}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{a.user}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="bg-slate-900 text-white px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-colors">Détails</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/50 flex justify-between items-center text-[10px] font-bold text-slate-400 border-t border-slate-50">
                    <span>Affichage 3 / 14</span>
                    <div className="flex gap-1.5">
                        <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 flex items-center gap-1 transition-colors"><ChevronLeft size={14} /> Précedent</button>
                        <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 flex items-center gap-1 transition-colors">Suivant <ChevronRight size={14} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnomalyDetection;