import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageList = ({ messages, onTemplateClick, isTyping }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    if (messages.length === 0 && !isTyping) {
      scrollToTop();
    } else {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const getMessageStyle = (type) => {
    const baseStyle = {
      margin: '4px 8px',
      padding: '8px 12px',
      borderRadius: '14px',
      maxWidth: '82%',
      wordWrap: 'break-word',
      fontSize: '13px',
      fontWeight: '600',
      lineHeight: '1.3',
      transition: 'all 0.3s ease',
      opacity: 1,
      transform: 'translateY(0)',
      animation: 'fadeInUp 0.3s ease-out'
    };

    switch (type) {
      case 'user':
        return {
          ...baseStyle,
          backgroundColor: '#1da1f2',
          color: 'white',
          alignSelf: 'flex-end',
          marginLeft: 'auto',
          borderBottomRightRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          animation: 'slideInRight 0.3s ease-out'
        };
      case 'assistant':
        return {
          ...baseStyle,
          backgroundColor: '#f7f9fa',
          color: '#14171a',
          alignSelf: 'flex-start',
          border: '1px solid #e1e8ed',
          borderBottomLeftRadius: '4px',
          textAlign: 'left',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          animation: 'slideInLeft 0.3s ease-out'
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
          margin: '2px 8px',
          animation: 'fadeIn 0.3s ease-out',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: '#f8d7da',
          color: '#721c24',
          alignSelf: 'center',
          border: '1px solid #f5c6cb',
          textAlign: 'left',
          maxWidth: '88%',
          fontSize: '11px',
          margin: '2px 8px',
          animation: 'shake 0.5s ease-out',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        };
      default:
        return baseStyle;
    }
  };

  const templateCommands = [
    {
      id: 'general_chat',
      emoji: '💬',
      title: 'General Chat',
      description: 'Explain how Artificial Intelligence works in simple terms',
      command: 'Explain how Artificial Intelligence works in simple terms'
    },
    {
      id: 'social_media',
      emoji: '🐦',
      title: 'Social Media Task',
      description: 'Search for AI Agents video on YouTube and play the first one',
      command: 'Search for AI Agents video on YouTube and play the first one'
    },
    {
      id: 'shopping_task',
      emoji: '🛒',
      title: 'Shopping Task',
      description: 'Find the Labubu Doll on Amazon and add to cart the first one',
      command: 'Find the Labubu Doll on Amazon and add to cart the first one'
    }
  ];

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

  const TemplateCommands = () => (
    <div style={{ 
      padding: '15px 15px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      alignItems: 'center'
    }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '16px'
      }}>
        <h4 style={{ 
          color: '#AADEFFFF', 
          marginBottom: '4px', 
          fontSize: '16px', 
          fontWeight: '700',
          margin: 0
        }}>
          🚀 Quick Start Templates
        </h4>
        <p style={{ 
          fontSize: '12px', 
          color: '#ABDFFFEA', 
          fontWeight: '600',
          margin: '4px 0 0 0'
        }}>
          Choose a template to get started quickly
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        maxWidth: '320px'
      }}>
        {templateCommands.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateClick?.(template.command)}
            style={{
              background: 'linear-gradient(135deg, #003A7CFF 0%, #004499FF 100%)',
              border: '1px solid rgba(255, 220, 220, 0.3)',
              borderRadius: '12px',
              padding: '8px 10px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              color: '#FFDCDCFF'
            }}
          >
            <div style={{
              fontSize: '20px',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {template.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '2px',
                color: '#FFDCDCFF'
              }}>
                {template.title}
              </div>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255, 220, 220, 0.8)',
                lineHeight: '1.3'
              }}>
                {template.description}
              </div>
            </div>
            <div style={{
              width: '2px',
              height: '30px',
              backgroundColor: 'rgba(255, 220, 220, 0.3)',
              margin: '0 0 0 0',
              flexShrink: 0
            }} />
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 220, 220, 0.6)',
              flexShrink: 0
            }}>
              Try ➤
            </div>
          </button>
        ))}
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: 'rgba(255, 220, 220, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 220, 220, 0.2)',
        textAlign: 'center',
        maxWidth: '280px'
      }}>
        <p style={{ 
          fontSize: '11px', 
          color: 'rgba(255, 220, 220, 0.8)',
          margin: 0,
          lineHeight: '1.4'
        }}>
          💡 <strong>Tip:</strong> You can also type your own custom commands or questions directly in the chat input below.
        </p>
      </div>
    </div>
  );

  const WelcomeMessage = () => (
    <div style={{ 
      textAlign: 'center', 
      color: '#657786', 
      marginTop: '10px',
      padding: '0 16px'
    }}>
      <h4 style={{ color: '#AADEFFFF', marginBottom: '-5px', fontSize: '15px', fontWeight: '750' }}>🤖 Welcome to Social Shopping Agent!</h4>
      <p style={{ marginBottom: '12px', fontSize: '13px', color: '#ABDFFFEA', fontWeight: '600' }}>Ask me to help you with tasks or start a conversation.</p>
      {/* <div style={{ 
        textAlign: 'left', 
        maxWidth: '280px', 
        margin: '0 auto',
        backgroundColor: '#FFDCDCE3',
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
      </div> */}
      {/* <p style={{ 
        fontSize: '13px', 
        color: '#FFDCDCFF', 
        marginTop: '15px',
        fontStyle: 'italic', 
        fontWeight: '600'
      }}>
        Configure your API keys in Settings ⚙️ to get started..
      </p> */}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      style={{ 
        flex: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#002550FF', 
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth'
      }}
    >
      {messages.length === 0 && (
        <>
          <div className="welcome-message">
            <WelcomeMessage />
          </div>
          <div className="template-commands">
            <TemplateCommands />
          </div>
        </>
      )}
      
      {messages.map((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
        const isFirstInGroup = !prevMessage || prevMessage.type !== message.type;
        const isLastInGroup = !nextMessage || nextMessage.type !== message.type;
        
        // Get base style
        const baseStyle = getMessageStyle(message.type);
        
        // Modify style for grouped messages
        const style = {
          ...baseStyle,
          marginBottom: isLastInGroup ? '8px' : '2px',
          marginTop: isFirstInGroup ? '8px' : '2px',
          borderRadius: (() => {
            if (message.type === 'user') {
              if (isFirstInGroup && isLastInGroup) return '14px 14px 4px 14px';
              if (isFirstInGroup) return '14px 14px 4px 4px';
              if (isLastInGroup) return '4px 14px 4px 14px';
              return '4px 14px 4px 4px';
            } else if (message.type === 'assistant') {
              if (isFirstInGroup && isLastInGroup) return '14px 14px 14px 4px';
              if (isFirstInGroup) return '14px 4px 4px 4px';
              if (isLastInGroup) return '4px 14px 14px 4px';
              return '4px 4px 4px 4px';
            }
            return baseStyle.borderRadius;
          })()
        };

        return (
          <div key={message.id || index} className={`message-item message-${message.type}`} style={style}>
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
                              message.type === 'error' ? (
                <ReactMarkdown 
                  components={markdownComponents}
                  remarkPlugins={[remarkGfm]}
                  style={{ textAlign: 'left' }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : message.content
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
            {/* Only show timestamp for last message in group */}
            {isLastInGroup && (
              <div style={{ 
                fontSize: '9px', 
                opacity: 0.6, 
                marginTop: '2px',
                textAlign: message.type === 'user' ? 'right' : 'left'
              }}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Typing Indicator */}
      {isTyping && (
        <div className="message-item message-assistant typing-indicator" style={getMessageStyle('assistant')}>
          <div style={{ textAlign: 'left', width: '100%' }}>
            <div className="typing-dots">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;