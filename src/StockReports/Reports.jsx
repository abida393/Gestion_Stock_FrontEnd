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
        <div className="w-full min-h-screen bg-gray-50 p-6 md:p-10">

            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Centre de Rapports</h1>
                    <p className="text-gray-500 mt-1">Générez et consultez vos rapports d'inventaire détaillés.</p>
                </div>
                <Link 
                    to="/stock-detail" 
                    className="flex items-center gap-2 bg-[#1e293b] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-slate-800 transition-all active:scale-95"
                >
                    <BarChart3 size={20} /> Analyse Détaillée
                </Link>
            </header>

            {/* SECTION GÉNÉRATION (Main Card) */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12 mb-12">

                {/* Stepper (Visuel uniquement) */}
                <div className="flex justify-center items-center gap-4 mb-12 max-w-2xl mx-auto">
                    <div className="flex flex-col items-center gap-2"><div className="w-10 h-10 rounded-full border-2 border-teal-600 flex items-center justify-center text-teal-600 font-bold">1</div><span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">Portée</span></div>
                    <div className="h-[2px] bg-gray-200 w-24"></div>
                    <div className="flex flex-col items-center gap-2"><div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold">2</div><span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Filtres</span></div>
                    <div className="h-[2px] bg-gray-200 w-24"></div>
                    <div className="flex flex-col items-center gap-2"><div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold">3</div><span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Format</span></div>
                </div>

                <div className="max-w-5xl mx-auto space-y-12">

                    {/* 1. Category Selection */}
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-slate-800">Sélectionner la Catégorie de Rapport</h2>
                        <p className="text-sm text-gray-400 mb-8">Choisissez l'ensemble de données principal pour votre rapport.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { id: 'status', label: 'État des stocks', icon: <FileText size={24} />, desc: 'Niveaux actuels et valorisation.' },
                                { id: 'movement', label: 'Mouvement', icon: <ArrowLeftRight size={24} />, desc: 'Historique des transactions.' },
                                { id: 'alerts', label: 'Alertes', icon: <Bell size={24} />, desc: 'Avertissements du système.' },
                                { id: 'kpi', label: 'Résumé des KPI', icon: <BarChart3 size={24} />, desc: 'Indicateurs de performance.' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setCategory(item.id)}
                                    className={`p-6 rounded-3xl border-2 text-left transition-all ${category === item.id ? 'border-teal-600 bg-teal-50/30 ring-4 ring-teal-50' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}
                                >
                                    <div className={`p-2 rounded-lg w-fit mb-4 ${category === item.id ? 'bg-teal-600 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                                        {item.icon}
                                    </div>
                                    <h3 className="font-bold text-slate-800">{item.label}</h3>
                                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Refine Data */}
                    <div className="pt-8 border-t border-gray-50">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-slate-800">Affiner vos données</h2>
                            <p className="text-sm text-gray-400">Appliquez des filtres pour cibler des périodes spécifiques.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plage de dates</label>
                                <select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 font-medium">
                                    <option>Les 30 derniers jours</option>
                                    <option>Les 6 derniers mois</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catégorie de produit</label>
                                <select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 font-medium">
                                    <option>Tous les produits</option>
                                    <option>Électronique</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 3. Export Format */}
                    <div className="pt-8 border-t border-gray-50 text-center">
                        <h2 className="text-xl font-bold text-slate-800 mb-8">Format d'exportation</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                            <button
                                onClick={() => setFormat('pdf')}
                                className={`p-8 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${format === 'pdf' ? 'border-teal-600 bg-teal-50/20' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                                <FileText size={40} className={format === 'pdf' ? 'text-teal-600' : 'text-gray-300'} />
                                <span className="font-bold">Document PDF</span>
                            </button>
                            <button
                                onClick={() => setFormat('excel')}
                                className={`p-8 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${format === 'excel' ? 'border-teal-600 bg-teal-50/20' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                                <FileSpreadsheet size={40} className={format === 'excel' ? 'text-teal-600' : 'text-gray-300'} />
                                <span className="font-bold">Feuille de calcul Excel</span>
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`w-full bg-[#0d6e60] text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#0a5a4f] transition-all shadow-xl shadow-teal-100 active:scale-[0.98] ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Génération en cours...
                            </>
                        ) : (
                            <>
                                <Download size={24} /> Générer et télécharger
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* TABLEAU : PREVIOUS REPORTS (Full Width) */}
            <section className="w-full">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Rapports précédents</h2>
                        <p className="text-sm text-gray-400 mt-1">Accédez et téléchargez à nouveau vos exportations récemment générées.</p>
                    </div>
                    <button className="text-teal-600 font-bold text-sm flex items-center gap-1 hover:underline">
                        Voir l'Archive <ChevronRight size={16} />
                    </button>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Nom du Rapport</th>
                                <th className="px-8 py-5">Date de Génération</th>
                                <th className="px-8 py-5">Type</th>
                                <th className="px-8 py-5">Statut</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {previousReports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${report.status === 'Expiré' ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-red-500'}`}>
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-bold text-slate-700">{report.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-medium text-slate-600">{report.date}</div>
                                        <div className="text-[10px] text-gray-400">{report.time}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full text-gray-500 uppercase tracking-tighter">
                                            {report.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${report.status === 'Disponible' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                            <span className={`text-xs font-bold ${report.status === 'Disponible' ? 'text-teal-600' : 'text-gray-400'}`}>
                                                {report.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {report.status === 'Disponible' ? (
                                            <button
                                                onClick={() => handleDownload(report.name)}
                                                className="p-2 hover:bg-teal-50 rounded-full text-teal-600 transition-colors"
                                            >
                                                <Download size={20} />
                                            </button>
                                        ) : (
                                            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                                <RefreshCcw size={18} />
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