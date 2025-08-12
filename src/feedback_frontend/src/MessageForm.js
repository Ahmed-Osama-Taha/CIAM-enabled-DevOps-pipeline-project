// MessageForm.js
import React, { useState } from 'react';

const MessageForm = ({ onAddMessage }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onAddMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error submitting message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your feedback"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={isSubmitting || !message.trim()}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default MessageForm;