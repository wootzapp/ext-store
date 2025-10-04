import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFileAlt, FaCheckCircle, FaHistory } from 'react-icons/fa';
import { renderMarkdown } from '@/lib/markdownUtils';
import aiService from '@/services/ai';
import ChatHeader from '../components/ChatHeader';

const ChatInput = ({ 
  onSendMessage, 
  onStopExecution, 
  isExecuting, 
  disabled, 
  placeholder = "Ask me anything about web content...",
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
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120;
      const newHeight = Math.min(scrollHeight, maxHeight);
      textareaRef.current.style.height = newHeight + 'px';
      
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.overflowY = 'hidden';
      }
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
    } else if (e.key === 'Enter' && !e.shiftKey && !disabled && !isExecuting) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape' && isExecuting) {
      e.preventDefault();
      handleStop(e);
    }
  };

  const handleFocus = () => {
    // Auto-scroll to bottom when user starts typing
    setTimeout(() => {
      const messagesContainer = document.querySelector('[data-messages-container]');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  };

  return (
    <div className="chat-input-container" style={{ 
      padding: '8px 12px',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#ffffff',
      flexShrink: 0
    }}>
      <form onSubmit={isExecuting ? handleStop : handleSubmit} style={{ 
        display: 'flex',
        alignItems: 'flex-end',
        position: 'relative',
        maxWidth: '768px',
        margin: '0 auto'
      }}>
        <div style={{ 
          flex: 1, 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #d1d5db',
          padding: '0',
          minHeight: '44px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <textarea
            ref={textareaRef}
            value={currentValue}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              e.target.parentElement.style.borderColor = '#3b82f6';
              e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              handleFocus();
            }}
            onBlur={(e) => {
              e.target.parentElement.style.borderColor = '#d1d5db';
              e.target.parentElement.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="chat-input"
            style={{
              width: '100%',
              minHeight: '20px',
              maxHeight: '120px',
              padding: '10px 50px 10px 12px',
              border: 'none',
              borderRadius: '12px',
              resize: 'none',
              fontSize: '14px',
              lineHeight: '20px',
              fontFamily: 'inherit',
              outline: 'none',
              backgroundColor: 'transparent',
              color: disabled ? '#9ca3af' : '#111827',
              boxSizing: 'border-box',
              overflow: 'auto'
            }}
            rows={1}
          />
          
          {/* Send/Stop Button */}
          {isExecuting ? (
            <button
              type="button"
              onClick={handleStop}
              className="chat-stop-button"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
              }}
              title="Stop"
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
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                backgroundColor: (!currentValue.trim() || disabled) ? '#d1d5db' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (!currentValue.trim() || disabled) ? 'default' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: (!currentValue.trim() || disabled) ? 'none' : '0 1px 3px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease'
              }}
              title="Send"
            >
              ➤
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const MessageList = ({ messages, isTyping }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  useEffect(() => {
    if (isScrolledToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isScrolledToBottom]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsScrolledToBottom(isAtBottom);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsScrolledToBottom(true);
  };

  const getMessageStyle = (type) => {
    const baseStyle = {
      margin: '8px 16px',
      padding: '12px 16px',
      borderRadius: '12px',
      maxWidth: '85%',
      wordWrap: 'break-word',
      fontSize: '14px',
      lineHeight: '1.5',
      animation: 'slideInUp 0.3s ease-out'
    };

    if (type === 'user') {
      return {
        ...baseStyle,
        backgroundColor: '#3b82f6',
        color: 'white',
        alignSelf: 'flex-end',
        marginLeft: 'auto'
      };
    } else if (type === 'assistant') {
      return {
        ...baseStyle,
        backgroundColor: '#f3f4f6',
        color: '#111827',
        alignSelf: 'flex-start',
        border: '1px solid #e5e7eb'
      };
    } else if (type === 'system') {
      return {
        ...baseStyle,
        backgroundColor: '#fef3c7',
        color: '#92400e',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: '13px',
        border: '1px solid #fbbf24'
      };
    }
    return baseStyle;
  };

  return (
    <div 
      ref={messagesContainerRef}
      onScroll={handleScroll}
      data-messages-container
      style={{
        flex: 1,
        overflowY: 'auto', 
        padding: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        scrollBehavior: 'smooth'
      }}
    >
      {messages.length === 0 && !isTyping && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6b7280'
          }}
        >
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}
          >
            Welcome to Wootz AI
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ fontSize: '14px', lineHeight: '1.5' }}
          >
            I can help you with AI research, page analysis and summarization, and facts checking.
          </motion.p>
        </motion.div>
      )}

      {messages.map((message, index) => (
        <motion.div
          key={message.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={getMessageStyle(message.type)}
        >
          {message.type === 'assistant' && message.content ? (
            (() => {
              const rendered = renderMarkdown(message.content);
              const isString = typeof rendered === 'string';
              return isString ? (
                <div dangerouslySetInnerHTML={{ __html: rendered }} />
              ) : (
                <div className="prose max-w-none prose-sm sm:prose-base prose-pre:rounded-lg prose-pre:shadow-sm">
                  {rendered}
                </div>
              );
            })()
          ) : (
            <div>{message.content}</div>
          )}
        </motion.div>
      ))}

      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={getMessageStyle('assistant')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#6b7280',
                borderRadius: '50%',
                animation: 'typingBounce 1.4s infinite ease-in-out'
              }} />
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#6b7280',
                borderRadius: '50%',
                animation: 'typingBounce 1.4s infinite ease-in-out 0.2s'
              }} />
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#6b7280',
                borderRadius: '50%',
                animation: 'typingBounce 1.4s infinite ease-in-out 0.4s'
              }} />
            </div>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Thinking...</span>
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
      
      {/* Scroll to bottom button */}
      {!isScrolledToBottom && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToBottom}
          style={{
            position: 'absolute',
            bottom: '80px', // Position above the chat input field
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            fontSize: '16px',
            zIndex: 10
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ↓
        </motion.button>
      )}
    </div>
  );
};

const SuggestionButtons = ({ onSuggestionClick, disabled, isNewTabPage, isValidWebPage }) => {
  const allSuggestions = [
    {
      id: 'research',
      icon: <FaSearch />,
      title: 'AI Deep Research',
      description: 'Comprehensive research on any topic',
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    {
      id: 'analysis',
      icon: <FaFileAlt />,
      title: 'Page Analysis & Summarization',
      description: 'Analyze and summarize current webpage content',
      color: '#10b981',
      bgColor: '#ecfdf5'
    },
    {
      id: 'factcheck',
      icon: <FaCheckCircle />,
      title: 'Facts Checker',
      description: 'Verify claims against factual information on the webpage',
      color: '#f59e0b',
      bgColor: '#fffbeb'
    }
  ];

  // Filter suggestions based on page validity
  let suggestions;
  if (isNewTabPage) {
    // Only show research for new tab pages
    suggestions = allSuggestions.filter(s => s.id === 'research');
  } else if (!isValidWebPage) {
    // Only show research for invalid web pages (chrome://, extensions, etc.)
    suggestions = allSuggestions.filter(s => s.id === 'research');
  } else {
    // Show all suggestions for valid web pages
    suggestions = allSuggestions;
  }

  return (
    <div style={{
      padding: '12px 16px',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
      flexShrink: 0
    }}>
      <div style={{
        maxWidth: '768px',
        margin: '0 auto'
      }}>
        <p style={{
          fontSize: '13px',
          color: '#6b7280',
          marginBottom: '12px',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          Choose a feature to get started:
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '8px'
        }}>
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion.id}
              onClick={() => onSuggestionClick(suggestion.id)}
              disabled={disabled}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                backgroundColor: suggestion.bgColor,
                border: `1px solid ${suggestion.color}30`,
                borderRadius: '8px',
                cursor: disabled ? 'default' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: disabled ? 0.6 : 1,
                fontSize: '13px',
                fontWeight: '500',
                color: suggestion.color,
                textAlign: 'left',
                minHeight: '48px',
                justifyContent: 'flex-start',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <motion.span 
                style={{ fontSize: '16px', flexShrink: 0 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                {suggestion.icon}
              </motion.span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '1px', lineHeight: '1.2' }}>
                  {suggestion.title}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.8, lineHeight: '1.3' }}>
                  {suggestion.description}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChatInterface = ({ 
  onOpenProfile,
  onOpenPlans,
  currentPageUrl,
  onBack,
  onNewChat,
  userProfilePicUrl
}) => {
  const [messages, setMessages] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [activeMode, setActiveMode] = useState(null);
  const [isNewTabPage, setIsNewTabPage] = useState(false); // 'research', 'analysis', 'factcheck', or null for normal chat
  const [conversationHistory, setConversationHistory] = useState([]); // Store conversation history separately
  const [isValidWebPage, setIsValidWebPage] = useState(false); // Whether current page is valid for analysis
  const [screenshotData, setScreenshotData] = useState(null); // Store screenshot data
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false); // Screenshot capture state
  const [autoScreenshotEnabled, setAutoScreenshotEnabled] = useState(true); // Auto-capture screenshots

  // Function to get current page URL
  const getCurrentPageUrl = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab?.url || '';
    } catch (error) {
      console.error('Error getting current page URL:', error);
      return '';
    }
  };

  // Handle screenshot completion (for legacy compatibility)
  const handleScreenshotComplete = (result) => {
    console.log('📸 Screenshot Result:', result);
    setIsCapturingScreenshot(false);
    
    if (result && result.success && result.dataUrl) {
      setScreenshotData(result.dataUrl);
      console.log('📸 Screenshot captured successfully:', {
        dataUrlLength: result.dataUrl.length,
        estimatedSize: Math.round(result.dataUrl.length * 0.75 / 1024) + 'KB'
      });
      
      // Auto-clear screenshot after a delay to allow AI processing
      setTimeout(() => {
        setScreenshotData(null);
        console.log('📸 Screenshot cleared after processing');
      }, 5000);
    } else {
      console.error('📸 Screenshot capture failed:', result?.message || 'Unknown error');
    }
  };

  // Clear screenshot data
  const clearScreenshot = () => {
    setScreenshotData(null);
  };

  // Function to get current page state using chrome.wootz API
  const getCurrentPageState = async () => {
    try {
      return new Promise((resolve) => {
        chrome.wootz.getPageState({
          debugMode: false,
          includeHidden: true
        }, (result) => {
          if (result.success) {
            console.log('📄 Page State Retrieved:', result.pageState);
            resolve(result.pageState);
          } else {
            console.error('Failed to get page state:', result.error);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Error getting page state:', error);
      return null;
    }
  };

  // Function to check if current page is valid for analysis
  const checkIfValidWebPage = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab?.url || '';
      
      console.log('🔍 Checking page validity for URL:', url);
      
      // Check if URL is invalid for analysis
      const invalidPatterns = [
        'chrome://',           // Chrome internal pages
        'wootzapp://',         // Internal Wootzapp URLs
        'chrome-search://',    // Chrome search pages
        'chrome-devtools://',  // DevTools
        'chrome-extension://', // Extensions
        'newtab',              // New tab pages
        'new-tab-page',        // New tab pages
      ];
      
      // Check if URL matches any invalid patterns
      const isInvalid = invalidPatterns.some(pattern => 
        url.toLowerCase().includes(pattern.toLowerCase())
      );
      
      // Also check for empty or undefined URLs
      const isEmpty = !url || url.trim() === '';
      
      // Check if it's a new tab page specifically
      const isNewTab = url === 'chrome://newtab/' || 
                      url.startsWith('chrome://newtab/') ||
                      url === 'chrome-search://local-ntp/local-ntp.html' ||
                      url.includes('newtab') ||
                      url.includes('new-tab');
      
      const isValid = !isInvalid && !isEmpty && !isNewTab;
      
      console.log('🔍 Page validity check:', { 
        url, 
        isInvalid, 
        isEmpty, 
        isNewTab, 
        isValid 
      });
      
      setIsValidWebPage(isValid);
      return isValid;
      
    } catch (error) {
      console.error('Error checking page validity:', error);
      setIsValidWebPage(false);
      return false;
    }
  };

  // Function to manage conversation history with proper trimming and limits
  const addToConversationHistory = (message, type) => {
    const trimmedContent = message.content.length > 200 
      ? message.content.substring(0, 200) + '...' 
      : message.content;
    
    const historyEntry = {
      type: type,
      content: trimmedContent,
      timestamp: message.timestamp
    };
    
    console.log('💾 Adding to conversation history:', { type, originalLength: message.content.length, trimmedLength: trimmedContent.length });
    
    setConversationHistory(prev => {
      const updated = [...prev, historyEntry];
      const limited = updated.slice(-4); // Keep only last 4 messages (2 user + 2 assistant pairs)
      console.log('💾 Conversation history updated:', { totalEntries: updated.length, keptEntries: limited.length });
      return limited;
    });
  };

  // Function to get conversation history for AI service
  const getConversationHistoryForAI = () => {
    return conversationHistory.map(msg => ({
      type: msg.type,
      content: msg.content
    }));
  };

  // Check if current page is new tab page and valid for analysis
  useEffect(() => {
    const checkPageStatus = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
          const isNewTab = tab.url === 'chrome://newtab/' || tab.url.startsWith('chrome://newtab/');
          setIsNewTabPage(isNewTab);
          
          // Check if page is valid for analysis
          await checkIfValidWebPage();
        }
      } catch (error) {
        console.error('Error checking page status:', error);
        setIsNewTabPage(false);
        setIsValidWebPage(false);
      }
    };
    checkPageStatus();

    // Listen for tab updates to recheck page validity
    const handleTabUpdate = (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.active) {
        console.log('🔄 Tab updated, rechecking page validity');
        checkPageStatus();
      }
    };

    // Listen for tab activation to recheck page validity
    const handleTabActivated = (activeInfo) => {
      console.log('🔄 Tab activated, rechecking page validity');
      checkPageStatus();
    };

    // Add listeners
    chrome.tabs.onUpdated.addListener(handleTabUpdate);
    chrome.tabs.onActivated.addListener(handleTabActivated);
    
    // Add screenshot listener
    chrome.wootz.onScreenshotComplete.addListener(handleScreenshotComplete);

    // Cleanup listeners
    return () => {
      chrome.tabs.onUpdated.removeListener(handleTabUpdate);
      chrome.tabs.onActivated.removeListener(handleTabActivated);
      chrome.wootz.onScreenshotComplete.removeListener(handleScreenshotComplete);
    };
  }, []);

  // New chat functionality
  const handleNewChat = () => {
    console.log('🔄 Starting new chat - clearing conversation history');
    setMessages([]);
    setMessageInput('');
    setActiveMode(null);
    setIsExecuting(false);
    setIsTyping(false);
    setConversationHistory([]); // Clear conversation history on new chat
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    onNewChat?.();
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    // Update messages state FIRST
    setMessages(prev => [...prev, userMessage]);
    
    // Add user message to conversation history AFTER adding to messages
    addToConversationHistory(userMessage, 'user');
    setMessageInput('');
    setIsExecuting(true);
    setIsTyping(true);

    // Determine the type of request based on message content or context FIRST
    let requestType = 'chat';
    let payload = { message };

    // Handle based on active mode
    if (activeMode === 'research') {
      // Deep research mode - user entered topic
      requestType = 'research';
      payload = { topic: message, depth: 'comprehensive' };
      setActiveMode(null); // Reset to normal chat after research
    } else if (activeMode === 'analysis') {
      // This shouldn't happen as analysis is immediate
      requestType = 'pageAnalysis';
      const currentUrl = await getCurrentPageUrl();
      payload = { url: currentUrl };
      setActiveMode(null);
    } else if (activeMode === 'factcheck') {
      // This shouldn't happen as fact check is immediate
      requestType = 'factCheck';
      const currentUrl = await getCurrentPageUrl();
      payload = { url: currentUrl };
      setActiveMode(null);
    } else {
      // Normal chat mode - no active mode
      requestType = 'chat';
      payload = { message };
    }

    // Auto-capture screenshot if enabled and for specific modes
    let capturedScreenshotData = null;
    if (autoScreenshotEnabled && (requestType === 'pageAnalysis' || requestType === 'factCheck' || requestType === 'chat')) {
      console.log('📸 Auto-capturing screenshot for AI analysis...');
      
      // Capture screenshot and wait for completion
      capturedScreenshotData = await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('📸 Screenshot capture timeout');
          resolve(null);
        }, 5000); // 5 second timeout
        
        const handleScreenshotComplete = (result) => {
          clearTimeout(timeout);
          chrome.wootz.onScreenshotComplete.removeListener(handleScreenshotComplete);
          
          if (result && result.success && result.dataUrl) {
            console.log('📸 Screenshot captured successfully:', {
              dataUrlLength: result.dataUrl.length,
              estimatedSize: Math.round(result.dataUrl.length * 0.75 / 1024) + 'KB'
            });
            resolve(result.dataUrl);
          } else {
            console.error('📸 Screenshot capture failed:', result?.message || 'Unknown error');
            resolve(null);
          }
        };
        
        chrome.wootz.onScreenshotComplete.addListener(handleScreenshotComplete);
        chrome.wootz.captureScreenshot();
      });
    }

    try {
      // Create abort controller for this request
      const controller = new AbortController();
      setAbortController(controller);

      console.log('🔍 Debug - Request Type:', requestType, 'Payload:', payload);
      console.log('🔍 Debug - Message content:', message);
      console.log('🔍 Debug - Active mode:', activeMode);

      // Stream the response
      let assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Validate screenshot data if available
      let validatedScreenshotData = null;
      if (capturedScreenshotData) {
        try {
          // Check if screenshot data is valid
          if (capturedScreenshotData.startsWith('data:image/') && capturedScreenshotData.includes('base64,')) {
            const base64Data = capturedScreenshotData.split(',')[1];
            if (base64Data && base64Data.length > 0) {
              validatedScreenshotData = capturedScreenshotData;
              console.log('📸 Valid screenshot data available:', {
                dataUrlLength: capturedScreenshotData.length,
                base64Length: base64Data.length,
                estimatedSize: Math.round(base64Data.length * 0.75 / 1024) + 'KB'
              });
            } else {
              console.warn('📸 Invalid screenshot data - empty base64 content');
            }
          } else {
            console.warn('📸 Invalid screenshot data format - not a valid data URL');
          }
        } catch (error) {
          console.error('📸 Error validating screenshot data:', error);
        }
      }

      console.log('🚀 Calling AI service with:', { 
        kind: requestType, 
        payload,
        hasScreenshot: !!validatedScreenshotData
      });
      
      // Get conversation history for AI service
      const historyForAI = getConversationHistoryForAI();
      
      // Get current page URL for context
      const currentPageUrl = await getCurrentPageUrl();
      
      console.log('📚 Conversation History:', historyForAI);
      console.log('📚 History Length:', historyForAI.length);
      console.log('🌐 Current Page URL:', currentPageUrl);
      
      await aiService.stream({
        kind: requestType,
        payload,
        signal: controller.signal,
        conversationHistory: historyForAI,
        currentUrl: currentPageUrl,
        screenshotData: validatedScreenshotData,
        onDelta: (delta) => {
          console.log('📝 Received delta:', delta);
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.type === 'assistant') {
              // Ensure delta is a string
              const deltaStr = typeof delta === 'string' ? delta : String(delta);
              lastMessage.content += deltaStr;
            }
            return newMessages;
          });
        }
      });

      // Add assistant response to conversation history after completion
      setTimeout(() => {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.type === 'assistant' && lastMessage.content) {
            addToConversationHistory(lastMessage, 'assistant');
          }
          return prev;
        });
      }, 100); // Small delay to ensure message is fully updated

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sending message:', error);
        
        // More specific error messages
        let errorContent = 'Sorry, I encountered an error. Please try again.';
        
        if (error.message?.includes('API key')) {
          errorContent = 'API key not configured. Please check your settings.';
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          errorContent = 'Network error. Please check your internet connection.';
        } else if (error.message?.includes('authentication') || error.message?.includes('auth')) {
          errorContent = 'Authentication error. Please sign in again.';
        } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
          errorContent = 'Usage limit reached. Please check your quota or upgrade your plan.';
        }
        
        const errorMessage = {
          id: Date.now() + 1,
          type: 'system',
          content: errorContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsExecuting(false);
      setIsTyping(false);
      setAbortController(null);
    }
  };

  const handleStopExecution = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsExecuting(false);
    setIsTyping(false);
  };

  const handleSuggestionClick = async (suggestionId) => {
    if (isExecuting) return;

    switch (suggestionId) {
      case 'research':
        // Activate research mode - user will type topic next
        setActiveMode('research');
        const researchMessage = {
          id: Date.now(),
          type: 'system',
          content: '🔍 **AI Deep Research Mode Activated**\n\nPlease enter the topic you\'d like me to research comprehensively. I\'ll provide detailed analysis with credible sources and expert insights.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, researchMessage]);
        break;

      case 'analysis':
        // Immediate page analysis
        const currentUrl = await getCurrentPageUrl();
        if (currentUrl) {
          // Add user message
          const userMessage = {
            id: Date.now(),
            type: 'user',
            content: 'Analyze this webpage and provide a comprehensive summary with key insights',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, userMessage]);
          
          // Create assistant message
          const assistantMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: '',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
          
          // Start analysis
          setIsExecuting(true);
          setIsTyping(true);
          
          const controller = new AbortController();
          setAbortController(controller);
          
          // Capture screenshot for page analysis
          let capturedScreenshotData = null;
          if (autoScreenshotEnabled) {
            console.log('📸 Auto-capturing screenshot for page analysis...');
            
            capturedScreenshotData = await new Promise((resolve) => {
              const timeout = setTimeout(() => {
                console.warn('📸 Screenshot capture timeout');
                resolve(null);
              }, 5000);
              
              const handleScreenshotComplete = (result) => {
                clearTimeout(timeout);
                chrome.wootz.onScreenshotComplete.removeListener(handleScreenshotComplete);
                
                if (result && result.success && result.dataUrl) {
                  console.log('📸 Screenshot captured successfully for analysis:', {
                    dataUrlLength: result.dataUrl.length,
                    estimatedSize: Math.round(result.dataUrl.length * 0.75 / 1024) + 'KB'
                  });
                  resolve(result.dataUrl);
                } else {
                  console.error('📸 Screenshot capture failed:', result?.message || 'Unknown error');
                  resolve(null);
                }
              };
              
              chrome.wootz.onScreenshotComplete.addListener(handleScreenshotComplete);
              chrome.wootz.captureScreenshot();
            });
          }
          
          try {
            await aiService.stream({
              kind: 'pageAnalysis',
              payload: { url: currentUrl },
              signal: controller.signal,
              screenshotData: capturedScreenshotData,
              onDelta: (delta) => {
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.type === 'assistant') {
                    const deltaStr = typeof delta === 'string' ? delta : String(delta);
                    lastMessage.content += deltaStr;
                  }
                  return newMessages;
                });
              }
            });
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.error('Error in page analysis:', error);
              const errorMessage = {
                id: Date.now() + 2,
                type: 'system',
                content: 'Sorry, I encountered an error while analyzing the webpage. Please try again.',
                timestamp: new Date()
              };
              setMessages(prev => [...prev, errorMessage]);
            }
          } finally {
            setIsExecuting(false);
            setIsTyping(false);
            setAbortController(null);
          }
        } else {
          const analysisMessage = {
            id: Date.now(),
            type: 'system',
            content: '📄 **Page Analysis**\n\nPlease navigate to a webpage you\'d like me to analyze, then I\'ll provide a detailed summary of its content.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, analysisMessage]);
        }
        break;

      case 'factcheck':
        // Immediate fact check
        const factCheckUrl = await getCurrentPageUrl();
        if (factCheckUrl) {
          // Add user message
          const userMessage = {
            id: Date.now(),
            type: 'user',
            content: 'Fact-check the claims made on this webpage and verify their accuracy',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, userMessage]);
          
          // Create assistant message
          const assistantMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: '',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
          
          // Start fact check
          setIsExecuting(true);
          setIsTyping(true);
          
          const controller = new AbortController();
          setAbortController(controller);
          
          // Capture screenshot for fact checking
          let capturedScreenshotData = null;
          if (autoScreenshotEnabled) {
            console.log('📸 Auto-capturing screenshot for fact checking...');
            
            capturedScreenshotData = await new Promise((resolve) => {
              const timeout = setTimeout(() => {
                console.warn('📸 Screenshot capture timeout');
                resolve(null);
              }, 5000);
              
              const handleScreenshotComplete = (result) => {
                clearTimeout(timeout);
                chrome.wootz.onScreenshotComplete.removeListener(handleScreenshotComplete);
                
                if (result && result.success && result.dataUrl) {
                  console.log('📸 Screenshot captured successfully for fact check:', {
                    dataUrlLength: result.dataUrl.length,
                    estimatedSize: Math.round(result.dataUrl.length * 0.75 / 1024) + 'KB'
                  });
                  resolve(result.dataUrl);
                } else {
                  console.error('📸 Screenshot capture failed:', result?.message || 'Unknown error');
                  resolve(null);
                }
              };
              
              chrome.wootz.onScreenshotComplete.addListener(handleScreenshotComplete);
              chrome.wootz.captureScreenshot();
            });
          }
          
          try {
            await aiService.stream({
              kind: 'factCheck',
              payload: { url: factCheckUrl },
              signal: controller.signal,
              screenshotData: capturedScreenshotData,
              onDelta: (delta) => {
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.type === 'assistant') {
                    const deltaStr = typeof delta === 'string' ? delta : String(delta);
                    lastMessage.content += deltaStr;
                  }
                  return newMessages;
                });
              }
            });
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.error('Error in fact check:', error);
              const errorMessage = {
                id: Date.now() + 2,
                type: 'system',
                content: 'Sorry, I encountered an error while fact-checking the webpage. Please try again.',
                timestamp: new Date()
              };
              setMessages(prev => [...prev, errorMessage]);
            }
          } finally {
            setIsExecuting(false);
            setIsTyping(false);
            setAbortController(null);
          }
        } else {
          const factCheckMessage = {
            id: Date.now(),
            type: 'system',
            content: '✅ **Fact Checker**\n\nPlease navigate to a webpage with claims you\'d like me to fact-check, then I\'ll verify their accuracy against trusted sources.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, factCheckMessage]);
        }
        break;

      default:
        return;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#ffffff',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <ChatHeader 
        onOpenProfile={onOpenProfile}
        onNewChat={handleNewChat}
        title="Wootz AI"
        subtitle="AI-powered chat and web analysis"
        userProfilePicUrl={userProfilePicUrl}
      />

      {/* Messages */}
      <MessageList messages={messages} isTyping={isTyping} />

      {/* Suggestion Buttons */}
      {messages.length === 0 && !isTyping && (
        <SuggestionButtons 
          onSuggestionClick={handleSuggestionClick} 
          disabled={isExecuting}
          isNewTabPage={isNewTabPage}
          isValidWebPage={isValidWebPage}
        />
      )}

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onStopExecution={handleStopExecution}
        isExecuting={isExecuting}
        disabled={false}
        placeholder={
          activeMode === 'research' 
            ? "Enter the topic you'd like me to research..." 
            : "Ask me anything about web content..."
        }
        value={messageInput}
        onChange={setMessageInput}
      />
    </div>
  );
};

export default ChatInterface;
