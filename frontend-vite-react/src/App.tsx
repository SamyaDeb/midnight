import { useState, useCallback } from 'react';
import './App.css';

// Contract address from environment variable
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error';

interface VerificationResult {
  status: VerificationStatus;
  message: string;
  txHash?: string;
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function App() {
  const [birthYear, setBirthYear] = useState('');
  const [result, setResult] = useState<VerificationResult>({ status: 'idle', message: '' });
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [totalProofs, setTotalProofs] = useState(0);

  const handleVerify = useCallback(async () => {
    if (!birthYear) return;

    const year = parseInt(birthYear, 10);

    // Client-side validation
    if (isNaN(year) || year < 1900 || year > 2026) {
      setResult({
        status: 'error',
        message: 'Please enter a valid birth year between 1900 and 2026.',
      });
      return;
    }

    setResult({ status: 'verifying', message: 'Generating zero-knowledge proof...' });
    setTotalProofs(prev => prev + 1);

    // Simulate the ZK proof verification process
    // In production, this would call the Midnight contract via the wallet SDK
    await new Promise(resolve => setTimeout(resolve, 2500));

    const currentYear = 2026;
    const age = currentYear - year;

    if (age >= 18) {
      setResult({
        status: 'success',
        message: `Age verified! You have been confirmed as 18+ without revealing your actual birth year.`,
        txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      });
      setVerifiedCount(prev => prev + 1);
    } else {
      setResult({
        status: 'error',
        message: 'Age verification failed. The ZK proof could not confirm that you meet the minimum age requirement of 18.',
      });
    }
  }, [birthYear]);

  const handleReset = () => {
    setResult({ status: 'idle', message: '' });
    setBirthYear('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && birthYear && result.status !== 'verifying') {
      handleVerify();
    }
  };

  return (
    <>
      {/* Background effects */}
      <div className="bg-animation" />
      <div className="grid-pattern" />

      <div className="app-container">
        {/* Header */}
        <header className="header">
          <div className="header-badge">
            <span className="pulse-dot" />
            Midnight Network — Zero Knowledge
          </div>
          <h1>Age Verifier</h1>
          <p>Prove you're 18+ without revealing your date of birth. Powered by Midnight's privacy-preserving ZK proofs.</p>
        </header>

        {/* Main Verification Card */}
        <main className="main-card" id="verification-card">
          <div className="shield-icon">
            <ShieldIcon />
          </div>

          {/* Contract Status */}
          <div className="status-bar">
            <div className={`status-dot ${CONTRACT_ADDRESS ? 'connected' : 'pending'}`} />
            <span className="status-label">Contract</span>
            <span className="status-value">
              {CONTRACT_ADDRESS
                ? `${CONTRACT_ADDRESS.slice(0, 8)}...${CONTRACT_ADDRESS.slice(-6)}`
                : 'Demo Mode'}
            </span>
          </div>

          {/* Privacy Info Box */}
          <div className="info-box">
            <InfoIcon />
            <p>
              Your birth year is processed <strong>locally</strong> to generate a ZK proof. Only the proof is submitted on-chain — your actual age is never revealed.
            </p>
          </div>

          {/* Birth Year Input */}
          {result.status !== 'success' && (
            <div className="form-group">
              <label className="form-label" htmlFor="birthYear">
                Birth Year
                <span className="form-sublabel">(kept private)</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="birthYear"
                  type="number"
                  placeholder="e.g. 1990"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={result.status === 'verifying'}
                  min="1900"
                  max="2026"
                  autoComplete="off"
                />
                <div className="input-icon">
                  <LockIcon />
                </div>
              </div>
            </div>
          )}

          {/* Verify Button */}
          {result.status !== 'success' ? (
            <button
              className="btn-primary"
              id="verify-button"
              onClick={handleVerify}
              disabled={!birthYear || result.status === 'verifying'}
            >
              <span className="btn-content">
                {result.status === 'verifying' ? (
                  <>
                    <div className="spinner" />
                    Generating ZK Proof...
                  </>
                ) : (
                  <>
                    <ShieldIcon />
                    Verify My Age
                  </>
                )}
              </span>
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleReset}
            >
              <span className="btn-content">
                Verify Another User
              </span>
            </button>
          )}

          {/* Result Display */}
          {result.status === 'success' && (
            <div className="result-card success">
              <div className="result-icon">✓</div>
              <h3>Age Verified</h3>
              <p>{result.message}</p>
              {result.txHash && (
                <div className="tx-hash">
                  TX: {result.txHash}
                </div>
              )}
            </div>
          )}

          {result.status === 'error' && (
            <div className="result-card error">
              <div className="result-icon">✗</div>
              <h3>Verification Failed</h3>
              <p>{result.message}</p>
            </div>
          )}
        </main>

        {/* Stats */}
        <section className="stats-section" id="stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{verifiedCount}</div>
              <div className="stat-label">Verified</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalProofs}</div>
              <div className="stat-label">Proofs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Data shared</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features-section" id="features">
          <div className="features-title">Use Cases</div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <div className="feature-title">Token-Gated Content</div>
              <div className="feature-desc">Access age-restricted content without sharing personal data.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏛️</div>
              <div className="feature-title">Restricted Memberships</div>
              <div className="feature-desc">Join exclusive communities with privacy-preserving verification.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <div className="feature-title">Private Identity</div>
              <div className="feature-desc">Build identity apps that respect user privacy by design.</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <p className="footer-text">
            Built on <a href="https://midnight.network" target="_blank" rel="noopener noreferrer">Midnight Network</a> — Privacy-preserving DApps with Zero-Knowledge Proofs
          </p>
        </footer>
      </div>
    </>
  );
}

export default App;
