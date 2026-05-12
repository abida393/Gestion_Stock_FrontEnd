import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    BrainCircuit, TrendingUp, PackageCheck, AlertCircle,
    Play, Calendar, ShieldCheck, ArrowRight, Search, Zap, ShieldAlert,
    HeartPulse, FlaskConical, AlertTriangle, Lightbulb, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import api from '../services/api';
import llmService from '../services/llmService';


const AIInsights = () => {
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("30j");
    const [isLoading, setIsLoading] = useState(false);
    const [hasData, setHasData] = useState(false);
    const [predictionData, setPredictionData] = useState(null);
    const [selectedProductName, setSelectedProductName] = useState("");
    const [products, setProducts] = useState([]);

    // Health Score
    const [healthScore, setHealthScore] = useState(null);
    const [healthLoading, setHealthLoading] = useState(true);

    // What-If Simulation
    const [simProduct, setSimProduct] = useState("");
    const [simType, setSimType] = useState("delay");
    const [simDelay, setSimDelay] = useState(7);
    const [simSpike, setSimSpike] = useState(30);
    const [simLoading, setSimLoading] = useState(false);
    const [simResult, setSimResult] = useState(null);

    // LLM Explanation
    const [explanation, setExplanation] = useState("");
    const [isExplaining, setIsExplaining] = useState(false);


    useEffect(() => {
        productService.getAll().then((data) => {
            let list = [];
            if (Array.isArray(data)) list = data;
            else if (data?.data && Array.isArray(data.data)) list = data.data;
            else if (data?.data?.data && Array.isArray(data.data.data)) list = data.data.data;
            setProducts(list);
        }).catch(() => toast.error("Erreur de chargement des produits"));

        // Load health score
        api.get('/ai/health-score').then(r => setHealthScore(r.data)).catch(() => {}).finally(() => setHealthLoading(false));
    }, []);

    const handleAnalyze = async () => {
        if (!selectedProduct) { toast.error("Veuillez sélectionner un produit."); return; }
        setIsLoading(true);
        try {
            const localProd = products.find(p => String(p.id) === String(selectedProduct));
            const stockActuel = localProd?.stock_actuel ?? localProd?.stock ?? localProd?.quantite ?? 0;
            const seuilMin = localProd?.seuil_minimum ?? localProd?.seuil_min ?? 0;

            const response = await api.post('/ai/sync');
            const rawPredictions = response.data.predictions ?? [];
            const match = rawPredictions.find(p => String(p.produit_id) === String(selectedProduct));

            const genRecs = (eoq, demande, stock, seuil) => {
                const recs = [];
                if (stock < seuil) recs.push(`⚠️ Stock critique (${stock} u.) sous le seuil (${seuil} u.) — réapprovisionner en urgence.`);
                if (eoq > 0) recs.push(`📦 Commander ${Math.round(eoq)} unités pour minimiser les coûts (EOQ Wilson).`);
                if (demande > stock * 0.8) recs.push("📈 Demande prévue élevée — envisagez d'augmenter le seuil de sécurité de 20%.");
                else recs.push("✅ Le stock actuel couvre la demande prévue confortablement.");
                return recs.slice(0, 3);
            };

            const previsionResponse = await api.get('/previsions', { params: { produit_id: selectedProduct } });
            const list = Array.isArray(previsionResponse.data) ? previsionResponse.data : (previsionResponse.data.data ?? []);

            if (list.length > 0) {
                const latest = list[list.length - 1];
                const agentRecs = match?.recommandations ?? [];
                const recs = agentRecs.length > 0 ? agentRecs : genRecs(latest.eoq, latest.quantite_predite, stockActuel, seuilMin);
                setPredictionData({
                    ...latest,
                    recommandations: recs,
                    reasoning: match?.reasoning ?? latest.reasoning ?? null,
                    stock_actuel: stockActuel,
                    seuil_minimum: seuilMin,
                });
                setHasData(true);
                toast.success(`Analyse terminée — ${response.data.predictions_processed} prédictions générées`);
            } else if (match) {
                const recs = match.recommandations?.length > 0 ? match.recommandations : genRecs(match.EOQ, match.quantite, stockActuel, seuilMin);
                setPredictionData({
                    eoq: match.EOQ, quantite_predite: match.quantite, confiance: match.confiance,
                    score_anomalie: match.score_anomalie, recommandations: recs,
                    reasoning: match.reasoning ?? null,
                    stock_actuel: stockActuel, seuil_minimum: seuilMin,
                });
                setHasData(true);
                toast.success(`Analyse terminée pour ${selectedProductName}`);
            } else {
                toast.error("Aucune prévision disponible pour ce produit après analyse.");
                setHasData(false);
            }
        } catch (error) {
            const msg = error?.response?.data?.message ?? "Erreur lors de l'analyse IA";
            toast.error(msg);
        } finally { setIsLoading(false); }
    };

    const handleSimulate = async () => {
        if (!simProduct) { toast.error("Sélectionnez un produit pour la simulation."); return; }
        setSimLoading(true);
        setSimResult(null);
        try {
            const payload = {
                produit_id: parseInt(simProduct),
                scenario_type: simType,
                delay_days: simType === 'delay' || simType === 'supply_cut' ? simDelay : 0,
                demand_spike_pct: simType === 'demand_spike' ? simSpike : 0,
            };
            const r = await api.post('/ai/simulate', payload);
            setSimResult(r.data);
            toast.success("Simulation terminée");
        } catch (error) {
            toast.error(error?.response?.data?.message ?? "Erreur de simulation");
        } finally { setSimLoading(false); }
    };

    const handleExplain = async () => {
        if (!selectedProduct) return;
        setIsExplaining(true);
        setExplanation("");
        try {
            const result = await llmService.explainPrevision(selectedProduct);
            setExplanation(result);
            toast.success("Analyse détaillée générée");
        } catch (error) {
            toast.error("Impossible de générer l'explication");
        } finally {
            setIsExplaining(false);
        }
    };


    const riskColor = (level) => {
        if (level === 'Critique') return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', ring: 'ring-red-500/20', pulse: true };
        if (level === 'Moyen') return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', ring: 'ring-amber-500/20', pulse: false };
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', ring: 'ring-emerald-500/20', pulse: false };
    };

    const scoreColor = (s) => s >= 80 ? 'text-emerald-500' : s >= 60 ? 'text-blue-500' : s >= 40 ? 'text-amber-500' : 'text-red-500';
    const scoreBg = (s) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-blue-500' : s >= 40 ? 'bg-amber-500' : 'bg-red-500';
    const scoreTrack = (s) => s >= 80 ? 'stroke-emerald-500' : s >= 60 ? 'stroke-blue-500' : s >= 40 ? 'stroke-amber-500' : 'stroke-red-500';

    return (
        <div className="w-full animate-in fade-in duration-500">

            {/* Header d'actions IA */}
            <header className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Health Score Mini */}
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                            {healthScore && (
                                <circle cx="18" cy="18" r="15.5" fill="none" className={scoreTrack(healthScore.score)}
                                    strokeWidth="3" strokeDasharray={`${healthScore.score * 0.975} 100`}
                                    strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
                            )}
                        </svg>
                        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${healthScore ? scoreColor(healthScore.score) : 'text-slate-300'}`}>
                            {healthLoading ? '…' : healthScore ? `${healthScore.score}%` : '—'}
                        </span>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Santé Inventaire</p>
                        <p className={`text-xs font-bold ${healthScore ? scoreColor(healthScore.score) : 'text-slate-400'}`}>
                            {healthScore?.label ?? 'Chargement…'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex bg-white px-5 py-2 rounded-lg border border-slate-100 shadow-sm items-center gap-3">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Modèle IA</p>
                            <p className="text-xs font-bold text-emerald-600">v3.0 Opérationnel</p>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                    <Link to="/ai-insights/anomalies"
                        className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95 text-slate-600">
                        <ShieldAlert size={16} className="text-red-500" /> Anomalies
                    </Link>
                </div>
            </header>

            {/* Barre de contrôle */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row items-end gap-6">
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">1. Produit</label>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none transition-all text-[13px]"
                            value={selectedProduct}
                            onChange={(e) => { setSelectedProduct(e.target.value); const p = products.find(p => String(p.id) === String(e.target.value)); setSelectedProductName(p ? (p.nom ?? p.name) : ""); }}>
                            <option value="">Sélectionner un article...</option>
                            {products.length === 0 ? (<option value="" disabled>Aucun produit disponible</option>) :
                                (products.map(p => (<option key={p.id} value={p.id}>{p.nom ?? p.name}</option>)))}
                        </select>
                    </div>
                </div>
                <div className="flex-none w-full lg:w-auto">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">2. Prévision</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg h-[46px]">
                        {['7j', '14j', '30j', '90j'].map(d => (
                            <button key={d} onClick={() => setSelectedPeriod(d)}
                                className={`px-5 rounded-md text-[13px] font-bold transition-all ${d === selectedPeriod ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>{d}</button>
                        ))}
                    </div>
                </div>
                <button className={`w-full lg:w-auto bg-[#1e293b] text-white px-8 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={handleAnalyze} disabled={isLoading}>
                    {isLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Analyse...</>) :
                        (<><Zap size={16} fill="currentColor" /> Analyser</>)}
                </button>
                {hasData && (
                    <button className={`w-full lg:w-auto bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-md ${isExplaining ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={handleExplain} disabled={isExplaining}>
                        {isExplaining ? (<><Loader2 size={16} className="animate-spin" /> Génération...</>) :
                            (<><Sparkles size={16} /> Expliquer</>)}
                    </button>
                )}
            </div>


            {/* État Vide */}
            {!hasData && (
                <div className="w-full py-20 bg-white rounded-xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <BrainCircuit className="text-blue-500" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Analyse Prédictive</h2>
                    <p className="text-xs text-slate-400 mt-2 max-w-sm">Sélectionnez un produit et une période pour générer des prévisions de demande intelligentes.</p>
                </div>
            )}

            {/* Résultats */}
            {hasData && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Carte EOQ */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><PackageCheck size={80} /></div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><PackageCheck size={20} /></div>
                                <div><h3 className="font-bold text-slate-700">Quantité Économique (EOQ)</h3><p className="text-[10px] text-slate-400 font-medium">{selectedProductName}</p></div>
                            </div>
                            <div className="mt-3">
                                <p className="text-3xl font-black text-slate-800">{predictionData?.eoq ?? 0} <span className="text-sm font-medium text-slate-400">unités</span></p>
                                <div className="mt-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-slate-400">Confiance</span>
                                        <span className="text-[11px] font-black text-emerald-600">{predictionData ? (predictionData.confiance * 100).toFixed(0) : 0}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${predictionData ? predictionData.confiance * 100 : 0}%` }} />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto pt-5"><button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">Appliquer au stock <ArrowRight size={14} /></button></div>
                        </div>

                        {/* Carte Demande Prévue */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><AlertCircle size={80} /></div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><TrendingUp size={20} /></div>
                                <div><h3 className="font-bold text-slate-700">Demande Prévue</h3><p className="text-[10px] text-slate-400 font-medium">Période : {selectedPeriod}</p></div>
                            </div>
                            <div className="mt-3">
                                <p className="text-3xl font-black text-slate-800">{predictionData?.quantite_predite ?? 0} <span className="text-sm font-medium text-slate-400">unités</span></p>
                                <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-slate-500">
                                    <TrendingUp size={13} className="text-amber-500" />
                                    Stock actuel : <span className="font-black text-slate-700">{predictionData?.stock_actuel ?? '--'}</span> u.
                                    &nbsp;&bull;&nbsp; Seuil : <span className="font-black text-slate-700">{predictionData?.seuil_minimum ?? '--'}</span> u.
                                </div>
                            </div>
                            <div className="mt-auto pt-5"><button className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">Commander maintenant <Play size={14} /></button></div>
                        </div>

                        {/* Carte Recommandations */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><ShieldCheck size={80} /></div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck size={20} /></div>
                                <div><h3 className="font-bold text-slate-700">Recommandations</h3><p className="text-[10px] text-slate-400 font-medium">Basées sur les données réelles</p></div>
                            </div>
                            <div className="mt-2 space-y-3">
                                {(predictionData?.recommandations ?? []).map((rec, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                        <p className="text-xs text-slate-600 leading-relaxed">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* XAI Reasoning */}
                    {predictionData?.reasoning && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Lightbulb size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-slate-700">Raisonnement de l'IA</h3>
                                    <p className="text-[10px] text-blue-500 font-medium">Explainable AI — Justification des décisions</p>
                                </div>
                            </div>
                            <p className="text-[13px] text-slate-600 leading-relaxed italic">{predictionData.reasoning}</p>
                        </div>
                    )}

                    {/* LLM Detailed Explanation */}
                    {explanation && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl p-8 border border-blue-200 shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <BrainCircuit size={160} />
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Synthèse Stratégique du Copilote</h3>
                                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">Analyse Deep-Learning & Logistique</p>
                                </div>
                            </div>
                            <div className="prose prose-slate max-w-none">
                                <div className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                    {explanation}
                                </div>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                Analyse certifiée par StockManager AI v3.0 • Basé sur Gemini 1.5 Flash
                            </div>
                        </motion.div>
                    )}
                </div>

            )}

            {/* ── Simulation What-If ── */}
            <div className="mt-10 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#1e293b] to-[#334155] p-5 flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg"><FlaskConical size={20} className="text-amber-400" /></div>
                    <div>
                        <h3 className="text-white font-bold">Simulation What-If</h3>
                        <p className="text-slate-400 text-[10px]">Analysez l'impact de scénarios sur votre stock</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Produit</label>
                            <select value={simProduct} onChange={e => setSimProduct(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-700 text-[13px] appearance-none outline-none focus:ring-2 focus:ring-blue-500/10">
                                <option value="">Choisir…</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.nom ?? p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Scénario</label>
                            <select value={simType} onChange={e => setSimType(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-700 text-[13px] appearance-none outline-none focus:ring-2 focus:ring-blue-500/10">
                                <option value="delay">Retard fournisseur</option>
                                <option value="demand_spike">Hausse de demande</option>
                                <option value="supply_cut">Coupure approvisionnement</option>
                            </select>
                        </div>
                        {(simType === 'delay' || simType === 'supply_cut') && (
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Jours de retard</label>
                                <input type="number" min="1" max="365" value={simDelay} onChange={e => setSimDelay(Number(e.target.value))}
                                    className="w-full px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-700 text-[13px] outline-none focus:ring-2 focus:ring-blue-500/10" />
                            </div>
                        )}
                        {simType === 'demand_spike' && (
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Hausse (%)</label>
                                <input type="number" min="1" max="500" value={simSpike} onChange={e => setSimSpike(Number(e.target.value))}
                                    className="w-full px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-700 text-[13px] outline-none focus:ring-2 focus:ring-blue-500/10" />
                            </div>
                        )}
                        <div className="flex items-end">
                            <button onClick={handleSimulate} disabled={simLoading}
                                className="w-full bg-amber-500 text-white px-6 py-2.5 rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-amber-600 transition-all active:scale-95 shadow-md disabled:opacity-60">
                                {simLoading ? <><Loader2 size={16} className="animate-spin" /> Simulation…</> : <><FlaskConical size={16} /> Simuler</>}
                            </button>
                        </div>
                    </div>

                    {/* Résultat simulation */}
                    {simResult && (() => {
                        const rc = riskColor(simResult.risk_level);
                        return (
                            <div className={`${rc.bg} border ${rc.border} rounded-xl p-5 transition-all duration-500`}>
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/80 border ${rc.border} ring-4 ${rc.ring}`}>
                                        <AlertTriangle size={28} className={`${rc.text} ${rc.pulse ? 'animate-pulse' : ''}`} />
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Niveau de Risque</p>
                                            <p className={`text-2xl font-black ${rc.text}`}>{simResult.risk_level}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-slate-500 font-medium">Score :</span>
                                            <span className={`font-black text-lg ${rc.text}`}>{simResult.risk_score}/100</span>
                                            <span className="text-slate-300">|</span>
                                            <span className="text-slate-500 font-medium">Jours avant rupture :</span>
                                            <span className="font-black text-lg text-slate-700">{simResult.projected_stockout_days}j</span>
                                            <span className="text-slate-300">|</span>
                                            <span className="text-slate-500 font-medium">Conso./jour :</span>
                                            <span className="font-black text-slate-700">{simResult.daily_consumption} u.</span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">{simResult.explanation}</p>
                                    </div>
                                </div>
                                {/* Risk bar */}
                                <div className="mt-4 w-full h-2 bg-white/60 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-700 ${simResult.risk_score >= 70 ? 'bg-red-500' : simResult.risk_score >= 40 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                        style={{ width: `${simResult.risk_score}%` }} />
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default AIInsights;