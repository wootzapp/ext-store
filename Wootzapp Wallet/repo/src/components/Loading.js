import React from 'react';
import wootzIcon from '../assets/wootz.png';

const Loading = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <img
                src={wootzIcon}
                alt="Loading..."
                className="w-24 h-24 ml-3"
            />
            <p className="mt-4 text-gray-600 text-lg font-bold">Loading</p>

            <div className="flex space-x-2 mt-8">
                <div 
                    className="w-2 h-2 rounded-full animate-bounce transition-colors duration-1000" 
                    style={{ 
                        animationDelay: '0ms',
                        backgroundColor: '#FF3B30',
                        animation: 'bounce 1s infinite, colorChange 5s infinite'
                    }} 
                />
                <div 
                    className="w-2 h-2 rounded-full animate-bounce transition-colors duration-1000" 
                    style={{ 
                        animationDelay: '100ms',
                        backgroundColor: '#FF8C00',
                        animation: 'bounce 1s infinite 0.1s, colorChange 5s infinite'
                    }} 
                />
                <div 
                    className="w-2 h-2 rounded-full animate-bounce transition-colors duration-1000" 
                    style={{ 
                        animationDelay: '200ms',
                        backgroundColor: '#FF3B30',
                        animation: 'bounce 1s infinite 0.2s, colorChange 5s infinite'
                    }} 
                />
            </div>
        </div>
    );
};

export default Loading;