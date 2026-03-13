import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MinigamesPage from './pages/MinigamesPage';
import UsersPage from './pages/UsersPage';
import ScoresPage from './pages/ScoresPage';
import NavBar from './components/NavBar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('adminToken')
  );

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <NavBar onLogout={handleLogout} />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/minigames" replace />} />
          <Route path="/minigames" element={<MinigamesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/scores" element={<ScoresPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;

