import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:8000'

interface Program {
  id: number
  user_id: number
  name: string
  description: string | null
  active: boolean
}

interface WorkoutExercise {
  exercise_name: string
  sets: number
  reps: number | null
  weight_kg: number | null
}

interface WorkoutType {
  id: number
  name: string
  week_day: string | null
  exercises: WorkoutExercise[]
}

interface ProgramWorkout {
  id: number
  name: string
  description: string | null
  workout_types: WorkoutType[]
}

export default function Programs() {
  const navigate = useNavigate()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ user_id: '', name: '', description: '' })
  const [status, setStatus] = useState('')
  const [selectedWorkout, setSelectedWorkout] = useState<ProgramWorkout | null>(null)

  async function load() {
    try {
      const res = await fetch(`${API}/programs`)
      const data = await res.json()
      setPrograms(Array.isArray(data) ? data : [])
    } catch {
      setStatus('Could not reach the API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function openWorkout(id: number) {
    const res = await fetch(`${API}/programs/${id}/workout`)
    if (!res.ok) return
    const data: ProgramWorkout = await res.json()
    setSelectedWorkout(data)
  }

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

  function startSession(workout: WorkoutType, programName: string) {
    navigate('/sessions', {
      state: {
        prefilled: workout.exercises,
        programTitle: `${programName} — ${workout.name}`
      }
    })
    setSelectedWorkout(null)
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
                  <td>
                    <span
                      onClick={() => openWorkout(p.id)}
                      style={{ cursor: 'pointer', fontWeight: 500, textDecoration: 'underline' }}
                    >
                      {p.name}
                    </span>
                  </td>
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

      {selectedWorkout && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: 540, width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '0.25rem' }}>{selectedWorkout.name}</h2>
            {selectedWorkout.description && (
              <p style={{ color: '#71717a', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {selectedWorkout.description}
              </p>
            )}

            {selectedWorkout.workout_types.length === 0 ? (
              <p className="empty-state">No exercises in this program yet.</p>
            ) : (
              selectedWorkout.workout_types.map(wt => (
                <div key={wt.id} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e4e4e7' }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                    {wt.name}{wt.week_day ? ` — ${wt.week_day}` : ''}
                  </p>
                  <table>
                    <thead>
                      <tr>
                        <th>Exercise</th>
                        <th>Sets</th>
                        <th>Reps</th>
                        <th>Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wt.exercises.map((ex, i) => (
                        <tr key={i}>
                          <td>{ex.exercise_name}</td>
                          <td>{ex.sets}</td>
                          <td>{ex.reps ?? '—'}</td>
                          <td>{ex.weight_kg ? `${ex.weight_kg} kg` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '0.75rem' }}
                    onClick={() => startSession(wt, selectedWorkout.name)}
                  >
                    Start this session
                  </button>
                </div>
              ))
            )}

            <button className="btn btn-danger" onClick={() => setSelectedWorkout(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
