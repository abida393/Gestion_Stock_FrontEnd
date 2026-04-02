import { useState } from "react";
import { toast } from "react-hot-toast";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const WarehouseIcon = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="36" height="36" rx="10" fill="#F5C842" />
    <path d="M6 15L18 7L30 15V29H6V15Z" fill="#1A2E6E" />
    <rect x="14" y="20" width="8" height="9" rx="1" fill="#F5C842" />
    <rect x="10" y="18" width="4" height="4" rx="0.5" fill="#F5C842" />
    <rect x="22" y="18" width="4" height="4" rx="0.5" fill="#F5C842" />
    <path d="M18 7L6 15H30L18 7Z" fill="#243B8A" />
  </svg>
);

const GridPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-10"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path
          d="M 40 0 L 0 0 0 40"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

const FloatingBox = ({ style, delay }) => (
  <motion.div
    className="absolute rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
    style={style}
    animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

export default function Connexion() {
  const [role, setRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez entrer vos identifiants.");
      return;
    }

    setIsLoading(true);
    // Simulation d'un appel API (Backend Integration Stub)
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Connexion réussie en tant que ${role} !`);
      // Ici tu ferais window.location.href = "/dashboard" ou similar
    }, 2000);
  };

  const isAdmin = role === "admin";

  const accentColor = isAdmin ? "#F5C842" : "#60A5FA";
  const accentDark = isAdmin ? "#D4A800" : "#3B82F6";

  return (
    <div
      className="min-h-screen flex font-sans bg-gray-50"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* LEFT PANEL */}
      <motion.div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden w-[52%] p-10"
        style={{
          background:
            "linear-gradient(135deg, #0F1F6B 0%, #1A2E8A 40%, #0D1B5E 100%)",
        }}
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <GridPattern />

        {/* Floating decorative boxes */}
        <FloatingBox
          style={{
            width: 80,
            height: 80,
            top: "18%",
            right: "12%",
            borderRadius: 16,
          }}
          delay={0}
        />
        <FloatingBox
          style={{
            width: 48,
            height: 48,
            top: "38%",
            right: "28%",
            borderRadius: 10,
          }}
          delay={1.5}
        />
        <FloatingBox
          style={{
            width: 120,
            height: 60,
            bottom: "22%",
            left: "8%",
            borderRadius: 14,
          }}
          delay={0.8}
        />
        <FloatingBox
          style={{
            width: 36,
            height: 36,
            bottom: "38%",
            right: "18%",
            borderRadius: 8,
          }}
          delay={2}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <WarehouseIcon />
          <span className="text-white text-xl font-bold tracking-wide">
            StockManager
          </span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Maîtrisez votre
              <br />
              inventaire avec{" "}
              <span style={{ color: "#F5C842" }}>précision.</span>
            </h1>
            <p className="text-blue-200 mt-4 text-base max-w-sm leading-relaxed">
              La plateforme conçue pour transformer la gestion de vos stocks en
              un véritable avantage stratégique.
            </p>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            className="border border-white/15 rounded-2xl p-5 backdrop-blur-md flex gap-8"
            style={{ background: "rgba(255,255,255,0.07)" }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <div>
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">
                Valeur Totale
              </p>
              <p className="text-white text-2xl font-bold">1.2M €</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">
                Flux Quotidien
              </p>
              <div className="flex items-center gap-2">
                <p className="text-white text-2xl font-bold">+12%</p>
                <span style={{ color: "#F5C842" }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex gap-6 text-blue-300/60 text-xs">
          <span>© 2024 StockManager</span>
          <a href="#" className="hover:text-white transition-colors">
            Aide
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Confidentialité
          </a>
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div
        className="flex-1 flex flex-col justify-center items-center px-8 py-12 bg-gray-50"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <WarehouseIcon />
          <span className="text-gray-800 text-xl font-bold tracking-wide">
            StockManager
          </span>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Bienvenue 👋
            </h2>
            <p className="text-gray-400 mt-1 text-sm">
              Connectez-vous pour accéder à votre tableau de bord.
            </p>
          </motion.div>

          {/* Role Toggle */}
          <motion.div
            className="relative flex bg-gray-200 rounded-xl p-1 mb-8"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <motion.div
              className="absolute top-1 bottom-1 rounded-lg shadow-sm"
              style={{
                background: isAdmin ? "#1A2E8A" : "#1D4ED8",
                width: "calc(50% - 4px)",
              }}
              animate={{ left: isAdmin ? 4 : "calc(50%)" }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
            {["admin", "utilisateur"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                  role === r
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </motion.div>

          {/* Role badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              className="flex items-center gap-2 mb-6"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
            >
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: accentColor + "22", color: accentDark }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: accentColor }}
                />
                {isAdmin
                  ? "Accès Administrateur"
                  : "Accès Utilisateur Standard"}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <motion.div
            className="space-y-5"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Identifiant ou Email
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3 border-2 transition-all duration-200 bg-white"
                style={{
                  borderColor: focused === "email" ? accentColor : "#E5E7EB",
                  boxShadow:
                    focused === "email" ? `0 0 0 4px ${accentColor}22` : "none",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={focused === "email" ? accentDark : "#9CA3AF"}
                  strokeWidth="2"
                >
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
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3 border-2 transition-all duration-200 bg-white"
                style={{
                  borderColor: focused === "password" ? accentColor : "#E5E7EB",
                  boxShadow:
                    focused === "password"
                      ? `0 0 0 4px ${accentColor}22`
                      : "none",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={focused === "password" ? accentDark : "#9CA3AF"}
                  strokeWidth="2"
                >
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
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setRemember(!remember)}
                  className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 cursor-pointer"
                  style={{
                    borderColor: remember ? accentDark : "#D1D5DB",
                    background: remember ? accentColor : "white",
                  }}
                >
                  {remember && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="#1A2E6E"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors select-none">
                  Se souvenir de moi
                </span>
              </label>
              <a
                href="#"
                className="text-sm font-semibold transition-colors"
                style={{ color: accentDark }}
              >
                Mot de passe oublié ?
              </a>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wide shadow-lg transition-all duration-200 flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={{
                background: isAdmin
                  ? "linear-gradient(135deg, #1A2E8A, #0F1F6B)"
                  : "linear-gradient(135deg, #1D4ED8, #1E40AF)",
                color: "white",
                boxShadow: isAdmin
                  ? "0 6px 24px rgba(26,46,138,0.35)"
                  : "0 6px 24px rgba(29,78,216,0.35)",
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Connexion...
                </>
              ) : (
                "Se Connecter"
              )}
            </motion.button>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Contact Admin */}
          <p className="text-center text-sm text-gray-400">
            Pas encore de compte ?{" "}
            <a
              href="#"
              className="font-semibold transition-colors"
              style={{ color: accentDark }}
            >
              Contacter l'administrateur
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
