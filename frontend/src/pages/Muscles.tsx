import { useState, useEffect } from 'react'

const API = 'http://localhost:8000'

const GROUPS = ['Legs', 'Chest', 'Back', 'Arms', 'Core', 'Shoulders']

interface Muscle {
  id: number
  name: string
  group_name: string
}

export default function Muscles() {
  const [muscles, setMuscles] = useState<Muscle[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', group_name: '' })
  const [status, setStatus] = useState('')

  async function load() {
    try {
      const res = await fetch(`${API}/muscles`)
      setMuscles(await res.json())
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
      const res = await fetch(`${API}/muscles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        setStatus(err.detail ?? 'Error creating muscle')
        return
      }
      setForm({ name: '', group_name: '' })
      setStatus('Muscle added')
      load()
    } catch {
      setStatus('Could not reach the API')
    }
  }

  async function handleDelete(id: number) {
    await fetch(`${API}/muscles/${id}`, { method: 'DELETE' })
    setMuscles(m => m.filter(x => x.id !== id))
  }

  const grouped = muscles.reduce<Record<string, Muscle[]>>((acc, m) => {
    ;(acc[m.group_name] ??= []).push(m)
    return acc
  }, {})

  return (
    <div>
      <div className="page-header">
        <h1>Muscles</h1>
      </div>

      <div className="card">
        <h2>New muscle</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                placeholder="Quadriceps"
              />
            </div>
            <div className="form-group">
              <label>Group</label>
              <select
                value={form.group_name}
                onChange={e => setForm(f => ({ ...f, group_name: e.target.value }))}
                required
              >
                <option value="">Select group</option>
                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
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

      {loading ? (
        <div className="card"><p className="empty-state">Loading…</p></div>
      ) : muscles.length === 0 ? (
        <div className="card"><p className="empty-state">No muscles yet.</p></div>
      ) : (
        Object.entries(grouped).map(([group, list]) => (
          <div className="card" key={group}>
            <h2>{group}</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map(m => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.name}</td>
                    <td>
                      <button className="btn btn-danger" onClick={() => handleDelete(m.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  )
}
