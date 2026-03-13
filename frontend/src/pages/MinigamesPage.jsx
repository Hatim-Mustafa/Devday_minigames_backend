import { useEffect, useState } from 'react';
import api from '../api/client';

export default function MinigamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGames = async () => {
    try {
      const res = await api.get('/minigames');
      setGames(res.data);
    } catch {
      setError('Failed to load minigames.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/minigames', { name, description });
      setName('');
      setDescription('');
      await fetchGames();
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to register minigame.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (game) => {
    try {
      await api.put(`/minigames/${game._id}`, { isActive: !game.isActive });
      await fetchGames();
    } catch {
      alert('Failed to update minigame.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this minigame?')) return;
    try {
      await api.delete(`/minigames/${id}`);
      await fetchGames();
    } catch {
      alert('Failed to delete minigame.');
    }
  };

  return (
    <div className="page">
      <h2>Minigames</h2>

      {/* Registration form */}
      <section className="card">
        <h3>Register New Minigame</h3>
        <form onSubmit={handleRegister}>
          <label htmlFor="gameName">Name *</label>
          <input
            id="gameName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Game name"
            required
          />
          <label htmlFor="gameDesc">Description</label>
          <textarea
            id="gameDesc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            rows={3}
          />
          {formError && <p className="error">{formError}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Registering…' : 'Register Minigame'}
          </button>
        </form>
      </section>

      {/* Games list */}
      <section className="card">
        <h3>Registered Minigames</h3>
        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && games.length === 0 && <p>No minigames registered yet.</p>}
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game._id}>
                <td>{game.name}</td>
                <td>{game.description || '—'}</td>
                <td>
                  <span className={game.isActive ? 'badge active' : 'badge inactive'}>
                    {game.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <code>{game._id}</code>
                </td>
                <td className="actions">
                  <button onClick={() => handleToggleActive(game)}>
                    {game.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="danger"
                    onClick={() => handleDelete(game._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
