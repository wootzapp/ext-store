import React from 'react';
import ReactDOM from 'react-dom/client';
import WidgetApp from './WidgetApp';
import './index.css';

const widgetRoot = ReactDOM.createRoot(document.getElementById('widget-root'));
widgetRoot.render(
  <React.StrictMode>
    <WidgetApp />
  </React.StrictMode>
);
