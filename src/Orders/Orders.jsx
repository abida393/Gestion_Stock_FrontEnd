import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Clock, CheckCircle2, XCircle, Search, Filter, Eye, ArrowRight, FileText, X } from 'lucide-react';
import orderService from '../services/orderService';
import { toast } from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAll();
      setOrders(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      toast.error("Erreur lors du chargement des commandes");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'en_attente':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100">
            <Clock size={12} /> En attente
          </span>
        );
      case 'livree':
      case 'reçu':
      case 'complet':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
            <CheckCircle2 size={12} /> Reçu / Livré
          </span>
        );
      case 'annulee':
      case 'annulé':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100">
            <XCircle size={12} /> Annulé
          </span>
        );
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase">{status}</span>;
    }
  };


  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShowDetails = async (id) => {
    setIsLoading(true);
    try {
      const res = await orderService.getById(id);
      setSelectedOrder(res.data || res);
      setIsModalOpen(true);

    } catch (err) {
      toast.error("Impossible de charger les détails");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedOrder) return;
    
    // Simple way to "download" is to print a hidden styled container
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Bon de Commande #${selectedOrder.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; pb: 20px; mb: 40px; }
            h1 { color: #1d4ed8; margin: 0; }
            .info { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .info-block h3 { color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background: #f8fafc; padding: 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .total { text-align: right; margin-top: 40px; font-size: 20px; font-weight: bold; }
            .footer { margin-top: 100px; font-size: 10px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>BON DE COMMANDE</h1>
              <p>N° #${selectedOrder.id}</p>
            </div>
            <div style="text-align: right">
              <p><strong>Date:</strong> ${new Date(selectedOrder.date_commande).toLocaleDateString('fr-FR')}</p>
              <p><strong>Statut:</strong> ${selectedOrder.statut.toUpperCase()}</p>
            </div>
          </div>

          <div class="info">
            <div class="info-block">
              <h3>Destinataire (Fournisseur)</h3>
              <p><strong>${selectedOrder.fournisseur?.nom}</strong></p>
              <p>${selectedOrder.fournisseur?.adresse || 'N/A'}</p>
              <p>${selectedOrder.fournisseur?.email || 'N/A'}</p>
              <p>${selectedOrder.fournisseur?.telephone || 'N/A'}</p>
            </div>
            <div class="info-block" style="text-align: right">
              <h3>Émetteur</h3>
              <p><strong>StockManager Pro</strong></p>
              <p>Inventaire Centralisé</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix Unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(selectedOrder.lignes || []).map(item => `
                <tr>
                  <td>${item.produit?.nom}</td>
                  <td>${item.quantite}</td>
                  <td>${parseFloat(item.prix).toFixed(2)} €</td>
                  <td>${(item.quantite * item.prix).toFixed(2)} €</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            Total Commande: ${parseFloat(selectedOrder.total).toLocaleString('fr-FR')} €
          </div>

          <div class="footer">
            Généré automatiquement par StockManager IA - ${new Date().toLocaleString()}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchTerm) || 
                         (order.fournisseur?.nom || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.statut === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await orderService.updateStatus(id, newStatus);
      toast.success(`Statut mis à jour : ${newStatus}`);
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === id ? { ...o, statut: newStatus } : o));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => ({ ...prev, statut: newStatus }));
      }
      
      // If received, we might want to refresh stock but backend should handle that via triggers
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative space-y-6"
    >
      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Détails de la Commande #{selectedOrder.id}</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                    {selectedOrder.fournisseur?.nom} • {new Date(selectedOrder.date_commande).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informations Fournisseur</p>
                    <p className="text-sm font-bold text-slate-800">{selectedOrder.fournisseur?.nom}</p>
                    <p className="text-xs text-slate-500">{selectedOrder.fournisseur?.email}</p>
                    <p className="text-xs text-slate-500">{selectedOrder.fournisseur?.telephone}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut Actuel</p>
                    <div className="flex justify-end gap-2 items-center">
                      {getStatusBadge(selectedOrder.statut)}
                      <select 
                        value={selectedOrder.statut}
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                        className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 focus:ring-0 cursor-pointer"
                      >
                        <option value="en_attente">En attente</option>
                        <option value="livree">Reçu / Livré</option>
                        <option value="annulee">Annulé</option>
                      </select>

                    </div>
                    <p className="text-lg font-black text-blue-600 mt-2">{parseFloat(selectedOrder.total).toLocaleString('fr-FR')} €</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Articles Commandés</p>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 font-bold text-slate-600">Produit</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-center">Quantité</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-right">Prix Unit.</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(selectedOrder.lignes || []).map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 font-medium text-slate-800">{item.produit?.nom}</td>
                            <td className="px-4 py-3 text-center font-bold text-slate-600">{item.quantite}</td>
                            <td className="px-4 py-3 text-right text-slate-500">{parseFloat(item.prix).toFixed(2)} €</td>
                            <td className="px-4 py-3 text-right font-black text-slate-900">{(item.quantite * item.prix).toFixed(2)} €</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>


              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={handleDownloadPDF}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                >
                  <FileText size={16} /> Télécharger le Bon (PDF)
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Commandes Fournisseurs</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Gérez vos réapprovisionnements et bons de commande IA.</p>
        </div>
        
        <div className="flex items-center gap-3">
           {/* Cart icon removed per user request */}
        </div>
      </div>


      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Rechercher par N° ou fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="livree">Reçu</option>
            <option value="annulee">Annulé</option>
          </select>

        </div>

        <button 
          onClick={fetchOrders}
          className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
        >
          <Clock size={18} />
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">N° Commande</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fournisseur</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && !isModalOpen ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">Aucune commande trouvée.</td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-black text-blue-600 text-sm">#{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{order.fournisseur?.nom || 'Inconnu'}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{order.fournisseur?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">
                    {new Date(order.date_commande).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900">
                    {parseFloat(order.total || 0).toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.statut)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleShowDetails(order.id)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2 ml-auto"
                    >
                      <Eye size={12} /> Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
