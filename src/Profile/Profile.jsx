import React, { useState, useEffect } from 'react';
import {
  User, Mail, Shield, Smartphone,
  MapPin, Camera, Save, Key,
  LogOut, BellRing, Globe
} from 'lucide-react';
import authService from '../services/authService';

const Profile = () => {
  // État pour gérer les informations (Prêt pour ton Backend Laravel)
  const [user, setUser] = useState({
    nom: "",
    email: "",
    role: "",
    telephone: "",
    localisation: "",
    langue: "",
    timezone: ""
  });

  const [notifications, setNotifications] = useState({
    stockAlerts: true,
    mouvements: false,
    reports: true
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser({
        nom: currentUser.nom || currentUser.name || "Utilisateur",
        email: currentUser.email || "",
        role: currentUser.role || currentUser.role_id || "Utilisateur",
        telephone: currentUser.telephone || currentUser.phone || "",
        localisation: currentUser.localisation || "Non spécifié",
        langue: currentUser.langue || "Français",
        timezone: currentUser.timezone || "(GMT+01:00) Casablanca"
      });
    }
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 md:p-8">

      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mon Profil</h1>
        <p className="text-[13px] text-gray-500 font-medium mt-1">Gérez vos informations personnelles et vos paramètres de sécurité.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Colonne Gauche : Carte Photo & Actions Rapides */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="w-full h-full bg-[#1e293b] rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg">
                {user.nom?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-100 text-blue-600 hover:scale-110 transition-transform">
                <Camera size={20} />
              </button>
            </div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">{user.nom}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block mt-2">
              {user.role}
            </p>

            <div className="mt-8 pt-8 border-t border-slate-50 space-y-2">
              <button className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-600 font-bold text-[13px]">
                <span className="flex items-center gap-3"><Key size={16} className="text-slate-400" /> Changer le mot de passe</span>
                <span className="text-slate-300">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-2.5 hover:bg-red-50 rounded-xl transition-colors text-red-500 font-bold text-[13px]">
                <span className="flex items-center gap-3"><LogOut size={16} /> Déconnexion</span>
              </button>
            </div>
          </div>

          <div className="bg-[#0a192f] rounded-2xl p-6 text-white shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-4"><Shield size={16} className="text-teal-400" /> Sécurité</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-6 font-medium">
              Votre compte est protégé par une authentification à deux facteurs. Dernière connexion : aujourd'hui à 14:20.
            </p>
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[11px] font-bold text-slate-300">Statut du compte</span>
              <span className="text-[9px] font-black bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded uppercase tracking-tighter">Vérifié</span>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Formulaire d'édition */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8 flex items-center gap-2">
              <User size={16} /> Informations Personnelles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Nom Complet
                </label>
                <input
                  type="text"
                  value={user.nom}
                  className="w-full py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 font-bold text-slate-700 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} /> Adresse Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  className="w-full py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 font-bold text-slate-700 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Smartphone size={14} /> Téléphone
                </label>
                <input
                  type="text"
                  value={user.telephone}
                  className="w-full py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 font-bold text-slate-700 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} /> Localisation
                </label>
                <input
                  type="text"
                  value={user.localisation}
                  className="w-full py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 font-bold text-slate-700 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
               <Globe size={16} /> Préférences Système
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} /> Langue de l'interface
                </label>
                <select className="w-full py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 font-bold text-slate-700 appearance-none cursor-pointer">
                  <option>Français (FR)</option>
                  <option>Anglais (EN)</option>
                  <option>Arabe (AR)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} /> Fuseau Horaire
                </label>
                <select className="w-full py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 font-bold text-slate-700 appearance-none cursor-pointer">
                  <option>{user.timezone || "(GMT+01:00) Casablanca"}</option>
                  <option>(GMT+00:00) Londres</option>
                  <option>(GMT+02:00) Paris</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
              <BellRing size={16} /> Notifications
            </h3>
            
            <div className="space-y-3">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><BellRing size={16}/></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Alertes de Stock</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Être notifié quand un produit passe sous le seuil critique</p>
                  </div>
                </div>
                <div 
                  onClick={() => toggleNotification('stockAlerts')}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications.stockAlerts ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${notifications.stockAlerts ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Smartphone size={16}/></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Mouvements Rapides</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Recevoir un résumé des mouvements inhabituels</p>
                  </div>
                </div>
                <div 
                  onClick={() => toggleNotification('mouvements')}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications.mouvements ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${notifications.mouvements ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
              
              {/* Toggle 3 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><Mail size={16}/></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Rapports Hebdomadaires</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Envoi automatique du rapport d'inventaire par email</p>
                  </div>
                </div>
                <div 
                  onClick={() => toggleNotification('reports')}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications.reports ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${notifications.reports ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-6 items-center">
              <button className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all">Annuler</button>
              <button className="bg-[#1e293b] text-white px-8 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                <Save size={16} /> Sauvegarder
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
