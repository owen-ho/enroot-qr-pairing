import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || ''

function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [token, setToken] = useState(null)
  
  const [participants, setParticipants] = useState([])
  const [stats, setStats] = useState({ total: 0, paired: 0, waiting: 0, activePairings: 0 })
  const [loading, setLoading] = useState(true)
  
  const [selectedPair, setSelectedPair] = useState({ p1: '', p2: '' })

  // Check for existing token
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken')
    if (savedToken) {
      setToken(savedToken)
      setIsLoggedIn(true)
      fetchData(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  // Auto-refresh data every 5 seconds when logged in
  useEffect(() => {
    if (!isLoggedIn || !token) return

    const interval = setInterval(() => {
      fetchData(token)
    }, 5000)

    return () => clearInterval(interval)
  }, [isLoggedIn, token])

  const fetchData = async (authToken) => {
    try {
      const [participantsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/participants`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }),
        fetch(`${API_URL}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      ])

      if (!participantsRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const participantsData = await participantsRes.json()
      const statsData = await statsRes.json()

      setParticipants(participantsData.participants)
      setStats(statsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoggingIn(true)

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (!response.ok) {
        throw new Error('Invalid password')
      }

      const data = await response.json()
      localStorage.setItem('adminToken', data.token)
      setToken(data.token)
      setIsLoggedIn(true)
      toast.success('Logged in successfully')
      fetchData(data.token)
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Invalid password')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
    setIsLoggedIn(false)
    setPassword('')
    toast.success('Logged out')
  }

  const handleManualPair = async () => {
    if (!selectedPair.p1 || !selectedPair.p2) {
      toast.error('Please select two participants')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/pair`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participant1Id: parseInt(selectedPair.p1),
          participant2Id: parseInt(selectedPair.p2)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to pair')
      }

      toast.success('Participants paired successfully')
      setSelectedPair({ p1: '', p2: '' })
      fetchData(token)
    } catch (error) {
      console.error('Pairing error:', error)
      toast.error(error.message)
    }
  }

  const handleUnpair = async (pairingId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/unpair/${pairingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to unpair')
      }

      toast.success('Pairing broken successfully')
      fetchData(token)
    } catch (error) {
      console.error('Unpair error:', error)
      toast.error('Failed to unpair')
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to reset')
      }

      toast.success('Database reset successfully')
      fetchData(token)
    } catch (error) {
      console.error('Reset error:', error)
      toast.error('Failed to reset database')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="container">
        <h1>🔐 Admin Login</h1>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loggingIn}>
            {loggingIn ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container admin-container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  const waitingParticipants = participants.filter(p => p.status === 'waiting')

  return (
    <div className="container admin-container">
      <div className="admin-header">
        <h1>📊 Admin Dashboard</h1>
        <button className="btn btn-secondary btn-small" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Participants</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.paired}</div>
          <div className="stat-label">Paired</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.waiting}</div>
          <div className="stat-label">Waiting</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activePairings}</div>
          <div className="stat-label">Active Pairings</div>
        </div>
      </div>

      <h2>Manual Pairing</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', alignItems: 'flex-end' }}>
        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
          <label>Participant 1</label>
          <select 
            value={selectedPair.p1} 
            onChange={(e) => setSelectedPair({ ...selectedPair, p1: e.target.value })}
          >
            <option value="">Select participant</option>
            {waitingParticipants.map(p => (
              <option key={p.id} value={p.id}>{p.slug}</option>
            ))}
          </select>
        </div>
        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
          <label>Participant 2</label>
          <select 
            value={selectedPair.p2} 
            onChange={(e) => setSelectedPair({ ...selectedPair, p2: e.target.value })}
          >
            <option value="">Select participant</option>
            {waitingParticipants.map(p => (
              <option key={p.id} value={p.id}>{p.slug}</option>
            ))}
          </select>
        </div>
        <button 
          className="btn btn-primary btn-small" 
          onClick={handleManualPair}
          disabled={!selectedPair.p1 || !selectedPair.p2}
        >
          Pair
        </button>
      </div>

      <h2>All Participants</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Partner</th>
              <th>Joined At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>
                  No participants yet
                </td>
              </tr>
            ) : (
              participants.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><strong>{p.slug}</strong></td>
                  <td>
                    <span className={`status-badge status-${p.status}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.partner_slug || '-'}</td>
                  <td>{new Date(p.joined_at).toLocaleString()}</td>
                  <td>
                    {p.pairing_id && (
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleUnpair(p.pairing_id)}
                      >
                        Unpair
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button className="btn btn-danger" onClick={handleReset}>
        Reset All Data (New Event)
      </button>
    </div>
  )
}

export default AdminPage
