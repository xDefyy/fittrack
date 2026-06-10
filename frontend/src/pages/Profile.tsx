import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API = 'http://localhost:8000'

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const [profile, setProfile] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [followers, setFollowers] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  const isOwnProfile = currentUser.id === Number(id)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/users/${id}`).then(r => r.json()),
      fetch(`${API}/sessions?user_id=${id}`).then(r => r.json()),
      fetch(`${API}/users/${id}/followers`).then(r => r.json()),
    ]).then(([user, sess, followerData]) => {
      setProfile(user)
      setSessions(Array.isArray(sess) ? sess : [])
      setFollowers(followerData.count)
      const alreadyFollowing = followerData.followers.some((f: any) => f.id === currentUser.id)
      setIsFollowing(alreadyFollowing)
    }).finally(() => setLoading(false))
  }, [id])

  async function handleFollow() {
    await fetch(`${API}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_id: currentUser.id, target_id: Number(id) }),
    })
    setIsFollowing(true)
    setFollowers(f => f + 1)
  }

  async function handleUnfollow() {
    await fetch(`${API}/follow`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_id: currentUser.id, target_id: Number(id) }),
    })
    setIsFollowing(false)
    setFollowers(f => f - 1)
  }

  if (loading) return <p className="empty-state">Loading...</p>
  if (!profile) return <p className="empty-state">User not found</p>

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{profile.name}</h1>
            <p style={{ color: '#71717a', fontSize: '0.875rem', marginTop: '0.2rem' }}>{profile.email}</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              <strong>{followers}</strong> follower{followers !== 1 ? 's' : ''}
            </p>
          </div>

          {!isOwnProfile && (
            <button
              className={isFollowing ? 'btn btn-danger' : 'btn btn-primary'}
              onClick={isFollowing ? handleUnfollow : handleFollow}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <div className="page-header">
        <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Sessions</h2>
      </div>

      {sessions.length === 0 ? (
        <p className="empty-state">No sessions yet.</p>
      ) : (
        sessions.map(s => (
          <div className="card session-card" key={s.id} onClick={() => navigate(`/sessions/${s.id}`)} style={{ cursor: 'pointer' }}>
            <p style={{ fontWeight: 600 }}>{s.title}</p>
            <p style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '0.2rem' }}>
              {s.date}{s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}{s.total_weight > 0 ? ` · ${s.total_weight} kg soulevés` : ''}
            </p>
            {s.notes && <p style={{ fontSize: '0.82rem', marginTop: '0.3rem' }}>{s.notes}</p>}
          </div>
        ))
      )}
    </div>
  )
}
