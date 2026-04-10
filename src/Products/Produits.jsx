import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Loader2
} from 'lucide-react';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import { hasPermission } from '../services/permissionHelper';

const CATEGORY_COLORS = [
  'bg-teal-50 text-teal-700',
  'bg-blue-50 text-blue-700',
  'bg-slate-100 text-slate-700',
  'bg-orange-50 text-orange-700',
  'bg-purple-50 text-purple-700',
];

const normalise = (p, idx) => ({
  id: p.id,
  name: p.nom ?? p.name ?? '—',
  sku: p.sku ?? '—',
  category: p.categorie?.nom ?? p.categorie?.name ?? p.category ?? '—',
  categoryColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  price: p.prix != null ? `${Number(p.prix).toFixed(2)} €` : (p.price ?? '—'),
  stock: p.stock_actuel ?? p.stock ?? 0,
  threshold: p.seuil_minimum ?? p.threshold ?? 0,
  image: p.image_url ?? p.image ?? null,
  status: (p.stock_actuel ?? p.stock ?? 0) === 0 ? 'Out of Stock'
        : (p.stock_actuel ?? p.stock ?? 0) < (p.seuil_minimum ?? p.threshold ?? 0) ? 'Low Stock'
        : 'In Stock',
});

export default function Produits() {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });
  const [lowStockCount, setLowStockCount] = useState(0);

  const fetchProducts = async (page = 1, s = '', cat = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (s) params.search = s;
      if (cat) params.cat = cat;
      const [data, lowStock, cats] = await Promise.all([
        productService.getAll(params),
        productService.getLowStock().catch(() => []),
        categoryService.getAll().catch(() => []),
      ]);
      const list = Array.isArray(data) ? data : (data.data ?? []);
      setProducts(list.map(normalise));
      setMeta(Array.isArray(data) ? { total: data.length, last_page: 1 } : (data.meta ?? { total: 0, last_page: 1 }));
      const lowList = Array.isArray(lowStock) ? lowStock : (lowStock.data ?? []);
      setLowStockCount(lowList.length);
      const catList = Array.isArray(cats) ? cats : (cats.data ?? []);
      setCategories(catList);
    } catch {
      setError("Impossible de charger les produits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, search, selectedCat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    fetchProducts(1, e.target.value, selectedCat);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCat(e.target.value);
    setCurrentPage(1);
    fetchProducts(1, search, e.target.value);
  };

  return (
    <div className="space-y-6">
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
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={16} />
            Filtres
          </button>
          {hasPermission('produit.create') && (
            <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-blue-900 text-white rounded-lg text-[13px] font-bold hover:bg-blue-950 transition-all shadow-md">
              <Plus size={16} />
              Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[9px] font-extrabold tracking-widest text-slate-400">
                <th className="px-5 py-3 w-10"></th>
                <th className="px-5 py-3">Image</th>
                <th className="px-5 py-3">Produit</th>
                <th className="px-5 py-3">Catégorie</th>
                <th className="px-5 py-3 text-center">Prix</th>
                <th className="px-5 py-3 text-center">Stock</th>
                <th className="px-5 py-3 text-center">Seuil</th>
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
                  <td className="px-5 py-3">
                    <div className="w-3.5 h-3.5 rounded border border-slate-300 group-hover:border-blue-500"></div>
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
                    <span className={`text-[13px] font-bold ${product.stock < product.threshold ? 'text-red-500' : 'text-emerald-600'
                      }`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-[13px] font-medium text-slate-400">{product.threshold}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-white hover:text-blue-600 rounded-md shadow-sm border border-slate-100 transition-all">
                        <Eye size={14} />
                      </button>
                      {hasPermission('produit.update') && (
                        <button className="p-1.5 hover:bg-white hover:text-emerald-600 rounded-md shadow-sm border border-slate-100 transition-all">
                          <Edit2 size={14} />
                        </button>
                      )}
                      {hasPermission('produit.delete') && (
                        <button className="p-1.5 hover:bg-white hover:text-red-500 rounded-md shadow-sm border border-slate-100 transition-all">
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
    </div>
  );
}
