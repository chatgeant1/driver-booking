import React, { useState, useEffect } from 'react'

const DRIVER_URL = import.meta.env.VITE_DRIVER_SERVICE_URL || 'http://localhost:3002'

export default function DriverDetail({ driverId, onBack }) {
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchDriver()
  }, [driverId])

  async function fetchDriver() {
    try {
      setLoading(true)
      const r = await fetch(`${DRIVER_URL}/drivers/${driverId}`)
      const j = await r.json()
      setDriver(j)
      setMsg('Driver loaded')
    } catch (e) {
      setMsg('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading...</p>
  if (!driver) return <p>Driver not found</p>

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
      <button onClick={onBack}>← Quay lại</button>
      <h3>{driver.name}</h3>
      <p><strong>ID:</strong> {driver._id}</p>
      <p><strong>Phone:</strong> {driver.phone}</p>
      <p><strong>Vehicle Plate:</strong> {driver.vehiclePlate}</p>
      <p><strong>Vehicle Type:</strong> {driver.vehicleType}</p>
      <p><strong>Status:</strong> {driver.status}</p>
      {driver.location && (
        <p><strong>Location:</strong> {driver.location.lat}, {driver.location.lon}</p>
      )}
      <p className="msg">{msg}</p>
    </div>
  )
}