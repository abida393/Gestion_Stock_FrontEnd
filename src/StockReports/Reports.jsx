import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
    FileText, BarChart3, Bell, ArrowLeftRight,
    Download, Calendar, Filter, FileSpreadsheet,
    ChevronRight, RefreshCcw, Search, ExternalLink
} from 'lucide-react';

const Reports = () => {
    // États pour le formulaire
    const [category, setCategory] = useState('status');
    const [format, setFormat] = useState('pdf');

    // Simulation de données vides pour le tableau (Backend ready)
    const [previousReports, setPreviousReports] = useState([
        { id: 1, name: "Synthèse_Valorisation_Stock_T3", date: "Oct 24, 2023", time: "14:32", type: "ÉTAT DU STOCK", status: "Disponible" },
        { id: 2, name: "Journal_Mouvements_Mensuel_Sept", date: "Oct 02, 2023", time: "09:15", type: "MOUVEMENT", status: "Disponible" },
        { id: 3, name: "Audit_Alertes_Entrepot_FY23", date: "Sep 28, 2023", time: "11:45", type: "ALERTES", status: "Expiré" },
    ]);

    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulation d'un appel API (Backend Integration Stub)
        setTimeout(() => {
            setIsGenerating(false);
            const newReport = {
                id: Date.now(),
                name: `Rapport_${category.toUpperCase()}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'YYYY' }),
                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                type: category.toUpperCase(),
                status: "Disponible"
            };
            setPreviousReports([newReport, ...previousReports]);
            toast.success("Rapport généré avec succès !");
        }, 2500);
    };

    const handleDownload = (reportName) => {
        toast.success(`Téléchargement de "${reportName}" en cours...`);
    };

    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Header d'actions */}
            <header className="mb-6 flex justify-end">
                <Link
                    to="/reports/detail"
                    className="flex items-center gap-2 bg-[#1e293b] text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md shadow-blue-100/20 hover:bg-slate-800 transition-all active:scale-95"
                >
                    <BarChart3 size={16} /> Analyse Détaillée
                </Link>
            </header>

            {/* SECTION GÉNÉRATION (Main Card) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-10 mb-10">

                {/* Stepper */}
                <div className="flex justify-center items-center gap-4 mb-10 max-w-xl mx-auto">
                    <div className="flex flex-col items-center gap-1.5"><div className="w-8 h-8 rounded-full border-2 border-teal-600 flex items-center justify-center text-teal-600 font-bold text-xs">1</div><span className="text-[9px] font-bold uppercase tracking-widest text-teal-600">Portée</span></div>
                    <div className="h-[1px] bg-slate-100 w-20"></div>
                    <div className="flex flex-col items-center gap-1.5"><div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-300 font-bold text-xs">2</div><span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Filtres</span></div>
                    <div className="h-[1px] bg-slate-100 w-20"></div>
                    <div className="flex flex-col items-center gap-1.5"><div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-300 font-bold text-xs">3</div><span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Format</span></div>
                </div>

                <div className="max-w-4xl mx-auto space-y-10">

                    {/* 1. Category Selection */}
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-slate-800">Catégorie de Rapport</h2>
                        <p className="text-xs text-slate-400 mb-6">Choisissez l'ensemble de données principal.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {[
                                { id: 'status', label: 'État des stocks', icon: <FileText size={18} />, desc: 'Niveaux et valorisation.' },
                                { id: 'movement', label: 'Mouvement', icon: <ArrowLeftRight size={18} />, desc: 'Historique transactions.' },
                                { id: 'alerts', label: 'Alertes', icon: <Bell size={18} />, desc: 'Avertissements système.' },
                                { id: 'kpi', label: 'Résumé KPI', icon: <BarChart3 size={18} />, desc: 'Indicateurs clés.' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setCategory(item.id)}
                                    className={`p-4 rounded-xl border text-left transition-all ${category === item.id ? 'border-teal-600 bg-teal-50/20' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                                >
                                    <div className={`p-2 rounded-lg w-fit mb-3 ${category === item.id ? 'bg-teal-600 text-white' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                                        {item.icon}
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-[13px]">{item.label}</h3>
                                    <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Refine Data */}
                    <div className="pt-6 border-t border-slate-50">
                        <div className="text-center mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Affiner les données</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Période</label>
                                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-600/10 text-[13px] font-medium">
                                    <option>Les 30 derniers jours</option>
                                    <option>Les 6 derniers mois</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Catégorie</label>
                                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-600/10 text-[13px] font-medium">
                                    <option>Tous les produits</option>
                                    <option>Électronique</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 3. Export Format */}
                    <div className="pt-6 border-t border-slate-50 text-center">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">Format d'exportation</h2>
                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                            <button
                                onClick={() => setFormat('pdf')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${format === 'pdf' ? 'border-teal-600 bg-teal-50/20' : 'border-slate-100 hover:bg-slate-50'}`}
                            >
                                <FileText size={32} className={format === 'pdf' ? 'text-teal-600' : 'text-slate-300'} />
                                <span className="font-bold text-[13px]">PDF</span>
                            </button>
                            <button
                                onClick={() => setFormat('excel')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${format === 'excel' ? 'border-teal-600 bg-teal-50/20' : 'border-slate-100 hover:bg-slate-50'}`}
                            >
                                <FileSpreadsheet size={32} className={format === 'excel' ? 'text-teal-600' : 'text-slate-300'} />
                                <span className="font-bold text-[13px]">EXCEL</span>
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`w-full bg-[#0d6e60] text-white py-3.5 rounded-lg font-bold text-base flex items-center justify-center gap-2 hover:bg-[#0a5a4f] transition-all shadow-md active:scale-[0.98] ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Génération...
                            </>
                        ) : (
                            <>
                                <Download size={20} /> Générer et télécharger
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* PREVIOUS REPORTS */}
            <section className="w-full">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Rapports récents</h2>
                    </div>
                    <button className="text-teal-600 font-bold text-[11px] flex items-center gap-1 hover:underline uppercase tracking-wider">
                        Archive <ChevronRight size={14} />
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Document</th>
                                <th className="px-6 py-4">Généré le</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {previousReports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${report.status === 'Expiré' ? 'bg-slate-100 text-slate-400' : 'bg-red-50/50 text-red-500'}`}>
                                                <FileText size={16} />
                                            </div>
                                            <span className="font-bold text-slate-700 text-[13px]">{report.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[13px] font-medium text-slate-600">{report.date}</div>
                                        <div className="text-[9px] text-slate-400">{report.time}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 uppercase tracking-tight">
                                            {report.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${report.status === 'Disponible' ? 'bg-teal-500' : 'bg-slate-300'}`}></div>
                                            <span className={`text-[11px] font-bold ${report.status === 'Disponible' ? 'text-teal-600' : 'text-slate-400'}`}>
                                                {report.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {report.status === 'Disponible' ? (
                                            <button
                                                onClick={() => handleDownload(report.name)}
                                                className="p-2 hover:bg-teal-50 rounded-lg text-teal-600 transition-colors border border-transparent hover:border-teal-100"
                                            >
                                                <Download size={16} />
                                            </button>
                                        ) : (
                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                                <RefreshCcw size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Reports;