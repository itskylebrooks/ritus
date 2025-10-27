import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '@/shared/styles/index.css'
// Ensure theme store is initialized early so it can apply the resolved theme and listeners
import '@/shared/store/theme'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// Re-enable animations after initial paint
// Use rAF to wait until the first frame renders
requestAnimationFrame(() => {
  document.body.classList.remove('preload')
})
