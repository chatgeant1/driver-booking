import React, { useState } from 'react'

const RIDE_URL = import.meta.env.VITE_RIDE_SERVICE_URL || 'http://localhost:3003'

export default function RideCancel({ rideId, userId, onCancel }) {
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!confirm('Bạn chắc chắn muốn hủy chuyến đi?')) return
    try {
      setLoading(true)
      const r = await fetch(`${RIDE_URL}/rides/${rideId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })
      const j = await r.json()
      setMsg('Ride canceled: ' + j.status)
      if (onCancel) onCancel(j)
    } catch (e) {
      setMsg('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={handleCancel} disabled={loading} style={{ background: '#dc3545', color: '#fff', padding: '6px 12px' }}>
        {loading ? 'Canceling...' : '❌ Cancel Ride'}
      </button>
      <p className="msg">{msg}</p>
    </div>
  )
}