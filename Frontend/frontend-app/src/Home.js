import React, { useEffect, useState } from 'react';
import './Home.css';

const Home = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${backendUrl}/api/message`)
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to connect to backend');
        setLoading(false);
      });

    fetch(`${backendUrl}/api/health`)
      .then((response) => response.json())
      .then((data) => setHealth(data.status));
  }, [backendUrl]);

  if (loading) return (
    <div className="container">
      <div className="loading">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="container">
      <div className="error-card">
        <h2>⚠️ Connection Error</h2>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="container">
      <header className="header">
        <h1>🚀 DevOps CI/CD Dashboard</h1>
        <div className="status-badge">
          <span className={`status-dot ${health === 'healthy' ? 'healthy' : 'unhealthy'}`}></span>
          System {health === 'healthy' ? 'Healthy' : 'Unhealthy'}
        </div>
      </header>

      <div className="dashboard">
        <div className="card hero-card">
          <div className="card-icon">✨</div>
          <h2>{message}</h2>
          <p>Your application is successfully deployed and running</p>
        </div>

        <div className="grid">
          <div className="card">
            <div className="card-header">
              <span className="card-icon-small">🎨</span>
              <h3>Frontend</h3>
            </div>
            <div className="card-body">
              <p className="port">Port: 3000</p>
              <p className="tech">React 19.2.4</p>
              <div className="status-indicator online">● Online</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-icon-small">⚙️</span>
              <h3>Backend</h3>
            </div>
            <div className="card-body">
              <p className="port">Port: 5000</p>
              <p className="tech">Flask 3.0.0</p>
              <div className="status-indicator online">● Online</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-icon-small">🔄</span>
              <h3>CI/CD Pipeline</h3>
            </div>
            <div className="card-body">
              <p className="port">GitHub Actions</p>
              <p className="tech">Automated Deploy</p>
              <div className="status-indicator online">● Active</div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>Built with ❤️ using React & Flask</p>
      </footer>
    </div>
  );
};

export default Home;
