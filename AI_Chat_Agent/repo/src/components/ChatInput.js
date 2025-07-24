import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSendMessage, onStopExecution, isExecuting, disabled, placeholder }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isExecuting) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleStop = (e) => {
    e.preventDefault();
    if (onStopExecution && isExecuting) {
      onStopExecution();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isExecuting) {
        handleStop(e);
      } else {
        handleSubmit(e);
      }
    }
  };

  return (
    <div style={{ 
      padding: '8px 12px',
      borderTop: '1px solid #8A8A8AFF',
      background: 'linear-gradient(to top, #B1B1B1FF, #EBEBEBFF)',
      flexShrink: 0
    }}>
      <form onSubmit={isExecuting ? handleStop : handleSubmit} style={{ 
        display: 'flex', 
        gap: '8px',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              width: '100%',
              minHeight: '36px',
              maxHeight: '100px',
              padding: '8px 12px',
              border: '1px solid #A5A5A5FF',
              borderRadius: '12px',
              resize: 'none',
              fontSize: '14px',
              lineHeight: '20px',
              fontFamily: 'inherit',
              outline: 'none',
              backgroundColor: disabled ? '#f7f9fa' : '#ffffff',
              color: disabled ? '#657786' : '#14171a',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
            rows={1}
          />
        </div>
        
        {/* Conditional button - either Send or Stop */}
        {isExecuting ? (
          <button
            type="button"
            onClick={handleStop}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e0245e',
              color: 'white',
              border: 'none',
              borderRadius: '18px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              minWidth: '60px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px', 
              marginBottom: '5px'
            }}
            title="Stop Execution"
          >
            🛑 Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            style={{
              padding: '8px 16px',
              backgroundColor: (!message.trim() || disabled) ? '#e1e8ed' : '#00694AFF',
              color: (!message.trim() || disabled) ? '#657786' : 'white',
              border: '1px solid #A5A5A5FF',
              borderRadius: '18px',
              cursor: (!message.trim() || disabled) ? 'default' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              minWidth: '60px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              marginBottom: '5px'
            }}
            title="Send Message"
          >
            ➤ Send
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatInput;
