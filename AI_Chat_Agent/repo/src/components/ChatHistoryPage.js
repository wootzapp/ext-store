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
    boxSizing: 'border-box'
  };

  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '0',
    WebkitOverflowScrolling: 'touch'
  };

  return (
    <div style={containerStyle}>
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
      <div style={headerStyle}>
        <button 
          onClick={handleBack}
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
          title="Back"
        >
          <FaArrowLeft />
        </button>
        
        <div style={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
          <h3 style={{ 
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
          <p style={{ 
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
            justifyContent: 'center'
          }}
          title="Clear All"
        >
          <FaTrashAlt />
        </button>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '200px',
            color: 'rgba(255, 220, 220, 0.8)'
          }}>
            Loading chat history...
          </div>
        ) : chatHistories.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: '300px',
            color: 'rgba(255, 220, 220, 0.8)',
            textAlign: 'center',
            padding: '0 32px'
          }}>
            <FaComment style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
            <h4 style={{ margin: '0 0 8px 0', color: '#FFDCDCFF' }}>No Chat History</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Start a conversation to see your chat history here
            </p>
          </div>
        ) : (
          <div style={{ padding: '8px' }}>
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
                    backgroundColor: '#003A7CFF',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '8px',
                    border: '1px solid rgba(255, 220, 220, 0.2)',
                    cursor: 'pointer',
                    opacity: isDeleting ? 0.5 : 1,
                    transform: isDeleting ? 'translateX(-10px)' : 'translateX(0)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                        width: '2px',
                        height: '35px',
                        backgroundColor: 'rgba(255, 220, 220, 0.4)',
                        margin: '0 6px'
                      }}
                    />
                    <button
                      onClick={(e) => handleDelete(chat.id, e)}
                      disabled={isDeleting}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isDeleting ? 'rgba(224, 36, 94, 0.5)' : '#e0245e',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        padding: '4px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'all 0.2s'
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