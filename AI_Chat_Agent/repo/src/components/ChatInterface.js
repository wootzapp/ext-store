/* global chrome */

import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import TaskStatus from './TaskStatus';
import SettingsModal from './SettingsModal';
import { useChat } from '../hooks/useChat';

const ChatInterface = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { messages, addMessage, clearMessages } = useChat();
  const [isExecuting, setIsExecuting] = useState(false);
  const [taskStatus, setTaskStatus] = useState(null);
  const portRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);

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
              setTaskStatus({ status: 'error', message: message.error });
              addMessage({
                type: 'error',
                content: `❌ Error: ${message.error}`,
                timestamp: Date.now()
              });
              break;

            case 'task_cancelled':
              setIsExecuting(false);
              setTaskStatus({ status: 'cancelled', message: 'Task cancelled' });
              addMessage({
                type: 'system',
                content: '🛑 Task cancelled by user',
                timestamp: Date.now()
              });
              break;

            case 'error':
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
    // Add user message immediately
    addMessage({
      type: 'user',
      content: message,
      timestamp: Date.now()
    });

    // Send to background script if connected
    if (portRef.current && connectionStatus === 'connected' && !isExecuting) {
      try {
        console.log('Sending message to background:', message);
        portRef.current.postMessage({
          type: 'new_task',
          task: message
        });
      } catch (error) {
        console.error('Error sending message:', error);
        addMessage({
          type: 'error',
          content: '❌ Failed to send message. Connection lost.',
          timestamp: Date.now()
        });
        setConnectionStatus('disconnected');
      }
    } else {
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

  const handleNewChat = () => {
    // Clear local messages first
    clearMessages();
    setTaskStatus(null);
    setIsExecuting(false);
    
    // Send new_chat message to background to clear backend state
    if (portRef.current && connectionStatus === 'connected') {
      try {
        console.log('Sending new_chat message to background');
        portRef.current.postMessage({
          type: 'new_chat'
        });
      } catch (error) {
        console.error('Error sending new_chat message:', error);
      }
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#17bf63';
      case 'connecting': return '#ffad1f';
      case 'error': return '#e0245e';
      default: return '#657786';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Disconnected';
    }
  };

  // If settings is open, show full-page settings
  if (showSettings) {
    return <SettingsModal onClose={() => setShowSettings(false)} />;
  }

  return (
    <div className="chat-interface" style={{ 
      width: '100vw',
      height: '100vh',
      maxWidth: '400px',
      maxHeight: '600px',
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#ffffff',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      touchAction: 'manipulation'
    }}>
      {/* Fixed Header - Reduced height */}
      <div className="header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px 12px',
        borderBottom: '1px solid #8A8A8AFF',
        background: 'linear-gradient(to bottom, #B1B1B1FF, #CECECEFF)',
        flexShrink: 0,
        height: '48px',
        boxSizing: 'border-box'
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{ 
            margin: 0, 
            color: '#00559BFF', 
            fontSize: '16px', 
            fontWeight: '800',
            lineHeight: '20px', 
            textAlign: 'left'
          }}>
            AI CHAT AGENT
          </h3>
          <div style={{ 
            fontSize: '12px', 
            color: getConnectionStatusColor(),
            marginTop: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            lineHeight: '12px'
          }}>
            <span style={{ fontSize: '12px' }}>●</span>
            <span>{getConnectionStatusText()}</span>
            {isExecuting && <span>• Working...</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '7.5px', flexShrink: 0 }}>
          <button 
            onClick={handleNewChat}
            style={{ 
              padding: '4px 6px', 
              backgroundColor: '#F0F0F0FF',
              border: '1px solid #6B6B6BFF',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '20px',
              lineHeight: '18px',
            }}
            title="New Chat"
          >
            📝
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            style={{ 
              padding: '4px 6px',
              backgroundColor: '#F0F0F0FF',
              border: '1px solid #6B6B6BFF',
              color: '#000000FF',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '20px',
              lineHeight: '18px'
            }}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Task Status - Only if executing */}
      {isExecuting && taskStatus && <TaskStatus status={taskStatus} />}

      {/* Scrollable Messages Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0 
      }}>
        <MessageList messages={messages} />
      </div>

      {/* Fixed Input at Bottom - Pass stop handler and execution state */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        onStopExecution={handleStopExecution}
        isExecuting={isExecuting}
        disabled={connectionStatus !== 'connected'}
        placeholder={
          connectionStatus === 'connected' 
            ? (isExecuting ? "Processing..." : "Ask me anything...")
            : "Connecting..."
        }
      />
    </div>
  );
};

export default ChatInterface;