import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface ExerciseOption {
  id: number
  name: string
  type: string
  description: string
  muscles: { name: string; role: string }[]
}

interface ExerciseRow {
  exercise_name: string
  sets: number
  reps: number | null
  weight_kg: number | null
}

interface Session {
  id: number
  title: string
  date: string
  duration_minutes: number | null
  notes: string | null
  total_weight: number
}

const API = 'http://localhost:8000'

interface Props {
  exercises: ExerciseOption[]
}

export default function Sessions({ exercises: exerciseOptions }: Props) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState<ExerciseRow[]>([
    { exercise_name: '', sets: 3, reps: null, weight_kg: null }
  ])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user.id) return
    fetch(`${API}/sessions?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not load sessions'))
      .finally(() => setLoading(false))

  }, [])

  function getExerciseInfo(name: string) {
    return exerciseOptions.find(e => e.name === name) || null
  }

  function updateExercise(index: number, field: keyof ExerciseRow, value: string) {
    setExercises(prev => prev.map((ex, i) =>
      i === index ? { ...ex, [field]: value === '' ? null : isNaN(Number(value)) ? value : Number(value) } : ex
    ))
  }

  function addExercise() {
    setExercises(prev => [...prev, { exercise_name: '', sets: 3, reps: null, weight_kg: null }])
  }

  function removeExercise(index: number) {
    setExercises(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const res = await fetch(`${API}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        title,
        date,
        duration_minutes: duration ? Number(duration) : null,
        notes: notes || null,
        exercises: exercises.filter(ex => ex.exercise_name.trim() !== '')
      }),
    })

    if (!res.ok) {
      setError('Failed to save session')
      return
    }

    const newSession = await res.json()
    setSessions(prev => [newSession, ...prev])
    setTitle('')
    setNotes('')
    setDuration('')
    setExercises([{ exercise_name: '', sets: 3, reps: null, weight_kg: null }])
  }

  async function handleDelete(id: number) {
    await fetch(`${API}/sessions/${id}`, { method: 'DELETE' })
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div>
      <div className="page-header">
        <h1>Workout Sessions</h1>
      </div>

      <div className="card">
        <h2>New Session</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Leg day" required />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Duration (min)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="60" />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>Notes</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <p className="section-label">Exercises</p>
            {exercises.map((ex, i) => {
              const info = getExerciseInfo(ex.exercise_name)
              return (
                <div key={i} style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px solid #e4e4e7', borderRadius: '6px' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Exercise</label>
                      <select
                        value={ex.exercise_name}
                        onChange={e => updateExercise(i, 'exercise_name', e.target.value)}
                      >
                        <option value="">Select an exercise</option>
                        {exerciseOptions.map(opt => (
                          <option key={opt.id} value={opt.name}>{opt.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Sets</label>
                      <input type="number" value={ex.sets} onChange={e => updateExercise(i, 'sets', e.target.value)} style={{ width: 70 }} />
                    </div>
                    <div className="form-group">
                      <label>Reps</label>
                      <input type="number" value={ex.reps ?? ''} onChange={e => updateExercise(i, 'reps', e.target.value)} placeholder="—" style={{ width: 70 }} />
                    </div>
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input type="number" value={ex.weight_kg ?? ''} onChange={e => updateExercise(i, 'weight_kg', e.target.value)} placeholder="—" style={{ width: 80 }} />
                    </div>
                    {exercises.length > 1 && (
                      <button type="button" className="btn btn-danger" style={{ marginTop: '1.1rem' }} onClick={() => removeExercise(i)}>✕</button>
                    )}
                  </div>

                  {info && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#52525b' }}>
                      <p>{info.description}</p>
                      {info.muscles.length > 0 && (
                        <p style={{ marginTop: '0.3rem' }}>
                          <strong>Muscles: </strong>
                          {info.muscles.map(m => (
                            <span key={m.name} style={{
                              display: 'inline-block',
                              marginRight: '0.3rem',
                              padding: '0.1rem 0.5rem',
                              borderRadius: '999px',
                              background: m.role === 'primary' ? '#18181b' : '#e4e4e7',
                              color: m.role === 'primary' ? '#fff' : '#52525b',
                              fontSize: '0.72rem'
                            }}>
                              {m.name}
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            <button type="button" className="btn btn-primary" onClick={addExercise}>+ Add exercise</button>
          </div>

          {error && <p className="status-msg error">{error}</p>}

          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary">Save session</button>
          </div>
        </form>
      </div>

      {loading && <p className="empty-state">Loading…</p>}

      {sessions.map(s => (
        <div key={s.id} className="card session-card" onClick={() => navigate(`/sessions/${s.id}`)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontWeight: 600 }}>{s.title}</p>
              <p style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '0.2rem' }}>
                {s.date}{s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}{s.total_weight > 0 ? ` · ${s.total_weight} kg lifted` : ''}
              </p>
              {s.notes && <p style={{ fontSize: '0.82rem', color: '#52525b', marginTop: '0.4rem' }}>{s.notes}</p>}
            </div>
            <button className="btn btn-danger" onClick={e => { e.stopPropagation(); handleDelete(s.id) }}>Delete</button>
          </div>
        </div>
      ))}

      {!loading && sessions.length === 0 && <p className="empty-state">No sessions yet. Log your first workout!</p>}
    </div>
  )
}
