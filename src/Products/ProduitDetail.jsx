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
  if (path.startsWith('/storage')) return `http://127.0.0.1:8000${path}`;
  if (path.startsWith('/')) return `http://127.0.0.1:8000${path}`;
  return `http://127.0.0.1:8000/storage/${path}`;
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
    <div className="space-y-8 animate-in fade-in duration-500">
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
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">{product.nom || product.name}</h1>
            <p className="mt-6 text-slate-500 leading-relaxed text-sm font-medium">
              {product.description || 'Appuyez sur modifier pour ajouter une description à ce produit. Gérez vos informations efficacement via cette interface.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to={`/products/edit/${id}`} className="flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-slate-900 rounded-2xl text-sm font-bold text-slate-900 hover:bg-slate-50 transition-all">
              <Edit3 className="w-4 h-4" />
              Modifier le produit
            </Link>
            <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-200">
              <ArrowLeftRight className="w-4 h-4" />
              Enregistrer un mouvement
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-8">
          {/* Primary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between h-48 border-l-[6px] ${(product.stock_actuel ?? product.stock ?? product.quantite ?? 0) <= (product.seuil_minimum ?? product.seuil_min ?? 0) ? 'border-l-orange-500' : 'border-l-emerald-500'}`}>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock Actuel</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">{product.stock_actuel ?? product.stock ?? product.quantite ?? 0}</span>
                  <span className="text-lg font-bold text-slate-400">Unités</span>
                </div>
              </div>
              <div className={`flex items-center gap-2 text-xs font-bold ${(product.stock_actuel ?? product.stock ?? product.quantite ?? 0) <= (product.seuil_minimum ?? product.seuil_min ?? 0) ? 'text-orange-500' : 'text-emerald-600'}`}>
                {(product.stock_actuel ?? product.stock ?? product.quantite ?? 0) <= (product.seuil_minimum ?? product.seuil_min ?? 0) ? <AlertTriangle className="w-4 h-4"/> : <CheckCircle2 className="w-4 h-4" />}
                {(product.stock_actuel ?? product.stock ?? product.quantite ?? 0) <= (product.seuil_minimum ?? product.seuil_min ?? 0) ? 'Action requise : Stock faible' : 'Niveau de stock sain'}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between h-48">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prix Unitaire</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">{Number(product.prix || 0).toFixed(2)}</span>
                  <span className="text-xl font-bold text-slate-400">€</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                <Clock className="w-4 h-4" />
                Dernier update: {new Date(product.updated_at || product.created_at || new Date()).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seuil Minimum</p>
                <p className="text-xl font-bold text-slate-800">{product.seuil_minimum ?? product.seuil_min ?? 0} Unités</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date d'Ajout</p>
                <p className="text-xl font-bold text-slate-800">{new Date(product.created_at || new Date()).toLocaleDateString('fr-FR')}</p>
              </div>
              <Calendar className="w-6 h-6 text-slate-400" />
            </div>
          </div>

          {/* Last 5 Movements */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900">5 derniers mouvements</h3>
              <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
                Voir l'historique complet <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest border-b border-slate-50">
                    <th className="pb-4">Date</th>
                    <th className="pb-4 text-center">Type</th>
                    <th className="pb-4 text-center">Qté</th>
                    <th className="pb-4 text-right pr-2">Opérateur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {movements.length > 0 ? movements.map((move, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 text-sm font-bold text-slate-500">{new Date(move.created_at || move.date).toLocaleDateString('fr-FR')}</td>
                      <td className="py-5">
                        <div className="flex items-center justify-center gap-2">
                           {move.type === 'entree' || move.type === 'ENTRANT' ? <ArrowUpCircle className="w-4 h-4 text-emerald-600" /> : <ArrowDownCircle className="w-4 h-4 text-orange-600" />}
                           <span className={`text-[10px] font-black tracking-widest ${move.type === 'entree' || move.type === 'ENTRANT' ? 'text-emerald-600' : 'text-orange-600'}`}>{move.type}</span>
                        </div>
                      </td>
                      <td className="py-5 text-center text-sm font-black text-slate-800">{move.quantite || move.qty}</td>
                      <td className="py-5 text-right text-sm font-bold text-slate-500 pr-2">{move.user?.nom || move.operator || 'Système'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-sm font-medium text-slate-400 italic">Aucun mouvement enregistré pour ce produit.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="space-y-8">
          {/* Product Image Card */}
          <div className="bg-white p-2 rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden group">
            <div className="aspect-square rounded-[2.2rem] bg-slate-50 flex items-center justify-center overflow-hidden relative">
               {product.image || product.image_url ? (
                 <img src={getImageUrl(product.image || product.image_url)} alt={product.nom || product.name} className="w-4/5 object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
               ) : (
                 <div className="flex flex-col items-center">
                    <Sparkles className="w-12 h-12 text-slate-300" />
                    <span className="text-xs font-bold text-slate-400 mt-2">Aucune image</span>
                 </div>
               )}
               <div className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm">
                  <Info className="w-4 h-4 text-slate-400" />
               </div>
            </div>
          </div>

          {/* Linked Suppliers */}
          <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-slate-900" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Fournisseurs Liés</h3>
            </div>
            <ul className="space-y-4">
              {suppliers.length > 0 ? suppliers.map((s, idx) => (
                <li key={idx} className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
                   <span className="text-sm font-bold text-slate-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex-1">
                     {s.nom ?? s.name ?? s}
                   </span>
                </li>
              )) : (
                <li className="text-sm text-slate-400 italic text-center py-4">Aucun fournisseur lié pour le moment.</li>
              )}
            </ul>
          </div>

          {/* AI Insights (Dark Mode) */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 -m-12 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-100">Analyses IA</h3>
                </div>
                <span className="px-2 py-0.5 bg-blue-500 text-[8px] font-black rounded uppercase tracking-tighter">LIVE</span>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest">Demande Prévue (30j)</p>
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-xl font-black">124 Unités</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest">Quantité EOQ</p>
                    <div className="w-4 h-4 rounded-md bg-blue-500/20 flex items-center justify-center font-mono text-[8px] font-bold">±</div>
                  </div>
                  <p className="text-xl font-black">45 Unités</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest">Score d'Anomalie</p>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xl font-black text-emerald-400">0.02</p>
                </div>
              </div>

              <p className="mt-8 text-[11px] font-medium text-blue-100/60 italic leading-relaxed">
                "Action de réapprovisionnement recommandée dans 14 jours pour maintenir des marges optimales."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
