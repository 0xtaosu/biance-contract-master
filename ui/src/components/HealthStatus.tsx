import { useState, useEffect } from 'react';
import { getHealth, ApiError } from '../services/api';
import type { HealthResponse } from '../types/api';

export function HealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getHealth();
        setHealth(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to connect to API');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="health-status">
        <h3>System Status</h3>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="health-status error">
        <h3>System Status</h3>
        <p className="status-indicator offline">● Offline</p>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  return (
    <div className="health-status">
      <h3>System Status</h3>
      <div className="status-grid">
        <div className="status-item">
          <span className="status-label">API Status:</span>
          <span className={`status-indicator ${health.status}`}>
            ● {health.status === 'healthy' ? 'Healthy' : 'Degraded'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Binance Connection:</span>
          <span className={`status-indicator ${health.binanceConnected ? 'connected' : 'disconnected'}`}>
            ● {health.binanceConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Last Updated:</span>
          <span className="timestamp">{new Date(health.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
