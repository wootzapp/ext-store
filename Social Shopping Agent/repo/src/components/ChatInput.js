import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ 
  onSendMessage, 
  onStopExecution, 
  isExecuting, 
  disabled, 
  placeholder,
  value = '',
  onChange 
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Use external value if provided, otherwise use internal state
  const currentValue = onChange ? value : message;
  const setValue = onChange ? onChange : setMessage;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [currentValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentValue.trim() && !disabled && !isExecuting) {
      onSendMessage(currentValue.trim());
      setValue('');
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
      background: 'linear-gradient(to top, #00499CFF, #002550FF)',
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
            value={currentValue}
            onChange={(e) => setValue(e.target.value)}
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
              backgroundColor: disabled ? '#FFDCDCCB' : '#FFDCDCFF',
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
              marginBottom: '3px'
            }}
            title="Stop Execution"
          >
            🛑 Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!currentValue.trim() || disabled}
            style={{
              padding: '8px 16px',
              backgroundColor: (!currentValue.trim() || disabled) ? '#FFDCDCCB' : '#00694AFF',
              color: (!currentValue.trim() || disabled) ? '#657786' : 'white',
              border: '1px solid #FFDCDCFF',
              borderRadius: '18px',
              cursor: (!currentValue.trim() || disabled) ? 'default' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              minWidth: '60px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              marginBottom: '3px'
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
