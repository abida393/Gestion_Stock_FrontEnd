import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Connexion from "./Connexion/Connexion";
import DashboardLayout from "./layout/DashboardLayout";
import Dashboard from "./Dashboard/Dashboard";
import Produits from "./Products/Produits";
import ProduitDetail from "./Products/ProduitDetail";
import Fournisseurs from "./Suppliers/Fournisseurs";
import AddFournisseur from "./Suppliers/AddFournisseur";
import "./App.css";
import StockMovements from './StockMovements/StockMovements';
import StockAlerts from './StockAlerts/StockAlerts';
import Reports from "./StockReports/Reports";
import AIInsights from "./AI_Insights/AIInsights";
import StockDetailReport from "./StockReports/StockDetailReport";
import MovementHistory from "./StockMovements/MovementHistory";
import AnomalyDetection from "./AI_Insights/AnomalyDetection";
import ThresholdConfig from "./StockAlerts/ThresholdConfig";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const isAuthenticated = !!localStorage.getItem('sanctum_token');

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public route — redirect to dashboard if already logged in */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Connexion />}
        />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
          </Route>

          <Route path="/products" element={<DashboardLayout />}>
            <Route index element={<Produits />} />
            <Route path=":id" element={<ProduitDetail />} />
          </Route>

          <Route path="/suppliers" element={<DashboardLayout />}>
            <Route index element={<Fournisseurs />} />
            <Route path="add" element={<AddFournisseur />} />
          </Route>

          <Route path="/movements" element={<DashboardLayout />}>
            <Route index element={<StockMovements />} />
            <Route path="history" element={<MovementHistory />} />
          </Route>

          <Route path="/alerts" element={<DashboardLayout />}>
            <Route index element={<StockAlerts />} />
            <Route path="thresholds" element={<ThresholdConfig />} />
          </Route>

          <Route path="/reports" element={<DashboardLayout />}>
            <Route index element={<Reports />} />
            <Route path="detail" element={<StockDetailReport />} />
          </Route>

          <Route path="/ai-insights" element={<DashboardLayout />}>
            <Route index element={<AIInsights />} />
            <Route path="anomalies" element={<AnomalyDetection />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;


