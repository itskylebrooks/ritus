import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
// Ensure theme store is initialized early so it can apply the resolved theme and listeners
import './store/theme'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Re-enable animations after initial paint
// Use rAF to wait until the first frame renders
requestAnimationFrame(() => {
  document.body.classList.remove('preload')
})
