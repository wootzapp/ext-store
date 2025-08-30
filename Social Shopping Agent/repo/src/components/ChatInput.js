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
    if (e.key === 'Enter' && !e.shiftKey && isExecuting) {
      e.preventDefault();
      handleStop(e);
    }
  };

  return (
    <div className="chat-input-container" style={{ 
      padding: '6px 8px',
      borderTop: '1px solid #8A8A8AFF',
      background: 'linear-gradient(to top, #00499CFF, #002550FF)',
      flexShrink: 0
    }}>
      <form onSubmit={isExecuting ? handleStop : handleSubmit} style={{ 
        display: 'flex',
        alignItems: 'flex-end',
        position: 'relative'
      }}>
        <div style={{ 
          flex: 1, 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: disabled ? '#FFDCDCCB' : '#FFDCDCFF',
          borderRadius: '24px',
          border: '1px solid #00F064FF',
          padding: '0',
          minHeight: '48px'
        }}>
          <textarea
            ref={textareaRef}
            value={currentValue}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="chat-input"
            style={{
              width: '100%',
              minHeight: '20px',
              maxHeight: '120px',
              padding: '12px 60px 12px 16px',
              border: 'none',
              borderRadius: '24px',
              resize: 'none',
              fontSize: '14px',
              lineHeight: '24px',
              fontFamily: 'inherit',
              outline: 'none',
              backgroundColor: 'transparent',
              color: disabled ? '#657786' : '#14171a',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
            rows={1}
          />
          
          {/* Integrated Send/Stop Button */}
          {isExecuting ? (
            <button
              type="button"
              onClick={handleStop}
              className="chat-stop-button"
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                backgroundColor: '#e0245e',
                color: 'white',
                border: '1px solid #F00000FF',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '24px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(224, 36, 94, 0.3)',
                paddingBottom: '6px',
                transition: 'all 0.2s ease'
              }}
              title="Stop Execution"
            >
              ■
            </button>
          ) : (
            <button
              type="submit"
              disabled={!currentValue.trim() || disabled}
              className="chat-send-button"
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                backgroundColor: (!currentValue.trim() || disabled) ? '#CCCCCC' : '#00B64CFF',
                color: 'white',
                border: (!currentValue.trim() || disabled) ? '1px solid #AFAFAFFF' : '1px solid #00F064FF',
                borderRadius: '50%',
                cursor: (!currentValue.trim() || disabled) ? 'default' : 'pointer',
                fontSize: '22px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: (!currentValue.trim() || disabled) ? 'none' : '0 2px 8px rgba(0, 240, 100, 0.3)',
                transition: 'all 0.2s ease',
                paddingBottom: '2px',
                paddingRight: '4px'
              }}
              title="Send Message"
            >
              ➤
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
