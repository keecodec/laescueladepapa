import { useState, useEffect } from 'react';
import api from '../api';

export default function DataListView({ title, endpoint, icon, columns }) {
  const Icon = icon;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(endpoint);
        setData(res.data);
      } catch (e) {
        setError(e.response?.data?.error || "Erreur de chargement (accès refusé ou réseau).");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [endpoint]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '1.5rem' }}>
        <Icon size={32} color="#007AFF" />
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>{title}</h1>
      </header>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#8E8E93', fontWeight: '500' }}>Chargement sécurisé des données...</div>
        ) : error ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#FF3B30', fontWeight: '500' }}>{error}</div>
        ) : data.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#8E8E93' }}>Aucune donnée disponible.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.02)' }}>
                  {columns.map((col, i) => (
                    <th key={i} style={{ padding: '1.25rem 1.5rem', color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    {columns.map((col, j) => (
                      <td key={j} style={{ padding: '1rem 1.5rem', color: '#1D1D1F' }}>
                        {row[col.key] === true ? <span style={{ color: '#34C759' }}>Oui</span> : row[col.key] === false ? <span style={{ color: '#8E8E93' }}>Non</span> : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
