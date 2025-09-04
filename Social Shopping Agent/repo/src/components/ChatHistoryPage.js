// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatHistory } from '../hooks/useChatHistory';
import { 
  FaHistory, 
  FaArrowLeft, 
  FaTrash, 
  FaClock,
  FaComment,
  FaTrashAlt
} from 'react-icons/fa';

const ChatHistoryPage = () => {
  const navigate = useNavigate();
  const { chatHistories, loading, deleteChatHistory, clearAllChatHistories } = useChatHistory();
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [swipedIds, setSwipedIds] = useState(new Set());

  // Sort histories by updatedAt (most recent first)
  const sortedHistories = [...chatHistories].sort((a, b) => b.updatedAt - a.updatedAt);

  const handleBack = () => {
    navigate('/chat');
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all chat history?')) {
      await clearAllChatHistories();
    }
  };

  const handleChatClick = (chatId) => {
    console.log('Opening chat history:', chatId);
    navigate(`/chat?history=${chatId}`);
  };

  const handleDelete = async (chatId, e) => {
    e.stopPropagation();
    setDeletingIds(prev => new Set([...prev, chatId]));
    
    setTimeout(async () => {
      await deleteChatHistory(chatId);
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });
    }, 300);
  };

  const handleSwipeDelete = async (chatId) => {
    setSwipedIds(prev => new Set([...prev, chatId]));
    
    setTimeout(async () => {
      await deleteChatHistory(chatId);
      setSwipedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });
    }, 300);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 2) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getMessageCount = (messages) => {
    return messages.filter(msg => msg.type === 'user' || msg.type === 'assistant').length;
  };

  const containerStyle = {
    width: '100%',
    height: '100%',
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
    touchAction: 'manipulation'
  };

  const headerStyle = {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255, 220, 220, 0.3)',
    background: 'linear-gradient(0deg, #002550FF 0%, #764ba2 100%)',
    flexShrink: 0,
    minHeight: '56px',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1
  };

  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    position: 'relative',
    zIndex: 1
  };

  return (
    <div className="chat-history-container" style={containerStyle}>
      {/* Background Animation */}
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
          className="chat-history-orb-1"
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
          className="chat-history-orb-2"
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
        <div
          className="chat-history-orb-3"
          style={{
            position: "absolute",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #45B7D1, #67C9E1)",
            filter: "blur(40px)",
            opacity: 0.2,
            bottom: "20%",
            left: "20%",
            animation: "float 6s ease-in-out infinite 4s",
          }}
        />
      </div>

      <style>
        {`
          @keyframes swipeLeft {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-100%); opacity: 0; }
          }
          
          .swipe-delete {
            animation: swipeLeft 0.3s ease-out forwards;
          }
          
          .chat-card {
            transition: transform 0.2s ease;
          }
          
          .chat-card:hover {
            transform: translateX(-2px);
          }
        `}
      </style>

      {/* Header */}
      <div className="chat-history-header" style={headerStyle}>
        <button 
          onClick={handleBack}
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
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
          }}
          title="Back"
        >
          <FaArrowLeft />
        </button>
        
        <div style={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
          <h3 className="chat-title" style={{ 
            margin: 0, 
            color: '#FFDCDCFF', 
            fontSize: '18px', 
            fontWeight: '700',
            lineHeight: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <FaHistory />
            RECENT CHATS
          </h3>
          <p className="chat-subtitle" style={{ 
            margin: 0, 
            color: 'rgba(255, 220, 220, 0.8)', 
            fontSize: '12px',
            lineHeight: '14px',
            marginTop: '2px'
          }}>
            {chatHistories.length} conversation{chatHistories.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button 
          onClick={handleClearAll}
          disabled={chatHistories.length === 0}
          className="chat-header-button"
          style={{ 
            padding: '6px 8px', 
            backgroundColor: chatHistories.length === 0 ? 'rgba(255, 220, 220, 0.1)' : 'rgba(224, 36, 94, 0.2)',
            border: '1px solid rgba(255, 220, 220, 0.3)',
            borderRadius: '8px',
            cursor: chatHistories.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            color: chatHistories.length === 0 ? 'rgba(255, 220, 220, 0.5)' : '#e0245e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
          }}
          title="Clear All"
        >
          <FaTrashAlt />
        </button>
      </div>

      {/* Content */}
      <div className="chat-history-content" style={contentStyle}>
        {loading ? (
          <div className="chat-history-loading" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: '200px',
            color: 'rgba(255, 220, 220, 0.8)'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '12px' 
            }}>
              <div style={{ transform: 'scale(0.7)' }}>
                <div className="profile-loader" />
              </div>
              <p style={{ 
                color: 'rgba(255, 220, 220, 0.7)', 
                margin: '0',
                fontSize: '13px'
              }}>
                Loading chat history...
              </p>
            </div>
          </div>
        ) : chatHistories.length === 0 ? (
          <div className="chat-history-empty" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: '300px',
            color: 'rgba(255, 220, 220, 0.8)',
            textAlign: 'center',
            padding: '0 32px',
            animation: 'fadeInScale 0.2s ease-out 0.1s both'
          }}>
            <FaComment className="empty-icon" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5, animation: 'pulse 3s ease-in-out infinite' }} />
            <h4 style={{ margin: '0 0 8px 0', color: '#FFDCDCFF' }}>No Chat History</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Start a conversation to see your chat history here
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedHistories.map((chat) => {
              const isDeleting = deletingIds.has(chat.id);
              const isSwiped = swipedIds.has(chat.id);
              
              return (
                <div
                  key={chat.id}
                  className={`chat-card ${isSwiped ? 'swipe-delete' : ''}`}
                  onClick={() => !isDeleting && !isSwiped && handleChatClick(chat.id)}
                  onTouchStart={(e) => {
                    e.currentTarget.touchStartX = e.touches[0].clientX;
                  }}
                  onTouchEnd={(e) => {
                    const touchEndX = e.changedTouches[0].clientX;
                    const diff = e.currentTarget.touchStartX - touchEndX;
                    if (diff > 100) { // Swipe left threshold
                      handleSwipeDelete(chat.id);
                    }
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 220, 220, 0.08)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(255, 220, 220, 0.2)',
                    cursor: 'pointer',
                    opacity: isDeleting ? 0.5 : 1,
                    transform: isDeleting ? 'translateX(-10px)' : 'translateX(0)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ 
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#FFDCDCFF',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {chat.title}
                      </h4>
                      
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '12px',
                        color: 'rgba(255, 220, 220, 0.7)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaClock style={{ fontSize: '10px' }} />
                          {formatDate(chat.updatedAt)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaComment style={{ fontSize: '10px' }} />
                          {getMessageCount(chat.messages)} messages
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        width: '1px',
                        height: '35px',
                        backgroundColor: 'rgba(255, 220, 220, 0.3)',
                        margin: '0 8px'
                      }}
                    />
                    <button
                      onClick={(e) => handleDelete(chat.id, e)}
                      disabled={isDeleting}
                      style={{
                        background: 'rgba(224, 36, 94, 0.1)',
                        border: '1px solid rgba(224, 36, 94, 0.3)',
                        color: isDeleting ? 'rgba(224, 36, 94, 0.5)' : '#e0245e',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        padding: '8px',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        transition: 'all 0.2s',
                        minWidth: '32px',
                        height: '32px',
                        backdropFilter: 'blur(5px)'
                      }}
                      title="Delete Chat"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistoryPage; 