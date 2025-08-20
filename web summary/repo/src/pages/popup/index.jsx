import React from 'react';
import { createRoot } from 'react-dom/client';
import '@/pages/popup/index.css';
import App from '@/pages/popup/App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);