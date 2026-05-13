import React, { useState, useEffect, useRef } from 'react';
import { toast } from "react-hot-toast";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  History, 
  Package, 
  Hash, 
  FileText,
  TrendingUp,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import productService from '../services/productService';
import movementService from '../services/movementService';

const StockMovements = () => {
    const [movementType, setMovementType] = useState('IN');
    const [selectedProductId, setSelectedProductId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [note, setNote] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const dateInputRef = useRef(null);

    useEffect(() => {
        productService.getAll().then((data) => {
            const list = Array.isArray(data) ? data : (data.data ?? []);
            setProducts(list);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (selectedProductId) {
            const p = products.find(p => p.id.toString() === selectedProductId.toString());
            setSelectedProduct(p);
        } else {
            setSelectedProduct(null);
        }
    }, [selectedProductId, products]);

    const handleConfirm = async () => {
        if (!selectedProductId || !quantity) {
            toast.error("Veuillez remplir les champs obligatoires (produit et quantité).");
            return;
        }

        const currentQty = selectedProduct ? (selectedProduct.quantite ?? selectedProduct.quantite_stock ?? 0) : 0;

        if (movementType === 'OUT' && currentQty <= 0) {
            toast.error("Impossible d'effectuer une sortie : Le stock est de 0.");
            return;
        }

        if (movementType === 'OUT' && currentQty < parseInt(quantity, 10)) {
            toast.error(`Stock insuffisant. Stock disponible : ${currentQty}`);
            return;
        }

        setIsSubmitting(true);
        try {
            await movementService.record({
                produit_id: selectedProductId,
                type: movementType === 'IN' ? 'entree' : 'sortie',
                quantite: parseInt(quantity, 10),
                note: note || undefined,
                date_mouvement: date || undefined,
            });
            toast.success("Flux de stock enregistré avec succès !");
            
            productService.getAll().then((data) => {
                const list = Array.isArray(data) ? data : (data.data ?? []);
                setProducts(list);
            }).catch(() => {});

            setQuantity("");
            setNote("");
        } catch (err) {
            const msg = err.response?.data?.message || "Erreur lors de l'enregistrement.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full animate-in fade-in duration-700">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mouvements de Stock</h2>
                        <p className="text-slate-500 text-sm mt-1">Enregistrez les flux entrants et sortants de votre inventaire.</p>
                    </div>
                    <Link
                        to="/movements/history"
                        className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-black shadow-sm hover:bg-slate-50 transition-all active:scale-95 text-slate-600 uppercase tracking-widest"
                    >
                        <History size={16} /> Historique
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 md:p-10">
                            {/* Toggle Type Premium */}
                            <div className="flex bg-slate-100/50 p-1.5 rounded-[18px] mb-10 w-full">
                                <button
                                    onClick={() => setMovementType('IN')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                                        movementType === 'IN' ? 'bg-white text-emerald-600 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <ArrowUpRight size={16} />
                                    Entrée
                                </button>
                                <button
                                    onClick={() => setMovementType('OUT')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                                        movementType === 'OUT' ? 'bg-white text-red-600 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <ArrowDownLeft size={16} />
                                    Sortie
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Product Selector */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Sélection du Produit</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                            <Package size={18} />
                                        </div>
                                        <select
                                            value={selectedProductId}
                                            onChange={(e) => setSelectedProductId(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-slate-700 text-sm font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="">Choisir un article...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.nom ?? p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Quantity */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Quantité</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <Hash size={18} />
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="Quantité à ajuster"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-bold"
                                            />
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Date effective</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <Calendar size={18} />
                                            </div>
                                            <input
                                                ref={dateInputRef}
                                                type="date"
                                                value={date}
                                                onClick={() => dateInputRef.current?.showPicker()}
                                                onChange={(e) => setDate(e.target.value)}
                                                className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-bold cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Note de mouvement</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                            <FileText size={18} />
                                        </div>
                                        <textarea
                                            placeholder="Ex: Réception commande #1234, Retour client, etc."
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl h-32 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all resize-none text-sm font-bold"
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-8 pt-8 border-t border-slate-100">
                                    <button
                                        onClick={() => { setQuantity(""); setNote(""); setSelectedProductId(""); }}
                                        className="text-[11px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.2em]"
                                    >
                                        Réinitialiser
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={isSubmitting}
                                        className={`w-full md:w-auto min-w-[200px] bg-slate-900 text-white px-10 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-blue-500/10 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Envoi...
                                            </>
                                        ) : (
                                            <>
                                                Valider le flux <CheckCircle size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Contextual Insights */}
                    <div className="lg:col-span-5 space-y-6 sticky top-8">
                        <AnimatePresence mode="wait">
                            {selectedProduct ? (
                                <motion.div
                                    key={selectedProduct.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-[24px] border border-slate-100 shadow-xl p-6"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                            <Info size={24} />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catégorie ABC</span>
                                            <span className="text-xl font-black text-blue-600">{selectedProduct.abc_category || 'B'}</span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-lg font-black text-slate-900 mb-1">{selectedProduct.nom || selectedProduct.name}</h3>
                                    <p className="text-xs text-slate-500 mb-6">{selectedProduct.sku || 'REF-N/A'}</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">En Stock</p>
                                            <p className="text-xl font-black text-slate-900">
                                                {selectedProduct.quantite ?? selectedProduct.stock_actuel ?? 0} 
                                                <span className="text-[10px] ml-1 font-bold text-slate-400">UNITÉS</span>
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Seuil Min</p>
                                            <p className="text-xl font-black text-slate-900">
                                                {selectedProduct.seuil_min ?? selectedProduct.seuil_minimum ?? 0}
                                                <span className="text-[10px] ml-1 font-bold text-slate-400">UNITÉS</span>
                                            </p>
                                        </div>
                                    </div>

                                    {movementType === 'OUT' && (
                                        <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                                            <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                                            <p className="text-[11px] font-bold text-amber-800 leading-tight">
                                                Stock après sortie : <span className="font-black text-lg">{Math.max(0, (selectedProduct.quantite ?? 0) - (parseInt(quantity) || 0))}</span> unités.
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest">
                                            <TrendingUp size={14} /> rotation active
                                        </div>
                                        <Link 
                                            to={`/products/${selectedProduct.id}`}
                                            className="text-blue-600 font-black uppercase tracking-widest hover:underline"
                                        >
                                            Détails
                                        </Link>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                                    <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                                        <Package size={32} className="text-slate-300" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-[180px]">
                                        Sélectionnez un produit pour voir ses informations de stock en temps réel.
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockMovements;