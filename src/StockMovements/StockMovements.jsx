import React, { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { ArrowUpRight, ArrowDownLeft, CheckCircle, AlertTriangle, Calendar, History } from 'lucide-react';
import { Link } from 'react-router-dom';
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

    useEffect(() => {
        productService.getAll().then((data) => {
            const list = Array.isArray(data) ? data : (data.data ?? []);
            setProducts(list);
        }).catch(() => {});
    }, []);

    const handleConfirm = async () => {
        if (!selectedProductId || !quantity) {
            toast.error("Veuillez remplir les champs obligatoires (produit et quantité).");
            return;
        }

        setIsSubmitting(true);
        try {
            await movementService.record({
                product_id: selectedProductId,
                type: movementType === 'IN' ? 'entree' : 'sortie',
                quantite: parseInt(quantity, 10),
                note: note || undefined,
                date: date || undefined,
            });
            toast.success("Mouvement de stock enregistré avec succès !");
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
        <div className="w-full animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-end">
          <Link
            to="/movements/history"
            className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95 text-slate-600"
          >
            <History size={16} /> Historique
          </Link>
        </div>

        {/* Le formulaire est maintenant centré et limité en largeur */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-10">
          {/* Toggle Type */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-8 max-w-[280px]">
            <button
              onClick={() => setMovementType('IN')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[13px] font-bold transition-all ${movementType === 'IN' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${movementType === 'IN' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              Entrée
            </button>
            <button
              onClick={() => setMovementType('OUT')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[13px] font-bold transition-all ${movementType === 'OUT' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${movementType === 'OUT' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
              Sortie
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {/* Product Selector */}
            <div className="w-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Produit</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-700 text-[13px] font-medium appearance-none"
              >
                <option value="">Sélectionner un produit...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.nom ?? p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Quantity */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Quantité</label>
                <input
                  type="number"
                  placeholder="Ex: 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-[13px] font-medium"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-[13px] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Note / Référence</label>
              <textarea
                placeholder="Raison du mouvement ou référence document..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg h-32 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all resize-none text-[13px] font-medium"
              ></textarea>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-6 pt-6 border-t border-slate-50">
              <button
                onClick={() => { setQuantity(""); setNote(""); }}
                className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider"
              >
                Réinitialiser
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className={`w-full md:w-auto bg-[#1e293b] text-white px-8 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    Confirmer le mouvement <CheckCircle size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
        </div>
    );
};

export default StockMovements;