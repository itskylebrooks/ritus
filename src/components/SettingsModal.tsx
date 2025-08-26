import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import pkg from '../../package.json'
type Entry = any

// Simple local storage placeholders
function loadUser() { try { return JSON.parse(localStorage.getItem('ritus-user') || '{}') } catch { return {} } }
function saveUser(u: any) { localStorage.setItem('ritus-user', JSON.stringify(u)); return u }
function loadReminders() { try { return JSON.parse(localStorage.getItem('ritus-reminders') || JSON.stringify({ dailyEnabled: false, dailyTime: '21:00' })) } catch { return { dailyEnabled: false, dailyTime: '21:00' } }
}
function saveReminders(r: any) { localStorage.setItem('ritus-reminders', JSON.stringify(r)); return r }
function clearAllData() { localStorage.clear() }
function exportAllData() { return { notes: [], version: pkg.version } }
function importAllData(_txt: string, _opts: any) { return { ok: true, added: 0, merged: 0, total: 0 } }

export default function SettingsModal({ open, onClose, entries, onShowGuide, isTG, onOpenPrivacy }: { open: boolean; onClose: () => void; entries: Entry[]; onShowGuide?: () => void; isTG?: boolean; onOpenPrivacy?: () => void }) {
  const [closing, setClosing] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const pendingRef = useRef<'none' | 'guide'>('none')
  const [username, setUsername] = useState(() => loadUser().username || '')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [reminders, setReminders] = useState(()=> loadReminders())
  const [mode, setMode] = useState<'merge'|'replace'>('merge')
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(()=>{ if(!open) setClosing(false); }, [open])
  useEffect(()=>()=>{ if(timeoutRef.current) window.clearTimeout(timeoutRef.current); },[])
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
      const current = loadUser(); setUsername(current.username || '')
      setDirty(false); setSaving(false); setSavedFlash(false)
      setReminders(loadReminders())
    }
  }, [open])

  async function handleExport() {
    try { setExporting(true); const payload = exportAllData(); const json = JSON.stringify(payload, null, 2); setPreview(json); const blob = new Blob([json], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); const now = new Date().toISOString().slice(0,10); a.href = url; a.download = `ritus-export-${now}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { alert('Export failed') } finally { setExporting(false) }
  }
  function triggerFilePick() { fileRef.current?.click() }
  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const txt = await f.text()
    setImporting(true)
    try {
      const res = importAllData(txt, { merge: mode === 'merge' })
      if (!res.ok) alert('Import failed')
      else { alert('Import completed'); window.location.reload() }
    } catch {
      alert('Import failed')
    } finally {
      setImporting(false)
      try { e.target.value = '' } catch {}
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) { setUsername(e.target.value); setDirty(true) }
  async function handleSave(e?: React.FormEvent) { if (e) e.preventDefault(); if (!dirty || saving) return; setSaving(true); if (username.trim().length < 4) { setSaving(false); alert('Username must be at least 4 characters.'); return; } const stored = saveUser({ username: username.trim(), updatedAt: Date.now() }); setUsername(stored.username); setSaving(false); setDirty(false); setSavedFlash(true); setTimeout(()=> setSavedFlash(false), 1400) }

  function handleDeleteAllLocal() {
    const ok = window.confirm('Delete all local data? This will clear localStorage and cannot be undone. Are you sure?')
    if (!ok) return
    try {
      clearAllData()
      // inform the user and reload so the app reflects cleared data
      window.alert('All local data cleared. The app will reload now.')
      window.location.reload()
    } catch (e) {
      console.error('Failed to clear local data', e)
      window.alert('Failed to clear local data')
    }
  }

  function handlePrivacyPolicy() {
    // intentionally non-functional in this build; left as a placeholder
  }

  const topEmoji = '🙂'
  const gradientCSS = 'linear-gradient(135deg,#111,#0b1220)'

  const dailyEnabled = reminders.dailyEnabled

  if (!open && !closing) return null
  return (
    <div className={"fixed inset-0 z-50 flex items-stretch sm:items-center justify-center settings-overlay backdrop-blur-sm " + (closing? 'closing':'')} onClick={beginClose}>
      <div className={"w-full h-full sm:h-auto max-w-none sm:max-w-sm rounded-none sm:rounded-2xl bg-white p-6 pt-7 pb-8 ring-1 ring-black/5 overflow-y-auto settings-panel " + (closing? 'closing':'')} style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 'max(env(safe-area-inset-bottom), 32px)' }} onClick={(e)=>e.stopPropagation()}>
        <div className="mb-8">
          <div className="relative h-12 flex items-center justify-center">
            {onShowGuide && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2" style={{ width:48, height:48 }}>
                <button type="button" aria-label="Open guide" onClick={handleShowGuide} className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100/40 ring-1 ring-black/6 text-black/60 hover:text-black hover:bg-gray-100/60 transition">
                  <span className="text-xl font-semibold">?</span>
                </button>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full text-[10px] text-black/40 font-medium whitespace-nowrap pointer-events-none select-none">App guide</div>
              </div>
            )}
            <span className="text-lg font-semibold tracking-wide">Settings</span>
            <div className="absolute right-0 top-1/2 -translate-y-1/2" title="Your avatar">
              <div className="relative" style={{ width:48, height:48 }}>
                <div className="w-full h-full rounded-full ring-1 ring-black/8 shadow-inner overflow-hidden" style={{ backgroundImage: gradientCSS }}>
                  <div className="flex items-center justify-center w-full h-full text-[24px] select-none">{topEmoji}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-2xl shadow-sm text-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold mb-0.5">Account</div>
              </div>
            </div>
            <hr className="border-t border-black/6 my-3" />
            <form onSubmit={handleSave} className="mt-1 space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-black/40 mb-2">Username</label>
                <div className="flex items-center gap-3">
                  <input value={username} onChange={handleChange} maxLength={24} className="flex-1 rounded-md bg-white px-3 py-2 text-sm outline-none ring-1 ring-black/6 focus:ring-2 focus:ring-emerald-400 placeholder:text-black/30" placeholder="user" />
                  <button type="submit" disabled={!dirty || saving || !username.trim()} className="rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-black text-white">{saving ? 'Saving…' : savedFlash ? 'Saved' : 'Save'}</button>
                </div>
                <p className="mt-2 text-[11px] text-black/40">Lowercase, 24 chars max. Placeholder only.</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <button type="button" onClick={handleDeleteAllLocal} className="text-sm font-medium text-red-600 hover:underline">Delete all local data</button>
                  <button type="button" disabled onClick={handlePrivacyPolicy} className="text-sm text-black/50 underline disabled:opacity-50 disabled:cursor-not-allowed">Privacy policy</button>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl shadow-sm text-sm">
            <div className="text-sm font-semibold mb-2">Data transfer</div>
            <div className="text-[11px] text-black/50">Export or import JSON (placeholder).</div>
            <div className="mt-3 grid gap-2">
              <button onClick={handleExport} disabled={exporting} className="w-full rounded-md bg-black text-white px-3 py-2">{exporting ? 'Exporting…' : 'Export all data (JSON)'}</button>
              <div className="flex gap-2">
                <button type="button" onClick={triggerFilePick} className="flex-1 rounded-md bg-white border px-3 py-2">{importing ? 'Importing…' : 'Import from file'}</button>
                <input ref={fileRef} type="file" accept="application/json" onChange={handleFileChosen} className="hidden" />
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px]">
                <label onClick={() => setMode('merge')} className={"px-2 py-1 rounded-md cursor-pointer " + (mode==='merge' ? 'bg-emerald-100' : 'bg-white') }>
                  <input aria-hidden className="sr-only" type="radio" checked={mode==='merge'} readOnly />
                  <span>Merge</span>
                </label>
                <label onClick={() => setMode('replace')} className={"px-2 py-1 rounded-md cursor-pointer " + (mode==='replace' ? 'bg-red-100' : 'bg-white') }>
                  <input aria-hidden className="sr-only" type="radio" checked={mode==='replace'} readOnly />
                  <span>Replace</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl shadow-sm text-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Daily reminder</div>
                <div className="text-[12px] text-black/40 mt-1">Placeholder reminder settings</div>
              </div>
              <div>
                <button type="button" role="switch" aria-checked={dailyEnabled} onClick={()=>{ const v={...reminders,dailyEnabled: !dailyEnabled}; setReminders(v); saveReminders(v); }} className={"inline-flex items-center px-3 py-2 rounded-full " + (dailyEnabled ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-black') }>
                  <span className="mr-3 text-sm">{dailyEnabled ? 'On' : 'Off'}</span>
                  <span className={"relative inline-block w-11 h-6 rounded-full " + (dailyEnabled ? 'bg-emerald-500' : 'bg-gray-300') }>
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform" style={{ transform: dailyEnabled ? 'translateX(1.4rem)' : 'translateX(0)' }} />
                  </span>
                </button>
              </div>
            </div>
            <div className="text-[11px] text-black/40 mt-3">Reminders are placeholders in this build.</div>
          </div>

        </div>

        <div className="mt-5">
          <button onClick={beginClose} className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white bg-black">Done</button>
        </div>

        <div className="mt-6 text-center text-[10px] text-black/40 relative">
          <a
            href="https://www.linkedin.com/in/itskylebrooks/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kyle Brooks on LinkedIn"
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-90 hover:opacity-75 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M4.00098 3H20.001C20.5533 3 21.001 3.44772 21.001 4V20C21.001 20.5523 20.5533 21 20.001 21H4.00098C3.44869 21 3.00098 20.5523 3.00098 20V4C3.00098 3.44772 3.44869 3 4.00098 3ZM5.00098 5V19H19.001V5H5.00098ZM7.50098 9C6.67255 9 6.00098 8.32843 6.00098 7.5C6.00098 6.67157 6.67255 6 7.50098 6C8.3294 6 9.00098 6.67157 9.00098 7.5C9.00098 8.32843 8.3294 9 7.50098 9ZM6.50098 10H8.50098V17.5H6.50098V10ZM12.001 10.4295C12.5854 9.86534 13.2665 9.5 14.001 9.5C16.072 9.5 17.501 11.1789 17.501 13.25V17.5H15.501V13.25C15.501 12.2835 14.7175 11.5 13.751 11.5C12.7845 11.5 12.001 12.2835 12.001 13.25V17.5H10.001V10H12.001V10.4295Z"></path></svg>
          </a>

          <a
            href="https://github.com/itskylebrooks"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kyle Brooks on GitHub"
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-90 hover:opacity-75 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z"></path></svg>
          </a>

          <div className="font-medium text-black/55">Ritus {pkg.version}</div>
          <div className="mt-1">© {new Date().getFullYear()} Kyle Brooks. All rights reserved.</div>
          <div className="mt-0.5">Icons by Remix Design.</div>
        </div>
      </div>
    </div>
  )
}
