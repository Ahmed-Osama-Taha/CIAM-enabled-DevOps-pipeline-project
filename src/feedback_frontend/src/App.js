// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import api from './api'; // axios instance with Keycloak token

function App() {
  const [messages, setMessages] = useState([]);

  // Load messages from backend
  const fetchMessages = async () => {
    try {
      const response = await api.get('/messages'); // token auto added
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Delete a message
  const handleDelete = async (id) => {
    try {
      await api.delete(`/message/${id}`);
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Add a message
  const handleAddMessage = async (message) => {
    try {
      await api.post('/message', { message });
      fetchMessages();
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="App">
      <h1>Feedback App</h1>
      <MessageForm onAddMessage={handleAddMessage} />
      <MessageList messages={messages} onDelete={handleDelete} />
    </div>
  );
}

export default App;
