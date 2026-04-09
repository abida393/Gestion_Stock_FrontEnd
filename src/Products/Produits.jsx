import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

// Product images
import shoesImg from '../assets/products/shoes.png';
import watchImg from '../assets/products/watch.png';
import headphonesImg from '../assets/products/headphones.png';
import chairImg from '../assets/products/chair.png';
import micImg from '../assets/products/mic.png';

const products = [
  {
    id: 1,
    name: 'Chaussures AeroVance Running',
    sku: 'AV-992-RD',
    category: 'Vêtements',
    categoryColor: 'bg-teal-50 text-teal-700',
    price: '$124.00',
    stock: 128,
    threshold: 25,
    image: shoesImg,
    status: 'In Stock'
  },
  {
    id: 2,
    name: 'Titan Chrono XL',
    sku: 'TT-W22-BK',
    category: 'Électronique',
    categoryColor: 'bg-blue-50 text-blue-700',
    price: '$499.00',
    stock: 8,
    threshold: 15,
    image: watchImg,
    status: 'Low Stock'
  },
  {
    id: 3,
    name: 'Studio-X Wireless',
    sku: 'SX-88-BT',
    category: 'Électronique',
    categoryColor: 'bg-blue-50 text-blue-700',
    price: '$215.50',
    stock: 42,
    threshold: 30,
    image: headphonesImg,
    status: 'In Stock'
  },
  {
    id: 4,
    name: 'Chaise de bureau Mesh Executive',
    sku: 'OF-441-GR',
    category: 'Mobilier',
    categoryColor: 'bg-slate-100 text-slate-700',
    price: '$389.00',
    stock: 15,
    threshold: 10,
    image: chairImg,
    status: 'In Stock'
  },
  {
    id: 5,
    name: 'Micro Pro-Cast 500',
    sku: 'PC-500-BK',
    category: 'Électronique',
    categoryColor: 'bg-blue-50 text-blue-700',
    price: '$159.99',
    stock: 2,
    threshold: 5,
    image: micImg,
    status: 'Critical'
  },
];

export default function Produits() {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {showAlert && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center justify-between shadow-sm mt-[-8px]">
          <div className="flex items-center gap-3">
             <AlertCircle className="w-5 h-5 text-orange-600" />
             <p className="text-sm font-medium text-orange-900">
               3 produits sont en dessous du seuil minimum — <a href="#" className="underline font-bold">Voir les alertes</a>
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher un produit par nom ou SKU..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative min-w-[200px] hidden sm:block">
            <select className="appearance-none w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm pr-10">
              <option>Toutes les catégories</option>
              <option>Électronique</option>
              <option>Vêtements</option>
              <option>Mobilier</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filtres avancés
          </button>
          <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl text-sm font-bold hover:bg-blue-950 transition-all shadow-md">
            <Plus className="w-4 h-4" />
            Ajouter un produit
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-bold tracking-widest text-slate-500">
                <th className="px-6 py-4 w-10">
                   <div className="w-4 h-4 rounded border-2 border-slate-300"></div>
                </th>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Nom du produit</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4 text-center">Prix Unitaire</th>
                <th className="px-6 py-4 text-center">Quantité en stock</th>
                <th className="px-6 py-4 text-center">Seuil Min</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((product) => (
                <tr 
                  key={product.id} 
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <td className="px-6 py-5">
                     <div className="w-4 h-4 rounded border-2 border-slate-300"></div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                      <img src={product.image} alt={product.name} className="w-10 h-10 object-contain hover:scale-110 transition-transform duration-300" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{product.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5">SKU: {product.sku}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${product.categoryColor}`}>
                       {product.category}
                     </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-bold text-slate-700">{product.price}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                       <span className={`flex items-center gap-1.5 text-sm font-bold ${
                         product.stock < product.threshold ? 'text-red-600' : 'text-emerald-600'
                       }`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${
                           product.stock < product.threshold ? 'bg-red-600' : 'bg-emerald-600'
                         }`}></span>
                         {product.stock} Unités
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-medium text-slate-500">{product.threshold}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white hover:text-blue-600 rounded-lg hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white hover:text-emerald-600 rounded-lg hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white hover:text-red-500 rounded-lg hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-slate-300 group-hover:hidden" />
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
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valeur Totale de l'Inventaire</p>
               <p className="text-2xl font-bold text-blue-900">$142,590.00</p>
             </div>
             <div className="flex flex-col items-center border-l border-r border-slate-200">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SKUs Actifs</p>
               <p className="text-2xl font-bold text-slate-800">48 <span className="text-xs font-medium text-slate-400">items</span></p>
             </div>
             <div className="flex flex-col items-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Catégories</p>
               <p className="text-2xl font-bold text-slate-800">12 <span className="text-xs font-medium text-slate-400">Global</span></p>
             </div>
           </div>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-white">
          <p className="text-xs font-medium text-slate-500">
             Affichage <span className="font-bold text-slate-800">1-10</span> sur <span className="font-bold text-slate-800">48</span> produits
          </p>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all">
              <ChevronLeft className="w-4 h-4" /> Précédent
            </button>
            {[1, 2, 3].map((num) => (
              <button 
                key={num} 
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  num === 1 ? 'bg-blue-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {num}
              </button>
            ))}
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all">
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
