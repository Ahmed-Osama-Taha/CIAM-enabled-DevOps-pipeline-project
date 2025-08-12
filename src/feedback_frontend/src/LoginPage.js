// LoginPage.js
import React from 'react';
import { useAuth } from './AuthContext';

const LoginPage = () => {
  const { login, isLoading } = useAuth();

  const handleLogin = () => {
    login();
  };

  return (
    <div className="App">
      <h1>👾 Ahmed Ultimate CI/CD 🥷</h1>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>🔐 Authentication Required</h2>
        <p>Please log in to access the feedback application.</p>
        <button 
          onClick={handleLogin} 
          disabled={isLoading}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            marginTop: '20px',
            backgroundColor: '#ff0000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {isLoading ? 'Loading...' : '🚀 Login with Keycloak'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;