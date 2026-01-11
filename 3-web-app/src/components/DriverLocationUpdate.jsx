import React, { useState } from 'react'

const DRIVER_URL = import.meta.env.VITE_DRIVER_SERVICE_URL || 'http://localhost:3002'

export default function DriverLocationUpdate({ driverId, onUpdate }) {
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUpdateLocation(e) {
    e.preventDefault()
    if (!lat || !lon) {
      setMsg('Vui lòng nhập lat/lon')
      return
    }
    try {
      setLoading(true)
      const r = await fetch(`${DRIVER_URL}/drivers/${driverId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          timestamp: new Date().toISOString()
        })
      })
      const j = await r.json()
      setMsg('Location updated: ' + (j.status || 'success'))
      setLat('')
      setLon('')
      if (onUpdate) onUpdate(j)
    } catch (e) {
      setMsg('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  function getCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        setLat(pos.coords.latitude)
        setLon(pos.coords.longitude)
      }, err => setMsg('Location error: ' + err.message))
    } else {
      setMsg('Geolocation not supported')
    }
  }

  return (
    <form onSubmit={handleUpdateLocation} style={{ marginBottom: 12, border: '1px solid #ccc', padding: 8 }}>
      <h4>Cập nhật Vị trí (Real-time)</h4>
      <div>
        <input type="number" step="0.0001" placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} />
        <input type="number" step="0.0001" placeholder="Longitude" value={lon} onChange={e => setLon(e.target.value)} style={{ marginLeft: 6 }} />
      </div>
      <div style={{ marginTop: 6 }}>
        <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Location'}</button>
        <button type="button" onClick={getCurrentLocation} style={{ marginLeft: 6 }}>📍 Get Current</button>
      </div>
      <p className="msg">{msg}</p>
    </form>
  )
}