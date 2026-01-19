import { useState } from 'react';
import { getSinglePrice, ApiError } from '../services/api';
import type { ContractPrice } from '../types/api';

export function SinglePriceChecker() {
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState<ContractPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) {
      setError('Please enter a symbol');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPrice(null);
      const data = await getSinglePrice(symbol.trim().toUpperCase());
      setPrice(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch price');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="single-price-checker">
      <h3>Single Symbol Price Checker</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter symbol (e.g., BTCUSDT)"
            className="symbol-input"
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="fetch-button">
            {loading ? 'Loading...' : 'Get Price'}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {price && (
        <div className="price-result">
          <div className="price-card">
            <div className="price-symbol">{price.symbol}</div>
            <div className="price-value">${price.price.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 8,
            })}</div>
            <div className="price-timestamp">
              Updated: {new Date(price.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
