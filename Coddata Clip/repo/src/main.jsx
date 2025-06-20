import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Check if we're in extension context
const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id

// Get the root element - could be 'root' for web or 'codatta-extension-root' for extension
const rootElement = document.getElementById('codatta-extension-root') || document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} else {
  console.error('Root element not found')
}
