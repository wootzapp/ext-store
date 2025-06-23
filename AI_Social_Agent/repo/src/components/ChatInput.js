import React, { useState, useRef } from 'react';

const ChatInput = ({ onSendMessage, disabled, placeholder = "Ask me anything or request social media tasks..." }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div style={{ 
      padding: '12px 16px', 
      borderTop: '1px solid #e1e8ed',
      backgroundColor: '#ffffff'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows="2"
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #e1e8ed',
              borderRadius: '20px',
              resize: 'none',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'inherit',
              backgroundColor: disabled ? '#f7f9fa' : '#ffffff'
            }}
          />
          <button 
            type="submit" 
            disabled={disabled || !message.trim()}
            style={{
              padding: '12px 20px',
              backgroundColor: disabled || !message.trim() ? '#e1e8ed' : '#1da1f2',
              color: disabled || !message.trim() ? '#657786' : 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: disabled || !message.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              minWidth: '80px'
            }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
