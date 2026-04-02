import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    BrainCircuit, TrendingUp, PackageCheck, AlertCircle,
    Play, Calendar, ShieldCheck, ArrowRight, Search, Zap, ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AIInsights = () => {
    // États vides pour tes futurs calculs
    const [selectedProduct, setSelectedProduct] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasData, setHasData] = useState(false);
    // Simulation de produits
    const [products] = useState([
        { id: 1, name: "UltraGlide Velocity X1" },
        { id: 2, name: "Zenith Chrono Black" },
        { id: 3, name: "SonicBeam H1 ANC" }
    ]);

    const handleAnalyze = () => {
        if (!selectedProduct) {
            toast.error("Veuillez sélectionner un produit.");
            return;
        }

        setIsLoading(true);
        // Simulation d'un appel API (Backend Integration Stub)
        setTimeout(() => {
            setIsLoading(false);
            setHasData(true);
            toast.success(`Analyse terminée pour ${selectedProduct}`);
        }, 2000);
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 p-6 md:p-12">

            {/* Header Large */}
            {/* Header Large */}
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <BrainCircuit className="text-blue-600" size={36} /> Analyses IA
                    </h1>
                    <p className="text-gray-500 text-lg mt-2 font-medium">Optimisation des stocks par Intelligence Artificielle.</p>
                </div>
                <div className="hidden md:flex bg-white p-4 rounded-2xl border border-gray-100 shadow-sm items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut du Modèle</p>
                        <p className="text-sm font-bold text-green-600">Prêt à analyser</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <Link 
                    to="/ai-anomalies" 
                    className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95"
                >
                    <ShieldAlert size={20} className="text-red-500" /> Détection d'anomalies
                </Link>
            </header>

            {/* Barre de contrôle - Prend toute la largeur */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-10 flex flex-col lg:flex-row items-end gap-8">
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">1. Sélectionner un produit</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
                            onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                            <option value="">Choisir dans l'inventaire...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex-none w-full lg:w-auto">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">2. Période de prévision</label>
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl h-[60px]">
                        {['7j', '14j', '30j', '90j'].map(d => (
                            <button key={d} className={`px-8 rounded-xl text-sm font-bold transition-all ${d === '30j' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    className={`w-full lg:w-auto bg-[#1e293b] text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-blue-100 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={handleAnalyze}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Analyse en cours...
                        </>
                    ) : (
                        <>
                            <Zap size={20} fill="currentColor" /> Lancer l'analyse
                        </>
                    )}
                </button>
            </div>

            {/* État Vide (Empty State) */}
            {!hasData && (
                <div className="w-full py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <BrainCircuit className="text-blue-500" size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Prêt pour l'analyse prédictive</h2>
                    <p className="text-gray-400 mt-2 max-w-md">
                        Sélectionnez un produit et une période pour générer des prévisions de demande et optimiser vos commandes (EOQ).
                    </p>
                </div>
            )}

            {/* Cette partie restera masquée tant que hasData est false */}
            {hasData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Tes cartes EOQ, Stockout et Recommendations viendront ici */}
                </div>
            )}

        </div>
    );
};

export default AIInsights;