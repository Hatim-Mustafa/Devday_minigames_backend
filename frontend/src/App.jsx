import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import PublicGamesPage from './pages/PublicGamesPage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MinigamesPage from './pages/MinigamesPage';
import GamesGalleryPage from './pages/GamesGalleryPage';
import ScoresPage from './pages/ScoresPage';
import NavBar from './components/NavBar';
import './App.css';

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('adminToken');
  const isAdminShellPage =
    location.pathname.startsWith('/admin/minigames') ||
    location.pathname === '/admin/dashboard' ||
    location.pathname === '/admin/games';

  const handleLogin = () => {
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <main className={isAdminShellPage ? 'app-main-full' : ''}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<PublicGamesPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            isAuthenticated ? (
              <AdminDashboardPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin/minigames/new"
          element={
            isAuthenticated ? (
              <MinigamesPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin/minigames/:id/edit"
          element={
            isAuthenticated ? (
              <MinigamesPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin/games"
          element={
            isAuthenticated ? (
              <GamesGalleryPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin/scores"
          element={
            isAuthenticated ? (
              <>
                <NavBar onLogout={handleLogout} />
                <ScoresPage />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route
          path="/admin/minigames"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;

