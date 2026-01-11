import React, { useState } from 'react'

const RIDE_URL = import.meta.env.VITE_RIDE_SERVICE_URL || 'http://localhost:3003'

export default function FareCalculator() {
  const [pickupLat, setPickupLat] = useState('')
  const [pickupLon, setPickupLon] = useState('')
  const [dropoffLat, setDropoffLat] = useState('')
  const [dropoffLon, setDropoffLon] = useState('')
  const [vehicleType, setVehicleType] = useState('motorbike')
  const [fareData, setFareData] = useState(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCalculate(e) {
    e.preventDefault()
    if (!pickupLat || !pickupLon || !dropoffLat || !dropoffLon) {
      setMsg('Vui lòng điền đủ toạ độ')
      return
    }
    try {
      setLoading(true)
      const r = await fetch(`${RIDE_URL}/rides/fare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup_location: { lat: parseFloat(pickupLat), lon: parseFloat(pickupLon) },
          dropoff_location: { lat: parseFloat(dropoffLat), lon: parseFloat(dropoffLon) },
          vehicle_type: vehicleType
        })
      })
      const j = await r.json()
      setFareData(j)
      setMsg('Fare calculated')
    } catch (e) {
      setMsg('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: 12, border: '1px solid #28a745', padding: 12, borderRadius: 6, background: '#f1f8f4' }}>
      <h3>💰 Tính Phí Chuyến Đi</h3>
      <form onSubmit={handleCalculate}>
        <div style={{ marginBottom: 8 }}>
          <label><strong>📍 Vị trí đón:</strong></label>
          <input type="number" step="0.0001" placeholder="Latitude" value={pickupLat} onChange={e => setPickupLat(e.target.value)} />
          <input type="number" step="0.0001" placeholder="Longitude" value={pickupLon} onChange={e => setPickupLon(e.target.value)} style={{ marginLeft: 6 }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label><strong>📍 Vị trí đến:</strong></label>
          <input type="number" step="0.0001" placeholder="Latitude" value={dropoffLat} onChange={e => setDropoffLat(e.target.value)} />
          <input type="number" step="0.0001" placeholder="Longitude" value={dropoffLon} onChange={e => setDropoffLon(e.target.value)} style={{ marginLeft: 6 }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label><strong>🚗 Loại xe:</strong></label>
          <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
            <option value="motorbike">Motorbike</option>
            <option value="car">Car</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Fare'}
        </button>
      </form>
      <p className="msg">{msg}</p>
      {fareData && (
        <div style={{ marginTop: 8, padding: 8, background: '#fff', border: '1px solid #28a745', borderRadius: 4 }}>
          <p><strong>Estimated Fare:</strong> <span style={{ fontSize: 18, fontWeight: 'bold', color: '#28a745' }}>${fareData.estimated_fare}</span></p>
          <p><strong>Distance:</strong> {fareData.distance} km</p>
        </div>
      )}
    </div>
  )
}