/* global chrome */

import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import TaskStatus from './TaskStatus';
import { useChat } from '../hooks/useChat';
import { useLocation } from 'react-router-dom';
import { useConfig } from '../hooks/useConfig';
import { 
  FaEdit, 
  // FaUser, 
  FaWifi,
  FaExclamationTriangle,
  FaHistory,
  FaCog
} from 'react-icons/fa';
// import RequestCounter from './RequestCounter';
// import SubscriptionChoice from './SubscriptionChoice';
import { useNavigate } from 'react-router-dom';

const ChatInterface = ({ user, subscription, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = useConfig();
  
  // Get chat ID from URL params
  const urlParams = new URLSearchParams(location.search);
  const historyId = urlParams.get('history');
  
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { messages, addMessage, clearMessages, loading, saveCurrentChat } = useChat(historyId);
  const [isExecuting, setIsExecuting] = useState(false);
  const [taskStatus, setTaskStatus] = useState(null);
  const portRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);

  // Add state for subscription choice modal
  // const [showSubscriptionChoice, setShowSubscriptionChoice] = useState(false);

  // Add state for message input
  const [messageInput, setMessageInput] = useState('');

  // Add state for typing indicator
  const [isTyping, setIsTyping] = useState(false);

  // Add function to handle template clicks
  const handleTemplateClick = (templateCommand) => {
    setMessageInput(templateCommand);
  };

  // Helper function to check if API keys are configured
  const hasApiKeysConfigured = () => {
    return !!(config.anthropicApiKey || config.openaiApiKey || config.geminiApiKey);
  };

  // Helper function to detect markdown content
  const hasMarkdownContent = (content) => {
    if (!content || typeof content !== 'string') return false;
    
    // Check for common markdown patterns
    const markdownPatterns = [
      /```[\s\S]*?```/,  // Code blocks
      /`[^`]+`/,         // Inline code
      /\*\*[^*]+\*\*/,   // Bold
      /\*[^*]+\*/,       // Italic
      /^#{1,3}\s+/m,     // Headers
      /^\s*[-*+]\s+/m,   // Bullet points
      /^\s*\d+\.\s+/m    // Numbered lists
    ];
    
    return markdownPatterns.some(pattern => pattern.test(content));
  };

  useEffect(() => {
    let mounted = true;

    const setupConnection = () => {
      if (!mounted || isConnectingRef.current) return;
      
      isConnectingRef.current = true;
      
      try {
        console.log('Setting up connection...');
        
        // Clear existing connection safely
        if (portRef.current) {
          try {
            portRef.current.onMessage.removeListener();
            portRef.current.onDisconnect.removeListener();
            portRef.current.disconnect();
          } catch (e) {
            // Ignore disconnect errors
          }
          portRef.current = null;
        }

        // Create new connection
        portRef.current = chrome.runtime.connect({ name: 'popup-connection' });
        
        portRef.current.onMessage.addListener((message) => {
          if (!mounted) return;

          console.log('Received message:', message.type);
          
          switch (message.type) {
            case 'connected':
              setConnectionStatus('connected');
              isConnectingRef.current = false;
              console.log('Connection established');
              
              // Request current status including execution state
              portRef.current.postMessage({ type: 'get_status' });
              break;

            case 'restore_message':
              // Validate restored message structure
              if (message.message && 
                  message.message.type && 
                  message.message.timestamp) {
                
                console.log('🔍 Restoring message:', message.message);
                
                // Ensure message has all required fields
                const restoredMessage = {
                  ...message.message,
                  id: message.message.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
                  type: message.message.type,
                  content: message.message.content || '',
                  timestamp: message.message.timestamp,
                  isMarkdown: message.message.isMarkdown || hasMarkdownContent(message.message.content)
                };
                
                // Special handling for task_complete messages that might have nested result structure
                if (message.message.type === 'task_complete' && message.message.result) {
                  const responseContent = message.message.result.response || message.message.result.message;
                  if (responseContent && responseContent !== restoredMessage.content) {
                    console.log('🔄 Extracting content from task_complete result:', responseContent);
                    restoredMessage.content = responseContent;
                    restoredMessage.isMarkdown = message.message.result.isMarkdown || hasMarkdownContent(responseContent);
                  }
                }
                
                // Final validation before adding
                if (!restoredMessage.content) {
                  console.warn('⚠️ Restored message has no content:', restoredMessage);
                  return;
                }
                
                console.log('✅ Restoring message:', restoredMessage);
                addMessage(restoredMessage);
              } else {
                console.warn('❌ Skipped invalid restored message:', message.message);
              }
              break;

            case 'status_response':
              // Handle execution state from background
              if (message.isExecuting) {
                setIsExecuting(true);
                setTaskStatus({ status: 'executing', message: 'Task in progress...' });
              }
              break;

            case 'execution_state':
              // Handle execution state sent on connection
              if (message.isExecuting) {
                setIsExecuting(true);
                setTaskStatus({ status: 'executing', message: 'Task in progress...' });
              }
              break;

            case 'config_updated':
              console.log('🔄 Config updated:', message.provider);
              break;

            case 'chat_cleared':
              console.log('Chat cleared by background, session:', message.sessionId);
              // Additional cleanup if needed
              setTaskStatus(null);
              setIsExecuting(false);
              break;

            case 'task_start':
              setIsExecuting(true);
              setTaskStatus({ status: 'starting', message: 'Task started...' });
              addMessage({
                type: 'system',
                content: '🚀 Task started...',
                timestamp: Date.now()
              });
              break;
              
            case 'status_update':
              setTaskStatus({ 
                status: 'executing', 
                message: message.message 
              });
              addMessage({
                type: 'system',
                content: `⚡ ${message.message}`,
                timestamp: Date.now()
              });
              break;
              
            case 'task_complete':
              setIsExecuting(false);
              setIsTyping(false); // Hide typing indicator
              setTaskStatus({ status: 'completed', message: 'Task completed!' });
              
              const responseContent = message.result.response || message.result.message;
              
              addMessage({
                type: 'assistant',
                content: responseContent,
                timestamp: Date.now(),
                isMarkdown: message.result.isMarkdown || hasMarkdownContent(responseContent), // Use flag from backend first
                actions: message.result.actions
              });
              break;
              
            case 'task_error':
              setIsExecuting(false);
              setIsTyping(false); // Hide typing indicator
              setTaskStatus({ status: 'error', message: message.error });
              addMessage({
                type: 'error',
                content: `❌ Error: ${message.error}`,
                timestamp: Date.now()
              });
              break;

            case 'task_cancelled':
              setIsExecuting(false);
              setIsTyping(false); // Hide typing indicator
              setTaskStatus({ status: 'cancelled', message: 'Task cancelled' });
              addMessage({
                type: 'system',
                content: '🛑 Task cancelled by user',
                timestamp: Date.now()
              });
              break;

            case 'error':
              setIsTyping(false); // Hide typing indicator
              addMessage({
                type: 'error',
                content: `❌ ${message.error}`,
                timestamp: Date.now()
              });
              break;
              
            default:
              console.warn('Unknown message type:', message.type);
          }
        });

        portRef.current.onDisconnect.addListener(() => {
          if (!mounted) return;

          console.log('Port disconnected');
          setConnectionStatus('disconnected');
          setIsExecuting(false);
          isConnectingRef.current = false;
          portRef.current = null;

          // Auto-reconnect after delay (only if not intentionally disconnected)
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mounted && !isConnectingRef.current) {
              console.log('Attempting to reconnect...');
              setupConnection();
            }
          }, 2000);
        });

        setConnectionStatus('connecting');

      } catch (error) {
        console.error('Connection setup failed:', error);
        setConnectionStatus('error');
        isConnectingRef.current = false;
        
        // Retry connection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mounted && !isConnectingRef.current) {
            setupConnection();
          }
        }, 3000);
      }
    };

    // Initial connection setup with small delay
    const initialTimeout = setTimeout(() => {
      if (mounted) {
        setupConnection();
      }
    }, 100);

    // Cleanup
    return () => {
      mounted = false;
      isConnectingRef.current = false;
      
      if (initialTimeout) {
        clearTimeout(initialTimeout);
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (portRef.current) {
        try {
          portRef.current.disconnect();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (message) => {
    // Check if API keys are configured
    if (!hasApiKeysConfigured()) {
      addMessage({
        type: 'system',
        content: '🔧 **API Configuration Required**\n\nTo use the AI Social Shopping Agent, you need to configure at least one API key.\n\n**What you need to do:**\n• Go to Settings and add your API keys\n• Choose from Anthropic (Claude), OpenAI, or Google Gemini\n• Save your configuration\n\n**Why this is needed:**\nThe agent uses AI models to understand and execute your requests. Without API keys, it cannot function.\n\nClick the Settings button (⚙️) in the header to configure your API keys.',
        timestamp: Date.now()
      });
      
      // Navigate to settings after a short delay
      setTimeout(() => {
        navigate('/settings');
      }, 2000);
      
      return;
    }

    // const shouldShowSubscription = !subscription.usingPersonalAPI && 
    //                                !subscription.hasPersonalKeys && 
    //                                subscription.remaining_requests <= 0;

    // if (shouldShowSubscription) {
    //   setShowSubscriptionChoice(true);
    //   return; 
    // }

    addMessage({
      type: 'user',
      content: message,
      timestamp: Date.now()
    });

    // Show typing indicator
    setIsTyping(true);

    // Fallback to background script (existing logic)
    if (portRef.current && connectionStatus === 'connected' && !isExecuting) {
      try {
        console.log('Sending message to background:', message);
        portRef.current.postMessage({
          type: 'new_task',
          task: message
        });
      } catch (error) {
        console.error('Error sending message:', error);
        setIsTyping(false); // Hide typing indicator on error
        addMessage({
          type: 'error',
          content: '❌ Failed to send message. Connection lost.',
          timestamp: Date.now()
        });
        setConnectionStatus('disconnected');
      }
    } else {
      setIsTyping(false); // Hide typing indicator if can't send
      const statusMessage = isExecuting 
        ? '⏳ Please wait for current task to complete...'
        : '❌ Not connected to background service. Please wait...';
        
      addMessage({
        type: 'error',
        content: statusMessage,
        timestamp: Date.now()
      });
    }
  };

  const handleStopExecution = () => {
    if (portRef.current && isExecuting) {
      try {
        console.log('Stopping task execution...');
        portRef.current.postMessage({
          type: 'cancel_task'
        });
      } catch (error) {
        console.error('Error stopping task:', error);
        setIsExecuting(false);
        setTaskStatus({ status: 'error', message: 'Failed to stop task' });
      }
    }
  };

  const handleNewChat = async () => {
    if (messages.length >= 2) {
      const userMessages = messages.filter(msg => msg.type === 'user' || msg.type === 'assistant');
      if (userMessages.length >= 2) {
        await saveCurrentChat();
      }
    }
    
    // Clear current chat state
    clearMessages();
    
    // Send new_chat message to background
    if (portRef.current) {
      portRef.current.postMessage({ type: 'new_chat' });
    }
    
    // Reset UI state
    setMessageInput('');
    setIsExecuting(false);
    setTaskStatus(null);
  };

  const getConnectionStatusColor = () => {
    if (!hasApiKeysConfigured()) {
      return '#ffad1f'; // Warning color for missing API keys
    }
    
    switch (connectionStatus) {
      case 'connected': return '#17bf63';
      case 'connecting': return '#ffad1f';
      case 'error': return '#e0245e';
      default: return '#657786';
    }
  };

  const getConnectionStatusText = () => {
    if (!hasApiKeysConfigured()) {
      return 'API Keys Required';
    }
    
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Disconnected';
    }
  };

  const getConnectionIcon = () => {
    if (!hasApiKeysConfigured()) {
      return <FaExclamationTriangle />; // Warning icon for missing API keys
    }
    
    switch (connectionStatus) {
      case 'connected': return <FaWifi />;
      case 'connecting': return <FaWifi style={{ opacity: 0.6 }} />;
      case 'error': return <FaExclamationTriangle />;
      default: return <FaWifi style={{ opacity: 0.3 }} />;
    }
  };

  // Add subscription choice modal as an overlay in the return statement
  return (
    <div className="chat-interface" style={{ 
      width: '100vw',
      height: '100vh',
      maxWidth: '500px',
      maxHeight: '600px',
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#002550FF',
      overflow: 'hidden',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      touchAction: 'manipulation'
    }}>
      {/* Background Animation */}
      <div className="background-animation">
        <div className="floating-orb chat-orb-1"></div>
        <div className="floating-orb chat-orb-2"></div>
        <div className="floating-orb chat-orb-3"></div>
      </div>

      {/* Fixed Header - Updated with consistent styling */}
      <div className="chat-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px 12px',
        borderBottom: '1px solid #8A8A8AFF',
        background: 'linear-gradient(0deg, #002550FF 0%, #764ba2 100%)',
        flexShrink: 0,
        minHeight: '50px',
        maxHeight: '75px',
        boxSizing: 'border-box'
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 className="chat-title" style={{ 
            margin: 0, 
            color: '#FFDCDCFF', 
            fontSize: '15px', 
            fontWeight: '750',
            lineHeight: '20px', 
            textAlign: 'left'
          }}>
            SOCIAL SHOPPING AGENT
          </h3>
          <div className="chat-status" style={{ 
            fontSize: '12px', 
            color: getConnectionStatusColor(),
            marginTop: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            lineHeight: '12px'
          }}>
            {getConnectionIcon()}
            <span>{getConnectionStatusText()}</span>
            {/* {isExecuting && <span>• Working...</span>} */}
            {/* <RequestCounter 
              subscriptionState={subscription} 
              onUpgradeClick={() => setShowSubscriptionChoice(true)}
            /> */}
          </div>
        </div>
        <div className="chat-header-buttons" style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button 
            onClick={handleNewChat}
            className="chat-header-button"
            style={{ 
              padding: '6px 8px', 
              backgroundColor: 'rgba(255, 220, 220, 0.2)',
              border: '1px solid rgba(255, 220, 220, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#FFDCDCFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="New Chat"
          >
            <FaEdit />
          </button>
          
          <button 
            onClick={() => navigate('/history')}
            className="chat-header-button"
            style={{ 
              padding: '6px 8px', 
              backgroundColor: 'rgba(255, 220, 220, 0.2)',
              border: '1px solid rgba(255, 220, 220, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#FFDCDCFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Chat History"
          >
            <FaHistory />
          </button>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => navigate('/settings')}
              className="chat-header-button"
              style={{ 
                padding: '6px 8px',
                backgroundColor: !hasApiKeysConfigured() 
                  ? 'rgba(255, 173, 31, 0.3)' // Warning background when API keys missing
                  : 'rgba(255, 220, 220, 0.2)',
                border: !hasApiKeysConfigured()
                  ? '1px solid rgba(255, 173, 31, 0.5)' // Warning border when API keys missing
                  : '1px solid rgba(255, 220, 220, 0.3)',
                color: !hasApiKeysConfigured()
                  ? '#ffad1f' // Warning color when API keys missing
                  : '#FFDCDCFF',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: !hasApiKeysConfigured() ? 'pulse 2s infinite' : 'none'
              }}
              title={!hasApiKeysConfigured() ? "Configure API Keys (Required)" : "Settings"}
            >
              <FaCog />
            </button>
          </div>
        </div>
      </div>

      {/* Task Status - Only if executing */}
      {isExecuting && taskStatus && <TaskStatus status={taskStatus} />}

      {/* Scrollable Messages Area */}
      <div className="messages-container" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0 
      }}>
        <MessageList 
          messages={messages} 
          onTemplateClick={handleTemplateClick}
          isTyping={isTyping}
        />
      </div>

      {/* Fixed Input at Bottom - Pass stop handler and execution state */}
      <div className="chat-input-container">
        <ChatInput 
          onSendMessage={handleSendMessage}
          onStopExecution={handleStopExecution}
          isExecuting={isExecuting}
          disabled={!hasApiKeysConfigured() || connectionStatus !== 'connected'}
          placeholder={
            !hasApiKeysConfigured() 
              ? "Configure API keys to start..."
              : connectionStatus === 'connected' 
                ? (isExecuting ? "Processing..." : "Ask me anything...")
                : "Connecting..."
          }
          value={messageInput}
          onChange={setMessageInput}
        />
      </div>
      
      {/* Add subscription choice as overlay */}
      {/* {showSubscriptionChoice && (
        <SubscriptionChoice 
          onSubscribe={() => {
            setShowSubscriptionChoice(false);
            navigate('/subscription');
          }}
          onUseAPI={() => {
            setShowSubscriptionChoice(false);
            navigate('/settings');
          }}
          onClose={() => setShowSubscriptionChoice(false)}
          onRefreshSubscription={() => subscription.loadSubscriptionData()}
          user={user}
        />
      )} */}
    </div>
  );
};

export default ChatInterface;