import { useEffect, useState, useRef } from 'react'
import { useHabitStore } from '../store/store'
import useThemeStore from '../store/theme'
import { exportAllData, importAllData } from '../utils/dataTransfer'
import ConfirmModal from './ConfirmModal'
import pkg from '../../package.json'
function clearAllData() { localStorage.clear() }

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  onShowGuide?: () => void
}

type ThemeMode = 'system' | 'light' | 'dark'

export default function SettingsModal({ open, onClose, onShowGuide }: SettingsModalProps) {
  const [closing, setClosing] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const pendingRef = useRef<'none' | 'guide'>('none')
  const storeSetUsername = useHabitStore((s) => s.setUsername)
  const storeReminders = useHabitStore((s) => s.reminders)
  const storeSetReminders = useHabitStore((s) => s.setReminders)

  const [reminders, setReminders] = useState(()=> storeReminders || { dailyEnabled: false, dailyTime: '21:00' })

  // Theme switcher (centralized)
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)
  const isSystemTheme = mode === 'system'
  
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  // export preview not shown in UI; omitted to keep UI minimal
  const fileRef = useRef<HTMLInputElement | null>(null)

  // import/export handled via utils/dataTransfer

  useEffect(()=>{ if(!open) setClosing(false); }, [open])
  useEffect(()=>()=>{ if(timeoutRef.current) window.clearTimeout(timeoutRef.current); },[])
  // Prevent background scrolling while settings modal is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])
  const CLOSE_DURATION = 280
  function beginClose(){ if (closing) return; setClosing(true); timeoutRef.current = window.setTimeout(()=> {
      try { onClose() } catch {}
      if (pendingRef.current === 'guide') {
        // little buffer so the settings overlay/panel fully finishes animating
        window.setTimeout(()=> { try { onShowGuide && onShowGuide() } catch {} ; pendingRef.current = 'none' }, 80)
      } else {
        pendingRef.current = 'none'
      }
    }, CLOSE_DURATION + 40); }

  function handleShowGuide() {
    if (!onShowGuide) return
    pendingRef.current = 'guide'
    // start the close animation; onClose will be called after CLOSE_DURATION, then we'll trigger guide from the parent via pendingRef in beginClose
    beginClose()
  }

  useEffect(()=>{
    if (open) {
      setReminders(storeReminders || { dailyEnabled: false, dailyTime: '21:00' })
    }
  }, [open])

  // useThemeStore.setMode handles persistence, syncing and applying class
  function applyTheme(next: ThemeMode) {
    try { setMode(next) } catch {}
  }

  async function handleExport() {
    try { setExporting(true); const payload = exportAllData(); const json = JSON.stringify(payload, null, 2); const blob = new Blob([json], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); const now = new Date().toISOString().slice(0,10); a.href = url; a.download = `ritus-export-${now}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { alert('Export failed') } finally { setExporting(false) }
  }
  function triggerFilePick() { fileRef.current?.click() }
  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const txt = await f.text()
    setImporting(true)
    try {
      const res = importAllData(txt)
      if (!res.ok) {
        if (res.reason === 'not_ritus') {
          alert('This file is not a Ritus export. Please export from Ritus and try again.')
        } else {
          alert('Import failed')
        }
      } else {
        const changes: string[] = []
        const anyHabitsInfo = res.addedHabits > 0 || res.duplicateHabits > 0 || res.invalidHabits > 0
        if (anyHabitsInfo) {
          if (res.addedHabits > 0) changes.push(`Added ${res.addedHabits} new habit${res.addedHabits === 1 ? '' : 's'}`)
          if (res.duplicateHabits > 0) changes.push(`Skipped ${res.duplicateHabits} duplicate${res.duplicateHabits === 1 ? '' : 's'}`)
          if (res.invalidHabits > 0) changes.push(`Ignored ${res.invalidHabits} invalid item${res.invalidHabits === 1 ? '' : 's'}`)
        }
        if (res.usernameChanged) changes.push('Updated username')
        if (res.totalPointsNew !== res.totalPointsPrev) changes.push(`Total points: ${res.totalPointsPrev} → ${res.totalPointsNew}`)
        if (res.longestStreakNew !== res.longestStreakPrev) changes.push(`Longest streak: ${res.longestStreakPrev} → ${res.longestStreakNew}`)
        changes.push(`Now tracking ${res.totalHabits} habit${res.totalHabits === 1 ? '' : 's'}`)

        const changed =
          res.addedHabits > 0 ||
          res.usernameChanged ||
          res.totalPointsNew !== res.totalPointsPrev ||
          res.longestStreakNew !== res.longestStreakPrev

        if (!changed) {
          alert('No changes imported. All items were duplicates or invalid.')
        } else {
          alert(`Import summary:\n- ${changes.join('\n- ')}`)
          window.location.reload()
        }
      }
    } catch {
      alert('Import failed')
    } finally {
      setImporting(false)
      try { e.target.value = '' } catch {}
    }
  }

  function handleDeleteAllLocal() { setConfirmClearOpen(true) }

  const topEmoji = '🙂'
  // reserved for potential future design accents
  // const gradientCSS = 'linear-gradient(135deg,#111,#0b1220)'

  const dailyEnabled = reminders.dailyEnabled

  if (!open && !closing) return null
  return (
    <div className={"fixed inset-0 z-50 flex items-stretch sm:items-center justify-center settings-overlay backdrop-blur-sm " + (closing? 'closing':'')} onClick={beginClose}>
  <div
  className={"w-full h-full sm:h-auto max-w-none sm:max-w-sm rounded-none sm:rounded-2xl bg-white dark:bg-neutral-950 p-6 pt-7 pb-8 ring-1 ring-black/5 dark:ring-neutral-700/5 overflow-y-auto settings-panel " + (closing? 'closing':'')}
        style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 'max(env(safe-area-inset-bottom), 32px)' }}
        onClick={(e)=>e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="mb-8">
          <div className="relative h-12 flex items-center justify-center">
            {onShowGuide && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2" style={{ width:48, height:48 }}>
                <button type="button" aria-label="Open guide" onClick={handleShowGuide} className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100/40 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-gray-100/60 dark:hover:bg-neutral-800/40 transition">
                  <span className="text-xl font-semibold">?</span>
                </button>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full text-[10px] text-black/40 font-medium whitespace-nowrap pointer-events-none select-none">App guide</div>
              </div>
            )}
            <span id="settings-title" className="text-lg font-semibold tracking-wide text-neutral-900 dark:text-neutral-100">Settings</span>
            <div className="absolute right-0 top-1/2 -translate-y-1/2" title="Your avatar">
              <div className="relative" style={{ width:48, height:48 }}>
                <div className="w-full h-full rounded-full border border-neutral-200 dark:border-neutral-700 shadow-inner overflow-hidden bg-black">
                  <div className="flex items-center justify-center w-full h-full text-[24px] select-none text-white">{topEmoji}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Theme */}
          <div className="p-4 rounded-2xl border dark:border-neutral-700 shadow-sm text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold mb-0.5">Theme</div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">Choose the app appearance.</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyTheme('system')}
                  className={"relative grid h-10 w-10 place-items-center rounded-lg border dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition " + (isSystemTheme ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500')}
                  aria-pressed={isSystemTheme}
                  aria-label="System"
                  title="System"
                >
                  {isSystemTheme && (
                    <span className="absolute inset-0 rounded-lg border border-black/10 dark:border-neutral-700/10 bg-black/5 dark:bg-neutral-700/10 pointer-events-none" aria-hidden />
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="relative z-10 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
                </button>

                <button
                  type="button"
                  onClick={() => applyTheme('light')}
                  className={"relative grid h-10 w-10 place-items-center rounded-lg border dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition " + (!isSystemTheme && mode === 'light' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500')}
                  aria-pressed={!isSystemTheme && mode === 'light'}
                  aria-label="Light"
                  title="Light"
                >
                  {!isSystemTheme && mode === 'light' && (
                    <span className="absolute inset-0 rounded-lg border border-black/10 dark:border-neutral-700/10 bg-black/5 dark:bg-neutral-700/10 pointer-events-none" aria-hidden />
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="relative z-10 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M20 12h2M2 12H0"/><path d="m17 17 1.5 1.5M5.5 5.5 7 7"/><path d="m17 7 1.5-1.5M5.5 18.5 7 17"/></svg>
                </button>

                <button
                  type="button"
                  onClick={() => applyTheme('dark')}
                  className={"relative grid h-10 w-10 place-items-center rounded-lg border dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition " + (!isSystemTheme && mode === 'dark' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500')}
                  aria-pressed={!isSystemTheme && mode === 'dark'}
                  aria-label="Dark"
                  title="Dark"
                >
                  {!isSystemTheme && mode === 'dark' && (
                    <span className="absolute inset-0 rounded-lg border border-black/10 dark:border-neutral-700/10 bg-black/5 dark:bg-neutral-700/10 pointer-events-none" aria-hidden />
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="relative z-10 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border dark:border-neutral-700 shadow-sm text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold mb-0.5">Data</div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">Import or export JSON.</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerFilePick}
                  disabled={importing || exporting}
                  aria-label="Import from file"
                  title="Import from file"
                  className="grid h-10 w-10 place-items-center rounded-lg border dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder-input-icon lucide-folder-input">
                    <path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/>
                    <path d="M2 13h10"/>
                    <path d="m9 16 3-3-3-3"/>
                  </svg>
                </button>
                <input ref={fileRef} type="file" accept="application/json" onChange={handleFileChosen} className="hidden" />

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  aria-label="Export all data"
                  title="Export all data"
                  className="grid h-10 w-10 place-items-center rounded-lg border dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder-output-icon lucide-folder-output">
                    <path d="M2 7.5V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-1.5"/>
                    <path d="M2 13h10"/>
                    <path d="m5 10-3 3 3 3"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAllLocal}
                  aria-label="Delete local data"
                  title="Delete local data"
                  className="grid h-10 w-10 place-items-center rounded-lg border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eraser-icon lucide-eraser"><path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"/><path d="m5.082 11.09 8.828 8.828"/></svg>
                </button>
              </div>
            </div>
          </div>

          {false && (
            <div className="p-4 rounded-2xl border dark:border-neutral-700 shadow-sm text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Daily reminder</div>
                  <div className="text-[12px] text-neutral-600 dark:text-neutral-400 mt-1">Will be implemented in a future update.</div>
                </div>
                <div>
                  <button type="button" role="switch" aria-checked={dailyEnabled} onClick={()=>{ const v={...reminders,dailyEnabled: !dailyEnabled}; setReminders(v); try { storeSetReminders(v) } catch {} }} className={"inline-flex items-center px-3 py-2 rounded-full " + (dailyEnabled ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-neutral-800 text-black dark:text-neutral-200') }>
                    <span className="mr-3 text-sm">{dailyEnabled ? 'On' : 'Off'}</span>
                    <span className={"relative inline-block w-11 h-6 rounded-full " + (dailyEnabled ? 'bg-emerald-500' : 'bg-gray-300') }>
                      <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform" style={{ transform: dailyEnabled ? 'translateX(1.4rem)' : 'translateX(0)' }} />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="mt-5">
          <button onClick={beginClose} className="w-full rounded-2xl px-4 py-3 text-sm font-semibold bg-black text-white hover:bg-neutral-800 transition dark:bg-white dark:text-black dark:hover:bg-neutral-200">Done</button>
        </div>

        <ConfirmModal
          open={confirmClearOpen}
          onClose={() => setConfirmClearOpen(false)}
          onConfirm={() => {
            try {
              // Clear persisted storage and reset in-memory store to defaults
              clearAllData()
              try {
                const st = useHabitStore.getState()
                st.clearAll()
                st.resetStats()
                storeSetUsername('')
                storeSetReminders({ dailyEnabled: false, dailyTime: '21:00' })
              } catch {}
              setConfirmClearOpen(false)
              // Smoothly close settings so main page shows updated empty state
              beginClose()
            } catch (e) {
              console.error('Failed to clear local data', e)
              setConfirmClearOpen(false)
            }
          }}
          title="Delete all local data?"
          message="This will clear all Ritus data stored in this browser. This cannot be undone."
          confirmLabel="Delete"
          destructive
        />

  <div className="mt-6 text-center text-[12px] text-neutral-600 dark:text-neutral-400 relative">
          <a
            href="https://itskylebrooks.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kyle Brooks personal website"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white opacity-90 hover:opacity-75 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-user-icon lucide-file-user w-5 h-5"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 18a3 3 0 1 0-6 0"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><circle cx="12" cy="13" r="2"/></svg>
          </a>

          <a
            href="https://github.com/itskylebrooks"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kyle Brooks on GitHub"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-black dark:text-white opacity-90 hover:opacity-75 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github-icon lucide-github w-5 h-5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>

          <div className="font-medium text-neutral-900 dark:text-neutral-200">Kyle Brooks <span className="mx-2">•</span> Ritus {pkg.version}</div>
          <div className="mt-1 flex items-center justify-center gap-6">
            <a href="https://itskylebrooks.vercel.app/imprint" target="_blank" rel="noopener noreferrer" className="underline">Imprint</a>
            <a href="https://itskylebrooks.vercel.app/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>
            <a href="https://itskylebrooks.vercel.app/license" target="_blank" rel="noopener noreferrer" className="underline">License</a>
          </div>
        </div>
      </div>
    </div>
  )
}
