import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
    ChevronRight, Package, Image as ImageIcon,
    Tag, BarChart3, Save, X, Info, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import productService from '../services/productService';
import categoryService from '../services/categoryService';

export default function AddProduct() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [productData, setProductData] = useState({
        nom: '',
        description: '',
        quantite: 0,
        seuil_min: 5,
        categorie_id: '',
        prix: '',
        image: null
    });
    
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        categoryService.getAll().then(res => {
            setCategories(Array.isArray(res) ? res : (res.data || []));
        }).catch(err => console.error("Erreur catégories:", err));
        
        if (isEdit) {
            productService.getById(id).then(res => {
                const p = res.data || res;
                setProductData({
                    nom: p.nom || p.name || '',
                    description: p.description || '',
                    quantite: p.stock_actuel ?? p.stock ?? p.quantite ?? 0,
                    seuil_min: p.seuil_minimum ?? p.seuil_min ?? 5,
                    categorie_id: p.categorie_id || '',
                    prix: p.prix || '',
                    image: null
                });
                if (p.image_url || p.image) {
                     const path = p.image_url || p.image;
                     const fullPath = path.startsWith('http') ? path : `http://127.0.0.1:8000/storage/${path.replace(/^\//,'')}`;
                     setImagePreview(fullPath);
                }
            }).catch(err => {
                toast.error("Impossible de charger les données du produit.");
            });
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData({ ...productData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductData({ ...productData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!productData.nom || !productData.categorie_id || !productData.prix) {
            toast.error("Veuillez remplir tous les champs obligatoires (*)");
            return;
        }

        try {
            if (isEdit) {
                const baseData = { ...productData };
                delete baseData.image; // Géré séparément
                await productService.update(id, baseData);
                
                if (productData.image instanceof File) {
                    const fd = new FormData();
                    fd.append('image', productData.image);
                    await productService.uploadImage(id, fd);
                }
                
                toast.success("Produit modifié avec succès !");
                setTimeout(() => navigate('/products'), 1500);
            } else {
                const formData = new FormData();
                Object.keys(productData).forEach(key => {
                    if (productData[key] !== null) {
                        formData.append(key, productData[key]);
                    }
                });

                await api.post('/products', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                toast.success("Produit ajouté avec succès !");
                setTimeout(() => navigate('/products'), 1500);
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout :", error);
            toast.error(error.response?.data?.message || "Erreur lors de l'ajout du produit.");
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 p-6 md:p-10 pb-24">

            {/* Fil d'ariane */}
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                <Link to="/products" className="hover:text-blue-600 transition-colors">Inventaire</Link>
                <ChevronRight size={10} />
                <span className="text-slate-900">{isEdit ? 'Modifier un Produit' : 'Nouveau Produit'}</span>
            </nav>

            <header className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{isEdit ? 'Modifier le produit' : 'Ajouter un produit'}</h1>
                <p className="mt-1 text-sm text-slate-500 font-medium">
                  {isEdit ? 'Mettez à jour les informations et spécifications de l\'article sélectionné.' : 'Référencez un nouvel article dans votre base de données centrale.'}
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Colonne Principale : Détails du produit (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8 flex items-center gap-2">
                            <Package size={16} /> Informations de base
                        </h2>

                        <div className="space-y-6">
                            {/* Nom du produit */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Nom du produit *</label>
                                <input
                                    name="nom"
                                    value={productData.nom}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="Ex: Processeur Intel Core i9"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-slate-900 font-semibold outline-none transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Description détaillée</label>
                                <textarea
                                    name="description"
                                    value={productData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Spécifications techniques, détails du modèle..."
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-slate-900 font-semibold outline-none transition-all resize-none"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Catégorie (categorie_id dans ta DB) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 ml-1">Catégorie *</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select
                                            name="categorie_id"
                                            value={productData.categorie_id}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-slate-900 font-bold outline-none appearance-none transition-all"
                                        >
                                            <option value="">Sélectionner une catégorie</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.nom || c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Prix (numeric(10,2) dans ta DB) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 ml-1">Prix de vente (€) *</label>
                                    <input
                                        name="prix"
                                        value={productData.prix}
                                        onChange={handleChange}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-slate-900 font-bold outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gestion du Stock */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-8 flex items-center gap-2">
                            <BarChart3 size={16} /> Niveaux de Stock
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Quantité Initiale</label>
                                <input
                                    name="quantite"
                                    value={productData.quantite}
                                    onChange={handleChange}
                                    type="number"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-2xl text-slate-900 font-bold outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Seuil d'alerte (min) *</label>
                                <div className="relative">
                                    <input
                                        name="seuil_min"
                                        value={productData.seuil_min}
                                        onChange={handleChange}
                                        type="number"
                                        className="w-full px-5 py-4 bg-orange-50/30 border border-orange-100 focus:border-orange-500 rounded-2xl text-orange-700 font-bold outline-none"
                                    />
                                    <Info className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-300" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne Latérale : Média & Statut (1/3) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 text-center">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Image du produit</h2>
                        <input 
                            type="file" 
                            accept="image/png, image/jpeg" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group hover:border-blue-400 transition-all cursor-pointer overflow-hidden p-2"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <>
                                    <ImageIcon size={40} className="text-slate-300 group-hover:text-blue-400 mb-2" />
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-blue-500 tracking-tight">Cliquer pour uploader</span>
                                </>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 italic text-left leading-relaxed">
                            Format supporté : PNG, JPG. Taille max : 2Mo. Cette image sera utilisée pour l'affichage de l'inventaire.
                        </p>
                    </div>

                    <div className="bg-[#1e293b] rounded-[2rem] p-8 text-white shadow-xl">
                        <h3 className="font-bold flex items-center gap-2 mb-4 text-blue-400"><Plus size={18} /> Aide Rapide</h3>
                        <p className="text-xs text-slate-300 leading-relaxed mb-6">
                            Une fois ajouté, le produit pourra être lié à un fournisseur pour suivre les délais de réapprovisionnement.
                        </p>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Impact Inventaire</p>
                            <p className="text-sm font-bold text-blue-200">Total Valeur : {(productData.quantite * productData.prix || 0).toFixed(2)} €</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barre d'action fixe */}
            <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-6 flex items-center justify-end gap-6 z-30">
                <button
                    onClick={() => navigate('/products')}
                    className="text-xs font-bold text-slate-400 hover:text-red-500 transition-all"
                >
                    Annuler
                </button>
                <button 
                    onClick={handleSave}
                    className="bg-[#1e293b] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-blue-100"
                >
                    <Save size={18} /> {isEdit ? "Enregistrer les modifications" : "Confirmer l'ajout"}
                </button>
            </div>
        </div>
    );
}