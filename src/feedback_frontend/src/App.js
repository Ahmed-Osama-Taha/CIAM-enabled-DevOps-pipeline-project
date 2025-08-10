// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import api from './api';

function App() {
  const [messages, setMessages] = useState([]);

  // Function to fetch messages from the backend
  async function fetchMessages() {
    try {
      const response = await api.get('/messages'); // <-- USE api.js
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  // Function to handle deletion
  const handleDelete = async (id) => {
    try {
      await api.delete(`/message/${id}`); // <-- USE api.js
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Function to handle adding messages
  const handleAddMessage = async (message) => {
    try {
      await api.post('/message', { message }); // <-- USE api.js
      fetchMessages();
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  return (
    <div className="App">
      <h1>Feedback App</h1>
      <MessageForm onAddMessage={handleAddMessage} />
      <MessageList messages={messages} onDelete={handleDelete} />
    </div>
  );
}

export default App;
