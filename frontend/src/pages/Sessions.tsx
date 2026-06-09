import { useEffect, useState } from 'react'

interface Exercise {
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
}

const API = 'http://localhost:8000'

export default function Sessions() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [sessions, setSessions] = useState<Session[]>([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([
    { exercise_name: '', sets: 3, reps: null, weight_kg: null }
  ])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API}/sessions?user_id=${user.id}`)
      .then(r => r.json())
      .then(setSessions)
  }, [])

  function updateExercise(index: number, field: keyof Exercise, value: string) {
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
            {exercises.map((ex, i) => (
              <div key={i} className="form-row" style={{ marginBottom: '0.5rem' }}>
                <div className="form-group">
                  <label>Exercise</label>
                  <input
                    value={ex.exercise_name}
                    onChange={e => updateExercise(i, 'exercise_name', e.target.value)}
                    placeholder="Squat"
                  />
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
            ))}
            <button type="button" className="btn btn-primary" style={{ marginTop: '0.25rem' }} onClick={addExercise}>+ Add exercise</button>
          </div>

          {error && <p className="status-msg error">{error}</p>}

          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary">Save session</button>
          </div>
        </form>
      </div>

      {sessions.map(s => (
        <div key={s.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontWeight: 600 }}>{s.title}</p>
              <p style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '0.2rem' }}>
                {s.date}{s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}
              </p>
              {s.notes && <p style={{ fontSize: '0.82rem', color: '#52525b', marginTop: '0.4rem' }}>{s.notes}</p>}
            </div>
            <button className="btn btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
          </div>
        </div>
      ))}

      {sessions.length === 0 && <p className="empty-state">No sessions yet. Log your first workout!</p>}
    </div>
  )
}
