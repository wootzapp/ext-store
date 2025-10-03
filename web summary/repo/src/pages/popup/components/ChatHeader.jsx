import React from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaUser } from 'react-icons/fa';

const ChatHeader = ({ onNewChat, onOpenProfile, title = "Wootz AI", subtitle = "AI-powered chat and web analysis", userProfilePicUrl }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: '8px 16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      {/* Left side - Wootz AI Icon and Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <img 
            src="/icons/WootzAi.png" 
            alt="Wootz AI" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            margin: 0,
            lineHeight: '1.2'
          }}>
            {title}
          </h1>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: 0,
            lineHeight: '1.3'
          }}>
            {subtitle}
          </p>
        </div>
      </div>
      
      {/* Right side - New Chat and Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* New Chat Icon */}
        <button
          onClick={onNewChat}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title="New Chat"
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
            e.target.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6b7280';
          }}
        >
          <img 
            src="/icons/chatIcon.png" 
            alt="New Chat" 
            style={{
              width: '36px',
              height: '36px',
              objectFit: 'contain'
            }}
          />
        </button>

        {/* User Profile Picture */}
        <button
          onClick={onOpenProfile}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            overflow: 'hidden'
          }}
          title="Profile & Settings"
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          {userProfilePicUrl ? (
            <img 
              src={userProfilePicUrl} 
              alt="Profile" 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <FaUser size={14} />
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
