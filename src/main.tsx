import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import '@/shared/styles/index.css'
// Ensure theme store is initialized early so it can apply the resolved theme and listeners
import '@/shared/store/theme'
import initAccentSync from '@/shared/theme/accent'

// Register service worker
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      // Check for updates periodically (every hour)
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

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

// Initialize accent sync after hydration kicks off
try { initAccentSync() } catch {}
