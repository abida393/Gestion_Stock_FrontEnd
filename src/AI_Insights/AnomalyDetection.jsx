import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldAlert, Activity, AlertTriangle,
    Play, Calendar, Download,
    MoreVertical, ChevronLeft, ChevronRight, Zap, Loader2, RefreshCw, BrainCircuit
} from 'lucide-react';
import movementService from '../services/movementService';
import categoryService from '../services/categoryService';
import api from '../services/api';

/* ─── helpers ────────────────────────────────────────────────── */
const classifyAnomaly = (mouvement) => {
    const qty = mouvement.quantite ?? mouvement.quantity ?? 0;
    const type = (mouvement.type ?? '').toLowerCase();
    const isEntry = type.includes('entree') || type.includes('entrée') || type === 'in';
    const hour = mouvement.date_mouvement || mouvement.created_at
        ? new Date(mouvement.date_mouvement || mouvement.created_at).getHours()
        : 12;

    if (qty > 500)           return { label: 'SORTIE MASSIVE', score: 90 };
    if (!isEntry && qty > 200) return { label: 'VOL PROBABLE',   score: 82 };
    if (hour < 6 || hour > 22) return { label: 'HEURE INHAB.',  score: 60 };
    return                       { label: 'ÉCART INV.',          score: 45 };
};

const fmtDate = (raw) => {
    if (!raw) return '—';
    const d = new Date(raw);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) +
        ', ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const ITEMS_PER_PAGE = 8;

/* ─── component ──────────────────────────────────────────────── */
const AnomalyDetection = () => {
    const [allMovements, setAllMovements]     = useState([]);
    const [previsions, setPrevisions]         = useState([]);
    const [categories, setCategories]         = useState([]);
    const [filterCat, setFilterCat]           = useState('');
    const [period, setPeriod]                 = useState(30);
    const [loading, setLoading]               = useState(true);
    const [scanning, setScanning]             = useState(false);
    const [currentPage, setCurrentPage]       = useState(1);
    const [behavioralAnomalies, setBehavioralAnomalies] = useState([]);
    const [notifCount, setNotifCount]         = useState(0);
    const [selectedAnomaly, setSelectedAnomaly] = useState(null);

    /* ── load data ── */
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [mvtData, catData, prevData] = await Promise.all([
                movementService.getAll().catch(() => []),
                categoryService.getAll().catch(() => []),
                api.get('/previsions').then(r => Array.isArray(r.data) ? r.data : (r.data.data ?? [])).catch(() => []),
            ]);

            let mvts = [];
            if (Array.isArray(mvtData))                mvts = mvtData;
            else if (mvtData?.data?.data)              mvts = mvtData.data.data;
            else if (mvtData?.data)                    mvts = mvtData.data;

            let cats = Array.isArray(catData) ? catData : (catData?.data ?? []);
            setCategories(cats);
            setPrevisions(prevData);
            setAllMovements(mvts);
        } catch (e) {
            console.error('AnomalyDetection load error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    /* ── derive anomalies from movements ── */
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period);

    const anomalies = allMovements
        .filter(m => {
            const rawDate = m.date_mouvement || m.created_at;
            if (rawDate && new Date(rawDate) < cutoff) return false;
            const pid = m.produit_id ?? m.product?.id;
            if (filterCat) {
                const cat = m.product?.categorie_id ?? m.produit?.categorie_id;
                if (String(cat) !== String(filterCat)) return false;
            }
            const cls = classifyAnomaly(m);
            return cls.score >= 45; // only real anomalies
        })
        .map((m, idx) => {
            const cls     = classifyAnomaly(m);
            const pid     = m.produit_id ?? m.product?.id;
            const prevision = previsions.find(p => String(p.produit_id) === String(pid));
            // Boost score if prevision marks an anomaly
            const score = prevision?.score_anomalie
                ? Math.min(99, Math.round(cls.score + prevision.score_anomalie * 100))
                : cls.score;
            return {
                id     : m.id ?? idx,
                date   : fmtDate(m.date_mouvement || m.created_at),
                product: m.product?.nom ?? m.product?.name ?? m.produit?.nom ?? '—',
                type   : cls.label,
                qty    : `${m.quantite ?? m.quantity ?? 0} unités`,
                score,
                user   : m.user?.name ?? m.user?.nom ?? m.utilisateur?.nom ?? 'Système',
            };
        })
        .sort((a, b) => b.score - a.score);

    // Merge behavioral anomalies from the detect-anomalies endpoint
    const mergedAnomalies = [
        ...anomalies,
        ...behavioralAnomalies.map((ba, idx) => ({
            id: `ba-${idx}`,
            date: ba.date ? new Date(ba.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ', ' + new Date(ba.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—',
            product: ba.produit_nom ?? '—',
            type: 'COMPORTEMENT',
            qty: `${ba.quantite ?? 0} unités`,
            score: ba.severity ?? 50,
            user: 'IA Agent',
            isBehavioral: true,
            reasons: ba.reasons ?? [],
        }))
    ].sort((a, b) => b.score - a.score);

    /* ── stats ── */
    const totalMvt  = allMovements.length;
    const totalAno  = mergedAnomalies.length;
    const highRisk  = mergedAnomalies.filter(a => a.score > 80).length;

    /* ── pagination ── */
    const totalPages = Math.max(1, Math.ceil(mergedAnomalies.length / ITEMS_PER_PAGE));
    const paginated  = mergedAnomalies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    /* ── export CSV ── */
    const handleExport = () => {
        const headers = ['Date', 'Produit', 'Type', 'Quantité', 'Score Risque', 'Agent'];
        const rows    = mergedAnomalies.map(a => [a.date, a.product, a.type, a.qty, a.score, a.user]);
        const csv     = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob    = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url     = URL.createObjectURL(blob);
        const a       = document.createElement('a');
        a.href = url; a.download = `anomalies_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    /* ── manual scan (calls ai/sync + detect-anomalies) ── */
    const handleScan = async () => {
        setScanning(true);
        try {
            await api.post('/ai/sync');
            // Also run behavioral anomaly detection
            try {
                const detectRes = await api.post('/ai/detect-anomalies');
                const ba = detectRes.data.anomalies ?? [];
                setBehavioralAnomalies(ba);
                setNotifCount(detectRes.data.notifications_created ?? 0);
            } catch (detectErr) {
                console.warn('Behavioral detection skipped:', detectErr);
            }
            await loadData();
        } catch (e) {
            console.error('Scan error:', e);
        } finally {
            setScanning(false);
        }
    };

    /* ─────────────────────────── render ── */
    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex text-[9px] text-slate-500 mb-6 gap-2 font-black uppercase tracking-[0.2em]">
                <Link to="/ai-insights" className="hover:text-blue-600 transition-colors">Analyses IA</Link>
                <span className="text-slate-300">/</span>
                <span className="text-slate-600">Anomalies</span>
            </nav>

            {/* Hero Banner */}
            <div className="w-full bg-[#1e293b] rounded-xl p-6 mb-8 text-white relative overflow-hidden shadow-lg border border-slate-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-900/20 pointer-events-none" />
                <div className="relative z-10 max-w-xl">
                    <h2 className="text-2xl font-black mb-2 tracking-tight text-white">Détection d'Anomalies</h2>
                    <p className="text-blue-100/80 text-xs font-medium leading-relaxed">
                        Analyse en temps réel de <span className="text-white font-bold">{totalMvt.toLocaleString('fr-FR')}</span> mouvements.
                        {totalAno > 0
                            ? <span className="text-blue-200"> {totalAno} irrégularité{totalAno > 1 ? 's' : ''} détectée{totalAno > 1 ? 's' : ''}.</span>
                            : ' Aucune irrégularité détectée.'}
                    </p>
                </div>
                <div className="absolute top-6 right-6 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                        {scanning ? 'Scan en cours…' : 'Analyste Actif'}
                    </p>
                </div>
                {notifCount > 0 && (
                    <div className="absolute top-6 right-56 bg-purple-500/20 border border-purple-400/30 px-3 py-1.5 rounded-lg">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-purple-300">
                            {notifCount} notification{notifCount > 1 ? 's' : ''} créée{notifCount > 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>

            {/* Barre de contrôle */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Catégorie</label>
                    <select
                        value={filterCat}
                        onChange={e => { setFilterCat(e.target.value); setCurrentPage(1); }}
                        className="w-full px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 text-[13px] appearance-none"
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.nom ?? c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 w-full">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Période d'analyse</label>
                    <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={period}
                            onChange={e => { setPeriod(Number(e.target.value)); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 text-[13px] appearance-none"
                        >
                            <option value={7}>7 derniers jours</option>
                            <option value={14}>14 derniers jours</option>
                            <option value={30}>30 derniers jours</option>
                            <option value={90}>90 derniers jours</option>
                            <option value={365}>12 derniers mois</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="bg-[#1e293b] text-white px-8 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-md disabled:opacity-60"
                >
                    {scanning
                        ? <><Loader2 size={16} className="animate-spin" /> Scan…</>
                        : <><Zap size={16} fill="currentColor" /> Lancer</>}
                </button>
                <button
                    onClick={loadData}
                    className="p-2.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all active:scale-95"
                    title="Rafraîchir"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Mouvements</p>
                        <Activity className="text-blue-500" size={16} />
                    </div>
                    {loading
                        ? <div className="h-8 w-20 bg-slate-100 rounded animate-pulse" />
                        : <h3 className="text-2xl font-black text-slate-800">{totalMvt.toLocaleString('fr-FR')}</h3>}
                    <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tight">
                        Période de {period} jours
                    </p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Anomalies</p>
                        <AlertTriangle className="text-amber-500" size={16} />
                    </div>
                    {loading
                        ? <div className="h-8 w-12 bg-slate-100 rounded animate-pulse" />
                        : <h3 className="text-2xl font-black text-slate-800">{totalAno}</h3>}
                    <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tight">
                        {categories.length > 0 ? `${categories.length} catégories surveillées` : 'Chargement…'}
                    </p>
                </div>
                <div className={`p-5 rounded-xl border ${highRisk > 0 ? 'bg-red-50/50 border-red-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <div className="flex justify-between items-start mb-3">
                        <p className={`text-[9px] font-black uppercase tracking-wider ${highRisk > 0 ? 'text-red-400' : 'text-emerald-500'}`}>Risques</p>
                        <ShieldAlert className={highRisk > 0 ? 'text-red-500' : 'text-emerald-500'} size={16} />
                    </div>
                    {loading
                        ? <div className="h-8 w-10 bg-slate-100 rounded animate-pulse" />
                        : <h3 className={`text-2xl font-black ${highRisk > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {String(highRisk).padStart(2, '0')}
                        </h3>}
                    <p className={`text-[10px] font-bold mt-1 tracking-tight ${highRisk > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {highRisk > 0 ? 'Action requise' : 'Tout est sain'}
                    </p>
                </div>
            </div>

            {/* Table anomalies */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-[15px] font-bold text-slate-800">Alertes Récentes</h2>
                        {!loading && <p className="text-[10px] text-slate-400 mt-0.5">{totalAno} anomalie{totalAno > 1 ? 's' : ''} détectée{totalAno > 1 ? 's' : ''}</p>}
                    </div>
                    <div className="flex gap-1.5 text-slate-400">
                        <button onClick={handleExport} className="p-1.5 hover:bg-slate-50 rounded-md transition-colors" title="Exporter CSV">
                            <Download size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-50 rounded-md transition-colors">
                            <MoreVertical size={16} />
                        </button>
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
                            {loading && (
                                <tr><td colSpan={7} className="px-6 py-12 text-center">
                                    <Loader2 className="w-6 h-6 text-slate-300 animate-spin inline" />
                                </td></tr>
                            )}
                            {!loading && paginated.length === 0 && (
                                <tr><td colSpan={7} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShieldAlert className="w-10 h-10 text-emerald-200" />
                                        <p className="text-sm font-bold text-slate-400">Aucune anomalie détectée</p>
                                        <p className="text-xs text-slate-300">Tous les mouvements semblent normaux pour la période sélectionnée.</p>
                                    </div>
                                </td></tr>
                            )}
                            {!loading && paginated.map((a) => (
                                <tr key={a.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4 text-[13px] font-medium text-slate-400">{a.date}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{a.product}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide ${
                                            a.isBehavioral ? 'bg-purple-50 text-purple-600' :
                                            a.score > 80 ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {a.isBehavioral && <BrainCircuit size={10} className="inline mr-1" />}
                                            {a.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[13px] font-bold text-slate-500">{a.qty}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-slate-100 h-1.5 rounded-full w-20">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${a.score > 80 ? 'bg-red-500' : 'bg-amber-400'}`}
                                                    style={{ width: `${a.score}%` }}
                                                />
                                            </div>
                                            <span className={`text-[11px] font-black ${a.score > 80 ? 'text-red-600' : 'text-amber-600'}`}>{a.score}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{a.user}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedAnomaly(a)}
                                            className="bg-slate-900 text-white px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-colors"
                                        >
                                            Détails
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/50 flex justify-between items-center text-[10px] font-bold text-slate-400 border-t border-slate-50">
                    <span>
                        {paginated.length === 0 ? '0 résultat' :
                            `Affichage ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, totalAno)} / ${totalAno}`}
                    </span>
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 flex items-center gap-1 transition-colors disabled:opacity-40"
                        >
                            <ChevronLeft size={14} /> Précédent
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 flex items-center gap-1 transition-colors disabled:opacity-40"
                        >
                            Suivant <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Détails */}
            {selectedAnomaly && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <ShieldAlert className="text-amber-400" size={20} />
                                    <h3 className="text-lg font-bold">Analyse de l'Anomalie</h3>
                                </div>
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">{selectedAnomaly.product}</p>
                            </div>
                            <button onClick={() => setSelectedAnomaly(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                <ChevronLeft className="rotate-180" size={20} />
                            </button>
                        </div>
                        
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Niveau de Risque</label>
                                    <div className="flex items-center gap-2">
                                        <div className={`text-2xl font-black ${selectedAnomaly.score > 80 ? 'text-red-600' : 'text-amber-500'}`}>
                                            {selectedAnomaly.score}%
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${selectedAnomaly.score > 80 ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                            {selectedAnomaly.score > 80 ? 'Critique' : 'Moyen'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Type d'alerte</label>
                                    <div className="text-sm font-bold text-slate-700">{selectedAnomaly.type}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Date du Mouvement</label>
                                    <div className="text-sm font-bold text-slate-700">{selectedAnomaly.date}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Quantité</label>
                                    <div className="text-sm font-bold text-slate-700">{selectedAnomaly.qty}</div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <BrainCircuit size={16} className="text-blue-500" />
                                    <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Raisonnement de l'IA</h4>
                                </div>
                                
                                {selectedAnomaly.isBehavioral ? (
                                    <div className="space-y-2">
                                        {selectedAnomaly.reasons && selectedAnomaly.reasons.length > 0 ? (
                                            selectedAnomaly.reasons.map((r, i) => (
                                                <div key={i} className="flex gap-2 text-[12px] text-slate-600 leading-relaxed">
                                                    <span className="text-blue-500 font-bold">•</span>
                                                    {r}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[12px] text-slate-600 italic">Écart significatif détecté par rapport aux habitudes historiques de sorties.</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-[12px] text-slate-600 leading-relaxed">
                                        Le mouvement a été identifié comme inhabituel car il s'écarte des seuils de sécurité standards (Volume: {selectedAnomaly.qty}, Heure: {selectedAnomaly.date.split(',')[1].trim()}).
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setSelectedAnomaly(null)}
                                className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnomalyDetection;