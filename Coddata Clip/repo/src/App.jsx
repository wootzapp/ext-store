import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isExtensionMode, setIsExtensionMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if we're running in extension context
    const checkExtensionContext = () => {
      const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id
      const isSidePanel = window.location.pathname.includes('sidepanel.html')
      
      setIsExtensionMode(isExtension || isSidePanel)
      
      if (isExtension || isSidePanel) {
        // In extension mode, check if sidepanelviews.js is available
        const checkSidepanelLoaded = () => {
          // Check if the sidepanelviews.js has created any extension-specific elements
          const hasExtensionContent = document.querySelector('[data-extension-content]') || 
                                     window.sidepanelViewsLoaded ||
                                     document.querySelector('.ant-app') // Common class from sidepanelviews.js
          
          if (hasExtensionContent) {
            setIsLoading(false)
          } else {
            // Try to load sidepanelviews.js if it's not already loaded
            if (!document.querySelector('script[src*="sidepanelviews"]')) {
              const script = document.createElement('script')
              script.src = './sidepanelviews.js'
              script.onload = () => {
                setTimeout(() => setIsLoading(false), 500)
              }
              script.onerror = () => {
                console.warn('Could not load sidepanelviews.js, using fallback')
                setIsLoading(false)
              }
              document.head.appendChild(script)
            } else {
              setTimeout(() => setIsLoading(false), 1000)
            }
          }
        }
        
        checkSidepanelLoaded()
      } else {
        setIsLoading(false)
      }
    }

    checkExtensionContext()
  }, [])

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <img src="./assets/images/logo.png" alt="Codatta" className="loading-logo" />
          <div>Loading Codatta Extension...</div>
        </div>
      </div>
    )
  }

  if (isExtensionMode) {
    // In extension mode, the UI is handled by sidepanelviews.js
    // This component serves as a fallback container
    return (
      <div id="codatta-extension-container">
        <div className="extension-fallback">
          <img src="./assets/images/logo.png" alt="Codatta" className="extension-logo" />
          <h2>Codatta Clip Extension</h2>
          <p>The extension is loading...</p>
        </div>
      </div>
    )
  }

  // Regular web app mode (for development)
  return (
    <div className="app-container">
      <div className="app-header">
        <img src="/src/assets/images/logo.png" alt="Codatta" className="app-logo" />
        <h1>Codatta Clip</h1>
        <p>Turn Your Intelligence into AI</p>
      </div>
      <div className="app-content">
        <p>This is the web version of Codatta Clip extension.</p>
        <p>Install the browser extension to use all features.</p>
      </div>
    </div>
  )
}

export default App
