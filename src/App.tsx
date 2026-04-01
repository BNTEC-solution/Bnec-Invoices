import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './components/pages/Dashboard';
import { Invoices } from './components/pages/Invoices';
import { Inventory } from './components/pages/Inventory';
import { Clients } from './components/pages/Clients';
import { Suppliers } from './components/pages/Suppliers';
import { Reports } from './components/pages/Reports';
import { Settings } from './components/pages/Settings';
import { LandingPage } from './components/pages/LandingPage';
import { Privacy, Terms } from './components/pages/StaticPages';
import { SuperAdminDashboard } from './components/pages/admin/SuperAdminDashboard';

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { isAdmin, isSuperAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      
      {/* Protected App Routes */}
      <Route path="/app" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="clients" element={<Clients />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={isAdmin ? <Settings /> : <Navigate to="/app" />} />
        <Route path="admin" element={isSuperAdmin ? <SuperAdminDashboard /> : <Navigate to="/app" />} />
        <Route path="*" element={<Navigate to="/app" />} />
      </Route>
      
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
