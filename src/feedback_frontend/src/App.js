// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import api from './api';

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch messages from backend
  async function fetchMessages() {
    try {
      const response = await api.get('/messages');
      setMessages(response.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  // Add new message
  const handleAddMessage = async (message) => {
    try {
      await api.post('/message', { message });
      fetchMessages();
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  // Delete message
  const handleDelete = async (id) => {
    try {
      await api.delete(`/message/${id}`);
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <div className="App">
      <h1>Feedback App</h1>

      {loading ? (
        <p>Loading messages...</p>
      ) : (
        <>
          <MessageForm onAddMessage={handleAddMessage} />
          {messages.length > 0 ? (
            <MessageList messages={messages} onDelete={handleDelete} />
          ) : (
            <p>No messages yet.</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;
