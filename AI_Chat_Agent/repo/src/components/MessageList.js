import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
      margin: '4px 8px',
      padding: '8px 12px',
      borderRadius: '14px',
      maxWidth: '82%',
      wordWrap: 'break-word',
      fontSize: '13px',
      fontWeight: '600',
      lineHeight: '1.3'
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
          borderBottomLeftRadius: '4px',
          textAlign: 'left' 
        };
      case 'system':
        return {
          ...baseStyle,
          backgroundColor: '#fff3cd',
          color: '#856404',
          alignSelf: 'center',
          fontSize: '11px',
          fontStyle: 'italic',
          border: '1px solid #ffeaa7',
          textAlign: 'left',
          maxWidth: '88%',
          margin: '2px 8px'
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: '#f8d7da',
          color: '#721c24',
          alignSelf: 'center',
          border: '1px solid #f5c6cb',
          textAlign: 'center',
          maxWidth: '88%',
          fontSize: '11px',
          margin: '2px 8px'
        };
      default:
        return baseStyle;
    }
  };

  // Custom markdown components with proper styling
  const markdownComponents = {
    // Code blocks
    pre: ({ children }) => (
      <pre style={{
        backgroundColor: '#F0F0F0FF',
        border: '1px solid #A5A5A5FF',
        borderRadius: '6px',
        padding: '12px',
        overflow: 'auto',
        margin: '8px 0',
        fontSize: '11px',
        lineHeight: '1.4'
      }}>
        {children}
      </pre>
    ),
    // Inline code
    code: ({ node, inline, children, ...props }) => (
      inline ? (
        <code style={{
          backgroundColor: '#f6f8fa',
          padding: '2px 4px',
          borderRadius: '3px',
          fontSize: '11px',
          fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace'
        }} {...props}>
          {children}
        </code>
      ) : (
        <code style={{
          fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
          fontSize: '11px'
        }} {...props}>
          {children}
        </code>
      )
    ),
    // Headers
    h1: ({ children }) => (
      <h1 style={{
        fontSize: '16px',
        fontWeight: '600',
        margin: '12px 0 8px 0',
        color: '#14171a'
      }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{
        fontSize: '14px',
        fontWeight: '600',
        margin: '12px 0 8px 0',
        color: '#14171a'
      }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{
        fontSize: '13px',
        fontWeight: '600',
        margin: '12px 0 8px 0',
        color: '#14171a'
      }}>
        {children}
      </h3>
    ),
    // Strong/Bold
    strong: ({ children }) => (
      <strong style={{
        fontWeight: '600',
        color: '#14171a'
      }}>
        {children}
      </strong>
    ),
    // Emphasis/Italic
    em: ({ children }) => (
      <em style={{
        fontStyle: 'italic',
        color: '#586069'
      }}>
        {children}
      </em>
    ),
    // Unordered lists
    ul: ({ children }) => (
      <ul style={{
        margin: '8px 0',
        paddingLeft: '20px'
      }}>
        {children}
      </ul>
    ),
    // Ordered lists
    ol: ({ children }) => (
      <ol style={{
        margin: '8px 0',
        paddingLeft: '20px'
      }}>
        {children}
      </ol>
    ),
    // List items
    li: ({ children }) => (
      <li style={{
        margin: '2px 0',
        fontSize: '13px',
        lineHeight: '1.4'
      }}>
        {children}
      </li>
    ),
    // Paragraphs
    p: ({ children }) => (
      <p style={{
        margin: '8px 0',
        lineHeight: '1.5'
      }}>
        {children}
      </p>
    ),
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote style={{
        borderLeft: '4px solid #e1e4e8',
        paddingLeft: '12px',
        margin: '8px 0',
        fontStyle: 'italic',
        color: '#586069'
      }}>
        {children}
      </blockquote>
    )
  };

  const WelcomeMessage = () => (
    <div style={{ 
      textAlign: 'center', 
      color: '#657786', 
      marginTop: '20px',
      padding: '0 16px'
    }}>
      <div style={{ fontSize: '36px', marginBottom: '12px' }}>🤖</div>
      <h4 style={{ color: '#005E99FF', marginBottom: '6px', fontSize: '15px', fontWeight: '750' }}>Welcome to AI Chat Agent!</h4>
      <p style={{ marginBottom: '12px', fontSize: '13px', color: '#000000FF', fontWeight: '600' }}>Ask me to help you with tasks or start a conversation:</p>
      <div style={{ 
        textAlign: 'left', 
        maxWidth: '280px', 
        margin: '0 auto',
        backgroundColor: '#DDDDDDFF',
        color: '#000000FF',
        padding: '12px',
        borderRadius: '10px',
        border: '1px solid #888888FF'
      }}>
        <div style={{ marginBottom: '6px', fontSize: '12px' }}>
          <strong>• YouTube:</strong> "Search for videos and play"
        </div>
        <div style={{ marginBottom: '6px', fontSize: '12px' }}>
          <strong>• Social:</strong> "Post content on Twitter"
        </div>
        <div style={{ marginBottom: '6px', fontSize: '12px' }}>
          <strong>• Shopping:</strong> "Find products online"
        </div>
        <div style={{ fontSize: '12px' }}>
          <strong>• Any site:</strong> "Help me navigate this page"
        </div>
      </div>
      <p style={{ 
        fontSize: '13px', 
        color: '#000000FF', 
        marginTop: '15px',
        fontStyle: 'italic', 
        fontWeight: '600'
      }}>
        Configure your API keys in Settings ⚙️ to get started..
      </p>
    </div>
  );

  return (
    <div style={{ 
      flex: 1, 
      overflowY: 'auto', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#F0F0F0FF', 
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth'
    }}>
      {messages.length === 0 && <WelcomeMessage />}
      
      {messages.map((message, index) => (
        <div key={index} style={getMessageStyle(message.type)}>
          {/* Render content with proper markdown support */}
          <div style={{ textAlign: 'left', width: '100%' }}>
            {message.isMarkdown ? (
              <ReactMarkdown 
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}
                style={{ textAlign: 'left' }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              message.content
            )}
          </div>
          {message.actions && message.actions.length > 0 && (
            <div style={{ 
              marginTop: '6px', 
              fontSize: '10px', 
              opacity: 0.9,
              borderTop: '1px solid rgba(0,0,0,0.1)',
              paddingTop: '4px'
            }}>
              <strong>Actions:</strong>
              <div style={{ marginTop: '2px' }}>
                {message.actions.map((action, i) => (
                  <div key={i} style={{ 
                    margin: '1px 0',
                    padding: '2px 6px',
                    backgroundColor: action.success ? '#d4edda' : '#f8d7da',
                    borderRadius: '6px',
                    fontSize: '9px'
                  }}>
                    {action.success ? '✅' : '❌'} {action.message || action.description}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ 
            fontSize: '9px', 
            opacity: 0.6, 
            marginTop: '2px',
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