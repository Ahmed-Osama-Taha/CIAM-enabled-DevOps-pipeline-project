// CallbackPage.js
import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';

const CallbackPage = () => {
  const { handleAuthCallback, isLoading } = useAuth();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  return (
    <div className="App">
      <h1>👾 Processing Login...</h1>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>🔄 Completing authentication...</p>
        {isLoading && <p>Please wait...</p>}
      </div>
    </div>
  );
};

export default CallbackPage;