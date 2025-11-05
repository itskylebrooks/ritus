import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isIosDevice, setIsIosDevice] = useState(false)
  const [isAndroidDevice, setIsAndroidDevice] = useState(false)

  useEffect(() => {
    // Check device type
    const iosDevice = isIOS()
    const androidDevice = isAndroid()
    setIsIosDevice(iosDevice)
    setIsAndroidDevice(androidDevice)

    // Check if already installed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true)
      return
    }

    // On iOS, show install button even without beforeinstallprompt event
    if (iosDevice) {
      setCanInstall(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const event = e as BeforeInstallPromptEvent
      setDeferredPrompt(event)
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = async () => {
    // For iOS, show instructions
    if (isIosDevice) {
      alert(
        'To install Ritus on iOS:\n\n' +
        '1. Tap the Share button at the bottom\n' +
        '2. Scroll down and tap "Add to Home Screen"\n' +
        '3. Tap "Add" in the top right'
      )
      return true
    }

    // For Android/Chrome
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null)
        setCanInstall(false)
        return true
      }
      return false
    } catch (error) {
      console.error('Error showing install prompt:', error)
      return false
    }
  }

  return {
    isInstalled,
    canInstall,
    install,
    isIosDevice,
    isAndroidDevice,
  }
}
