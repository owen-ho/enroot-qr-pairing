import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || ''

function ParticipantPage() {
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [slug, setSlug] = useState(null)
  const [status, setStatus] = useState('waiting')
  const [partner, setPartner] = useState(null)
  const [token, setToken] = useState(null)

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('participantToken')
    if (savedToken) {
      setToken(savedToken)
      fetchStatus(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  // Poll for status updates
  useEffect(() => {
    if (!token) return

    const interval = setInterval(() => {
      fetchStatus(token)
    }, 4000) // Poll every 4 seconds

    return () => clearInterval(interval)
  }, [token])

  const fetchStatus = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/api/status`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch status')
      }

      const data = await response.json()
      setSlug(data.slug)
      setStatus(data.status)
      
      // Show notification when paired
      if (data.paired && !partner && data.partner) {
        toast.success(`You've been paired with ${data.partner.slug}! Meet them at the entrance.`, {
          duration: 6000,
          icon: '🎉'
        })
      }
      
      setPartner(data.partner)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching status:', error)
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    setJoining(true)
    
    try {
      const response = await fetch(`${API_URL}/api/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to join')
      }

      const data = await response.json()
      
      // Save token to localStorage
      localStorage.setItem('participantToken', data.token)
      setToken(data.token)
      setSlug(data.slug)
      setStatus(data.paired ? 'paired' : 'waiting')
      setPartner(data.partner)
      
      if (data.paired) {
        toast.success(`You've been paired with ${data.partner.slug}! Meet them at the entrance.`, {
          duration: 6000,
          icon: '🎉'
        })
      } else {
        toast.success('Welcome! Looking for a partner...', {
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Error joining:', error)
      toast.error('Failed to join the event. Please try again.')
    } finally {
      setJoining(false)
    }
  }

  const handleUnpair = async () => {
    try {
      const response = await fetch(`${API_URL}/api/unpair`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to unpair')
      }

      const data = await response.json()
      setStatus(data.paired ? 'paired' : 'waiting')
      setPartner(data.partner)
      
      if (data.paired) {
        toast.success(`You've been re-paired with ${data.partner.slug}!`, {
          duration: 5000,
          icon: '🎉'
        })
      } else {
        toast('Looking for a new partner...', {
          icon: '🔍'
        })
      }
    } catch (error) {
      console.error('Error unpairing:', error)
      toast.error('Failed to unpair. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="container">
        <h1>🎨 Arts & Crafts Event</h1>
        <p className="subtitle">Welcome! Join the event to be paired with a partner for gift exchange.</p>
        
        <div className="stations-info">
          <div className="stations-title">Available Stations:</div>
          <ul className="stations-list">
            <li>Tote bag decoration</li>
            <li>Origami crafts</li>
            <li>Bead bracelets</li>
            <li>Keychain painting</li>
          </ul>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleJoin}
          disabled={joining}
        >
          {joining ? 'Joining...' : 'Join Event'}
        </button>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>🎨 Arts & Crafts Event</h1>
      
      <div className="slug-display">
        <div className="slug-label">Your ID</div>
        <div className="slug-value">{slug}</div>
      </div>

      <div className="status-card">
        {status === 'paired' && partner ? (
          <>
            <div className="status-icon">🎉</div>
            <div className="status-text">You're paired!</div>
            
            <div className="partner-info">
              <div className="partner-label">Your Partner</div>
              <div className="partner-slug">{partner.slug}</div>
            </div>

            <div className="meeting-point">
              <div className="meeting-point-text">
                📍 <strong>Meet at the entrance</strong> to start creating gifts together!
              </div>
            </div>

            <button 
              className="btn btn-danger" 
              onClick={handleUnpair}
              style={{ marginTop: '20px' }}
            >
              My Partner Left
            </button>
          </>
        ) : (
          <>
            <div className="status-icon">⏳</div>
            <div className="status-text">Looking for a partner...</div>
            <p style={{ color: '#888', fontSize: '0.9em', marginTop: '10px' }}>
              You'll be notified when someone joins!
            </p>
          </>
        )}
      </div>

      <div className="stations-info">
        <div className="stations-title">Visit These Stations:</div>
        <ul className="stations-list">
          <li>Tote bag decoration</li>
          <li>Origami crafts</li>
          <li>Bead bracelets</li>
          <li>Keychain painting</li>
        </ul>
      </div>
    </div>
  )
}

export default ParticipantPage
