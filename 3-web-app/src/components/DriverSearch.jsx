import React, { useState } from 'react'

const DRIVER_URL = import.meta.env.VITE_DRIVER_SERVICE_URL || 'http://localhost:3002'

export default function DriverSearch({ onResults }) {
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [radius, setRadius] = useState(5)
  const [results, setResults] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!lat || !lon) {
      setMsg('Vui lòng nhập lat/lon')
      return
    }
    try {
      setLoading(true)
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        radius: radius
      })
      const r = await fetch(`${DRIVER_URL}/drivers/search?${params}`)
      const j = await r.json()
      setResults(j || [])
      setMsg(`Found ${(j || []).length} drivers`)
      if (onResults) onResults(j)
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
    <div style={{ marginBottom: 12, border: '1px solid #ccc', padding: 8 }}>
      <h4>Tìm Tài xế Gần đó</h4>
      <form onSubmit={handleSearch}>
        <div>
          <input type="number" step="0.0001" placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} />
          <input type="number" step="0.0001" placeholder="Longitude" value={lon} onChange={e => setLon(e.target.value)} style={{ marginLeft: 6 }} />
        </div>
        <div style={{ marginTop: 6 }}>
          <input type="number" min="1" max="50" placeholder="Radius (km)" value={radius} onChange={e => setRadius(e.target.value)} />
        </div>
        <div style={{ marginTop: 6 }}>
          <button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
          <button type="button" onClick={getCurrentLocation} style={{ marginLeft: 6 }}>📍 Use Current</button>
        </div>
      </form>
      <p className="msg">{msg}</p>
      {results.length > 0 && (
        <ul>
          {results.map(driverId => (
            <li key={driverId}>{driverId}</li>
          ))}
        </ul>
      )}
    </div>
  )
}