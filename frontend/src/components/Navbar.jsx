import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname === path
      ? 'text-blue-600 font-medium'
      : 'text-gray-500 hover:text-gray-900';

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-gray-900">
          <span className="text-2xl">🐾</span>
          <span className="hidden sm:inline">Dog Health Tracker</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/dashboard" className={`text-sm ${isActive('/dashboard')}`}>
            Inicio
          </Link>
          <Link to="/dogs" className={`text-sm ${isActive('/dogs')}`}>
            Mis perros
          </Link>
          <Link to="/settings" className={`text-sm ${isActive('/settings')}`}>
            Ajustes
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Salir
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;