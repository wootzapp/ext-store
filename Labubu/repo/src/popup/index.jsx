import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/index.css';
import './popup.css';
import Popup from './Popup.jsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
); 