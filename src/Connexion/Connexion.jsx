import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import authService from "../services/authService";

const WarehouseIcon = () => (
  <svg
    width="42"
    height="42"
    viewBox="0 0 42 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="42" height="42" rx="12" fill="url(#paint0_linear)" />
    <path d="M7 17.5L21 8.16667L35 17.5V33.8333H7V17.5Z" fill="url(#paint1_linear)" />
    <rect x="16" y="23" width="10" height="11" rx="2" fill="white" />
    <rect x="11" y="21" width="5" height="5" rx="1" fill="white" fillOpacity="0.8" />
    <rect x="26" y="21" width="5" height="5" rx="1" fill="white" fillOpacity="0.8" />
    <path d="M21 8.16667L7 17.5H35L21 8.16667Z" fill="white" fillOpacity="0.9" />
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="paint1_linear" x1="21" y1="8.16667" x2="21" y2="33.8333" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E3A8A" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
    </defs>
  </svg>
);

const AbstractShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div 
      animate={{ 
        rotate: [0, 90, 180, 270, 360],
        scale: [1, 1.1, 1]
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[120px] bg-blue-500/20"
    />
    <motion.div 
      animate={{ 
        rotate: [360, 270, 180, 90, 0],
        scale: [1, 1.2, 1]
      }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full blur-[100px] bg-indigo-500/20"
    />
    <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-slate-900/80 to-transparent" />
  </div>
);

const FloatingBox = ({ style, delay, children }) => (
  <motion.div
    className="absolute rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl flex items-center justify-center overflow-hidden"
    style={style}
    animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
    transition={{ duration: 7, repeat: Infinity, delay, ease: "easeInOut" }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
    {children}
  </motion.div>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

export default function Connexion() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez entrer vos identifiants.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.login(email, password);
      toast.success("Connexion réussie !");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Identifiants incorrects. Veuillez réessayer.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50 selection:bg-blue-500/30">
      {/* LEFT PANEL */}
      <motion.div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden w-[55%] p-12"
        style={{
          background: "radial-gradient(circle at 30% 30%, #1e1b4b 0%, #0f172a 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <AbstractShapes />
        
        {/* Animated decorative boxes */}
        <FloatingBox style={{ width: 120, height: 120, top: "15%", right: "15%" }} delay={0}>
          <div className="w-16 h-16 rounded-full border-4 border-blue-400/30" />
        </FloatingBox>
        <FloatingBox style={{ width: 80, height: 80, top: "45%", right: "8%" }} delay={1.5}>
           <div className="w-8 h-8 bg-indigo-500/40 rounded-lg rotate-45" />
        </FloatingBox>
        <FloatingBox style={{ width: 160, height: 80, bottom: "25%", left: "10%" }} delay={0.8}>
           <div className="flex gap-2.5">
             <div className="w-2.5 h-10 bg-blue-400/50 rounded-full" />
             <div className="w-2.5 h-6 bg-indigo-400/50 rounded-full" />
             <div className="w-2.5 h-14 bg-purple-400/50 rounded-full" />
           </div>
        </FloatingBox>

        {/* Header / Logo */}
        <motion.div 
          className="relative z-10 flex items-center gap-3"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <WarehouseIcon />
          <span className="text-white text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            StockManager
          </span>
        </motion.div>

        {/* Hero Text */}
        <div className="relative z-10 space-y-8 my-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
          >
            <h1 className="text-[3.8rem] font-black text-white leading-[1.1] tracking-tight">
              Maîtrisez votre <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                inventaire avec précision.
              </span>
            </h1>
            <p className="text-slate-300 mt-6 text-[17px] max-w-[420px] leading-relaxed font-medium">
              La plateforme intelligente conçue pour transformer la gestion de vos stocks en un véritable avantage stratégique.
            </p>
          </motion.div>

          {/* Stats Glass Card */}
          <motion.div
            className="border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex gap-8 w-fit shadow-2xl bg-white/5 relative overflow-hidden"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                  Valeur Totale
                </p>
              </div>
              <p className="text-white text-3xl font-black tracking-tight">1.2M <span className="text-slate-500 text-xl font-bold">€</span></p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                  Flux Quotidien
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-white text-3xl font-black tracking-tight">+12%</p>
                <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/30">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div 
          className="relative z-10 flex gap-6 text-slate-400/80 text-xs uppercase font-bold tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span>© 2024 StockManager</span>
          <a href="#" className="hover:text-white transition-colors">Aide</a>
          <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
        </motion.div>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div
        className="flex-1 flex flex-col justify-center items-center px-6 py-8 relative bg-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Subtle background decoration for right panel */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-50 to-transparent rounded-full blur-3xl -z-10 opacity-60" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-50 to-transparent rounded-full blur-3xl -z-10 opacity-60" />

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <WarehouseIcon />
          <span className="text-slate-900 text-xl font-black tracking-tight">
            StockManager
          </span>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Header */}
          <motion.div
            className="mb-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
              Bienvenue 
            </h2>
            <p className="text-slate-500 text-[16px] font-medium">
              Connectez-vous à votre espace sécurisé.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleLogin}
            className="space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Email */}
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 transition-colors group-focus-within:text-blue-600">
                Email professionnel
              </label>
              <div
                className="flex items-center gap-3 rounded-2xl px-5 py-4 transition-all duration-300 bg-slate-50/50 border-2"
                style={{
                  borderColor: focused === "email" ? "#3B82F6" : "#F1F5F9",
                  backgroundColor: focused === "email" ? "#FFFFFF" : "#F8FAFC",
                  boxShadow: focused === "email" ? "0 4px 20px -5px rgba(59,130,246,0.15)" : "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={focused === "email" ? "#3B82F6" : "#94A3B8"} strokeWidth="2.5" className="transition-colors">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  placeholder="nom@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className="flex-1 bg-transparent text-[15px] font-semibold text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 transition-colors group-focus-within:text-blue-600">
                Mot de passe
              </label>
              <div
                className="flex items-center gap-3 rounded-2xl px-5 py-4 transition-all duration-300 bg-slate-50/50 border-2"
                style={{
                  borderColor: focused === "password" ? "#3B82F6" : "#F1F5F9",
                  backgroundColor: focused === "password" ? "#FFFFFF" : "#F8FAFC",
                  boxShadow: focused === "password" ? "0 4px 20px -5px rgba(59,130,246,0.15)" : "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={focused === "password" ? "#3B82F6" : "#94A3B8"} strokeWidth="2.5" className="transition-colors">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="flex-1 bg-transparent text-[15px] font-semibold text-slate-900 placeholder-slate-400 outline-none tracking-[0.2em]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setRemember(!remember)}
                  className="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 cursor-pointer"
                  style={{
                    borderColor: remember ? "#3B82F6" : "#CBD5E1",
                    background: remember ? "#3B82F6" : "white",
                  }}
                >
                  <AnimatePresence>
                    {remember && (
                      <motion.svg 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        exit={{ scale: 0 }} 
                        width="10" height="10" viewBox="0 0 12 12" fill="none"
                      >
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-[14px] font-medium text-slate-500 group-hover:text-slate-800 transition-colors select-none">
                  Se souvenir de moi
                </span>
              </label>
              <a href="#" className="text-[14px] font-bold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-all">
                Oublié ?
              </a>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className={`w-full mt-2 py-4 rounded-2xl text-[16px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden shadow-lg shadow-blue-500/25 ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <span className="relative text-white flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se Connecter
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </span>
            </motion.button>
          </motion.form>

          {/* Divider */}
          <motion.div 
            className="flex items-center gap-4 my-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          >
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] uppercase font-black text-slate-400 tracking-widest">ou</span>
            <div className="flex-1 h-px bg-slate-200" />
          </motion.div>

          {/* Contact Admin */}
          <motion.p 
            className="text-center text-[14px] text-slate-500 font-medium"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          >
            Pas encore de compte ?{" "}
            <a href="#" className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
              Contactez l'Admin
            </a>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
