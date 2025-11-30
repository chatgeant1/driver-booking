import React, { useState } from 'react'

const DRIVER_URL = import.meta.env.VITE_DRIVER_SERVICE_URL || 'http://localhost:3002'

export default function DriverStatusUpdate({ driverId, currentStatus, onUpdate }) {
  const [status, setStatus] = useState(currentStatus || 'offline')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUpdateStatus(e) {
    e.preventDefault()
    try {
      setLoading(true)
      const r = await fetch(`${DRIVER_URL}/drivers/${driverId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_online: status === 'available' })
      })
      const j = await r.json()
      setMsg('Status updated')
      if (onUpdate) onUpdate(j)
    } catch (e) {
      setMsg('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpdateStatus} style={{ marginBottom: 12, border: '1px solid #ccc', padding: 8 }}>
      <h4>Cập nhật Trạng thái</h4>
      <div>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="offline">Offline</option>
          <option value="available">Available</option>
          <option value="busy">Busy</option>
        </select>
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update'}</button>
      <p className="msg">{msg}</p>
    </form>
  )
}