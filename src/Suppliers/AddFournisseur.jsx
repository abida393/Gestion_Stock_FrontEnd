import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  ChevronRight, Mail, Phone, MapPin,
  Plus, Trash2, Save, Package, PhoneForwarded, X, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import productService from '../services/productService';
import supplierService from '../services/supplierService';

export default function AddFournisseur() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // 1. État pour le formulaire (Coherent avec ton diagramme SQL)
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    numero_fix: '',
    adresse: ''
  });

  // 2. État pour les produits liés (Table Pivot)
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');

  const hasFetched = useRef(false);

  // 3. Charger les produits au montage
  useEffect(() => {
    productService.getAll().then(res => {
      const list = Array.isArray(res) ? res : (res.data ?? []);
      setAvailableProducts(list);
    }).catch(() => {});

    if (isEdit && !hasFetched.current) {
      hasFetched.current = true;
      supplierService.getById(id).then(res => {
         // Debug: log the raw response to console
         console.log('[AddFournisseur] getById response:', res);
         const s = res?.data ?? res;
         setFormData({
            nom: s.nom ?? s.name ?? '',
            email: s.email ?? '',
            telephone: s.telephone ?? s.mobile ?? '',
            numero_fix: s.numero_fix ?? s.fixed ?? '',
            adresse: s.adresse ?? s.location ?? ''
         });
          const prods = (s.produits ?? s.products ?? []).map(p => ({
            ...p,
            prix_unitaire: p.pivot?.prix_unitaire ?? p.prix_unitaire ?? p.prix ?? 0,
            delai_livraison_jours: p.pivot?.delai_livraison_jours ?? p.delai_livraison_jours ?? 3
          }));
          setLinkedProducts(Array.isArray(prods) ? prods : []);
      }).catch((err) => {
         console.error('[AddFournisseur] getById error:', err?.response?.data ?? err.message);
         // Error toast already shown by global interceptor for 500/403
         if (!err?.response?.status || err.response.status < 400) {
           toast.error("Impossible de charger le fournisseur.");
         }
      });
    }
  }, [id, isEdit]);

  const addLinkedProduct = (product) => {
    if (!linkedProducts.find(p => p.id === product.id)) {
      setLinkedProducts([...linkedProducts, {
        ...product,
        prix_unitaire: product.prix ?? 0,
        delai_livraison_jours: 3 // Default delay
      }]);
    }
    setShowProductModal(false);
  };

  const updateProductDetail = (productId, field, value) => {
    setLinkedProducts(linkedProducts.map(p => 
      p.id === productId ? { ...p, [field]: value } : p
    ));
  };

  const removeLinkedProduct = (id) => {
    setLinkedProducts(linkedProducts.filter(p => p.id !== id));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.nom) {
      toast.error("Le nom de l'entreprise est obligatoire");
      return;
    }

    try {
      const payload = { 
        ...formData,
        produits: linkedProducts.map(p => ({
          id: p.id,
          prix_unitaire: parseFloat(p.prix_unitaire) || 0,
          delai_livraison_jours: parseInt(p.delai_livraison_jours) || 0
        }))
      };

      if (isEdit) {
         await supplierService.update(id, payload);
         toast.success("Fournisseur mis à jour avec succès !");
      } else {
         await api.post('/fournisseurs', payload);
         toast.success("Fournisseur créé avec succès !");
      }

      setTimeout(() => {
        navigate('/suppliers');
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      toast.error(error.response?.data?.message || "Une erreur est survenue lors de la sauvegarde.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-24">

      {/* Fil d'ariane */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
        <Link to="/suppliers" className="hover:text-blue-600 transition-colors">Fournisseurs</Link>
        <ChevronRight size={10} />
        <span className="text-slate-900">{isEdit ? 'Modifier un fournisseur' : 'Nouveau fournisseur'}</span>
      </nav>

      <header className="mb-6 flex flex-col gap-1.5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{isEdit ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}</h1>
        <p className="text-[12px] text-slate-500 font-medium">
          {isEdit ? 'Mettez à jour les informations et liez des produits.' : 'Créez la fiche d\'une nouvelle entreprise partenaire pour vos approvisionnements.'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne de gauche : Formulaire Principal (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              Informations Générales
            </h2>

            <div className="space-y-5">
              {/* Nom Entreprise */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nom de l'entreprise <span className="text-red-500">*</span></label>
                <input
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  type="text"
                  placeholder="Ex: Global Logistics Inc."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-slate-900 transition-all outline-none font-semibold text-[13px]"
                />
              </div>

              {/* Emails et Téléphones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Adresse Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="contact@fournisseur.com"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-slate-900 outline-none font-semibold text-[13px] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Téléphone Mobile</label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      type="tel"
                      placeholder="+212 6..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-slate-900 outline-none font-semibold text-[13px] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Nouveau champ : Numéro Fixe (Ajouté pour matcher ta DB) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Numéro Fixe (Optionnel)</label>
                <div className="relative group">
                  <PhoneForwarded className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name="numero_fix"
                    value={formData.numero_fix}
                    onChange={handleChange}
                    type="tel"
                    placeholder="+212 5..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-slate-900 outline-none font-semibold text-[13px] transition-all"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <MapPin size={12} /> Adresse du siège
                </label>
                <textarea
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Saisissez l'adresse complète..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-slate-900 outline-none font-semibold text-[13px] resize-none transition-all"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne de droite : Produits Liés (1/3) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Catalogue Lié</h2>
            <button 
              onClick={() => setShowProductModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-[13px] font-bold hover:bg-blue-100 transition-all"
            >
              <Plus size={16} />
              Lier un produit
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {linkedProducts.length === 0 ? (
              <div className="p-8 text-center text-[13px] font-medium text-slate-400">
                Aucun produit lié pour l'instant.
              </div>
            ) : linkedProducts.map((prod) => (
              <div key={prod.id} className="p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                      <Package size={14} />
                    </div>
                    <span className="text-[13px] font-bold text-slate-800">{prod.nom || prod.name}</span>
                  </div>
                  <button onClick={() => removeLinkedProduct(prod.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pl-10">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Prix Unitaire</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={prod.prix_unitaire}
                        onChange={(e) => updateProductDetail(prod.id, 'prix_unitaire', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[11px] font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">€</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Délai (jours)</label>
                    <input 
                      type="number"
                      value={prod.delai_livraison_jours}
                      onChange={(e) => updateProductDetail(prod.id, 'delai_livraison_jours', e.target.value)}
                      className="w-full px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[11px] font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 backdrop-blur-md border-t border-slate-100 px-8 py-3 flex items-center justify-end gap-3 z-20 shadow-lg">
        <button
          onClick={() => navigate('/suppliers')}
          className="px-6 py-2 text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-all"
        >
          Annuler
        </button>
        <button 
          onClick={handleSave}
          className="bg-[#1e293b] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all"
        >
          <Save size={14} /> {isEdit ? 'Enregistrer' : 'Confirmer'}
        </button>
      </div>

      {/* Modal Lier Produit */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/20">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Sélectionner un produit</h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-3 border-b border-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Rechercher par nom..." 
                  value={searchProduct}
                  onChange={e => setSearchProduct(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg text-[13px] border border-slate-200 focus:border-blue-500 outline-none transition-all bg-slate-50"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {availableProducts.length === 0 && (
                 <div className="text-center text-slate-500 p-4 text-[13px]">Aucun produit en base de données.</div>
              )}
              {availableProducts.filter(p => (p.nom || p.name || '').toLowerCase().includes(searchProduct.toLowerCase())).map(p => (
                <button 
                  key={p.id} 
                  onClick={() => addLinkedProduct(p)}
                  className="w-full text-left p-3 hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors mb-1"
                >
                  <div className="font-bold text-[13px] text-slate-800">{p.nom || p.name}</div>
                  <div className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded uppercase">{p.prix} €</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}