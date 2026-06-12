import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Clock, CheckCircle2, XCircle, Search,
  Filter, Eye, FileText, X, Truck, PackageCheck, Ban, Loader2
} from 'lucide-react';
import orderService from '../services/orderService';
import { toast } from 'react-hot-toast';
import { isAdmin } from '../services/permissionHelper';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // order id being processed

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAll();
      setOrders(Array.isArray(data) ? data : (data.data || []));
    } catch {
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // ── Confirmer Réception (en_attente → livree) ──
  const handleConfirmReception = async (order) => {
    if (!isAdmin()) { toast.error("Réservé aux administrateurs."); return; }
    setActionLoading(order.id);
    try {
      await orderService.updateStatus(order.id, 'livree');
      toast.success(`✅ Commande #${order.id} reçue — stock mis à jour !`);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, statut: 'livree' } : o));
      if (selectedOrder?.id === order.id) setSelectedOrder(p => ({ ...p, statut: 'livree' }));
    } catch {
      toast.error("Erreur lors de la confirmation de réception.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Annuler Commande (remet stock_en_transit) ──
  const handleCancelOrder = async (order) => {
    if (!isAdmin()) { toast.error("Réservé aux administrateurs."); return; }
    if (!window.confirm(`Annuler la commande #${order.id} ? Le stock en transit sera libéré.`)) return;
    setActionLoading(order.id);
    try {
      await orderService.updateStatus(order.id, 'annulee');
      toast.success(`Commande #${order.id} annulée — transit libéré.`);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, statut: 'annulee' } : o));
      if (selectedOrder?.id === order.id) setSelectedOrder(p => ({ ...p, statut: 'annulee' }));
    } catch {
      toast.error("Erreur lors de l'annulation.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleShowDetails = async (id) => {
    try {
      const res = await orderService.getById(id);
      setSelectedOrder(res.data || res);
      setIsModalOpen(true);
    } catch {
      toast.error("Impossible de charger les détails");
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedOrder) return;
    const printWindow = window.open('', '_blank');
    const content = `<html><head><title>Bon de Commande #${selectedOrder.id}</title>
      <style>body{font-family:sans-serif;padding:40px;color:#1e293b}h1{color:#1d4ed8}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th{background:#f8fafc;padding:12px;font-size:12px;border-bottom:1px solid #e2e8f0;text-align:left}
      td{padding:12px;border-bottom:1px solid #f1f5f9}
      .total{text-align:right;margin-top:40px;font-size:20px;font-weight:bold}
      </style></head><body>
      <h1>BON DE COMMANDE #${selectedOrder.id}</h1>
      <p><strong>Fournisseur:</strong> ${selectedOrder.fournisseur?.nom}</p>
      <p><strong>Date:</strong> ${new Date(selectedOrder.date_commande).toLocaleDateString('fr-FR')}</p>
      <p><strong>Statut:</strong> ${selectedOrder.statut?.toUpperCase()}</p>
      <table><thead><tr><th>Produit</th><th>Quantité</th><th>Prix Unit.</th><th>Total</th></tr></thead>
      <tbody>${(selectedOrder.lignes || []).map(i =>
        `<tr><td>${i.produit?.nom}</td><td>${i.quantite}</td><td>${parseFloat(i.prix).toFixed(2)} MAD</td><td>${(i.quantite * i.prix).toFixed(2)} MAD</td></tr>`
      ).join('')}</tbody></table>
      <div class="total">Total : ${parseFloat(selectedOrder.total).toLocaleString('fr-FR')} MAD</div>
      <script>window.print();</script></body></html>`;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const getStatusBadge = (status) => {
    const map = {
      en_attente: <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100"><Clock size={12} /> En attente</span>,
      livree:     <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100"><CheckCircle2 size={12} /> Reçu / Livré</span>,
      annulee:    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100"><XCircle size={12} /> Annulé</span>,
    };
    return map[status] || <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase">{status}</span>;
  };

  // ── Calcul transit pour affichage ──
  const getTotalTransit = (order) => {
    if (!order.lignes_commande && !order.lignes) return 0;
    return (order.lignes_commande || order.lignes || []).reduce((s, l) => s + (l.quantite || 0), 0);
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.id.toString().includes(searchTerm) ||
      (o.fournisseur?.nom || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.statut === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = orders.filter(o => o.statut === 'en_attente').length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative space-y-6">

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Commande #{selectedOrder.id}</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                    {selectedOrder.fournisseur?.nom} • {new Date(selectedOrder.date_commande).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fournisseur</p>
                    <p className="text-sm font-bold text-slate-800">{selectedOrder.fournisseur?.nom}</p>
                    <p className="text-xs text-slate-500">{selectedOrder.fournisseur?.email}</p>
                    <p className="text-xs text-slate-500">{selectedOrder.fournisseur?.telephone}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</p>
                    <div className="flex justify-end">{getStatusBadge(selectedOrder.statut)}</div>
                    {selectedOrder.date_prevue_livraison && (
                      <p className="text-xs text-violet-600 font-bold">
                        📅 Livraison prévue : {new Date(selectedOrder.date_prevue_livraison).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    <p className="text-lg font-black text-blue-600">{parseFloat(selectedOrder.total || 0).toLocaleString('fr-FR')} MAD</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Articles</p>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 font-bold text-slate-600">Produit</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-center">Qté</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-right">Prix Unit.</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(selectedOrder.lignes || selectedOrder.lignes_commande || []).map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 font-medium text-slate-800">{item.produit?.nom}</td>
                            <td className="px-4 py-3 text-center font-bold">
                              <span className="inline-flex items-center gap-1 text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full text-xs font-black">
                                <Truck size={10} /> {item.quantite}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-slate-500">{parseFloat(item.prix).toFixed(2)} MAD</td>
                            <td className="px-4 py-3 text-right font-black text-slate-900">{(item.quantite * item.prix).toFixed(2)} MAD</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Transit info box */}
                {selectedOrder.statut === 'en_attente' && (
                  <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3">
                    <Truck className="text-violet-600 mt-0.5 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-bold text-violet-800 text-sm">Stock en transit</p>
                      <p className="text-xs text-violet-600 mt-0.5">
                        Cette commande est en cours de livraison. {getTotalTransit(selectedOrder)} unités
                        sont comptabilisées dans le stock disponible en tant que "En Transit".
                        Cliquez sur "Confirmer Réception" dès l'arrivée physique des marchandises.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                {isAdmin() && selectedOrder.statut === 'en_attente' && (
                  <>
                    <button
                      onClick={() => { handleConfirmReception(selectedOrder); setIsModalOpen(false); }}
                      disabled={actionLoading === selectedOrder.id}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-60"
                    >
                      {actionLoading === selectedOrder.id ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
                      Confirmer Réception
                    </button>
                    <button
                      onClick={() => { handleCancelOrder(selectedOrder); setIsModalOpen(false); }}
                      disabled={actionLoading === selectedOrder.id}
                      className="py-3 px-5 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2 disabled:opacity-60"
                    >
                      <Ban size={16} /> Annuler
                    </button>
                  </>
                )}
                <button onClick={handleDownloadPDF}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                  <FileText size={16} /> PDF
                </button>
                <button onClick={() => setIsModalOpen(false)}
                  className="py-3 px-5 bg-white text-slate-600 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Commandes Fournisseurs</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Cycle complet : Commande → Transit → Stock Physique</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl">
            <Truck size={16} className="text-amber-600" />
            <p className="text-sm font-black text-amber-700">{pendingCount} commande{pendingCount > 1 ? 's' : ''} en transit</p>
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Rechercher par N° ou fournisseur..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer">
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En transit (attente)</option>
            <option value="livree">Reçu</option>
            <option value="annulee">Annulé</option>
          </select>
        </div>
        <button onClick={fetchOrders} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all">
          <Clock size={18} />
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">N° Cmd</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fournisseur</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transit</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium">Aucune commande trouvée.</td></tr>
              ) : filteredOrders.map((order) => {
                const isPending = order.statut === 'en_attente';
                const isLoading_ = actionLoading === order.id;
                const totalTransit = getTotalTransit(order);
                return (
                  <tr key={order.id} className={`hover:bg-slate-50/50 transition-colors ${isPending ? 'border-l-4 border-l-violet-400' : ''}`}>
                    <td className="px-6 py-4 font-black text-blue-600 text-sm">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{order.fournisseur?.nom || 'Inconnu'}</span>
                        <span className="text-[10px] text-slate-400">{order.fournisseur?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      {new Date(order.date_commande).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {isPending && totalTransit > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-[10px] font-black border border-violet-200">
                          <Truck size={10} className="animate-bounce" />
                          {totalTransit} u.
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900">
                      {parseFloat(order.total || 0).toLocaleString('fr-FR')} MAD
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.statut)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Confirmer Réception */}
                        {isAdmin() && isPending && (
                          <>
                            <button
                              onClick={() => handleConfirmReception(order)}
                              disabled={isLoading_}
                              title="Confirmer la réception — Transit → Stock Physique"
                              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-60 shadow-md shadow-emerald-200"
                            >
                              {isLoading_ ? <Loader2 size={12} className="animate-spin" /> : <PackageCheck size={12} />}
                              Réception
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order)}
                              disabled={isLoading_}
                              title="Annuler la commande — libère le stock en transit"
                              className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-95 disabled:opacity-60 border border-red-100"
                            >
                              <Ban size={14} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleShowDetails(order.id)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
