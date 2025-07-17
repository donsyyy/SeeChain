import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectWallet } from '../services/wallet';
import './AuthPages.css';

const RegisterPage = () => {
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleConnect = async () => {
    setStatus('');
    const address = await connectWallet();
    if (address) {
      setAccount(address);
      setStatus('Registration complete! You can now sign in.');
    } else {
      setStatus('Wallet connection failed.');
    }
  };

  const handleSignInRedirect = () => {
    navigate('/signin');
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Register for SeeChain</h2>
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
            <button className="auth-button" onClick={handleSignInRedirect}>
              Sign In
            </button>
          </>
        )}
        {status && <div className="auth-link" style={{ marginTop: 18 }}>{status}</div>}
      </div>
    </div>
  );
};

export default RegisterPage; 