import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
    FileText, BarChart3, Bell, ArrowLeftRight, BrainCircuit,
    Download, Calendar, Filter, FileSpreadsheet,
    ChevronRight, ChevronLeft, RefreshCcw, Loader2, Check
} from 'lucide-react';
import reportService from '../services/reportService';
import movementService from '../services/movementService';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const stripHtml = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let text = doc.body.textContent || "";
    return text.replace(/\s+/g, ' ').trim();
};

const fmtDate = (d) => {
    const date = new Date(d ?? Date.now());
    return {
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
};

const PERIODS = [
    { value: 30, label: 'Les 30 derniers jours' },
    { value: 90, label: 'Les 90 derniers jours' },
    { value: 180, label: 'Les 6 derniers mois' },
    { value: 365, label: "L'année en cours" },
];

const CATEGORIES = [
    { id: 'status', label: 'État des stocks', icon: <FileText size={18} />, desc: 'Niveaux, valorisation et statut.' },
    { id: 'movement', label: 'Mouvement', icon: <ArrowLeftRight size={18} />, desc: 'Historique des transactions.' },
    { id: 'alerts', label: 'Alertes', icon: <Bell size={18} />, desc: 'Alertes actives et résolues.' },
    { id: 'kpi', label: 'Résumé KPI', icon: <BarChart3 size={18} />, desc: 'Indicateurs clés de performance.' },
    { id: 'ai', label: 'Prévisions IA', icon: <BrainCircuit size={18} />, desc: 'Prédictions, EOQ et anomalies.' },
];

const Reports = () => {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState('status');
    const [format, setFormat] = useState('csv');
    const [period, setPeriod] = useState(30);
    const [filterCat, setFilterCat] = useState('');
    const [categories, setCategories] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);

    useEffect(() => {
        categoryService.getAll()
            .then(d => setCategories(Array.isArray(d) ? d : (d?.data ?? [])))
            .catch(() => {});
        reportService.getAllReports()
            .then(d => setReports(Array.isArray(d) ? d : (d?.data ?? [])))
            .catch(() => setReports([]))
            .finally(() => setLoadingReports(false));
    }, []);

    const buildCSV = (headers, rows) => {
        const csv = [headers, ...rows]
            .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');
        return '\uFEFF' + csv;
    };

    const downloadBlob = (content, filename, type = 'text/csv;charset=utf-8;') => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        return blob;
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            let rows = [];
            let headers = [];
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - period);

            const filterByCategory = (list) => {
                if (!filterCat) return list;
                return list.filter(p => String(p.categorie_id ?? p.categorie?.id) === String(filterCat));
            };

            if (category === 'status') {
                const data = await productService.getAll();
                const list = filterByCategory(Array.isArray(data) ? data : (data?.data ?? []));
                headers = ['ID', 'Nom', 'SKU', 'Catégorie', 'Stock', 'Seuil Min', 'Prix', 'Statut'];
                rows = list.map(p => {
                    const stock = p.stock_actuel ?? p.stock ?? p.quantite ?? 0;
                    const seuil = p.seuil_minimum ?? p.seuil_min ?? 0;
                    return [p.id, p.nom ?? p.name, p.sku ?? '—', p.categorie?.nom ?? '—', stock, seuil, p.prix ?? 0, stock === 0 ? 'Rupture' : stock < seuil ? 'Critique' : 'OK'];
                });
            } else if (category === 'movement') {
                const data = await movementService.getAll();
                let list = Array.isArray(data) ? data : (data?.data?.data ?? data?.data ?? []);
                list = list.filter(m => new Date(m.date_mouvement ?? m.created_at) >= cutoff);
                if (filterCat) list = list.filter(m => String(m.product?.categorie_id ?? m.produit?.categorie_id) === String(filterCat));
                headers = ['ID', 'Date', 'Produit', 'Type', 'Quantité', 'Stock Après', 'Utilisateur'];
                rows = list.map(m => [m.id, new Date(m.date_mouvement ?? m.created_at).toLocaleDateString('fr-FR'), m.product?.nom ?? m.produit?.nom ?? '—', m.type, m.quantite ?? m.quantity, m.stock_apres ?? '—', m.user?.name ?? m.utilisateur?.nom ?? 'Système']);
            } else if (category === 'alerts') {
                try {
                    const alertRes = await api.get('/alertes');
                    const alerts = Array.isArray(alertRes.data) ? alertRes.data : (alertRes.data?.data ?? []);
                    headers = ['ID', 'Produit', 'Type', 'Message', 'Active', 'Créée le'];
                    rows = alerts.map(a => [
                        a.id, 
                        a.produit?.nom ?? '—', 
                        a.type ?? '—', 
                        stripHtml(a.message ?? '—'), 
                        a.est_active ? 'Oui' : 'Non', 
                        a.created_at || a.cree_le || a.declenche_le ? new Date(a.created_at || a.cree_le || a.declenche_le).toLocaleDateString('fr-FR') : '—'
                    ]);
                } catch {
                    headers = ['Note'];
                    rows = [['Aucune alerte disponible.']];
                }
            } else if (category === 'kpi') {
                const prods = filterByCategory(await productService.getAll().then(d => Array.isArray(d) ? d : (d?.data ?? [])));
                const mvts = await movementService.getAll().then(d => {
                    let l = Array.isArray(d) ? d : (d?.data?.data ?? d?.data ?? []);
                    return l.filter(m => new Date(m.date_mouvement ?? m.created_at) >= cutoff);
                });
                let healthLabel = '—';
                try { const h = await api.get('/ai/health-score'); healthLabel = `${h.data.score}% (${h.data.label})`; } catch {}
                headers = ['Indicateur', 'Valeur'];
                rows = [
                    ['Total produits', prods.length],
                    ['Total mouvements (période)', mvts.length],
                    ['Produits en rupture', prods.filter(p => (p.stock_actuel ?? p.quantite ?? 0) === 0).length],
                    ['Produits sous seuil', prods.filter(p => (p.stock_actuel ?? p.quantite ?? 0) < (p.seuil_minimum ?? p.seuil_min ?? 0)).length],
                    ['Valeur stock totale (MAD)', prods.reduce((s, p) => s + (p.prix ?? 0) * (p.stock_actuel ?? p.quantite ?? 0), 0).toFixed(2)],
                    ['Santé inventaire', healthLabel],
                ];
            } else if (category === 'ai') {
                const prevRes = await api.get('/previsions');
                const previsions = Array.isArray(prevRes.data) ? prevRes.data : (prevRes.data?.data ?? []);
                headers = ['Produit ID', 'Période', 'Demande Prévue', 'EOQ', 'Confiance (%)', 'Score Anomalie', 'Raisonnement'];
                rows = previsions.map(p => [
                    p.produit_id, 
                    p.periode, 
                    p.quantite_predite, 
                    p.eoq, 
                    p.confiance ? (p.confiance * 100).toFixed(0) + '%' : '—', 
                    p.score_anomalie ?? '—', 
                    stripHtml(p.reasoning ?? '—')
                ]);
                // Add health score as summary
                try {
                    const h = await api.get('/ai/health-score');
                    rows.push([]);
                    rows.push(['--- SCORE DE SANTÉ ---', '', '', '', '', '', '']);
                    rows.push(['Score global', h.data.score + '%', h.data.label, `Sains: ${h.data.details?.sain_count}`, `Rupture: ${h.data.details?.rupture_count}`, `Surstock: ${h.data.details?.surstock_count}`, '']);
                } catch {}
            }

            const name = `Rapport_${category.toUpperCase()}_${new Date().toISOString().split('T')[0]}`;
            const csvContent = buildCSV(headers, rows);

            // Sanitize text for jsPDF (no special unicode)
            const sanitize = (str) => {
                const s = String(str ?? '');
                return s.replace(/[—–]/g, '-').replace(/[«»""]/g, '"').replace(/['']/g, "'").trim();
            };

            if (format === 'pdf') {
                try {
                    const doc = new jsPDF({ orientation: headers.length > 6 ? 'landscape' : 'portrait' });
                    // Header
                    doc.setFillColor(15, 23, 42);
                    doc.rect(0, 0, doc.internal.pageSize.width, 32, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text('StockManager - Rapport', 14, 15);
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'normal');
                    const catLabel = CATEGORIES.find(c => c.id === category)?.label ?? '';
                    const perLabel = PERIODS.find(p => p.value === period)?.label ?? '';
                    doc.text(sanitize(`${catLabel} | ${perLabel} | ${new Date().toLocaleDateString('fr-FR')}`), 14, 24);
                    // Table
                    const safeRows = rows.filter(r => Array.isArray(r) && r.length > 0).map(r => r.map(v => sanitize(v)));
                    const safeHeaders = headers.map(h => sanitize(h));
                    if (safeHeaders.length > 0) {
                        autoTable(doc, {
                            head: [safeHeaders],
                            body: safeRows.length > 0 ? safeRows : [safeHeaders.map(() => '-')],
                            startY: 40,
                            styles: { 
                                fontSize: 8, 
                                cellPadding: 3,
                                overflow: 'linebreak',
                                halign: 'left',
                                valign: 'middle'
                            },
                            headStyles: { 
                                fillColor: [13, 110, 96], 
                                textColor: 255, 
                                fontStyle: 'bold', 
                                fontSize: 8 
                            },
                            alternateRowStyles: { fillColor: [248, 250, 252] },
                            margin: { left: 14, right: 14 },
                            columnStyles: {
                                0: { cellWidth: 12 }, // ID / Index
                                1: { cellWidth: 35 }, // Nom / Produit
                                2: { cellWidth: 25 }, // Type / Cat
                                // Le reste prend l'espace restant (surtout Message/Description)
                                [safeHeaders.length - 2]: { cellWidth: 20 }, // Avant-dernier (Active/Statut/EOQ)
                                [safeHeaders.length - 1]: { cellWidth: 25 }, // Dernier (Date/Confiance)
                            }
                        });
                    }
                    // Footer
                    const pageCount = doc.internal.getNumberOfPages();
                    for (let i = 1; i <= pageCount; i++) {
                        doc.setPage(i);
                        doc.setFontSize(7);
                        doc.setTextColor(148, 163, 184);
                        doc.text(`Page ${i}/${pageCount} - Genere par StockManager IA`, 14, doc.internal.pageSize.height - 8);
                    }
                    doc.save(`${name}.pdf`);
                } catch (pdfErr) {
                    console.error('PDF generation error:', pdfErr);
                    toast.error('Erreur PDF: ' + (pdfErr.message ?? 'inconnue'));
                    setIsGenerating(false);
                    return;
                }
            } else if (format === 'excel') {
                const tsvContent = '\uFEFF' + [headers, ...rows].map(r => r.map(v => String(v ?? '').replace(/\t/g, ' ')).join('\t')).join('\n');
                downloadBlob(tsvContent, `${name}.xls`, 'application/vnd.ms-excel');
            } else {
                downloadBlob(csvContent, `${name}.csv`);
            }

            // Save to server (silent)
            try {
                await api.post('/rapports', { type: category.toUpperCase(), chemin_fichier: `rapports/${name}.${format === 'pdf' ? 'pdf' : format === 'excel' ? 'xls' : 'csv'}` });
            } catch {}

            const newReport = { id: Date.now(), name, ...fmtDate(), type: category.toUpperCase(), status: 'Disponible' };
            setReports(prev => [newReport, ...prev]);
            toast.success('Rapport genere et telecharge !');
        } catch (e) {
            console.error('Report generation error:', e);
            toast.error('Erreur: ' + (e?.response?.data?.message ?? e?.message ?? 'Generation impossible.'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = (report) => {
        if (report._blob) {
            const url = URL.createObjectURL(report._blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${report.name}.csv`; a.click();
            URL.revokeObjectURL(url);
        } else if (report.chemin_fichier) {
            api.get(`/rapports/${report.id}/download`, { responseType: 'blob' }).then(r => {
                const url = URL.createObjectURL(r.data);
                const a = document.createElement('a');
                a.href = url; a.download = report.chemin_fichier?.split('/').pop() ?? 'rapport.csv'; a.click();
                URL.revokeObjectURL(url);
            }).catch(() => toast.error('Fichier non disponible.'));
        } else {
            toast('Téléchargement non disponible.');
        }
    };

    const canNext = () => {
        if (step === 1) return !!category;
        if (step === 2) return true;
        return true;
    };

    return (
        <div className="w-full animate-in fade-in duration-500">
            <header className="mb-6 flex justify-end">
                <Link to="/reports/detail" className="flex items-center gap-2 bg-[#1e293b] text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-slate-800 transition-all active:scale-95">
                    <BarChart3 size={16} /> Analyse Détaillée
                </Link>
            </header>

            {/* Generation Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-10 mb-10">
                {/* Interactive Stepper */}
                <div className="flex justify-center items-center gap-4 mb-10 max-w-xl mx-auto">
                    {['Portée', 'Filtres', 'Format'].map((label, i) => {
                        const stepNum = i + 1;
                        const isActive = step === stepNum;
                        const isDone = step > stepNum;
                        return (
                            <React.Fragment key={label}>
                                <button onClick={() => setStep(stepNum)} className="flex flex-col items-center gap-1.5 group">
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${
                                        isDone ? 'border-emerald-500 bg-emerald-500 text-white' :
                                        isActive ? 'border-teal-600 text-teal-600 scale-110' :
                                        'border-slate-200 text-slate-300 group-hover:border-slate-300'
                                    }`}>
                                        {isDone ? <Check size={14} /> : stepNum}
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${
                                        isDone ? 'text-emerald-500' :
                                        isActive ? 'text-teal-600' :
                                        'text-slate-300 group-hover:text-slate-400'
                                    }`}>{label}</span>
                                </button>
                                {i < 2 && <div className={`h-[2px] w-20 rounded-full transition-colors ${isDone ? 'bg-emerald-400' : 'bg-slate-100'}`} />}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Step 1: Category */}
                    {step === 1 && (
                        <div className="text-center animate-in fade-in duration-300">
                            <h2 className="text-lg font-bold text-slate-800">Catégorie de Rapport</h2>
                            <p className="text-xs text-slate-400 mb-6">Choisissez l'ensemble de données à exporter.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {CATEGORIES.map(item => (
                                    <button key={item.id} onClick={() => setCategory(item.id)}
                                        className={`p-4 rounded-xl border text-left transition-all ${category === item.id ? 'border-teal-600 bg-teal-50/30 shadow-sm' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>
                                        <div className={`p-2 rounded-lg w-fit mb-3 ${category === item.id ? 'bg-teal-600 text-white' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                                            {item.icon}
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-[13px]">{item.label}</h3>
                                        <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Filters */}
                    {step === 2 && (
                        <div className="animate-in fade-in duration-300">
                            <div className="text-center mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Affiner les données</h2>
                                <p className="text-xs text-slate-400">Définissez la période et le filtre produit.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Période</label>
                                    <select value={period} onChange={e => setPeriod(Number(e.target.value))}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-600/10 text-[13px] font-medium">
                                        {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Catégorie produit</label>
                                    <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-600/10 text-[13px] font-medium">
                                        <option value="">Tous les produits</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.nom ?? c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Format + Generate */}
                    {step === 3 && (
                        <div className="text-center animate-in fade-in duration-300">
                            <h2 className="text-lg font-bold text-slate-800 mb-2">Format d'exportation</h2>
                            <p className="text-xs text-slate-400 mb-6">Rapport : <span className="font-bold text-teal-600">{CATEGORIES.find(c => c.id === category)?.label}</span> — {PERIODS.find(p => p.value === period)?.label}</p>
                            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
                                <button onClick={() => setFormat('csv')}
                                    className={`p-5 rounded-xl border flex flex-col items-center gap-2 transition-all ${format === 'csv' ? 'border-teal-600 bg-teal-50/30 shadow-sm' : 'border-slate-100 hover:bg-slate-50'}`}>
                                    <FileText size={32} className={format === 'csv' ? 'text-teal-600' : 'text-slate-300'} />
                                    <span className="font-bold text-[13px]">CSV</span>
                                    <span className="text-[9px] text-slate-400">Compatible universel</span>
                                </button>
                                <button onClick={() => setFormat('excel')}
                                    className={`p-5 rounded-xl border flex flex-col items-center gap-2 transition-all ${format === 'excel' ? 'border-teal-600 bg-teal-50/30 shadow-sm' : 'border-slate-100 hover:bg-slate-50'}`}>
                                    <FileSpreadsheet size={32} className={format === 'excel' ? 'text-teal-600' : 'text-slate-300'} />
                                    <span className="font-bold text-[13px]">EXCEL</span>
                                    <span className="text-[9px] text-slate-400">Format .xls tabulé</span>
                                </button>
                                <button onClick={() => setFormat('pdf')}
                                    className={`p-5 rounded-xl border flex flex-col items-center gap-2 transition-all ${format === 'pdf' ? 'border-red-500 bg-red-50/30 shadow-sm' : 'border-slate-100 hover:bg-slate-50'}`}>
                                    <FileText size={32} className={format === 'pdf' ? 'text-red-500' : 'text-slate-300'} />
                                    <span className="font-bold text-[13px]">PDF</span>
                                    <span className="text-[9px] text-slate-400">Rapport professionnel</span>
                                </button>
                            </div>
                            <button onClick={handleGenerate} disabled={isGenerating}
                                className={`w-full max-w-md mx-auto bg-[#0d6e60] text-white py-3.5 rounded-lg font-bold text-base flex items-center justify-center gap-2 hover:bg-[#0a5a4f] transition-all shadow-md active:scale-[0.98] ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {isGenerating ? <><Loader2 size={20} className="animate-spin" /> Génération...</> : <><Download size={20} /> Générer et télécharger</>}
                            </button>
                        </div>
                    )}

                    {/* Step navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-50">
                        <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
                            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30">
                            <ChevronLeft size={16} /> Précédent
                        </button>
                        {step < 3 && (
                            <button onClick={() => canNext() && setStep(s => s + 1)} disabled={!canNext()}
                                className="flex items-center gap-1 bg-[#1e293b] text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm disabled:opacity-40">
                                Suivant <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Previous Reports */}
            <section className="w-full">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Rapports récents</h2>
                        {!loadingReports && <p className="text-[10px] text-slate-400 mt-0.5">{reports.length} rapport{reports.length > 1 ? 's' : ''}</p>}
                    </div>
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
                            {loadingReports && (
                                <tr><td colSpan={5} className="px-6 py-10 text-center">
                                    <Loader2 className="w-5 h-5 text-slate-300 animate-spin inline" />
                                </td></tr>
                            )}
                            {!loadingReports && reports.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-14 text-center">
                                    <p className="text-sm text-slate-400 font-medium italic">Aucun rapport généré. Créez votre premier rapport ci-dessus.</p>
                                </td></tr>
                            )}
                            {!loadingReports && reports.map(report => {
                                const dt = typeof report.date === 'string' && report.time ? report : fmtDate(report.created_at ?? report.genere_le);
                                const typeBadge = {
                                    'AI': 'bg-purple-50 text-purple-600',
                                    'STATUS': 'bg-blue-50 text-blue-600',
                                    'MOVEMENT': 'bg-amber-50 text-amber-600',
                                    'KPI': 'bg-emerald-50 text-emerald-600',
                                    'ALERTS': 'bg-red-50 text-red-600',
                                }[report.type] ?? 'bg-slate-100 text-slate-500';
                                return (
                                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-teal-50 text-teal-600"><FileText size={16} /></div>
                                                <span className="font-bold text-slate-700 text-[13px]">{report.name ?? report.nom ?? report.chemin_fichier?.split('/').pop()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[13px] font-medium text-slate-600">{report.date ?? dt.date}</div>
                                            <div className="text-[9px] text-slate-400">{report.time ?? dt.time}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${typeBadge}`}>
                                                {report.type ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                                <span className="text-[11px] font-bold text-teal-600">{report.status ?? 'Disponible'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDownload(report)}
                                                className="p-2 hover:bg-teal-50 rounded-lg text-teal-600 transition-colors border border-transparent hover:border-teal-100">
                                                <Download size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Reports;