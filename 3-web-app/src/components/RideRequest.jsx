import React, { useState } from 'react'
import DriverDetail from './components/DriverDetail'
import DriverStatusUpdate from './components/DriverStatusUpdate'
import DriverLocationUpdate from './components/DriverLocationUpdate'
import DriverSearch from './components/DriverSearch'
import RideRequest from './components/RideRequest'

const DRIVER_URL = import.meta.env.VITE_DRIVER_SERVICE_URL || 'http://localhost:3002'

export default function App() {
  const [selectedDriverId, setSelectedDriverId] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [drivers, setDrivers] = useState([])

  async function fetchDrivers() {
    const r = await fetch(`${DRIVER_URL}/drivers`)
    const data = await r.json()
    setDrivers(data)
  }

  React.useEffect(() => {
    fetchDrivers()
  }, [])

  return (
    <div className="container">
      <h1>Driver Booking — Full UI</h1>
      
      {selectedDriverId && (
        <DriverDetail driverId={selectedDriverId} onBack={() => setSelectedDriverId(null)} />
      )}

      <section>
        <h2>🔍 Search Drivers</h2>
        <DriverSearch onResults={setSearchResults} />
      </section>

      <section>
        <h2>Driver Management</h2>
        {drivers.length === 0 ? <p>No drivers</p> : (
          <ul>
            {drivers.map(d => (
              <li key={d._id} style={{ marginBottom: 12, border: '1px solid #eee', padding: 8 }}>
                <strong>{d.name}</strong> — {d.vehiclePlate}
                <button onClick={() => setSelectedDriverId(d._id)}>View Detail</button>
                <DriverStatusUpdate driverId={d._id} currentStatus={d.status} />
                <DriverLocationUpdate driverId={d._id} />
                <RideRequest driverId={d._id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}