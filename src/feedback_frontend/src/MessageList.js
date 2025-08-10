// MessageList.js
import React from 'react';

const MessageList = ({ messages, onDelete }) => {
  if (!messages || messages.length === 0) {
    return <p>No messages yet.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {messages.map((msg) => (
        <li
          key={msg.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          <span style={{ flex: 1 }}>{msg.message}</span>
          <button
            onClick={() => onDelete(msg.id)}
            style={{
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              cursor: 'pointer'
            }}
          >
            ❌
          </button>
        </li>
      ))}
    </ul>
  );
};

export default MessageList;
