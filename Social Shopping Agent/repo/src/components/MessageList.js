import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageList = ({ messages, onTemplateClick, onResumeExecution, onApproveTask, onDeclineTask, isTyping, updateMessageState }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [animatedMessages, setAnimatedMessages] = useState(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prevMessageCountRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const handleApprove = (messageId) => {
    console.log('✅ Approve clicked for message:', messageId);
    // Update message state in storage immediately
    updateMessageState?.(messageId, { approved: true, declined: false });
    onApproveTask?.();
  };

  const handleDecline = (messageId) => {
    console.log('❌ Decline clicked for message:', messageId);
    // Update message state in storage immediately
    updateMessageState?.(messageId, { approved: false, declined: true });
    onDeclineTask?.();
  };

  const handleResume = (messageId) => {
    // Update message state in storage
    updateMessageState?.(messageId, { resumed: true });
    onResumeExecution?.();
  };

  useEffect(() => {
    if (messages.length === 0 && !isTyping) {
      scrollToTop();
    } else {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  // Track new messages for animation
  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      // On initial load, mark all existing messages as animated
      const initialMessageIds = new Set(messages.map((msg, index) => msg.id || `msg-${index}`));
      setAnimatedMessages(initialMessageIds);
      setIsInitialLoad(false);
      prevMessageCountRef.current = messages.length;
    } else if (!isInitialLoad && messages.length > prevMessageCountRef.current) {
      // For subsequent messages, animate only the newest ones
      const newMessageIds = new Set();
      
      messages.forEach((msg, index) => {
        const messageId = msg.id || `msg-${index}`;
        if (!animatedMessages.has(messageId)) {
          newMessageIds.add(messageId);
        }
      });
      
      if (newMessageIds.size > 0) {
        setAnimatedMessages(prev => new Set([...prev, ...newMessageIds]));
      }
      
      prevMessageCountRef.current = messages.length;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isInitialLoad]);

  const getTypingIndicatorStyle = () => {
    return {
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
      backgroundColor: 'transparent !important',
      color: '#14171a',
      alignSelf: 'flex-start',
      border: 'none !important',
      textAlign: 'left',
      boxShadow: 'none !important',
      animation: 'slideInFromLeft 0.3s ease-out',
      position: 'relative',
      zIndex: 1
    };
  };

  const getMessageStyle = (type, messageId) => {
    const isNewMessage = !animatedMessages.has(messageId);
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
      transform: 'translateY(0)'
    };

    // Add animation only for new messages (not in animatedMessages set yet)
    if (isNewMessage && !isInitialLoad) {
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
            animation: 'slideInFromRight 0.3s ease-out'
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
            animation: 'slideInFromLeft 0.3s ease-out'
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
            maxWidth: '80%', 
            margin: '2px 8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            animation: 'slideInFromLeft 0.3s ease-out'
          };
        case 'error':
          return {
            ...baseStyle,
            backgroundColor: '#f8d7da',
            color: '#721c24',
            alignSelf: 'center',
            border: '1px solid #f5c6cb',
            textAlign: 'left',
            maxWidth: '80%', 
            fontSize: '11px',
            margin: '2px 8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            animation: 'slideInFromLeft 0.3s ease-out'
          };
        case 'pause':
          return {
            ...baseStyle,
            backgroundColor: '#fff3cd',
            color: '#856404',
            alignSelf: 'center',
            border: '1px solid #ffeaa7',
            textAlign: 'center',
            maxWidth: '85%', 
            fontSize: '12px',
            margin: '4px 8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            animation: 'slideInFromLeft 0.3s ease-out'
          };
        case 'approval':
          return {
            ...baseStyle,
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            alignSelf: 'center',
            border: '1px solid #bbdefb',
            textAlign: 'center',
            maxWidth: '85%', 
            fontSize: '12px',
            margin: '4px 8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            animation: 'slideInFromLeft 0.3s ease-out'
          };
        default:
          return baseStyle;
      }
    } else {
      // No animation for existing messages or initial load
      switch (type) {
        case 'user':
          return {
            ...baseStyle,
            backgroundColor: '#1da1f2',
            color: 'white',
            alignSelf: 'flex-end',
            marginLeft: 'auto',
            borderBottomRightRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
            maxWidth: '80%', 
            margin: '2px 8px',
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
            maxWidth: '80%', 
            fontSize: '11px',
            margin: '2px 8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          };
        case 'pause':
          return {
            ...baseStyle,
            backgroundColor: '#fff3cd',
            color: '#856404',
            alignSelf: 'center',
            border: '1px solid #ffeaa7',
            textAlign: 'center',
            maxWidth: '85%', 
            fontSize: '12px',
            margin: '4px 8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          };
        case 'approval':
          return {
            ...baseStyle,
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            alignSelf: 'center',
            border: '1px solid #bbdefb',
            textAlign: 'center',
            maxWidth: '85%', 
            fontSize: '12px',
            margin: '4px 8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          };
        default:
          return baseStyle;
      }
    }
  };

  const templateCommands = [
    {
      id: 'general_chat',
      emoji: '🤖',
      title: 'AI Assistant',
      description: 'Ask me anything! I can explain concepts, help with research, or have a conversation',
      command: 'Explain how Artificial Intelligence works in simple terms'
    },
    {
      id: 'social_media',
      emoji: '📱',
      title: 'Social Media',
      description: 'Post content, manage accounts, or interact with social platforms',
      command: 'Post a tweet about the latest AI developments'
    },
    {
      id: 'shopping_task',
      emoji: '🛍️',
      title: 'Shopping Assistant',
      description: 'Find products, compare prices, add to cart, or complete purchases',
      command: 'Find the best wireless headphones on Amazon and add to cart'
    },
    {
      id: 'page_analysis',
      emoji: '🔍',
      title: 'Page Analysis',
      description: 'Analyze current webpage, extract information, or summarize content',
      command: 'Summarize the main points of this article and highlight key insights from the current page'
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
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'center',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      {/* Header Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2px'
      }}>
        <h2 style={{ 
          color: '#FFDCDCFF', 
          marginBottom: '2px', 
          fontSize: '18px', 
          fontWeight: '700',
          margin: '0 0 2px 0'
        }}>
          How can I help you today?
        </h2>
        <p style={{ 
          fontSize: '12px', 
          color: '#ABDFFFEA', 
          fontWeight: '400',
          margin: '0',
          lineHeight: '1.4'
        }}>
          Choose a template below or type your own request
        </p>
      </div>

      {/* Template Grid */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
        width: '100%'
      }}>
        {templateCommands.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateClick?.(template.command)}
            style={{
              background: 'rgba(255, 220, 220, 0.08)',
              border: '1px solid rgba(255, 220, 220, 0.15)',
              borderRadius: '12px',
              padding: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              width: '100%',
              color: '#FFDCDCFF',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Template Icon */}
            <div style={{
              fontSize: '18px',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: 'rgba(78, 205, 196, 0.1)',
              borderRadius: '10px'
            }}>
              {template.emoji}
            </div>
            
            {/* Template Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: '13px',
                fontWeight: '600',
                margin: '0 0 2px 0',
                color: '#FFDCDCFF'
              }}>
                {template.title}
              </h3>
              <p style={{
                fontSize: '11px',
                color: '#ABDFFFEA',
                lineHeight: '1.3',
                margin: 0
              }}>
                {template.description}
              </p>
            </div>
            
            {/* Try Arrow */}
            <div style={{
              fontSize: '12px',
              color: '#4ECDC4',
              flexShrink: 0
            }}>
              Try →
            </div>
          </button>
        ))}
      </div>

      {/* Help Section */}
      <div style={{
        marginTop: '4px',
        padding: '12px',
        backgroundColor: 'rgba(255, 220, 220, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 220, 220, 0.1)',
        textAlign: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ 
          fontSize: '11px', 
          color: '#ABDFFFEA',
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
      marginTop: '16px',
      padding: '0 16px'
    }}>
      <h3 style={{ 
        color: '#FFDCDCFF', 
        marginBottom: '6px', 
        fontSize: '16px', 
        fontWeight: '600' 
      }}>
        🤖 Welcome to Social Shopping Agent!
      </h3>
      <p style={{ 
        marginBottom: '16px', 
        fontSize: '12px', 
        color: '#ABDFFFEA', 
        fontWeight: '400',
        lineHeight: '1.4'
      }}>
        Your intelligent companion for web automation, shopping, and social media tasks.
      </p>
      
      {/* How to Use Button */}
      <button
        onClick={() => window.location.hash = '/how-to-use'}
        style={{
          background: 'rgba(78, 205, 196, 0.1)',
          border: '1px solid rgba(78, 205, 196, 0.3)',
          borderRadius: '8px',
          padding: '8px 16px',
          cursor: 'pointer',
          color: '#4ECDC4',
          fontSize: '12px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          margin: '0 auto',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}
      >
        📖 How to Use
      </button>
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
        scrollBehavior: 'smooth',
        position: 'relative'
      }}
    >
      {/* Background Animation - Floating Orbs */}
      <div
        className="background-animation"
        style={{
          position: "absolute",
          top: 0,           
          left: 0,          
          right: 0,         
          bottom: 0,        
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          className="message-orb-1"
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #FF6B6B, #FF8E8E)",
            filter: "blur(40px)",
            opacity: 0.2,
            top: "10%",
            left: "10%",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="message-orb-2"
          style={{
            position: "absolute",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #4ECDC4, #6EE7DF)",
            filter: "blur(40px)",
            opacity: 0.2,
            top: "60%",
            right: "15%",
            animation: "float 6s ease-in-out infinite 2s",
          }}
        />
      </div>
      {/* CSS Keyframes for animations */}
      <style>
        {`
          @keyframes slideInFromRight {
            0% {
              opacity: 0;
              transform: translateX(100%);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideInFromLeft {
            0% {
              opacity: 0;
              transform: translateX(-100%);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .message-item {
            animation-fill-mode: both;
          }
          
          /* Ensure animations don't conflict with existing ones */
          .message-item[style*="slideInFromRight"],
          .message-item[style*="slideInFromLeft"] {
            animation-fill-mode: both;
          }
          
          /* Ensure assistant messages always have proper background */
          .message-item.message-assistant {
            background-color: #f7f9fa !important;
            border: 1px solid #e1e8ed !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          }
          
          /* Ensure typing indicator is always transparent */
          .typing-indicator {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
        `}
      </style>

      {messages.length === 0 && (
        <>
          <div className="welcome-message" style={{ position: 'relative', zIndex: 1 }}>
            <WelcomeMessage />
          </div>
          <div className="template-commands" style={{ position: 'relative', zIndex: 1 }}>
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
        const baseStyle = getMessageStyle(message.type, message.id || `msg-${index}`);
        
        // Modify style for grouped messages
        const style = {
          ...baseStyle,
          marginBottom: isLastInGroup ? '8px' : '2px',
          marginTop: isFirstInGroup ? '8px' : '2px',
          position: 'relative',
          zIndex: 1,
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
          <div key={message.id || `msg-${index}`} className={`message-item message-${message.type}`} style={style}>
            {/* Special rendering for pause and approval messages */}
            {message.type === 'pause' || message.type === 'approval' ? (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ marginBottom: '12px' }}>
                  {message.pauseReason === 'signin' ? '🔐' : message.pauseReason === 'approval' ? '⏳' : '❓'} {message.content}
                </div>
                {message.pauseDescription && (
                  <div style={{ 
                    marginBottom: '12px', 
                    fontSize: '11px', 
                    color: message.type === 'approval' ? '#1565c0' : '#856404',
                    fontStyle: 'italic'
                  }}>
                    {message.pauseDescription}
                  </div>
                )}
                
                {message.type === 'approval' ? (
                  // Approval message rendering
                  (() => {
                    const messageId = message.id || `msg-${index}`;
                    
                    if (message.approved) {
                      return (
                        <div style={{
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          margin: '0 auto',
                          animation: 'fadeInScale 0.3s ease-out'
                        }}>
                          ✅ Approved
                        </div>
                      );
                    } else if (message.declined) {
                      return (
                        <div style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          margin: '0 auto',
                          animation: 'fadeInScale 0.3s ease-out'
                        }}>
                          ❌ Declined
                        </div>
                      );
                    } else {
                      return (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleDecline(messageId)}
                            style={{
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#da190b';
                              e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#f44336';
                              e.target.style.transform = 'scale(1)';
                            }}
                          >
                            ✗ Decline
                          </button>
                          <button
                            onClick={() => handleApprove(messageId)}
                            style={{
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#45a049';
                              e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#4CAF50';
                              e.target.style.transform = 'scale(1)';
                            }}
                          >
                            ✓ Approve
                          </button>
                        </div>
                      );
                    }
                  })()
                ) : (
                  // Pause message rendering (existing logic)
                  !message.resumed ? (
                    <button
                      onClick={() => handleResume(message.id || `msg-${index}`)}
                      style={{
                        backgroundColor: '#4ecdc4',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        margin: '0 auto'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#45b7d1';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#4ecdc4';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      ✓ Resume
                    </button>
                  ) : (
                    <div style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      margin: '0 auto',
                      animation: 'fadeInScale 0.3s ease-out'
                    }}>
                      ✅ Resumed
                    </div>
                  )
                )}
              </div>
            ) : (
              /* Render content with proper markdown support */
              <div style={{ textAlign: 'left', width: '100%' }}>
                {message.isMarkdown ? (
                  <ReactMarkdown 
                    components={markdownComponents}
                    remarkPlugins={[remarkGfm]}
                    style={{ textAlign: 'left' }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : message.type === 'error' ? (
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
            )}
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
        <div 
          className="typing-indicator" 
          style={getTypingIndicatorStyle()}
        >
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