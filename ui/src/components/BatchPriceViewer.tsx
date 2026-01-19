import { useState } from 'react';
import { getBatchPrices, ApiError } from '../services/api';
import type { BatchPriceResponse } from '../types/api';

const DEFAULT_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT'];

export function BatchPriceViewer() {
  const [symbolsInput, setSymbolsInput] = useState(DEFAULT_SYMBOLS.join(', '));
  const [batchData, setBatchData] = useState<BatchPriceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbolsInput.trim()) {
      setError('Please enter at least one symbol');
      return;
    }

    // Parse symbols from comma-separated input
    const symbols = symbolsInput
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    if (symbols.length === 0) {
      setError('Please enter at least one valid symbol');
      return;
    }

    if (symbols.length > 20) {
      setError('Maximum 20 symbols allowed');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setBatchData(null);
      const data = await getBatchPrices({ symbols });
      setBatchData(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch prices');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="batch-price-viewer">
      <h3>Batch Price Viewer</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            value={symbolsInput}
            onChange={(e) => setSymbolsInput(e.target.value)}
            placeholder="Enter symbols separated by commas (e.g., BTCUSDT, ETHUSDT, BNBUSDT)"
            className="symbols-textarea"
            rows={3}
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="fetch-button">
            {loading ? 'Loading...' : 'Get Prices'}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {batchData && (
        <div className="batch-results">
          <div className="batch-summary">
            <span>Total: {batchData.total}</span>
            <span>Successful: {batchData.successful}</span>
            <span>Failed: {batchData.failed}</span>
          </div>
          <table className="price-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Price</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {batchData.results.map((result) => (
                <tr key={result.symbol} className={result.error ? 'error-row' : ''}>
                  <td>{result.symbol}</td>
                  <td>
                    {result.error ? (
                      <span className="error-text">{result.error}</span>
                    ) : result.price !== undefined ? (
                      `$${result.price.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}`
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    {result.timestamp
                      ? new Date(result.timestamp).toLocaleTimeString()
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
