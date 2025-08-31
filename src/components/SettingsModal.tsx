import { useEffect, useState, useRef } from 'react'
import { useHabitStore } from '../store/store'
import { exportAllData, importAllData } from '../utils/dataTransfer'
import ConfirmModal from './ConfirmModal'
import pkg from '../../package.json'
function clearAllData() { localStorage.clear() }

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  onShowGuide?: () => void
  onShowPrivacy?: () => void
}

export default function SettingsModal({ open, onClose, onShowGuide, onShowPrivacy }: SettingsModalProps) {
  const [closing, setClosing] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const pendingRef = useRef<'none' | 'guide' | 'privacy'>('none')
  const storeUsername = useHabitStore((s) => s.username)
  const storeSetUsername = useHabitStore((s) => s.setUsername)
  const storeReminders = useHabitStore((s) => s.reminders)
  const storeSetReminders = useHabitStore((s) => s.setReminders)

  const [username, setUsername] = useState(() => storeUsername || '')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [reminders, setReminders] = useState(()=> storeReminders || { dailyEnabled: false, dailyTime: '21:00' })
  
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
      } else if (pendingRef.current === 'privacy') {
        window.setTimeout(()=> { try { onShowPrivacy && onShowPrivacy() } catch {} ; pendingRef.current = 'none' }, 80)
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

  function handleShowPrivacy() {
    if (!onShowPrivacy) return
    pendingRef.current = 'privacy'
    beginClose()
  }

  useEffect(()=>{
    if (open) {
  setUsername(storeUsername || '')
      setDirty(false); setSaving(false); setSavedFlash(false)
  setReminders(storeReminders || { dailyEnabled: false, dailyTime: '21:00' })
    }
  }, [open])

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) { setUsername(e.target.value); setDirty(true) }
  async function handleSave(e?: React.FormEvent) { if (e) e.preventDefault(); if (!dirty || saving) return; setSaving(true); if (username.trim().length < 4) { setSaving(false); alert('Username must be at least 4 characters.'); return; } try { storeSetUsername(username.trim()); setSaving(false); setDirty(false); setSavedFlash(true); setTimeout(()=> setSavedFlash(false), 1400) } catch (err) { setSaving(false); alert('Failed to save username') } }

  function handleDeleteAllLocal() { setConfirmClearOpen(true) }

  function handlePrivacyPolicy() { handleShowPrivacy() }

  const topEmoji = '🙂'
  // reserved for potential future design accents
  // const gradientCSS = 'linear-gradient(135deg,#111,#0b1220)'

  const dailyEnabled = reminders.dailyEnabled

  if (!open && !closing) return null
  return (
    <div className={"fixed inset-0 z-50 flex items-stretch sm:items-center justify-center settings-overlay backdrop-blur-sm " + (closing? 'closing':'')} onClick={beginClose}>
  <div
        className={"w-full h-full sm:h-auto max-w-none sm:max-w-sm rounded-none sm:rounded-2xl bg-white dark:bg-neutral-950 p-6 pt-7 pb-8 ring-1 ring-black/5 dark:ring-white/5 overflow-y-auto settings-panel " + (closing? 'closing':'')}
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
                <button type="button" aria-label="Open guide" onClick={handleShowGuide} className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100/40 dark:bg-neutral-800/30 border border-neutral-200 dark:border-white text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-gray-100/60 dark:hover:bg-neutral-800/40 transition">
                  <span className="text-xl font-semibold">?</span>
                </button>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full text-[10px] text-black/40 font-medium whitespace-nowrap pointer-events-none select-none">App guide</div>
              </div>
            )}
            <span id="settings-title" className="text-lg font-semibold tracking-wide text-neutral-900 dark:text-neutral-100">Settings</span>
            <div className="absolute right-0 top-1/2 -translate-y-1/2" title="Your avatar">
              <div className="relative" style={{ width:48, height:48 }}>
                <div className="w-full h-full rounded-full border border-neutral-200 dark:border-white shadow-inner overflow-hidden bg-black">
                  <div className="flex items-center justify-center w-full h-full text-[24px] select-none text-white">{topEmoji}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl border shadow-sm text-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold mb-0.5">Account</div>
              </div>
            </div>
            <hr className="border-t border-black/6 my-3" />
            <form onSubmit={handleSave} className="mt-1 space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-neutral-600 dark:text-neutral-400 mb-2">Username</label>
                <div className="flex items-center gap-3">
                  <input
                    value={username}
                    onChange={handleChange}
                    maxLength={24}
                    className="flex-1 rounded-md bg-white dark:bg-neutral-950 px-3 py-2 text-sm appearance-none outline-none focus:outline-none focus-visible:outline-none border border-black/10 dark:border-white/10 focus:border-black/20 dark:focus:border-white/20 placeholder:text-neutral-400 text-black dark:text-white transition-colors"
                    placeholder="user"
                  />
                  <button type="submit" disabled={!dirty || saving || username.trim().length < 4} className="rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-black text-white dark:bg-white dark:text-black">{saving ? 'Saving…' : savedFlash ? 'Saved' : 'Save'}</button>
                </div>
                <p className="mt-2 text-[11px] text-neutral-600 dark:text-neutral-400">Lowercase, 4-24 chars, currently local only.</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteAllLocal}
                    className="w-full rounded-md px-3 py-2 text-sm font-medium bg-white dark:bg-black border border-red-500 text-red-600 dark:text-red-400"
                  >
                    Delete local data
                  </button>
                  <button
                    type="button"
                    onClick={handlePrivacyPolicy}
                    className="w-full rounded-md px-3 py-2 text-sm font-medium bg-white dark:bg-black border border-emerald-500 text-emerald-700 dark:text-emerald-400"
                  >
                    Privacy policy
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="p-4 rounded-2xl border shadow-sm text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold mb-0.5">Data transfer</div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">Import or export JSON.</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerFilePick}
                  disabled={importing || exporting}
                  aria-label="Import from file"
                  title="Import from file"
                  className="grid h-10 w-10 place-items-center rounded-lg border text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="grid h-10 w-10 place-items-center rounded-lg border text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder-output-icon lucide-folder-output">
                    <path d="M2 7.5V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-1.5"/>
                    <path d="M2 13h10"/>
                    <path d="m5 10-3 3 3 3"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {false && (
            <div className="p-4 rounded-2xl border shadow-sm text-sm">
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

  <div className="mt-6 text-center text-[10px] text-neutral-600 dark:text-neutral-400 relative">
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

          <div className="font-medium text-neutral-900 dark:text-neutral-200">Ritus {pkg.version}</div>
          <div className="mt-1">© {new Date().getFullYear()} Kyle Brooks. All rights reserved.</div>
          <div className="mt-0.5">Icons By <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer" className="underline">Lucide</a>.</div>
        </div>
      </div>
    </div>
  )
}
