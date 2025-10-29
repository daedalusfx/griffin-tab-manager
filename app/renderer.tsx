import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import { ErrorBoundary } from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      {/* <WindowContextProvider titlebar={{ title: 'Electron React App', icon: appIcon, menuItems }}> */}
        <App />
      {/* </WindowContextProvider> */}
    </ErrorBoundary>
  </React.StrictMode>
)
