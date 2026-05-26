import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DogsList from './pages/DogsList';
import DogNew from './pages/DogNew';
import DogProfile from './pages/DogProfile';
import DogDocuments from './pages/DogDocuments';
import DogTracking from './pages/DogTracking';
import DogChat from './pages/DogChat';
import DogAlerts from './pages/DogAlerts';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Cargando...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Cargando...</div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    <Route path="/dogs" element={<PrivateRoute><DogsList /></PrivateRoute>} />
    <Route path="/dogs/new" element={<PrivateRoute><DogNew /></PrivateRoute>} />
    <Route path="/dogs/:id" element={<PrivateRoute><DogProfile /></PrivateRoute>} />
    <Route path="/dogs/:id/documents" element={<PrivateRoute><DogDocuments /></PrivateRoute>} />
    <Route path="/dogs/:id/tracking" element={<PrivateRoute><DogTracking /></PrivateRoute>} />
    <Route path="/dogs/:id/chat" element={<PrivateRoute><DogChat /></PrivateRoute>} />
    <Route path="/dogs/:id/alerts" element={<PrivateRoute><DogAlerts /></PrivateRoute>} />
    <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;