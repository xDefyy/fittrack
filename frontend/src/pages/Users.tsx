import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:8000'

interface User {
  id: number
  name: string
  email: string
}

export default function Users() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = currentUser.is_admin === true
  const navigate = useNavigate()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password_hash: '' })
  const [status, setStatus] = useState('')

  async function load() {
    try {
      const res = await fetch(`${API}/users?page=1&limit=100`)
      const data = await res.json()
      setUsers(Array.isArray(data.data) ? data.data : [])
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
    const res = await fetch(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const err = await res.json()
      setStatus(err.detail ?? 'Error creating user')
      return
    }
    setForm({ name: '', email: '', password_hash: '' })
    setStatus('User created')
    load()
  }

  async function handleDelete(id: number) {
    await fetch(`${API}/users/${id}`, { method: 'DELETE' })
    setUsers(u => u.filter(x => x.id !== id))
  }

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
      </div>

      {isAdmin && (
        <div className="card">
          <h2>New user</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Alice Martin"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="alice@example.com"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password_hash}
                  onChange={e => setForm(f => ({ ...f, password_hash: e.target.value }))}
                  required
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="btn btn-primary">Add</button>
            </div>
            {status && <p className={`status-msg${status.includes('Error') ? ' error' : ''}`}>{status}</p>}
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : users.length === 0 ? (
          <p className="empty-state">No users found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    <span
                      onClick={() => navigate(`/profile/${u.id}`)}
                      style={{ cursor: 'pointer', fontWeight: 500, textDecoration: 'underline' }}
                    >
                      {u.name}
                    </span>
                  </td>
                  <td>{u.email}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
