import { useState } from 'react';
import api from '../api/client';

export default function LoginPage({ onLogin }) {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { secret });
      localStorage.setItem('adminToken', res.data.token);
      onLogin();
    } catch {
      setError('Invalid admin secret. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Devday Minigames</h1>
        <h2>Admin Panel</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="secret">Admin Secret</label>
          <input
            id="secret"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter admin secret"
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
