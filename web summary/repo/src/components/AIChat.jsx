import React from 'react';
import { motion } from 'framer-motion';

const AIChat = React.memo(({ 
  messages, 
  isLoading, 
  inputMessage, 
  onInputChange, 
  onKeyDown, 
  onSendMessage, 
  messagesEndRef,
  inputRef 
}) => (
  <motion.div 
    className="w-full h-full bg-black flex flex-col relative overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {/* Red gradient background */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-radial from-red-500/20 via-red-600/10 to-transparent"></div>
    </div>

    {/* Header */}
    <div className="bg-black/40 backdrop-blur-sm text-white p-4 shadow-2xl relative z-10 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          <h2 className="text-lg font-bold">AI Researcher</h2>
        </div>
      </div>
    </div>

    {/* Messages */}
    <div className="flex-1 p-4 overflow-y-auto relative z-10">
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 mt-8">
          <div className="text-4xl mb-4">🔬</div>
          <h3 className="text-lg font-semibold text-white mb-2">Welcome to AI Researcher!</h3>
          <p className="text-sm">Ask me anything - I'm here to help with research and information.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${
                message.sender === 'user' 
                  ? 'justify-end' 
                  : message.sender === 'system'
                  ? 'justify-center'
                  : 'justify-start'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                    : message.sender === 'system'
                    ? 'bg-blue-900/50 text-blue-200 border border-blue-500/30 text-center'
                    : message.isError
                    ? 'bg-red-900/50 text-red-200 border border-red-500/30'
                    : 'bg-gray-800/50 text-white border border-gray-700/50'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-gray-800/50 text-white border border-gray-700/50 p-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>

    {/* Input Form */}
    <div className="p-4 relative z-10 border-t border-white/10">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSendMessage(e);
        }} 
        className="flex space-x-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder="Ask me anything..."
          className="flex-1 bg-gray-800/50 text-white border border-gray-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 placeholder-gray-400"
          disabled={isLoading}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-500 text-white px-4 py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSendMessage(e);
          }}
        >
          <span className="text-lg">→</span>
        </button>
      </form>
    </div>
  </motion.div>
));

export default AIChat;
