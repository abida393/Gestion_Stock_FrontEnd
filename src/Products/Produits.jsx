import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Download
} from 'lucide-react';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import movementService from '../services/movementService';
import { isAdmin } from '../services/permissionHelper';
import api from '../services/api';
import ProductRequestModal from './ProductRequestModal';
import ProductRequestsList from './ProductRequestsList';

const CATEGORY_COLORS = [
  'bg-teal-50 text-teal-700',
  'bg-blue-50 text-blue-700',
  'bg-slate-100 text-slate-700',
  'bg-orange-50 text-orange-700',
  'bg-purple-50 text-purple-700',
];

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  // Clean the path and ensure it's served from the backend storage
  const cleanPath = path.replace(/^\//, '').replace(/^storage\//, '');
  return `http://127.0.0.1:8000/storage/${cleanPath}`;
};

const normalise = (p, idx) => {
  const stockPhysique = p.stock_actuel ?? p.stock ?? p.quantite ?? 0;
  const stockReserve = p.stock_reserve ?? 0;
  const stockDisponible = p.stock_disponible ?? (stockPhysique - stockReserve);
  const seuil = p.seuil_minimum ?? p.seuil_min ?? p.threshold ?? 0;

  return {
    id: p.id,
    name: p.nom ?? p.name ?? '—',
    sku: p.sku ?? '—',
    category: p.categorie?.nom ?? p.categorie?.name ?? p.category ?? '—',
    categoryColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    price: p.prix != null ? `${Number(p.prix).toFixed(2)} €` : (p.price ?? '—'),
    stock: stockPhysique,
    available: stockDisponible,
    reserved: stockReserve,
    threshold: seuil,
    image: getImageUrl(p.image_url ?? p.image),
    status: stockDisponible === 0 ? 'Out of Stock' : stockDisponible < seuil ? 'Low Stock' : 'In Stock',
    isAnomaly: stockPhysique < stockReserve,
  };
};

export default function Produits() {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });
  const [lowStockCount, setLowStockCount] = useState(0);
  const [productToDelete, setProductToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('catalog');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const [productToReserve, setProductToReserve] = useState(null);
  const [reserveQty, setReserveQty] = useState('');
  const [reserveNote, setReserveNote] = useState('');
  const [reserveExpiration, setReserveExpiration] = useState('');
  const [reserving, setReserving] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkReserving, setIsBulkReserving] = useState(false);

  const [productToCancelReservation, setProductToCancelReservation] = useState(null);
  const [cancelQty, setCancelQty] = useState('');
  const [cancelNote, setCancelNote] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await productService.remove(productToDelete);
      toast.success("Produit supprimé avec succès.");
      setProductToDelete(null);
      fetchProducts(currentPage, search, selectedCat);
    } catch {
      toast.error("Erreur lors de la suppression du produit.");
    }
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!productToReserve || !reserveQty || reserveQty <= 0) return;
    if (reserveQty > productToReserve.available) {
      toast.error("Quantité supérieure au stock disponible.");
      return;
    }
    setReserving(true);
    try {
      await movementService.create({
        produit_id: productToReserve.id,
        quantite: reserveQty,
        type: 'reservation',
        date_mouvement: new Date().toISOString().split('T')[0],
        date_expiration: reserveExpiration || null,
        note: reserveNote || 'Réservation manuelle'
      });
      toast.success("Stock réservé avec succès.");
      setProductToReserve(null);
      setReserveQty('');
      setReserveNote('');
      setReserveExpiration('');
      fetchProducts(currentPage, search, selectedCat);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Erreur lors de la réservation.");
    } finally {
      setReserving(false);
    }
  };

  const handleCancelReservation = async (e) => {
    e.preventDefault();
    if (!productToCancelReservation || !cancelQty || cancelQty <= 0) return;
    if (cancelQty > productToCancelReservation.reserved) {
      toast.error("Quantité supérieure au stock réservé.");
      return;
    }
    setCancelling(true);
    try {
      await movementService.create({
        produit_id: productToCancelReservation.id,
        quantite: cancelQty,
        type: 'annulation_reservation',
        date_mouvement: new Date().toISOString().split('T')[0],
        note: cancelNote || 'Annulation manuelle de réservation'
      });
      toast.success("Stock libéré avec succès.");
      setProductToCancelReservation(null);
      setCancelQty('');
      setCancelNote('');
      fetchProducts(currentPage, search, selectedCat, selectedStatus);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Erreur lors de la libération du stock.");
    } finally {
      setCancelling(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length && products.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const handleBulkReserve = () => {
    // For now, opening a simplified bulk modal could be complex. 
    // Let's just show a toast or a simple confirm if they want to reserve 1 unit each, 
    // or better: just inform that bulk reservation is coming or implement a simple one.
    // User asked to show "Réserver la sélection".
    toast.success(`${selectedIds.length} produits sélectionnés pour réservation.`);
    // We could open a modal for each or one modal for all.
    // I'll implement a simple bulk modal.
    setIsBulkReserving(true);
  };

  const confirmBulkReserve = async (qty, note) => {
    const numericQty = parseInt(qty);
    if (isNaN(numericQty) || numericQty <= 0) {
      toast.error("Quantité invalide.");
      return;
    }

    // Validation préalable du stock disponible
    const selectedProducts = products.filter(p => selectedIds.includes(p.id));
    const insufficientStockProduct = selectedProducts.find(p => p.available < numericQty);
    
    if (insufficientStockProduct) {
      toast.error(`Stock insuffisant pour ${insufficientStockProduct.name} (Disponible: ${insufficientStockProduct.available})`);
      return;
    }

    setReserving(true);
    try {
      // On exécute séquentiellement ou avec un petit délai pour éviter les verrous DB concurrents sur les mêmes tables si nécessaire, 
      // mais Promise.all devrait fonctionner si les produits sont différents.
      await Promise.all(selectedIds.map(id => 
        movementService.create({
          produit_id: id,
          quantite: numericQty,
          type: 'reservation',
          date_mouvement: new Date().toISOString().split('T')[0],
          note: note || 'Réservation groupée'
        })
      ));
      toast.success("Réservations effectuées avec succès.");
      setSelectedIds([]);
      setIsBulkReserving(false);
      fetchProducts(currentPage, search, selectedCat);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Certaines réservations ont échoué.");
    } finally {
      setReserving(false);
    }
  };

  const fetchProducts = async (page = 1, s = '', cat = '', status = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (s) params.search = s;
      if (cat) params.categorie_id = cat;
      if (status) params.status = status;
      const [data, lowStock, cats, reqRes] = await Promise.all([
        productService.getAll(params),
        productService.getLowStock().catch(() => []),
        categoryService.getAll().catch(() => []),
        isAdmin() ? api.get('/product-requests').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);
      const list = Array.isArray(data) ? data : (data.data ?? []);
      setProducts(list.map(normalise));
      setMeta(Array.isArray(data) ? { total: data.length, last_page: 1 } : (data.meta ?? { total: 0, last_page: 1 }));
      const lowList = Array.isArray(lowStock) ? lowStock : (lowStock.data ?? []);
      setLowStockCount(lowList.length);
      const catList = Array.isArray(cats) ? cats : (cats.data ?? []);
      setCategories(catList);
      if (isAdmin() && reqRes.data) {
        setPendingRequestsCount(reqRes.data.filter(r => r.status === 'en_attente').length);
      }
    } catch {
      setError("Impossible de charger les produits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, search, selectedCat, selectedStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    fetchProducts(1, e.target.value, selectedCat, selectedStatus);
  };
  
  const handleCategoryFilter = (e) => {
    setSelectedCat(e.target.value);
    setCurrentPage(1);
    fetchProducts(1, search, e.target.value, selectedStatus);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
    fetchProducts(1, search, selectedCat, e.target.value);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Modal de confirmation de suppression */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px]">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="absolute inset-0 bg-slate-900/30"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-[320px] bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100"
            >
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="p-4 bg-red-50 text-red-500 rounded-full">
                  <AlertCircle size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Supprimer ce produit ?</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                    Action irréversible. Toutes les données associées disparaîtront.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-3.5 bg-red-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-200"
                >Oui, supprimer</button>
                <button 
                  onClick={() => setProductToDelete(null)}
                  className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95"
                >Annuler</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Réservation */}
        {productToReserve && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px]">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setProductToReserve(null)}
              className="absolute inset-0 bg-slate-900/30"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-[400px] bg-white rounded-3xl shadow-2xl p-6 border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2"><Lock size={20} className="text-amber-500"/> Réserver un lot</h3>
                <button onClick={() => setProductToReserve(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Stock Disponible</p>
                    <p className="text-2xl font-black text-amber-700">{productToReserve.available}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produit</p>
                    <p className="text-[13px] font-bold text-slate-700">{productToReserve.name}</p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleReserve} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 text-center sm:text-left">Quantité à réserver</label>
                  <input type="number" min="1" max={productToReserve.available} required value={reserveQty} onChange={(e) => setReserveQty(e.target.value)}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-700 text-center outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"/>
                  <p className="text-[9px] text-slate-400 mt-1.5 text-center italic">La quantité doit être comprise entre 1 et {productToReserve.available}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Motif / Note</label>
                  <input type="text" value={reserveNote} onChange={(e) => setReserveNote(e.target.value)} placeholder="Ex: Réservé pour la commande #104"
                         className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center justify-between">
                    <span>Date de libération (Optionnel)</span>
                    <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">PROCHAINE LIBÉRATION</span>
                  </label>
                  <input type="date" value={reserveExpiration} onChange={(e) => setReserveExpiration(e.target.value)} min={new Date().toISOString().split('T')[0]}
                         className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"/>
                </div>
                <button type="submit" disabled={reserving}
                  className="w-full mt-2 py-3.5 bg-amber-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 disabled:opacity-50"
                >
                  {reserving ? 'Réservation...' : 'Confirmer la réservation'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal de Réservation Groupée */}
        {isBulkReserving && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px]">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsBulkReserving(false)}
              className="absolute inset-0 bg-slate-900/30"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-[400px] bg-white rounded-3xl shadow-2xl p-6 border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2"><Lock size={20} className="text-blue-500"/> Réservation Groupée</h3>
                <button onClick={() => setIsBulkReserving(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              <p className="text-xs text-slate-500 mb-4">Vous allez réserver <strong className="text-slate-800">{selectedIds.length}</strong> produits.</p>
              
              <form onSubmit={(e) => { e.preventDefault(); confirmBulkReserve(e.target.qty.value, e.target.note.value); }} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Quantité par produit</label>
                  <input name="qty" type="number" min="1" required defaultValue="1"
                         className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Motif / Note commune</label>
                  <input name="note" type="text" placeholder="Ex: Réservation pour inventaire"
                         className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                </div>
                <button type="submit" disabled={reserving}
                  className="w-full mt-2 py-3 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {reserving ? 'Exécution...' : 'Confirmer la sélection'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
        {/* Modal d'Annulation de Réservation */}
        {productToCancelReservation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px]">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setProductToCancelReservation(null)}
              className="absolute inset-0 bg-slate-900/30"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-[400px] bg-white rounded-3xl shadow-2xl p-6 border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2"><Lock size={20} className="text-red-500"/> Annuler une réservation</h3>
                <button onClick={() => setProductToCancelReservation(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Actuellement Réservé</p>
                    <p className="text-2xl font-black text-red-700">{productToCancelReservation.reserved}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produit</p>
                    <p className="text-[13px] font-bold text-slate-700">{productToCancelReservation.name}</p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleCancelReservation} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Quantité à libérer</label>
                  <input type="number" min="1" max={productToCancelReservation.reserved} required value={cancelQty} onChange={(e) => setCancelQty(e.target.value)}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-700 text-center outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"/>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Motif / Note</label>
                  <input type="text" value={cancelNote} onChange={(e) => setCancelNote(e.target.value)} placeholder="Ex: Erreur de saisie ou Commande annulée"
                         className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                </div>
                <button type="submit" disabled={cancelling}
                  className="w-full mt-2 py-3.5 bg-red-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                >
                  {cancelling ? 'Libération...' : 'Libérer le stock'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alert Banner */}
      {showAlert && lowStockCount > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center justify-between shadow-sm mt-[-8px]">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <p className="text-sm font-medium text-orange-900">
              {lowStockCount} produit{lowStockCount > 1 ? 's' : ''} {lowStockCount > 1 ? 'sont' : 'est'} en dessous du seuil minimum — <a href="/alerts" className="underline font-bold">Voir les alertes</a>
            </p>
          </div>
          <button onClick={() => setShowAlert(false)} className="text-orange-400 hover:text-orange-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-3 w-full xl:max-w-3xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative min-w-[180px] hidden sm:block">
            <select
              value={selectedCat}
              onChange={handleCategoryFilter}
              className="appearance-none w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm pr-10">
              <option value="">Toutes les catégories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.nom ?? c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative min-w-[180px] hidden sm:block">
            <select
              value={selectedStatus}
              onChange={handleStatusFilter}
              className="appearance-none w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm pr-10">
              <option value="">Tous les états</option>
              <option value="normal">Normal</option>
              <option value="low">Stock Bas</option>
              <option value="out">Rupture</option>
              <option value="reserved">Stock Réservé</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkReserve}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-amber-500 text-white rounded-lg text-[13px] font-bold hover:bg-amber-600 transition-all shadow-md animate-in slide-in-from-left-2"
            >
              <Lock size={16} />
              Réserver la sélection ({selectedIds.length})
            </button>
          )}

          {isAdmin() ? (
            <>
              <button
                onClick={async () => {
                  try {
                    const token = sessionStorage.getItem('token');
                    const params = new URLSearchParams();
                    if (selectedCat) params.append('categorie_id', selectedCat);
                    if (selectedStatus) params.append('status', selectedStatus);
                    const res = await fetch(`http://127.0.0.1:8000/api/v1/products/export?${params}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `inventaire_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch { toast.error('Erreur lors de l\'export CSV.'); }
                }}
                className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg text-[13px] font-bold hover:bg-emerald-700 transition-all shadow-md"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button 
                onClick={() => navigate('/products/add')}
                className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-blue-900 text-white rounded-lg text-[13px] font-bold hover:bg-blue-950 transition-all shadow-md"
              >
                <Plus size={16} />
                Ajouter
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsRequestModalOpen(true)}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-bold hover:bg-blue-700 transition-all shadow-md"
            >
              <Plus size={16} />
              Suggérer un produit
            </button>
          )}
        </div>
      </div>

      {/* Tabs for Admin */}
      {isAdmin() && (
        <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 text-sm font-bold transition-all ${
              activeTab === 'catalog' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Catalogue
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`relative pb-3 text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'requests' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Demandes
            {pendingRequestsCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm font-black">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Product Requests List */}
      {activeTab === 'requests' ? (
        <ProductRequestsList />
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[9px] font-extrabold tracking-widest text-slate-400">
                <th className="px-5 py-3 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === products.length && products.length > 0}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3">Image</th>
                <th className="px-5 py-3">Produit</th>
                <th className="px-5 py-3">Catégorie</th>
                <th className="px-5 py-3 text-center">Prix</th>
                <th className="px-5 py-3 text-center">Disponible</th>
                <th className="px-5 py-3 text-center">Réservé</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr><td colSpan={8} className="px-5 py-10 text-center"><Loader2 className="w-6 h-6 text-slate-400 animate-spin inline" /></td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={8} className="px-5 py-6 text-center text-sm text-red-500 font-medium">{error}</td></tr>
              )}
              {!loading && !error && products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                      {product.image
                        ? <img src={product.image} alt={product.name} className="w-8 h-8 object-contain" />
                        : <div className="w-8 h-8 bg-slate-200 rounded" />}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-slate-700 leading-tight">{product.name}</span>
                      <span className="text-[9px] font-mono text-slate-400 mt-0.5">{product.sku}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${product.categoryColor}`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-[13px] font-bold text-slate-600">{product.price}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-[13px] font-bold ${product.available < product.threshold ? 'text-red-500' : 'text-emerald-600'
                      }`}>
                      {product.available} units
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[13px] font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">{product.reserved}</span>
                      {product.isAnomaly && (
                        <span className="text-[8px] font-black text-red-600 uppercase mt-1 animate-pulse">Anomalie</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setProductToReserve(product); }}
                        className="p-1.5 hover:bg-white hover:text-amber-500 rounded-md shadow-sm border border-slate-100 transition-all"
                        title="Réserver un lot"
                      >
                        <Lock size={14} />
                      </button>
                      {product.reserved > 0 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setProductToCancelReservation(product); }}
                          className="p-1.5 hover:bg-white hover:text-red-500 rounded-md shadow-sm border border-slate-100 transition-all"
                          title="Annuler la réservation"
                        >
                          <Lock size={14} className="rotate-180" />
                        </button>
                      )}
                      <button className="p-1.5 hover:bg-white hover:text-blue-600 rounded-md shadow-sm border border-slate-100 transition-all">
                        <Eye size={14} />
                      </button>
                      {isAdmin() && (
                        <button className="p-1.5 hover:bg-white hover:text-emerald-600 rounded-md shadow-sm border border-slate-100 transition-all">
                          <Edit2 size={14} />
                        </button>
                      )}
                      {isAdmin() && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setProductToDelete(product.id); }}
                          className="p-1.5 hover:bg-white hover:text-red-500 rounded-md shadow-sm border border-slate-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-slate-300 group-hover:hidden" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inventory Summary */}
        <div className="px-8 py-8 bg-slate-50/50 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Produits</p>
              <p className="text-2xl font-bold text-blue-900">{meta.total} <span className="text-xs font-medium text-slate-400">items</span></p>
            </div>
            <div className="flex flex-col items-center border-l border-r border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock Faible</p>
              <p className="text-2xl font-bold text-red-600">{lowStockCount} <span className="text-xs font-medium text-slate-400">produits</span></p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Catégories</p>
              <p className="text-2xl font-bold text-slate-800">{categories.length} <span className="text-xs font-medium text-slate-400">Global</span></p>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-white">
          <p className="text-xs font-medium text-slate-500">
            Affichage <span className="font-bold text-slate-800">{products.length}</span> sur <span className="font-bold text-slate-800">{meta.total}</span> produits
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Précédent
            </button>
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${num === currentPage ? 'bg-blue-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))}
              disabled={currentPage === meta.last_page}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all disabled:opacity-30"
            >
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Modals */}
      <ProductRequestModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
        categories={categories} 
      />
    </div>
  );
}
