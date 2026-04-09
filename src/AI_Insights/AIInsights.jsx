import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    BrainCircuit, TrendingUp, PackageCheck, AlertCircle,
    Play, Calendar, ShieldCheck, ArrowRight, Search, Zap, ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';

const AIInsights = () => {
    const [selectedProduct, setSelectedProduct] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasData, setHasData] = useState(false);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        productService.getAll().then((data) => {
            const list = Array.isArray(data) ? data : (data.data ?? []);
            setProducts(list);
        }).catch(() => {});
    }, []);



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
        <div className="w-full animate-in fade-in duration-500">

            {/* Header d'actions IA */}
            <header className="mb-6 flex flex-col md:flex-row justify-end items-center gap-4">
                <div className="flex bg-white px-5 py-2 rounded-lg border border-slate-100 shadow-sm items-center gap-3">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Modèle IA</p>
                        <p className="text-xs font-bold text-emerald-600">Opérationnel</p>
                    </div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <Link 
                    to="/ai-insights/anomalies" 
                    className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95 text-slate-600"
                >
                    <ShieldAlert size={16} className="text-red-500" /> Anomalies
                </Link>
            </header>

            {/* Barre de contrôle */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row items-end gap-6">
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">1. Produit</label>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none transition-all text-[13px]"
                            onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                            <option value="">Sélectionner un article...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.nom ?? p.name}>{p.nom ?? p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex-none w-full lg:w-auto">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">2. Prévision</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg h-[46px]">
                        {['7j', '14j', '30j', '90j'].map(d => (
                            <button key={d} className={`px-5 rounded-md text-[13px] font-bold transition-all ${d === '30j' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    className={`w-full lg:w-auto bg-[#1e293b] text-white px-8 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={handleAnalyze}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Analyse...
                        </>
                    ) : (
                        <>
                            <Zap size={16} fill="currentColor" /> Analyser
                        </>
                    )}
                </button>
            </div>

            {/* État Vide */}
            {!hasData && (
                <div className="w-full py-20 bg-white rounded-xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <BrainCircuit className="text-blue-500" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Analyse Prédictive</h2>
                    <p className="text-xs text-slate-400 mt-2 max-w-sm">
                        Sélectionnez un produit et une période pour générer des prévisions de demande intelligentes.
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