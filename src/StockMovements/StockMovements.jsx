import React, { useState } from 'react';
import { toast } from "react-hot-toast";
import { ArrowUpRight, ArrowDownLeft, CheckCircle, AlertTriangle, Calendar, History } from 'lucide-react';
import { Link } from 'react-router-dom';

const StockMovements = () => {
    // États vides : tout est à 0 ou vide pour ton futur Backend
    const [movementType, setMovementType] = useState('IN');
    const [selectedProductId, setSelectedProductId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [note, setNote] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Simulation d'une liste (Backend Integration Stub)
    const [products] = useState([
        { id: 1, name: "UltraGlide Velocity X1" },
        { id: 2, name: "Zenith Chrono Black" },
        { id: 3, name: "SonicBeam H1 ANC" }
    ]);

    const handleConfirm = () => {
        if (!selectedProductId || !quantity) {
            toast.error("Veuillez remplir les champs obligatoires (produit et quantité).");
            return;
        }

        setIsSubmitting(true);
        // Simulation d'un appel API (Backend Integration Stub)
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Mouvement de stock enregistré avec succès !");
            // Réinitialisation du formulaire
            setQuantity("");
            setNote("");
        }, 1500);
    };

    return (
        /* w-full pour occuper tout l'espace à droite de la sidebar */
        <div className="w-full min-h-screen bg-gray-50 p-6 md:p-12">

            {/* Navigation discrète */}
            <nav className="flex text-sm text-gray-400 mb-8 items-center gap-2">
                <span className="hover:text-blue-600 cursor-pointer">Mouvements de Stock</span>
                <span>/</span>
                <span className="text-gray-600 font-medium">Nouvel Enregistrement</span>
            </nav>

            <div className="w-full">
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Enregistrer un mouvement de stock</h1>
                        <p className="text-gray-500 text-lg mt-2">Enregistrez les ajustements d'inventaire entrants et sortants avec précision.</p>
                    </div>
                    <Link 
                        to="/movement-history" 
                        className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <History size={20} /> Voir l'historique
                    </Link>
                </div>

                {/* Le formulaire prend maintenant toute la largeur disponible */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">

                    {/* Toggle Type - Largeur fixe ou fluide selon ton choix */}
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-10 max-w-md">
                        <button
                            onClick={() => setMovementType('IN')}
                            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${movementType === 'IN' ? 'bg-white shadow-md text-green-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <ArrowDownLeft size={22} /> Entrée de Stock
                        </button>
                        <button
                            onClick={() => setMovementType('OUT')}
                            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${movementType === 'OUT' ? 'bg-white shadow-md text-red-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <ArrowUpRight size={22} /> Sortie de Stock
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {/* Product Selector */}
                        <div className="w-full">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Sélecteur de Produit</label>
                            <select
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                            >
                                <option value="">Sélectionner un produit dans la liste...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Quantity */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Quantité</label>
                                <input
                                    type="number"
                                    placeholder="Ex: 10"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Note / Référence</label>
                            <textarea
                                placeholder="Ajoutez une raison ou un numéro de bon de commande..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl h-40 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-6 pt-6 border-t border-gray-50">
                            <button
                                onClick={() => { setQuantity(""); setNote(""); }}
                                className="text-gray-400 font-bold hover:text-red-500 transition-colors"
                            >
                                Réinitialiser le formulaire
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                className={`w-full md:w-auto bg-[#1e293b] text-white px-12 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        Confirmer le mouvement <CheckCircle size={20} />
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