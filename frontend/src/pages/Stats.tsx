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

    const [prog, vol] = await Promise.all([
      fetch(`${API}/stats/progression?user_id=${user.id}&exercise=${encodeURIComponent(exercise)}`).then(r => r.json()),
      fetch(`${API}/stats/volume?user_id=${user.id}`).then(r => r.json()),
    ])

    setProgression(Array.isArray(prog) ? prog : [])
    setVolume(Array.isArray(vol) ? vol : [])
    setSearched(true)
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Stats</h1>
      </div>

      <div className="card">
        <h2>Progression sur un exercice</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Exercice</label>
            <input
              value={exercise}
              onChange={e => setExercise(e.target.value)}
              placeholder="Bench Press"
            />
          </div>
          <button className="btn btn-primary" onClick={loadStats}>Voir</button>
        </div>
      </div>

      {loading && <p className="empty-state">Chargement...</p>}

      {searched && !loading && (
        <>
          <div className="card">
            <h2>Poids max par date — {exercise}</h2>
            {progression.length === 0 ? (
              <p className="empty-state">Aucune donnée pour cet exercice.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Poids max (kg)</th>
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
            <h2>Volume total soulevé par séance</h2>
            {volume.length === 0 ? (
              <p className="empty-state">Aucune donnée.</p>
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
