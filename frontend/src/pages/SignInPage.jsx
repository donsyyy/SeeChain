import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectWallet } from '../services/wallet';
import { ethers } from 'ethers';
import './AuthPages.css';

const SignInPage = () => {
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'Authenticated!') {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const handleConnect = async () => {
    setStatus('');
    const address = await connectWallet();
    if (address) {
      setAccount(address);
    } else {
      setStatus('Wallet connection failed.');
    }
  };

  const handleSignMessage = async () => {
    if (!window.ethereum || !account) return;
    setIsAuthenticating(true);
    setStatus('Awaiting signature...');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nonce = `Sign in to SeeChain at ${new Date().toISOString()}`;
      const signature = await signer.signMessage(nonce);
      // In a real app, send signature to backend for verification
      setStatus('Authenticated!');
    } catch (err) {
      setStatus('Signature denied.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Sign In to SeeChain</h2>
        {!account ? (
          <button className="auth-button" onClick={handleConnect}>
            Connect Wallet
          </button>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.98rem', color: '#1976d2' }}>
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
            <button className="auth-button" onClick={handleSignMessage} disabled={isAuthenticating}>
              {isAuthenticating ? 'Authenticating...' : 'Sign Message to Authenticate'}
            </button>
          </>
        )}
        {status && <div className="auth-link" style={{ marginTop: 18 }}>{status}</div>}
      </div>
    </div>
  );
};

export default SignInPage; 