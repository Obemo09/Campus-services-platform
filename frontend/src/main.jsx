import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Events from './pages/Events';
import Marketplace from './pages/Marketplace';
import LostFound from './pages/LostFound';
import Carpooling from './pages/Carpooling';
import useIsMobile from './hooks/useIsMobile';

function Layout({ children }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--navy)' }}>
      {!isMobile && <Sidebar />}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 'var(--sidebar-w)',
        paddingBottom: isMobile ? 70 : 0,
        overflowY: 'auto', minHeight: '100vh'
      }}>
        {children}
      </main>
      {isMobile && <BottomNav />}
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a2438', color: '#fff', border: '1px solid rgba(255,255,255,0.07)', fontFamily: 'DM Sans' }
      }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><Layout><Bookings /></Layout></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Layout><Events /></Layout></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><Layout><Marketplace /></Layout></ProtectedRoute>} />
        <Route path="/lost-found" element={<ProtectedRoute><Layout><LostFound /></Layout></ProtectedRoute>} />
        <Route path="/carpooling" element={<ProtectedRoute><Layout><Carpooling /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);