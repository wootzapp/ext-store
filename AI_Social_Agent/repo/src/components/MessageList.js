import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getMessageStyle = (type) => {
    const baseStyle = {
      margin: '8px 12px',
      padding: '12px 16px',
      borderRadius: '18px',
      maxWidth: '85%',
      wordWrap: 'break-word',
      fontSize: '14px',
      lineHeight: '1.4'
    };

    switch (type) {
      case 'user':
        return {
          ...baseStyle,
          backgroundColor: '#1da1f2',
          color: 'white',
          alignSelf: 'flex-end',
          marginLeft: 'auto',
          borderBottomRightRadius: '4px'
        };
      case 'assistant':
        return {
          ...baseStyle,
          backgroundColor: '#f7f9fa',
          color: '#14171a',
          alignSelf: 'flex-start',
          border: '1px solid #e1e8ed',
          borderBottomLeftRadius: '4px'
        };
      case 'system':
        return {
          ...baseStyle,
          backgroundColor: '#fff3cd',
          color: '#856404',
          alignSelf: 'center',
          fontSize: '13px',
          fontStyle: 'italic',
          border: '1px solid #ffeaa7',
          textAlign: 'center',
          maxWidth: '90%'
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: '#f8d7da',
          color: '#721c24',
          alignSelf: 'center',
          border: '1px solid #f5c6cb',
          textAlign: 'center',
          maxWidth: '90%'
        };
      default:
        return baseStyle;
    }
  };

  const WelcomeMessage = () => (
    <div style={{ 
      textAlign: 'center', 
      color: '#657786', 
      marginTop: '40px',
      padding: '0 20px'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
      <h4 style={{ color: '#1da1f2', marginBottom: '12px' }}>Welcome to AI Social Agent!</h4>
      <p style={{ marginBottom: '16px', fontSize: '14px' }}>Ask me to help you with social media tasks:</p>
      <div style={{ 
        textAlign: 'left', 
        maxWidth: '300px', 
        margin: '0 auto',
        backgroundColor: '#f7f9fa',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e1e8ed'
      }}>
        <div style={{ marginBottom: '8px', fontSize: '13px' }}>
          <strong>• Post content:</strong> "Post a tweet about AI technology"
        </div>
        <div style={{ marginBottom: '8px', fontSize: '13px' }}>
          <strong>• Login help:</strong> "Help me login to X"
        </div>
        <div style={{ marginBottom: '8px', fontSize: '13px' }}>
          <strong>• Engagement:</strong> "Like posts about machine learning"
        </div>
        <div style={{ fontSize: '13px' }}>
          <strong>• Content ideas:</strong> "Generate tweet ideas about startups"
        </div>
      </div>
      <p style={{ 
        fontSize: '12px', 
        color: '#657786', 
        marginTop: '16px',
        fontStyle: 'italic'
      }}>
        Configure your API keys in Settings ⚙️ to get started
      </p>
    </div>
  );

  return (
    <div style={{ 
      flex: 1, 
      overflowY: 'auto', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#ffffff'
    }}>
      {messages.length === 0 && <WelcomeMessage />}
      
      {messages.map((message, index) => (
        <div key={index} style={getMessageStyle(message.type)}>
          <div>{message.content}</div>
          {message.actions && message.actions.length > 0 && (
            <div style={{ 
              marginTop: '12px', 
              fontSize: '12px', 
              opacity: 0.9,
              borderTop: '1px solid rgba(0,0,0,0.1)',
              paddingTop: '8px'
            }}>
              <strong>Actions performed:</strong>
              <div style={{ marginTop: '4px' }}>
                {message.actions.map((action, i) => (
                  <div key={i} style={{ 
                    margin: '2px 0',
                    padding: '4px 8px',
                    backgroundColor: action.success ? '#d4edda' : '#f8d7da',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}>
                    {action.success ? '✅' : '❌'} {action.message || action.description}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ 
            fontSize: '11px', 
            opacity: 0.6, 
            marginTop: '4px',
            textAlign: message.type === 'user' ? 'right' : 'left'
          }}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;