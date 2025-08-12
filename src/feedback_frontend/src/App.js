// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './LoginPage';
import CallbackPage from './CallbackPage';

// Protected component that requires authentication
const ProtectedApp = () => {
  const { isAuthenticated, isLoading, user, logout, getAccessToken } = useAuth();
  const [messages, setMessages] = useState([]);

  // Function to fetch messages from the backend with authentication
  async function fetchMessages() {
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        // Token expired, redirect to login
        logout();
        return;
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated]);

  // Function to handle deletion with authentication
  const handleDelete = async (id) => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/message/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        logout();
        return;
      }
      
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Function to add message with authentication
  const handleAddMessage = async (message) => {
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message }),
      });
      
      if (response.status === 401) {
        logout();
        return;
      }
      
      fetchMessages();
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="App">
        <h1>🔄 Loading...</h1>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="App">
      <div className="user-info">
        <span>Welcome, {user?.profile?.preferred_username || user?.profile?.name || 'User'}!</span>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
      <h1>👾 Ahmed Ultimate CI/CD 🥷</h1>
      <MessageForm onAddMessage={handleAddMessage} />
      <MessageList messages={messages} onDelete={handleDelete} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/silent-callback" element={<div>Renewing session...</div>} />
          <Route path="/" element={<ProtectedApp />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;