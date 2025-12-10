import React, { useState, useEffect } from 'react'

const RIDE_URL = import.meta.env.VITE_RIDE_SERVICE_URL || 'http://localhost:3003'

export default function RideDetail({ rideId, onBack }) {
  const [ride, setRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchRide()
    const interval = setInterval(fetchRide, 3000) // poll every 3s
    return () => clearInterval(interval)
  }, [rideId])

  async function fetchRide() {
    try {
      const r = await fetch(`${RIDE_URL}/rides/${rideId}`)
      const j = await r.json()
      setRide(j)
    } catch (e) {
      setMsg('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading...</p>
  if (!ride) return <p>Ride not found</p>

  const statusColor = {
    SEARCHING_DRIVER: '#ffc107',
    DRIVER_ACCEPTED: '#17a2b8',
    DRIVER_ARRIVED: '#28a745',
    STARTED: '#007bff',
    COMPLETED: '#6c757d',
    CANCELED: '#dc3545'
  }

  return (
    <div style={{ border: '2px solid #17a2b8', padding: 12, marginBottom: 12, borderRadius: 6 }}>
      <button onClick={onBack}>← Quay lại</button>
      <h3>Chuyến đi #{ride.ride_id}</h3>
      <p>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: statusColor[ride.status] || '#ccc',
          color: '#fff',
          borderRadius: 4,
          fontWeight: 'bold'
        }}>
          {ride.status}
        </span>
      </p>
      <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td><strong>User ID:</strong></td>
            <td>{ride.user_id}</td>
          </tr>
          <tr>
            <td><strong>Driver ID:</strong></td>
            <td>{ride.driverId || 'Searching...'}</td>
          </tr>
          <tr>
            <td><strong>Pickup:</strong></td>
            <td>{ride.pickup_location?.lat}, {ride.pickup_location?.lon}</td>
          </tr>
          <tr>
            <td><strong>Dropoff:</strong></td>
            <td>{ride.dropoff_location?.lat}, {ride.dropoff_location?.lon}</td>
          </tr>
          <tr>
            <td><strong>Estimated Fare:</strong></td>
            <td>${ride.estimated_fare}</td>
          </tr>
          <tr>
            <td><strong>Distance:</strong></td>
            <td>{ride.distance} km</td>
          </tr>
          <tr>
            <td><strong>Created:</strong></td>
            <td>{new Date(ride.created_at).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <p className="msg">{msg}</p>
    </div>
  )
}