import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Re-enable animations after initial paint
// Use rAF to wait until the first frame renders
requestAnimationFrame(() => {
  document.body.classList.remove('preload')
})
