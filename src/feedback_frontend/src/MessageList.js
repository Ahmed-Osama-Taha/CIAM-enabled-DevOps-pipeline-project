// MessageList.js
import React from 'react';

const MessageList = ({ messages, onDelete }) => {
  if (!messages || messages.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
        <p>No messages yet. Add your first feedback!</p>
      </div>
    );
  }

  return (
    <ul>
      {messages.map((msg) => (
        <li key={msg.id}>
          <div style={{ flex: 1 }}>
            <span>{msg.text}</span>
            {msg.username && (
              <small style={{ 
                display: 'block', 
                color: '#888', 
                fontSize: '12px',
                marginTop: '4px'
              }}>
                by {msg.username}
              </small>
            )}
          </div>
          <button className="delete-btn" onClick={() => onDelete(msg.id)}>
            ❌
          </button>
        </li>
      ))}
    </ul>
  );
};

export default MessageList;