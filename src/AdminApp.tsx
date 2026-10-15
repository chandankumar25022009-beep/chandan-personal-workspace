import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Eye, LogOut, Save, Shield, Upload, UserRound } from 'lucide-react'
import portfolioData from './data/portfolio.json'
import type { PortfolioContent } from './data/types'
import './admin.css'

type Section = Exclude<keyof PortfolioContent, 'schemaVersion'> | 'preview'
type DataSection = Exclude<Section, 'preview'>
const sections: Array<{ key: Section; label: string }> = [
  { key: 'profile', label: 'Profile' },
  { key: 'education', label: 'Education' },
  { key: 'skills', label: 'Skills' },
  { key: 'projects', label: 'Projects' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'resume', label: 'Resume' },
  { key: 'journey', label: 'Learning journey' },
  { key: 'contact', label: 'Contact' },
  { key: 'settings', label: 'Website settings' },
  { key: 'preview', label: 'Preview' },
]

function blankRecord(section: Section) {
  const id = crypto.randomUUID()
  if (section === 'education') return { id, title: 'New education entry', institution: '', location: '', period: '', status: 'Pursuing', detail: '' }
  if (section === 'skills') return { id, name: 'New skill', category: 'Data', status: 'Learning' }
  if (section === 'projects') return { id, name: 'New personal project', problem: '', description: '', technologies: [], dataset: '', findings: '', githubUrl: '', demoUrl: '', status: 'In Progress', published: false }
  if (section === 'certificates') return { id, title: 'New certificate', issuer: '', date: '', fileUrl: '', storagePath: null, verificationUrl: '', published: false }
  if (section === 'journey') return { id, title: 'New learning topic', status: 'Planned', detail: '' }
  return null
}

async function responseError(response: Response) {
  if (!response.headers.get('content-type')?.includes('application/json')) return `Request failed (${response.status})`
  const body = await response.json().catch(() => ({})) as { error?: string }
  return body.error || `Request failed (${response.status})`
}

function AdminApp() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [content, setContent] = useState<PortfolioContent>(portfolioData as PortfolioContent)
  const [section, setSection] = useState<Section>('profile')
  const [editor, setEditor] = useState(JSON.stringify(portfolioData.profile, null, 2))
  const [editorError, setEditorError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const loadAdminContent = async () => {
    const response = await fetch('/api/admin/content', { credentials: 'same-origin' })
    if (response.status === 401) {
      setAuthenticated(false)
      return
    }
    if (!response.ok) throw new Error(await responseError(response))
    const result = await response.json() as { draft?: PortfolioContent | null }
    const next = result.draft ?? portfolioData as PortfolioContent
    setContent(next)
    setEditor(JSON.stringify(section === 'preview' ? next.profile : next[section], null, 2))
    setAuthenticated(true)
  }

  useEffect(() => {
    if (!__PORTFOLIO_BACKEND_ENABLED__) {
      setMessage('Admin backend is not active in this static preview. Configure Supabase and use the Vercel deployment to sign in.')
      setChecking(false)
      return
    }
    let active = true
    fetch('/api/admin/content', { credentials: 'same-origin' })
      .then(async (response) => {
        if (response.status === 401 || response.status === 503) return null
        if (!response.ok) throw new Error(await responseError(response))
        return response.json() as Promise<{ draft?: PortfolioContent | null }>
      })
      .then((result) => {
        if (!active) return
        if (result) {
          const next = result.draft ?? portfolioData as PortfolioContent
          setContent(next)
          setEditor(JSON.stringify(next.profile, null, 2))
          setAuthenticated(true)
        }
      })
      .catch((error: Error) => { if (active) setMessage(error.message) })
      .finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    setSelectedIndex(0)
    setEditor(section === 'preview' ? '' : JSON.stringify(content[section], null, 2))
    setEditorError('')
  }, [section])

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!__PORTFOLIO_BACKEND_ENABLED__) {
      setMessage('Admin backend is not active in this static preview. Configure Supabase and use the Vercel deployment to sign in.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      await loadAdminContent()
      setPassword('')
      setMessage('Signed in securely.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  const signOut = async () => {
    setBusy(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' })
    } finally {
      setAuthenticated(false)
      setBusy(false)
      setMessage('You are signed out.')
    }
  }

  const updateEditor = (value: string) => {
    setEditor(value)
    try {
      const parsed = JSON.parse(value) as PortfolioContent[DataSection]
      if (section !== 'preview') {
        setContent((current) => ({ ...current, [section]: parsed }) as PortfolioContent)
      }
      setEditorError('')
    } catch {
      setEditorError('Invalid JSON. Fix the format before saving.')
    }
  }

  const addRecord = () => {
    if (section === 'preview') return
    const record = blankRecord(section)
    if (!record) return
    const values = content[section as DataSection] as unknown[]
    const next = [...values, record]
    setContent((current) => ({ ...current, [section]: next }) as PortfolioContent)
    setSelectedIndex(next.length - 1)
    setEditor(JSON.stringify(next, null, 2))
  }

  const removeSelected = () => {
    if (section === 'preview') return
    const values = content[section as DataSection] as unknown[]
    if (!values.length || !window.confirm('Remove this entry? This change is not published until you save or publish.')) return
    const next = values.filter((_, index) => index !== selectedIndex)
    setContent((current) => ({ ...current, [section]: next }) as PortfolioContent)
    setSelectedIndex(Math.max(0, selectedIndex - 1))
    setEditor(JSON.stringify(next, null, 2))
  }

  const saveContent = async (mode: 'draft' | 'publish') => {
    if (editorError) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, content }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      setMessage(mode === 'publish' ? 'Published to the public portfolio.' : 'Draft saved privately.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save content.')
    } finally {
      setBusy(false)
    }
  }

  const uploadFile = async (file?: File) => {
    if (!file) return
    if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      setMessage('Choose a PDF, PNG, or JPEG file up to 3 MB.')
      return
    }
    setBusy(true)
    setMessage('Uploading privately…')
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
        reader.onerror = () => reject(new Error('Could not read the selected file.'))
        reader.readAsDataURL(file)
      })
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, data }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      const result = await response.json() as { path: string }
      if (section === 'resume') {
        setContent((current) => ({ ...current, resume: { ...current.resume, storagePath: result.path, url: null, isPublic: false } }))
      } else if (section === 'certificates') {
        const certificates = [...content.certificates]
        const existing = certificates[selectedIndex]
        if (existing) certificates[selectedIndex] = { ...existing, storagePath: result.path, fileUrl: '' }
        else certificates.push({ id: crypto.randomUUID(), title: file.name, issuer: '', date: '', fileUrl: '', storagePath: result.path, verificationUrl: '', published: false })
        setContent((current) => ({ ...current, certificates }))
      }
      setMessage('Upload stored privately. Save as draft or explicitly publish to make it accessible.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New password confirmation does not match.')
      return
    }
    setBusy(true)
    try {
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage('Password updated.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update password.')
    } finally {
      setBusy(false)
    }
  }

  if (checking) return <main className="admin-loading">Checking admin session…</main>
  if (!authenticated) return (
    <main className="admin-login-page">
      <a className="admin-back" href={import.meta.env.BASE_URL}><ArrowLeft size={16} /> Portfolio</a>
      <section className="admin-login-panel">
        <div className="admin-mark"><Shield size={22} /></div>
        <p className="admin-eyebrow">PRIVATE CONTENT MANAGEMENT</p>
        <h1>Admin sign in</h1>
        <p>Sign in using the administrator account configured in Supabase.</p>
        <form onSubmit={signIn}>
          <label>Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button className="admin-primary" disabled={busy || !__PORTFOLIO_BACKEND_ENABLED__}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        {message && <p className="admin-message" role="status">{message}</p>}
        <p className="admin-security-note">Password is verified by Supabase Auth. This page does not store it in browser storage.</p>
      </section>
    </main>
  )

  const sectionIsCollection = ['education', 'skills', 'projects', 'certificates', 'journey'].includes(section)
  const records = sectionIsCollection ? content[section as DataSection] as unknown[] : []

  return <div className="admin-shell"><aside className="admin-sidebar"><a className="admin-brand" href="/"><span className="wordmark-mark">C<span>.</span></span><span>Portfolio admin</span></a><p className="admin-sidebar-label">CONTENT</p><nav aria-label="Admin sections">{sections.map((item) => <button key={item.key} className={section === item.key ? 'active' : ''} onClick={() => setSection(item.key)}>{item.label}</button>)}</nav><div className="admin-sidebar-bottom"><a href="/"><ArrowLeft size={15} /> View portfolio</a><button onClick={() => setSection('settings')}><UserRound size={15} /> Password & settings</button><button onClick={signOut} disabled={busy}><LogOut size={15} /> Sign out</button></div></aside>
    <main className="admin-main"><header className="admin-topbar"><div><p className="admin-eyebrow">CHANDAN KUMAR · PRIVATE WORKSPACE</p><h1>{sections.find((item) => item.key === section)?.label}</h1></div><span className="admin-auth-state"><span /> Authenticated admin</span></header>
      {message && <p className="admin-message" role="status">{message}</p>}
      {section === 'preview' ? <section className="admin-preview"><p className="admin-eyebrow">UNPUBLISHED PREVIEW</p><h2>{content.profile.name}</h2><p>{content.profile.headline}</p><p>{content.profile.intro}</p><h3>Education</h3>{content.education.map((entry) => <p key={entry.id}>{entry.title} · {entry.institution}</p>)}<h3>Projects ({content.projects.filter((project) => project.published).length} published)</h3>{content.projects.filter((project) => project.published).map((project) => <p key={project.id}>{project.name} · {project.status}</p>)}<h3>Skills</h3><p>{content.skills.map((skill) => `${skill.name} (${skill.status})`).join(' · ')}</p></section> : <section className="admin-editor"><div className="admin-editor-toolbar"><div><strong>Editable data</strong><span>{sectionIsCollection ? `${records.length} entries` : 'JSON configuration'}</span></div>{sectionIsCollection && <div className="admin-row-actions"><select aria-label="Select entry" value={selectedIndex} onChange={(event) => setSelectedIndex(Number(event.target.value))}>{records.map((record, index) => <option value={index} key={index}>{index + 1}. {String((record as { name?: string; title?: string }).name ?? (record as { title?: string }).title ?? 'Entry')}</option>)}</select><button onClick={addRecord}>Add entry</button><button className="admin-danger" onClick={removeSelected} disabled={!records.length}>Remove selected</button></div>}</div><label className="admin-json-label">{section} data<textarea spellCheck={false} value={editor} onChange={(event) => updateEditor(event.target.value)} aria-invalid={Boolean(editorError)} /></label>{editorError && <p className="admin-error" role="alert">{editorError}</p>}{(section === 'resume' || section === 'certificates') && <div className="admin-upload"><label className="admin-file-button"><Upload size={16} /> Upload PDF or image<input type="file" accept="application/pdf,image/png,image/jpeg" onChange={(event) => void uploadFile(event.target.files?.[0])} disabled={busy} /></label><span>Private by default · PDF/PNG/JPEG · maximum 3 MB</span></div>}</section>}
      <section className="admin-password"><details><summary>Change password</summary><form onSubmit={changePassword}><label>Current password<input type="password" autoComplete="current-password" required value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} /></label><label>New password<input type="password" autoComplete="new-password" minLength={12} required value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} /></label><label>Confirm new password<input type="password" autoComplete="new-password" required value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} /></label><button className="admin-secondary" disabled={busy}>Update password</button></form></details></section>
      <footer className="admin-footer"><span>{editorError ? 'Fix validation errors before saving.' : 'Draft changes stay private until you publish.'}</span><div><button className="admin-secondary" onClick={() => void saveContent('draft')} disabled={busy || Boolean(editorError)}><Save size={15} /> Save draft</button><button className="admin-primary" onClick={() => void saveContent('publish')} disabled={busy || Boolean(editorError)}><Eye size={15} /> Publish changes</button></div></footer>
    </main>
  </div>
}

export default AdminApp
