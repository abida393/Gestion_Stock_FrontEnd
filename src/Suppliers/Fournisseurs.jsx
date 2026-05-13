import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Grid,
  List,
  Mail,
  Phone,
  Smartphone,
  MapPin,
  Package,
  Plus,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Loader2,
  Trash2,
  AlertTriangle,
  Edit2,
  Eye
} from 'lucide-react';
import supplierService from '../services/supplierService';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const statusColor = (status = '') => {
  switch (status.toLowerCase()) {
    case 'actif': return 'bg-teal-50 text-teal-700';
    case 'inactif': return 'bg-red-50 text-red-700';
    case 'privilégié':
    case 'privilegie': return 'bg-blue-50 text-blue-700';
    default: return 'bg-orange-50 text-orange-700';
  }
};

const normalise = (s) => ({
  id: s.id,
  name: s.nom ?? s.name ?? '—',
  location: s.adresse ?? s.location ?? '—',
  email: s.email ?? '—',
  mobile: s.telephone ?? s.telephone_mobile ?? s.mobile ?? '—',
  fixed: s.numero_fix ?? s.telephone_fixe ?? s.fixed ?? '—',
  fixed: s.numero_fix ?? s.telephone_fixe ?? s.fixed ?? '—',
  status: (s.statut ?? s.status ?? 'ACTIF').toUpperCase(),
  statusColor: statusColor(s.statut ?? s.status ?? 'actif'),
  icon: Monitor,
});

export default function Fournisseurs() {
  const [viewMode, setViewMode] = useState('list');
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const navigate = useNavigate();

  const user = authService.getUser() || {};
  // Check typical Laravel/Spatie role structures
  const roleStr = JSON.stringify(user.roles || user.role || user.role_id || '').toLowerCase();
  // Permissive admin check: checks if 'admin' or 'administrateur' or role_id=1 is present
  // Also defaults to true if roles are completely absent from the user object (for dev testing)
  const isAdmin = roleStr.includes('admin') || roleStr.includes('1') || !user.roles && !user.role;

  const fetchSuppliers = async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await supplierService.getAll({ page, search: search || undefined });
      if (Array.isArray(data)) {
        setSuppliers(data);
        setMeta({ total: data.length, last_page: 1 });
      } else {
        setSuppliers(data.data ?? []);
        setMeta(data.meta ?? { total: 0, last_page: 1 });
      }
    } catch {
      setError("Impossible de charger les fournisseurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(currentPage, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    setCurrentPage(1);
    fetchSuppliers(1, q);
  };

  const handleDelete = (id) => {
    setSupplierToDelete(id);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    try {
      await supplierService.remove(supplierToDelete);
      toast.success("Fournisseur supprimé avec succès.");
      setSupplierToDelete(null);
      fetchSuppliers(currentPage, searchQuery);
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const displayedSuppliers = suppliers.map(normalise);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Modal de confirmation de suppression */}
      <AnimatePresence>
        {supplierToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSupplierToDelete(null)}
              className="absolute inset-0 bg-slate-900/30"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-[320px] bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100"
            >
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="p-4 bg-red-50 text-red-500 rounded-full">
                  <AlertTriangle size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Supprimer ce fournisseur ?</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                    Cette action est irréversible. Toutes les données associées à ce partenaire seront effacées du système.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmDelete}
                  className="w-full py-3.5 bg-red-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-95"
                >
                  Oui, supprimer
                </button>
                <button
                  onClick={() => setSupplierToDelete(null)}
                  className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Répertoire des Fournisseurs</h1>
          <p className="mt-1 text-xs text-slate-400 font-medium">
            {loading ? 'Chargement...' : `${meta.total} partenaires enregistrés.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={14} />
            </button>
          </div>

          <button
            onClick={() => navigate('/suppliers/add')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all shadow-md active:scale-95"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Rechercher par nom, région ou produit..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && displayedSuppliers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-500">Aucun fournisseur trouvé.</p>
        </div>
      )}

      {/* Suppliers Display */}
      {!loading && !error && displayedSuppliers.length > 0 && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedSuppliers.map((s) => (
              <div 
                key={s.id} 
                className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`/suppliers/${s.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors border border-slate-100">
                    <s.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/suppliers/${s.id}`); }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <Eye size={14} />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/suppliers/edit/${s.id}`); }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${s.statusColor}`}>
                      {s.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{s.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold mb-5 uppercase tracking-widest">
                  <MapPin size={12} />
                  {s.location}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail size={14} className="text-slate-300 shrink-0" />
                    <span className="text-[13px] font-medium truncate">{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Smartphone size={14} className="text-slate-300 shrink-0" />
                    <span className="text-[13px] font-medium">{s.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone size={14} className="text-slate-300 shrink-0" />
                    <span className="text-[13px] font-medium">{s.fixed} <span className="text-[9px] text-slate-300 lowercase font-normal">(fixe)</span></span>
                  </div>
                </div>

                <div className="pt-4 mt-auto border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Voir le catalogue</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {displayedSuppliers.map((s) => (
              <div
                key={s.id}
                className={`group relative bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 cursor-pointer overflow-hidden pl-1`}
                onClick={() => navigate(`/suppliers/${s.id}`)}
              >
                {/* Status Accent Border */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  s.statusColor.includes('teal') ? 'bg-teal-500' : 
                  s.statusColor.includes('blue') ? 'bg-blue-500' : 
                  s.statusColor.includes('red') ? 'bg-red-500' : 'bg-orange-500'
                }`} />

                <div className="grid grid-cols-12 items-center gap-4 p-4">
                  {/* Identity Column */}
                  <div className="col-span-12 lg:col-span-4 flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors shrink-0 border border-slate-100">
                      <s.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 truncate">{s.name}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">
                        <MapPin size={10} />
                        {s.location}
                      </div>
                    </div>
                  </div>

                  {/* Contact Column */}
                  <div className="col-span-6 lg:col-span-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Contact Email</span>
                      <div className="flex items-center gap-2 text-slate-500 overflow-hidden">
                        <Mail size={13} className="text-slate-300 shrink-0" />
                        <span className="text-[13px] font-medium truncate">{s.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Phone Column */}
                  <div className="col-span-6 lg:col-span-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Téléphones</span>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Smartphone size={13} className="text-slate-300 shrink-0" />
                        <span className="text-[12px] font-bold text-slate-600">{s.mobile}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Column */}
                  <div className="hidden lg:flex lg:col-span-1 justify-center">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${s.statusColor}`}>
                      {s.status}
                    </span>
                  </div>

                  {/* Actions Column */}
                  <div className="col-span-12 lg:col-span-2 flex items-center justify-end gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/suppliers/${s.id}`); }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors bg-slate-50 group-hover:bg-white border border-slate-100"
                      title="Voir détails"
                    >
                      <Eye size={16} />
                    </button>
                    {isAdmin && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/suppliers/edit/${s.id}`); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors bg-slate-50 group-hover:bg-white border border-slate-100"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors bg-slate-50 group-hover:bg-white border border-slate-100"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    <span className="lg:hidden">
                      <ChevronRight size={18} className="text-slate-300" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Pagination */}
      {!loading && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400">
            Affichage <span className="text-slate-800">{suppliers.length}</span> sur <span className="text-slate-800">{meta.total}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-7 h-7 rounded-md text-[13px] font-bold transition-all ${num === currentPage
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))}
              disabled={currentPage === meta.last_page}
              className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
