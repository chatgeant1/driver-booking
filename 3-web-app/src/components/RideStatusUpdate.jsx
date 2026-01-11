import React, { useState } from 'react'

const RIDE_URL = import.meta.env.VITE_RIDE_SERVICE_URL || 'http://localhost:3003'

export default function RideStatusUpdate({ rideId, onStatusUpdate }) {
  const [status, setStatus] = useState('STARTED')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const statuses = ['DRIVER_ARRIVED', 'STARTED', 'COMPLETED']

  async function handleUpdate(e) {
    e.preventDefault()
    try {
      setLoading(true)
      const r = await fetch(`${RIDE_URL}/rides/${rideId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status,
          timestamp: new Date().toISOString()
        })
      })
      const j = await r.json()
      setMsg('Status updated: ' + j.status)
      if (onStatusUpdate) onStatusUpdate(j)
    } catch (e) {
      setMsg('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpdate} style={{ marginTop: 8, padding: 8, background: '#f9f9f9', borderRadius: 4 }}>
      <h5>Cập nhật Trạng thái</h5>
      <select value={status} onChange={e => setStatus(e.target.value)}>
        {statuses.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
        {loading ? 'Updating...' : 'Update'}
      </button>
      <p className="msg">{msg}</p>
    </form>
  )
}