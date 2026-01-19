import { HealthStatus } from './components/HealthStatus';
import { SinglePriceChecker } from './components/SinglePriceChecker';
import { BatchPriceViewer } from './components/BatchPriceViewer';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Binance Contract Price Checker</h1>
        <p className="subtitle">Real-time futures contract prices from Binance</p>
      </header>

      <main className="app-main">
        <HealthStatus />
        <SinglePriceChecker />
        <BatchPriceViewer />
      </main>

      <footer className="app-footer">
        <p>
          Powered by{' '}
          <a href="https://www.binance.com" target="_blank" rel="noopener noreferrer">
            Binance API
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
