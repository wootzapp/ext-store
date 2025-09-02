import React from 'react';
import ReactDOM from 'react-dom/client';

import '@/pages/popup/index.css';
import App from '@/pages/popup/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Pure container: no logic changed, just clamps */}
    <div
      className="app-root no-x-overflow"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'clip',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }}
    >
      <App />
    </div>
  </React.StrictMode>
);
