import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Edit3, 
  ArrowLeftRight, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCw,
  Clock,
  Calendar,
  AlertTriangle,
  Building2,
  Sparkles,
  TrendingUp,
  Info,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import productService from '../services/productService';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  // Clean the path and ensure it's served from the backend storage
  const cleanPath = path.replace(/^\//, '').replace(/^storage\//, '');
  return `http://127.0.0.1:8000/storage/${cleanPath}`;
};

export default function ProduitDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const data = await productService.getById(id);
        setProduct(data.data || data); // selon la structure API Laravel
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchParams();
  }, [id]);

  const movements = product?.mouvements || product?.movements || [];
  const suppliers = product?.fournisseurs || product?.suppliers || [];

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (error || !product) return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-red-500 font-bold">Impossible de charger ce produit.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          <Link to="/products" className="hover:text-blue-600 transition-colors">Produits</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600">{product.nom || product.name || 'Détails du Produit'}</span>
        </nav>
        
        <div className="flex flex-wrap gap-2">
           <span className="px-3 py-1 bg-teal-100 text-teal-700 text-[10px] font-extrabold uppercase tracking-wider rounded-lg">
             {(product.categorie?.nom || product.categorie_id || 'GÉNÉRAL')}
           </span>
           <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider rounded-lg">
             SKU : {product.sku || 'N/A'}
           </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{product.nom || product.name}</h1>
            <p className="mt-2 text-slate-500 leading-relaxed text-[13px] font-medium">
              {product.description || 'Appuyez sur modifier pour ajouter une description à ce produit. Gérez vos informations efficacement via cette interface.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to={`/products/edit/${id}`} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Edit3 className="w-4 h-4" />
              Modifier
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md shadow-slate-200 active:scale-95">
              <ArrowLeftRight className="w-4 h-4" />
              Mouvement
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-6">
          {/* Primary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-36 border-l-[4px] ${(product.stock_actuel ?? product.stock ?? product.quantite ?? 0) <= (product.seuil_minimum ?? product.seuil_min ?? 0) ? 'border-l-orange-500' : 'border-l-emerald-500'}`}>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Stock Actuel</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{product.stock_actuel ?? product.stock ?? product.quantite ?? 0}</span>
                  <span className="text-[11px] font-bold text-slate-400">Unités</span>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight ${(product.stock_actuel ?? product.stock ?? product.quantite ?? 0) <= (product.seuil_minimum ?? product.seuil_min ?? 0) ? 'text-orange-500' : 'text-emerald-600'}`}>
                {(product.stock_actuel ?? product.stock ?? product.quantite ?? 0) <= (product.seuil_minimum ?? product.seuil_min ?? 0) ? <AlertTriangle className="w-3.5 h-3.5"/> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {(product.stock_actuel ?? product.stock ?? product.quantite ?? 0) <= (product.seuil_minimum ?? product.seuil_min ?? 0) ? 'Stock Faible' : 'Niveau de stock sain'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-36">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Prix Unitaire</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">{Number(product.prix || 0).toFixed(2)}</span>
                  <span className="text-sm font-bold text-slate-400">€</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                <Clock className="w-3.5 h-3.5" />
                Dernière MAJ: {new Date(product.updated_at || product.created_at || new Date()).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Seuil Minimum</p>
                <p className="text-base font-bold text-slate-800">{product.seuil_minimum ?? product.seuil_min ?? 0} Unités</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Date d'Ajout</p>
                <p className="text-base font-bold text-slate-800">{new Date(product.created_at || new Date()).toLocaleDateString('fr-FR')}</p>
              </div>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Last 5 Movements */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Historique des mouvements</h3>
              <button className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                Tout voir <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-50">
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-center">Type</th>
                    <th className="pb-3 text-center">Qté</th>
                    <th className="pb-3 text-right pr-2">Opérateur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {movements.length > 0 ? movements.map((move, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 text-[13px] font-bold text-slate-500">{new Date(move.created_at || move.date).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-1.5">
                           {move.type === 'entree' || move.type === 'ENTRANT' ? <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownCircle className="w-3.5 h-3.5 text-orange-500" />}
                           <span className={`text-[10px] font-black uppercase tracking-wider ${move.type === 'entree' || move.type === 'ENTRANT' ? 'text-emerald-500' : 'text-orange-500'}`}>{move.type}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center text-[13px] font-black text-slate-800">{move.quantite || move.qty}</td>
                      <td className="py-3 text-right text-[13px] font-bold text-slate-500 pr-2">{move.user?.nom || move.operator || 'Système'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-xs font-medium text-slate-400 italic">Aucun mouvement.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="space-y-6">
          {/* Product Image Card */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-hidden group">
            <div className="aspect-square rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden relative">
               {product.image || product.image_url ? (
                 <img src={getImageUrl(product.image || product.image_url)} alt={product.nom || product.name} className="w-3/4 object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
               ) : (
                 <div className="flex flex-col items-center">
                    <Sparkles className="w-10 h-10 text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Image indisponible</span>
                 </div>
               )}
               <div className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur-md rounded-lg shadow-sm">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
               </div>
            </div>
          </div>

          {/* Linked Suppliers */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-slate-900" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Fournisseurs Liés</h3>
            </div>
            <ul className="space-y-3">
              {suppliers.length > 0 ? suppliers.map((s, idx) => (
                <li key={idx} className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   <span className="text-[12px] font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex-1">
                     {s.nom ?? s.name ?? s}
                   </span>
                </li>
              )) : (
                <li className="text-xs text-slate-400 italic text-center py-4">Aucun partenaire.</li>
              )}
            </ul>
          </div>

          {/* AI Insights (Dark Mode) */}
          <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -m-12 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Analyses IA</h3>
                </div>
                <span className="px-1.5 py-0.5 bg-blue-500 text-[7px] font-black rounded uppercase tracking-tighter">LIVE</span>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-[8px] font-bold text-blue-300 uppercase tracking-widest">Demande Prévue</p>
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-lg font-black">124 unités</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-[8px] font-bold text-blue-300 uppercase tracking-widest">Quantité EOQ</p>
                    <div className="w-3.5 h-3.5 rounded bg-blue-500/20 flex items-center justify-center font-mono text-[8px] font-bold">±</div>
                  </div>
                  <p className="text-lg font-black">45 unités</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-[8px] font-bold text-blue-300 uppercase tracking-widest">Confiance</p>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-lg font-black text-emerald-400">98%</p>
                </div>
              </div>

              <p className="mt-6 text-[10px] font-medium text-blue-100/40 italic leading-relaxed">
                "Réapprovisionnement recommandé sous 14 jours."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
