import { useState } from 'react'

const API = 'http://localhost:8000'

export default function Stats() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [exercise, setExercise] = useState('')
  const [progression, setProgression] = useState<any[]>([])
  const [volume, setVolume] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function loadStats() {
    if (!exercise.trim()) return
    setLoading(true)
    try {
      const [prog, vol] = await Promise.all([
        fetch(`${API}/stats/progression?user_id=${user.id}&exercise=${encodeURIComponent(exercise)}`).then(r => r.json()),
        fetch(`${API}/stats/volume?user_id=${user.id}`).then(r => r.json()),
      ])
      setProgression(Array.isArray(prog) ? prog : [])
      setVolume(Array.isArray(vol) ? vol : [])
    } catch {
      // show empty state on error
    } finally {
      setSearched(true)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Stats</h1>
      </div>

      <div className="card">
        <h2>Exercise Progression</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Exercise</label>
            <input
              value={exercise}
              onChange={e => setExercise(e.target.value)}
              placeholder="Bench Press"
            />
          </div>
          <button className="btn btn-primary" onClick={loadStats}>Search</button>
        </div>
      </div>

      {loading && <p className="empty-state">Loading...</p>}

      {searched && !loading && (
        <>
          <div className="card">
            <h2>Max weight by date — {exercise}</h2>
            {progression.length === 0 ? (
              <p className="empty-state">No data for this exercise.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Max weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {progression.map((p, i) => (
                    <tr key={i}>
                      <td>{p.date}</td>
                      <td>{p.max_weight ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h2>Total volume lifted per session</h2>
            {volume.length === 0 ? (
              <p className="empty-state">No data available.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Volume total (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {volume.map((v, i) => (
                    <tr key={i}>
                      <td>{v.date}</td>
                      <td>{v.total_volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
