import React, { useState } from 'react'

const RIDE_URL = import.meta.env.VITE_RIDE_SERVICE_URL || 'http://localhost:3003'

export default function RideBooking({ userId, onRideCreated }) {
  const [pickupLat, setPickupLat] = useState('')
  const [pickupLon, setPickupLon] = useState('')
  const [dropoffLat, setDropoffLat] = useState('')
  const [dropoffLon, setDropoffLon] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [rideData, setRideData] = useState(null)

  async function handleBookRide(e) {
    e.preventDefault()
    if (!userId || !pickupLat || !pickupLon || !dropoffLat || !dropoffLon) {
      setMsg('Vui lòng điền đủ thông tin')
      return
    }
    try {
      setLoading(true)
      const r = await fetch(`${RIDE_URL}/rides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          pickup_location: { lat: parseFloat(pickupLat), lon: parseFloat(pickupLon) },
          dropoff_location: { lat: parseFloat(dropoffLat), lon: parseFloat(dropoffLon) }
        })
      })
      const j = await r.json()
      setRideData(j)
      setMsg(`Ride created: ${j.ride_id} - Status: ${j.status}`)
      if (onRideCreated) onRideCreated(j)
      setPickupLat('')
      setPickupLon('')
      setDropoffLat('')
      setDropoffLon('')
    } catch (e) {
      setMsg('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  function getCurrentLocation(type) {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        if (type === 'pickup') {
          setPickupLat(pos.coords.latitude)
          setPickupLon(pos.coords.longitude)
        } else {
          setDropoffLat(pos.coords.latitude)
          setDropoffLon(pos.coords.longitude)
        }
      }, err => setMsg('Location error: ' + err.message))
    } else {
      setMsg('Geolocation not supported')
    }
  }

  return (
    <div style={{ marginBottom: 12, border: '2px solid #007bff', padding: 12, borderRadius: 6 }}>
      <h3>🚗 Đặt Xe Ngay</h3>
      <form onSubmit={handleBookRide}>
        <div style={{ marginBottom: 8 }}>
          <label><strong>📍 Vị trí đón:</strong></label>
          <input type="number" step="0.0001" placeholder="Latitude" value={pickupLat} onChange={e => setPickupLat(e.target.value)} />
          <input type="number" step="0.0001" placeholder="Longitude" value={pickupLon} onChange={e => setPickupLon(e.target.value)} style={{ marginLeft: 6 }} />
          <button type="button" onClick={() => getCurrentLocation('pickup')} style={{ marginLeft: 6 }}>📍</button>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label><strong>📍 Vị trí đến:</strong></label>
          <input type="number" step="0.0001" placeholder="Latitude" value={dropoffLat} onChange={e => setDropoffLat(e.target.value)} />
          <input type="number" step="0.0001" placeholder="Longitude" value={dropoffLon} onChange={e => setDropoffLon(e.target.value)} style={{ marginLeft: 6 }} />
          <button type="button" onClick={() => getCurrentLocation('dropoff')} style={{ marginLeft: 6 }}>📍</button>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 'bold' }}>
          {loading ? 'Booking...' : 'Book Ride'}
        </button>
      </form>
      <p className="msg">{msg}</p>
      {rideData && (
        <div style={{ marginTop: 8, padding: 8, background: '#f0f8ff', borderRadius: 4 }}>
          <p><strong>Ride ID:</strong> {rideData.ride_id}</p>
          <p><strong>Status:</strong> {rideData.status}</p>
          <p><strong>Estimated Fare:</strong> ${rideData.estimated_fare}</p>
        </div>
      )}
    </div>
  )
} 