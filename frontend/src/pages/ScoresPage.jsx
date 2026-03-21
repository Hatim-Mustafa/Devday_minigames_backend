import { useEffect, useState } from 'react';
import api from '../api/client';

export default function ScoresPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterGame, setFilterGame] = useState('');

  const fetchScores = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterUser) params.userCode = filterUser;
      if (filterGame) params.gameId = filterGame;
      const res = await api.get('/scores', { params });
      setScores(res.data);
    } catch {
      setError('Failed to load scores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <h2>Score Submissions</h2>

      <section className="card">
        <h3>Filter</h3>
        <div className="filter-row">
          <input
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            placeholder="User code"
          />
          <input
            value={filterGame}
            onChange={(e) => setFilterGame(e.target.value)}
            placeholder="Game ID"
          />
          <button onClick={fetchScores}>Search</button>
        </div>
      </section>

      <section className="card">
        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && scores.length === 0 && <p>No score submissions found.</p>}
        <table>
          <thead>
            <tr>
              <th>User Code</th>
              <th>Game</th>
              <th>Score</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s.id}>
                <td>{s.userCode}</td>
                <td>{s.game?.name ?? s.gameId}</td>
                <td>{s.score}</td>
                <td>{new Date(s.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
