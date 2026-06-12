import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loader2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductRequestsList() {
  const [requests, setRequests] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvalModal, setApprovalModal] = useState({ isOpen: false, reqId: null, data: { prix: 0, fournisseur_id: '', quantite_commande: 0 } });

  const fetchRequestsAndData = async () => {
    try {
      const [reqRes, fournRes] = await Promise.all([
        api.get('/product-requests'),
        api.get('/fournisseurs')
      ]);
      setRequests(reqRes.data);
      setFournisseurs(fournRes.data.data || fournRes.data || []);
    } catch (err) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestsAndData();
  }, []);

  const handleUpdateStatus = async (id, status, extraData = {}) => {
    try {
      await api.put(`/product-requests/${id}/status`, { status, ...extraData });
      toast.success(status === 'approuve' ? "Demande approuvée. Produit (et commande) créé." : "Demande rejetée.");
      setApprovalModal({ isOpen: false, reqId: null, data: { prix: 0, fournisseur_id: '', quantite_commande: 0 } });
      fetchRequestsAndData(); // Refresh
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const openApprovalModal = (id) => {
    setApprovalModal({ isOpen: true, reqId: id, data: { prix: 0, fournisseur_id: '', quantite_commande: 0 } });
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aucune demande en attente</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[9px] font-extrabold tracking-widest text-slate-400">
            <th className="px-5 py-3">Produit Suggéré</th>
            <th className="px-5 py-3">Catégorie</th>
            <th className="px-5 py-3">Utilisateur</th>
            <th className="px-5 py-3">Statut</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {requests.map(req => (
            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-700">{req.nom}</span>
                  {req.description && <span className="text-[10px] text-slate-400">{req.description}</span>}
                </div>
              </td>
              <td className="px-5 py-3 text-[12px] font-medium text-slate-500">
                {req.categorie?.nom || '—'}
              </td>
              <td className="px-5 py-3 text-[12px] font-bold text-slate-600">
                {req.user?.name || req.user?.nom || '—'}
              </td>
              <td className="px-5 py-3">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                  req.status === 'approuve' ? 'bg-emerald-100 text-emerald-700' :
                  req.status === 'rejete' ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {req.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                {req.status === 'en_attente' && (
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openApprovalModal(req.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                      title="Approuver (Créer Produit)"
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(req.id, 'rejete')}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Rejeter"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Approval Modal */}
      <AnimatePresence>
        {approvalModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setApprovalModal({ ...approvalModal, isOpen: false })}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold">Valider la Suggestion</h3>
                <button onClick={() => setApprovalModal({ ...approvalModal, isOpen: false })} className="hover:bg-white/20 p-1 rounded-md">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-500 mb-2">Configurez les paramètres initiaux pour ce nouveau produit. Si vous spécifiez une quantité, une commande automatique sera générée.</p>
                
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-1">Prix Unitaire (€)</label>
                  <input type="number" step="0.01" min="0" 
                    value={approvalModal.data.prix} 
                    onChange={e => setApprovalModal({ ...approvalModal, data: { ...approvalModal.data, prix: e.target.value } })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-1">Fournisseur Associé</label>
                  <select 
                    value={approvalModal.data.fournisseur_id} 
                    onChange={e => setApprovalModal({ ...approvalModal, data: { ...approvalModal.data, fournisseur_id: e.target.value } })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Sélectionnez un fournisseur --</option>
                    {fournisseurs.map(f => (
                      <option key={f.id} value={f.id}>{f.nom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-1">Quantité à Commander (Auto)</label>
                  <input type="number" min="0" 
                    value={approvalModal.data.quantite_commande} 
                    onChange={e => setApprovalModal({ ...approvalModal, data: { ...approvalModal.data, quantite_commande: e.target.value } })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  onClick={() => setApprovalModal({ ...approvalModal, isOpen: false })}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleUpdateStatus(approvalModal.reqId, 'approuve', approvalModal.data)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm"
                >
                  Approuver & Créer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
