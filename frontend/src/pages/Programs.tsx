import { useState, useEffect } from 'react'

const API = 'http://localhost:8000'

interface Program {
  id: number
  user_id: number
  name: string
  description: string | null
  active: boolean
}

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ user_id: '', name: '', description: '' })
  const [status, setStatus] = useState('')

  async function load() {
    try {
      const res = await fetch(`${API}/programs`)
      setPrograms(await res.json())
    } catch {
      setStatus('Could not reach the API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('')
    try {
      const res = await fetch(`${API}/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(form.user_id),
          name: form.name,
          description: form.description || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        setStatus(err.detail ?? 'Error creating program')
        return
      }
      setForm({ user_id: '', name: '', description: '' })
      setStatus('Program created')
      load()
    } catch {
      setStatus('Could not reach the API')
    }
  }

  async function handleDelete(id: number) {
    await fetch(`${API}/programs/${id}`, { method: 'DELETE' })
    setPrograms(p => p.filter(x => x.id !== id))
  }

  async function toggleActive(prog: Program) {
    await fetch(`${API}/programs/${prog.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !prog.active }),
    })
    setPrograms(ps => ps.map(p => p.id === prog.id ? { ...p, active: !p.active } : p))
  }

  return (
    <div>
      <div className="page-header">
        <h1>Programs</h1>
      </div>

      <div className="card">
        <h2>New program</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>User ID</label>
              <input
                type="number"
                value={form.user_id}
                onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                required
                placeholder="1"
                style={{ minWidth: 80 }}
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                placeholder="PPL Beginner"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <button type="submit" className="btn btn-primary">Add</button>
          </div>
          {status && (
            <p className={`status-msg${status.startsWith('Error') || status.startsWith('Could') ? ' error' : ''}`}>
              {status}
            </p>
          )}
        </form>
      </div>

      <div className="card">
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : programs.length === 0 ? (
          <p className="empty-state">No programs yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {programs.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.description ?? '—'}</td>
                  <td>
                    <span
                      className={`badge ${p.active ? 'badge-green' : 'badge-gray'}`}
                      onClick={() => toggleActive(p)}
                      title="Click to toggle"
                    >
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
