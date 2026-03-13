import { useEffect, useState } from 'react';
import api from '../api/client';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [userCode, setUserCode] = useState('');
  const [username, setUsername] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/users', { userCode, username });
      setUserCode('');
      setUsername('');
      await fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h2>Participants</h2>

      <section className="card">
        <h3>Add Participant</h3>
        <form onSubmit={handleAdd}>
          <label htmlFor="userCode">User Code *</label>
          <input
            id="userCode"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            placeholder="Unique badge / QR code"
            required
          />
          <label htmlFor="username">Username *</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Display name"
            required
          />
          {formError && <p className="error">{formError}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Participant'}
          </button>
        </form>
      </section>

      <section className="card">
        <h3>All Participants</h3>
        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && users.length === 0 && <p>No participants registered yet.</p>}
        <table>
          <thead>
            <tr>
              <th>User Code</th>
              <th>Username</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <code>{u.userCode}</code>
                </td>
                <td>{u.username}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
