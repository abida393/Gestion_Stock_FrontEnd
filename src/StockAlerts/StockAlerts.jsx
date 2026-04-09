import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, AlertCircle, SortDesc, X, Search, Inbox, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import alertService from '../services/alertService';

const StockAlerts = () => {
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [resolvedAlerts, setResolvedAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const normalise = (a) => ({
        id: a.id,
        product: a.product?.nom ?? a.product?.name ?? a.produit ?? '—',
        sku: a.product?.sku ?? a.sku ?? '—',
        stock: a.stock_actuel ?? a.stock ?? 0,
        threshold: a.seuil ?? a.threshold ?? 0,
        priority: a.priorite ?? a.priority ?? 'High',
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await alertService.getActive();
                const list = Array.isArray(data) ? data : (data.data ?? []);
                setActiveAlerts(list.map(normalise));
            } catch {
                setError("Impossible de charger les alertes.");
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
            setResolvedAlerts(prev => [{ ...alertToResolve, resolvedAt: new Date().toLocaleString() }, ...prev]);
        } catch {
            // silently fail — keep optimistic state as-is
        }
    };



    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Header d'actions */}
            <header className="mb-6 flex justify-end">
                <Link
                    to="/alerts/thresholds"
                    className="flex items-center gap-2 bg-[#1e293b] text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md shadow-blue-100 hover:bg-slate-800 transition-all active:scale-95"
                >
                    <Settings size={16} /> Configuration
                </Link>
            </header>

            {/* Barre d'outils large */}
            <div className="flex flex-col md:flex-row gap-3 mb-8 items-center">
                <div className="relative w-full md:max-w-xl">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher une alerte..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all text-sm"
                    />
                </div>
                <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                    <SortDesc size={16} /> Trier par priorité
                </button>
            </div>

            {/* Zone de contenu - Sans max-width pour remplir l'écran */}
            <div className="space-y-12">

                {/* Section Alertes Actives */}
                <section>
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-2">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Priorités Actives</h2>
                        <span className="bg-gray-200 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-bold">
                            {activeAlerts.length}
                        </span>
                    </div>

                    {activeAlerts.length === 0 ? (
                        /* État vide quand il n'y a pas d'alertes */
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="bg-green-50 p-4 rounded-full mb-4">
                                <CheckCircle className="text-green-500" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700">Tout est sous contrôle</h3>
                            <p className="text-gray-400 mt-1">Aucun produit n'est actuellement sous le seuil critique.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {activeAlerts.map(alert => (
                                <div key={alert.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm group hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${alert.priority === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                            <AlertCircle size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-[13px] font-bold text-slate-800">{alert.product}</h3>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                                                {alert.sku} • Stock: <span className="text-red-500">{alert.stock}</span> / Seuil: {alert.threshold}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleResolve(alert.id)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
                                    >
                                        <CheckCircle size={14} /> Marquer comme résolu
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Section Résolues */}
                <section>
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Récemment Résolues</h2>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    ) : resolvedAlerts.length === 0 ? (
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