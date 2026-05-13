import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, AlertCircle, SortDesc, Search, Settings, BrainCircuit, TrendingDown, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import alertService from '../services/alertService';

const TYPE_CONFIG = {
    seuil:      { label: 'Seuil',      color: 'bg-red-50 text-red-600 border-red-100',      icon: <AlertCircle size={16} />,   priority: 'Critique' },
    prediction: { label: 'Prédiction IA', color: 'bg-purple-50 text-purple-600 border-purple-100', icon: <BrainCircuit size={16} />, priority: 'IA' },
    anomalie:   { label: 'Anomalie IA',   color: 'bg-amber-50 text-amber-600 border-amber-100',   icon: <ShieldAlert size={16} />,  priority: 'IA' },
};

const StockAlerts = () => {
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [resolvedAlerts, setResolvedAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all | seuil | prediction | anomalie
    const [searchQuery, setSearchQuery] = useState('');

    const normalise = (a) => ({
        id: a.id,
        product: a.produit?.nom ?? a.produit?.name ?? a.product?.nom ?? '—',
        sku: a.produit?.sku ?? a.product?.sku ?? '—',
        stock: a.produit?.quantite ?? a.produit?.stock_actuel ?? a.stock_actuel ?? 0,
        threshold: a.seuil ?? 0,
        type: a.type ?? 'seuil',
        message: a.message ?? null,
        confiance: a.confiance ?? null,
        declenche_le: a.declenche_le,
        produit_id: a.produit_id ?? a.product_id ?? a.produit?.id ?? a.product?.id,
        priority: a.type === 'prediction' || a.type === 'anomalie' ? 'IA' : (a.priorite ?? 'High'),
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await alertService.getActive();
                const list = Array.isArray(data) ? data : (data?.data ?? []);
                setActiveAlerts(list.map(normalise));
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleResolve = async (alertId) => {
        const alertToResolve = activeAlerts.find(a => a.id === alertId);
        if (!alertToResolve) return;
        try {
            await alertService.resolve(alertId);
            setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
            setResolvedAlerts(prev => [{ ...alertToResolve, resolvedAt: new Date().toLocaleString('fr-FR') }, ...prev]);
        } catch {}
    };

    const filtered = activeAlerts
        .filter(a => filter === 'all' || a.type === filter)
        .filter(a => !searchQuery || a.product.toLowerCase().includes(searchQuery.toLowerCase()) || (a.message ?? '').toLowerCase().includes(searchQuery.toLowerCase()));

    const countByType = (t) => activeAlerts.filter(a => a.type === t).length;

    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Header */}
            <header className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {activeAlerts.some(a => a.type === 'prediction' || a.type === 'anomalie') && (
                        <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-lg">
                            <BrainCircuit size={14} className="text-purple-600" />
                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                                {countByType('prediction') + countByType('anomalie')} alerte{(countByType('prediction') + countByType('anomalie')) > 1 ? 's' : ''} IA
                            </span>
                        </div>
                    )}
                </div>
                <Link to="/alerts/thresholds"
                    className="flex items-center gap-2 bg-[#1e293b] text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-slate-800 transition-all active:scale-95">
                    <Settings size={16} /> Configuration
                </Link>
            </header>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 mb-6 items-center">
                <div className="relative w-full md:max-w-xl">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Rechercher une alerte..."
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm" />
                </div>
                {/* Type filter chips */}
                <div className="flex gap-2">
                    {[
                        { key: 'all', label: 'Toutes', count: activeAlerts.length },
                        { key: 'seuil', label: 'Seuil', count: countByType('seuil') },
                        { key: 'prediction', label: 'Prédictions IA', count: countByType('prediction') },
                        { key: 'anomalie', label: 'Anomalies IA', count: countByType('anomalie') },
                    ].map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                                filter === f.key ? 'bg-[#1e293b] text-white border-[#1e293b]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}>
                            {f.label}
                            {f.count > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filter === f.key ? 'bg-white/20' : 'bg-slate-100'}`}>{f.count}</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-12">
                {/* Active Alerts */}
                <section>
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-2">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Priorités Actives</h2>
                        <span className="bg-gray-200 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-bold">{filtered.length}</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="bg-green-50 p-4 rounded-full mb-4">
                                <CheckCircle className="text-green-500" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700">Tout est sous contrôle</h3>
                            <p className="text-gray-400 mt-1">{filter === 'all' ? "Aucune alerte active." : "Aucune alerte de ce type."}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {filtered.map(alert => {
                                const cfg = TYPE_CONFIG[alert.type] ?? TYPE_CONFIG.seuil;
                                return (
                                    <div key={alert.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`p-2 rounded-lg ${cfg.color}`}>
                                                    {cfg.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-[13px] font-bold text-slate-800">{alert.product}</h3>
                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${cfg.color}`}>
                                                            {cfg.label}
                                                        </span>
                                                        {alert.confiance != null && (
                                                            <span className="text-[8px] font-bold bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full">
                                                                Confiance: {(alert.confiance * 100).toFixed(0)}%
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Message IA ou info classique */}
                                                    {alert.message ? (
                                                        <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{alert.message}</p>
                                                    ) : (
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                                                            {alert.sku} &bull; Stock: <span className="text-red-500">{alert.stock}</span> / Seuil: {alert.threshold}
                                                        </p>
                                                    )}

                                                    {alert.declenche_le && (
                                                        <p className="text-[9px] text-slate-300 mt-1.5 flex items-center gap-1">
                                                            <Clock size={10} /> {new Date(alert.declenche_le).toLocaleString('fr-FR')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {(alert.type === 'prediction' || alert.type === 'anomalie' || alert.type === 'seuil') && (
                                                    <Link 
                                                        to="/ai-insights"
                                                        state={{ productId: alert.produit_id ?? alert.product_id }}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold hover:bg-purple-100 transition-all border border-purple-100">
                                                        <BrainCircuit size={12} /> Analyse IA <ArrowRight size={10} />
                                                    </Link>
                                                )}
                                                <button onClick={() => handleResolve(alert.id)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100">
                                                    <CheckCircle size={14} /> Résoudre
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Resolved */}
                <section>
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Récemment Résolues</h2>
                    {resolvedAlerts.length === 0 ? (
                        <div className="text-center py-10 opacity-40 italic text-gray-500">
                            Aucune alerte résolue récemment.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {resolvedAlerts.map(alert => (
                                <div key={alert.id} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-center justify-between opacity-70">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span className="text-sm font-bold text-slate-700">{alert.product}</span>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${(TYPE_CONFIG[alert.type] ?? TYPE_CONFIG.seuil).color}`}>
                                            {(TYPE_CONFIG[alert.type] ?? TYPE_CONFIG.seuil).label}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{alert.resolvedAt}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default StockAlerts;