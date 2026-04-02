import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, AlertCircle, SortDesc, X, Search, Inbox, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const StockAlerts = () => {
    // États vides pour attendre ton Backend
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [resolvedAlerts, setResolvedAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulation d'un chargement initial depuis le backend
        const timer = setTimeout(() => {
            setActiveAlerts([
                { id: 1, product: "Intel Core i9", sku: "CPU-INT-09", stock: 12, threshold: 50, priority: "High" },
                { id: 2, product: "Nvidia RTX 4090", sku: "GPU-NVI-40", stock: 3, threshold: 10, priority: "Critical" }
            ]);
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleResolve = (alertId) => {
        const alertToResolve = activeAlerts.find(a => a.id === alertId);
        if (alertToResolve) {
            setActiveAlerts(activeAlerts.filter(a => a.id !== alertId));
            setResolvedAlerts([{ ...alertToResolve, resolvedAt: new Date().toLocaleString() }, ...resolvedAlerts]);
        }
    };

    return (
        /* w-full assure qu'on prend toute la largeur disponible */
        <div className="w-full min-h-screen bg-gray-50 p-4 md:p-10">

            {/* Header - Aligné à gauche sans contrainte de largeur */}
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#1e293b] tracking-tight">Alertes de Stock</h1>
                    <p className="text-gray-500 mt-2 text-lg">Gérez les produits sous le seuil critique en temps réel.</p>
                </div>
                <Link 
                    to="/threshold-config" 
                    className="flex items-center gap-2 bg-[#1e293b] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-slate-800 transition-all active:scale-95"
                >
                    <Settings size={20} /> Configurer les seuils
                </Link>
            </header>

            {/* Barre d'outils large */}
            <div className="flex flex-col md:flex-row gap-4 mb-12 justify-between items-center">
                <div className="relative w-full md:max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher une alerte..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                    <SortDesc size={20} /> Trier par priorité
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
                        <div className="grid grid-cols-1 gap-4">
                            {activeAlerts.map(alert => (
                                <div key={alert.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${alert.priority === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{alert.product}</h3>
                                            <p className="text-xs text-gray-400 uppercase font-medium">{alert.sku} • Stock: <span className="text-red-500">{alert.stock}</span> / Seuil: {alert.threshold}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleResolve(alert.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold hover:bg-green-50 hover:text-green-600 transition-all"
                                    >
                                        <CheckCircle size={18} /> Marquer comme résolu
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