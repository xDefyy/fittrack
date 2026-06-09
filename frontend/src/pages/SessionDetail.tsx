import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API = 'http://localhost:8000'

interface Exercise {
  id: number
  exercise_name: string
  sets: number
  reps: number | null
  weight_kg: number | null
}

interface SessionDetail {
  id: number
  title: string
  date: string
  duration_minutes: number | null
  notes: string | null
  created_at: string
  user: { id: number; name: string; email: string }
  exercises: Exercise[]
}

export default function SessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API}/sessions/${id}`)
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setSession)
      .catch(() => setError('Session not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="empty-state">Loading…</p>
  if (error || !session) return <p className="empty-state">{error}</p>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-primary" onClick={() => navigate(-1)} style={{ padding: '0.3rem 0.7rem' }}>← Back</button>
        <h1>{session.title}</h1>
      </div>

      <div className="card">
        <h2>Session Info</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Date</span>
            <span className="detail-value">{session.date}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Duration</span>
            <span className="detail-value">{session.duration_minutes ? `${session.duration_minutes} min` : '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Logged at</span>
            <span className="detail-value">{new Date(session.created_at).toLocaleString()}</span>
          </div>
          {session.notes && (
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <span className="detail-label">Notes</span>
              <span className="detail-value">{session.notes}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Athlete</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Name</span>
            <span className="detail-value">{session.user.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">{session.user.email}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Exercises</h2>
        {session.exercises.length === 0 ? (
          <p className="empty-state">No exercises logged.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Sets</th>
                <th>Reps</th>
                <th>Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              {session.exercises.map(ex => (
                <tr key={ex.id}>
                  <td>{ex.exercise_name}</td>
                  <td>{ex.sets}</td>
                  <td>{ex.reps ?? '—'}</td>
                  <td>{ex.weight_kg ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
