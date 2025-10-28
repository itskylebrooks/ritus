import { useEffect, useRef, useState } from 'react'
import { exportAllData, importAllData } from '@/shared/utils/dataTransfer'
import useThemeStore from '@/shared/store/theme'
import { useHabitStore } from '@/shared/store/store'
import pkg from '../../../../package.json'
import ConfirmModal from './ConfirmModal'
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
  const storeReminders = useHabitStore((s) => s.reminders)
  const storeSetReminders = useHabitStore((s) => s.setReminders)
  const dateFormat = useHabitStore((s) => s.dateFormat)
  const setDateFormat = useHabitStore((s) => s.setDateFormat)
  const weekStart = useHabitStore((s) => s.weekStart)
  const setWeekStart = useHabitStore((s) => s.setWeekStart)

  const [reminders, setReminders] = useState(()=> storeReminders || { dailyEnabled: false, dailyTime: '21:00' })

  // Theme switcher (centralized)
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)
  const isSystemTheme = mode === 'system'
  
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importReportOpen, setImportReportOpen] = useState(false)
  const [importReportTitle, setImportReportTitle] = useState('')
  const [importReportMessage, setImportReportMessage] = useState<string | null>(null)
  const [importReportReload, setImportReportReload] = useState(false)
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
          setImportReportTitle('Import failed')
          setImportReportMessage('This file is not a Ritus export. Please export from Ritus and try again.')
        } else {
          setImportReportTitle('Import failed')
          setImportReportMessage('Import failed')
        }
        setImportReportReload(false)
        setImportReportOpen(true)
      } else {
        const changes: string[] = []
        const anyHabitsInfo = res.addedHabits > 0 || res.duplicateHabits > 0 || res.invalidHabits > 0
        if (anyHabitsInfo) {
          if (res.addedHabits > 0) changes.push(`Added ${res.addedHabits} new habit${res.addedHabits === 1 ? '' : 's'}`)
          if (res.duplicateHabits > 0) changes.push(`Skipped ${res.duplicateHabits} duplicate${res.duplicateHabits === 1 ? '' : 's'}`)
          if (res.invalidHabits > 0) changes.push(`Ignored ${res.invalidHabits} invalid item${res.invalidHabits === 1 ? '' : 's'}`)
        }
  // username no longer used
        if (res.totalPointsNew !== res.totalPointsPrev) changes.push(`Total points: ${res.totalPointsPrev} → ${res.totalPointsNew}`)
        if (res.longestStreakNew !== res.longestStreakPrev) changes.push(`Longest streak: ${res.longestStreakPrev} → ${res.longestStreakNew}`)
        changes.push(`Now tracking ${res.totalHabits} habit${res.totalHabits === 1 ? '' : 's'}`)

        const changed =
          res.addedHabits > 0 ||
          res.totalPointsNew !== res.totalPointsPrev ||
          res.longestStreakNew !== res.longestStreakPrev

        if (!changed) {
          setImportReportTitle('No changes imported')
          setImportReportMessage('No changes imported. All items were duplicates or invalid.')
          setImportReportReload(false)
          setImportReportOpen(true)
        } else {
          setImportReportTitle('Import summary')
          setImportReportMessage(`- ${changes.join('\n- ')}`)
          setImportReportReload(true)
          setImportReportOpen(true)
        }
      }
    } catch {
      setImportReportTitle('Import failed')
      setImportReportMessage('Import failed')
      setImportReportReload(false)
      setImportReportOpen(true)
    } finally {
      setImporting(false)
      try { e.target.value = '' } catch {}
    }
  }

  function handleDeleteAllLocal() { setConfirmClearOpen(true) }

  // reserved for potential future design accents

  const dailyEnabled = reminders.dailyEnabled

  if (!open && !closing) return null
  return (
    <div className={`fixed inset-0 z-[80] flex items-center justify-center p-5 transition-colors duration-200 ${closing ? 'bg-transparent' : 'bg-overlay backdrop-blur-sm'}`} onClick={beginClose}>
  <div
  className={`w-full max-w-sm rounded-2xl bg-surface-elevated p-6 pt-7 pb-8 ring-1 ring-black/5 dark:ring-neutral-700/5 border border-subtle overflow-y-auto settings-panel ${closing ? 'closing' : ''}`}
        style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 'max(env(safe-area-inset-bottom), 32px)' }}
        onClick={(e)=>e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="mb-4">
                <div className="relative h-10 flex items-center justify-center">
                  <span id="settings-title" className="text-lg font-semibold tracking-wide text-strong">Settings</span>
                </div>
              </div>

        <div className="space-y-4">
          {/* Theme */}
          <div className="p-4 rounded-2xl border border-subtle shadow-sm text-sm bg-surface">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold mb-0.5">Theme</div>
                <div className="text-[11px] text-muted">Choose the app appearance.</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyTheme('system')}
                  className={`grid h-10 w-10 place-items-center rounded-lg border border-subtle transition ${isSystemTheme ? 'bg-accent text-inverse shadow-elevated' : 'text-muted hover-nonaccent'}`}
                  aria-pressed={isSystemTheme}
                  aria-label="System"
                  title="System"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
                </button>

                <button
                  type="button"
                  onClick={() => applyTheme('light')}
                  className={`grid h-10 w-10 place-items-center rounded-lg border border-subtle transition ${!isSystemTheme && mode === 'light' ? 'bg-accent text-inverse shadow-elevated' : 'text-muted hover-nonaccent'}`}
                  aria-pressed={!isSystemTheme && mode === 'light'}
                  aria-label="Light"
                  title="Light"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M20 12h2M2 12H0"/><path d="m17 17 1.5 1.5M5.5 5.5 7 7"/><path d="m17 7 1.5-1.5M5.5 18.5 7 17"/></svg>
                </button>

                <button
                  type="button"
                  onClick={() => applyTheme('dark')}
                  className={`grid h-10 w-10 place-items-center rounded-lg border border-subtle transition ${!isSystemTheme && mode === 'dark' ? 'bg-accent text-inverse shadow-elevated' : 'text-muted hover-nonaccent'}`}
                  aria-pressed={!isSystemTheme && mode === 'dark'}
                  aria-label="Dark"
                  title="Dark"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Format */}
          <div className="p-4 rounded-2xl border border-subtle shadow-sm text-sm bg-surface">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold mb-0.5">Format</div>
                <div className="text-[11px] text-muted">Date format and first day of week.</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDateFormat('MDY')}
                    className={`relative rounded-lg w-20 px-3 py-2 border border-subtle text-sm text-center ${dateFormat === 'MDY' ? 'bg-accent text-inverse shadow-elevated' : 'text-muted hover-nonaccent'}`}
                    aria-pressed={dateFormat === 'MDY'}
                    title="Month/Day/Year"
                  >
                    MM/DD
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateFormat('DMY')}
                    className={`relative rounded-lg w-20 px-3 py-2 border border-subtle text-sm text-center ${dateFormat === 'DMY' ? 'bg-accent text-inverse shadow-elevated' : 'text-muted hover-nonaccent'}`}
                    aria-pressed={dateFormat === 'DMY'}
                    title="Day/Month/Year"
                  >
                    DD/MM
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWeekStart('sunday')}
                    className={`relative rounded-lg w-20 px-3 py-2 border border-subtle text-sm text-center ${weekStart === 'sunday' ? 'bg-accent text-inverse shadow-elevated' : 'text-muted hover-nonaccent'}`}
                    aria-pressed={weekStart === 'sunday'}
                    title="Week starts on Sunday"
                  >
                    Sunday
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeekStart('monday')}
                    className={`relative rounded-lg w-20 px-3 py-2 border border-subtle text-sm text-center ${weekStart === 'monday' ? 'bg-accent text-inverse shadow-elevated' : 'text-muted hover-nonaccent'}`}
                    aria-pressed={weekStart === 'monday'}
                    title="Week starts on Monday"
                  >
                    Monday
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-subtle shadow-sm text-sm bg-surface">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold mb-0.5">Data</div>
                <div className="text-[11px] text-muted">Import or export JSON.</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerFilePick}
                  disabled={importing || exporting}
                  aria-label="Import from file"
                  title="Import from file"
                  className="grid h-10 w-10 place-items-center rounded-lg border border-subtle text-strong hover:bg-subtle transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="grid h-10 w-10 place-items-center rounded-lg border border-subtle text-strong hover:bg-subtle transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="grid h-10 w-10 place-items-center rounded-lg border border-danger text-danger hover:bg-danger-soft transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eraser-icon lucide-eraser"><path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"/><path d="m5.082 11.09 8.828 8.828"/></svg>
                </button>
              </div>
            </div>
          </div>

          {false && (
            <div className="p-4 rounded-2xl border border-subtle shadow-sm text-sm bg-surface">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Daily reminder</div>
                  <div className="text-[12px] text-muted mt-1">Will be implemented in a future update.</div>
                </div>
                <div>
                  <button type="button" role="switch" aria-checked={dailyEnabled} onClick={()=>{ const v={...reminders,dailyEnabled: !dailyEnabled}; setReminders(v); try { storeSetReminders(v) } catch {} }} className={`inline-flex items-center px-3 py-2 rounded-full transition ${dailyEnabled ? 'bg-success text-inverse' : 'bg-subtle text-muted'}`}>
                    <span className="mr-3 text-sm">{dailyEnabled ? 'On' : 'Off'}</span>
                    <span className={`relative inline-block w-11 h-6 rounded-full ${dailyEnabled ? 'bg-success' : 'bg-chip'}`}>
                      <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-surface shadow transform" style={{ transform: dailyEnabled ? 'translateX(1.4rem)' : 'translateX(0)' }} />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="mt-5">
          <button onClick={beginClose} className="w-full rounded-2xl px-4 py-3 text-sm font-semibold bg-accent text-inverse hover-accent-fade transition">Done</button>
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
                    // reset progression (essence/points/level and award keys)
                    try {
                      useHabitStore.setState({ progress: { essence: 0, points: 0, level: 1, weekBonusKeys: {}, completionAwardKeys: {} } })
                    } catch {}
                // restore UI defaults (reset view mode to list and other UI prefs)
                try { st.setShowList(true) } catch {}
                // restore UI defaults
                try { st.setShowAdd(true) } catch {}
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

        <ConfirmModal
          open={importReportOpen}
          onClose={() => setImportReportOpen(false)}
          onConfirm={() => {
            setImportReportOpen(false)
            if (importReportReload) {
              // reload so UI reflects imported changes (keeps behavior similar to previous impl)
              window.location.reload()
            }
          }}
          title={importReportTitle || 'Import'}
          message={importReportMessage ? <pre className="whitespace-pre-wrap text-sm text-strong">{importReportMessage}</pre> : undefined}
          confirmLabel={importReportReload ? 'Reload' : 'OK'}
          cancelLabel={importReportReload ? 'Cancel' : 'Close'}
        />

  <div className="mt-6 text-center text-[12px] text-muted relative">
          <a
            href="https://itskylebrooks.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kyle Brooks personal website"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-strong opacity-90 hover:opacity-75 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-user-icon lucide-file-user w-5 h-5"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 18a3 3 0 1 0-6 0"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><circle cx="12" cy="13" r="2"/></svg>
          </a>

          <a
            href="https://github.com/itskylebrooks"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kyle Brooks on GitHub"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-strong opacity-90 hover:opacity-75 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github-icon lucide-github w-5 h-5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>

          <div className="font-medium text-strong">Kyle Brooks <span className="mx-2">•</span> Ritus {pkg.version}</div>
          <div className="mt-0.5 flex items-center justify-center gap-3">
            <a href="https://itskylebrooks.vercel.app/imprint" target="_blank" rel="noopener noreferrer" className="underline">Imprint</a>
            <a href="https://itskylebrooks.vercel.app/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>
            <a href="https://itskylebrooks.vercel.app/license" target="_blank" rel="noopener noreferrer" className="underline">License</a>
          </div>
        </div>
      </div>
    </div>
  )
}
