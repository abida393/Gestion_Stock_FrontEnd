import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Edit3, 
  Building2, 
  Mail, 
  Phone, 
  Smartphone, 
  MapPin, 
  Package, 
  Clock, 
  ArrowLeft,
  Loader2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import supplierService from '../services/supplierService';
import authService from '../services/authService';
import toast from 'react-hot-toast';

export default function FournisseurDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = authService.getUser() || {};
  const roleStr = JSON.stringify(user.roles || user.role || user.role_id || '').toLowerCase();
  const isAdmin = roleStr.includes('admin') || roleStr.includes('1') || !user.roles && !user.role;

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await supplierService.getById(id);
        const s = data.data || data;
        
        // Normaliser les produits liés depuis le pivot
        const linkedProducts = (s.produits ?? s.products ?? []).map(p => ({
          id: p.id,
          nom: p.nom ?? p.name,
          sku: p.sku ?? 'N/A',
          prix: p.pivot?.prix_unitaire ?? p.prix_unitaire ?? 0,
          delai: p.pivot?.delai_livraison_jours ?? p.delai_livraison_jours ?? 0
        }));

        setSupplier({ ...s, formattedProducts: linkedProducts });
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSupplier();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) return;
    setIsDeleting(true);
    try {
      await supplierService.remove(id);
      toast.success("Fournisseur supprimé.");
      navigate('/suppliers');
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50/30">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chargement...</span>
      </div>
    </div>
  );

  if (error || !supplier) return (
    <div className="flex h-screen items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-500 rounded-full w-fit mx-auto">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-800">Fournisseur introuvable</h2>
        <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">Les informations n'ont pas pu être récupérées. Le fournisseur a peut-être été supprimé.</p>
        <Link to="/suppliers" className="inline-flex items-center gap-2 text-slate-900 font-bold hover:underline py-2">
          <ArrowLeft size={16} /> Retour à la liste
        </Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Link to="/suppliers" className="hover:text-slate-900 transition-colors">Fournisseurs</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 line-clamp-1">{supplier.nom || supplier.name}</span>
        </nav>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex-1 max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                (supplier.statut || supplier.status || 'actif').toLowerCase() === 'actif' ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'
              }`}>
                {supplier.statut || supplier.status || 'ACTIF'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                ID: {supplier.id}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{supplier.nom || supplier.name}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
                <Link to={`/suppliers/edit/${id}`} className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md active:scale-95">
                  <Edit3 className="w-4 h-4" />
                  Modifier le profil
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content: Catalogue */}
        <div className="xl:col-span-2 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit mb-4">
                 <Package size={20} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produits Liés</p>
               <p className="text-2xl font-black text-slate-900 mt-1">{supplier.formattedProducts?.length || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
               <div className="p-2 bg-purple-50 text-purple-600 rounded-lg w-fit mb-4">
                 <Smartphone size={20} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Mobile</p>
               <p className="text-sm font-black text-slate-700 mt-2 truncate">{supplier.telephone || supplier.telephone_mobile || '—'}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
               <div className="p-2 bg-slate-50 text-slate-600 rounded-lg w-fit mb-4">
                 <MapPin size={20} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localisation</p>
               <p className="text-sm font-black text-slate-700 mt-2 truncate">{supplier.adresse || supplier.location || '—'}</p>
            </div>
          </div>

          {/* Product Catalogue Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
               <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                 <Package className="w-4 h-4 text-blue-600" />
                 Catalogue Fournisseur
               </h3>
               <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
                 {supplier.formattedProducts?.length || 0} références
               </span>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50/50">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Nom du produit</th>
                      <th className="px-6 py-4">SKU</th>
                      <th className="px-6 py-4 text-center">Prix Négocié</th>
                      <th className="px-6 py-4 text-center">Délai (Jours)</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {supplier.formattedProducts?.length > 0 ? supplier.formattedProducts.map((prod, idx) => (
                     <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="flex flex-col">
                           <span className="text-[13px] font-bold text-slate-800">{prod.nom}</span>
                           <span className="text-[10px] text-slate-400 font-medium">Produit Système</span>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <span className="text-[11px] font-mono font-bold text-slate-400">{prod.sku}</span>
                       </td>
                       <td className="px-6 py-4 text-center">
                         <span className="text-[14px] font-black text-slate-900">{Number(prod.prix).toFixed(2)} <span className="text-[10px] text-slate-400 font-bold ml-0.5">€</span></span>
                       </td>
                       <td className="px-6 py-4 text-center">
                         <span className={`px-2 py-1 rounded-lg text-[11px] font-black border ${
                           prod.delai <= 3 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-500'
                         }`}>
                           {prod.delai} jours
                         </span>
                       </td>
                     </tr>
                   )) : (
                     <tr>
                       <td colSpan="4" className="px-6 py-12 text-center">
                         <div className="flex flex-col items-center gap-2 opacity-40">
                            <Package className="w-8 h-8 text-slate-300" />
                            <p className="text-xs font-medium text-slate-500 italic">Aucun produit lié à ce partenaire.</p>
                         </div>
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Sidebar: Details & Contact */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Informations de Contact</h4>
              
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Officiel</p>
                    <a href={`mailto:${supplier.email}`} className="text-[13px] font-bold text-slate-800 hover:text-blue-600 transition-colors truncate block">{supplier.email || '—'}</a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Téléphone GSM</p>
                    <p className="text-[13px] font-bold text-slate-800">{supplier.telephone || supplier.telephone_mobile || '—'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Numéro Fixe</p>
                    <p className="text-[13px] font-bold text-slate-800">{supplier.numero_fix || supplier.telephone_fixe || 'Inconnu'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Siège Social</p>
                    <p className="text-[13px] font-medium text-slate-600 leading-relaxed italic">{supplier.adresse || supplier.location || 'Adresse non renseignée.'}</p>
                  </div>
                </div>
              </div>
           </div>

           {/* Quick Actions Card */}
           <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 -m-8 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
              <div className="relative z-10">
                <h4 className="text-[9px] font-black text-blue-300 uppercase tracking-[0.2em] mb-4">Commandes Récentes</h4>
                <div className="text-center py-6 border border-white/10 rounded-xl bg-white/5">
                   <Package className="w-8 h-8 text-blue-400/50 mx-auto mb-2" />
                   <p className="text-[11px] font-bold text-slate-400">Aucune commande active</p>
                </div>
                <button className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40">
                  Nouvelle Commande
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
