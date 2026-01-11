import React, { useEffect, useState } from 'react'
import UserForm from './components/UserForm'
import DriverForm from './components/DriverForm'
import RideBooking from './components/RideBooking'
import RideDetail from './components/RideDetail'
import RideCancel from './components/RideCancel'
import RideStatusUpdate from './components/RideStatusUpdate'
import FareCalculator from './components/FareCalculator'
import PaymentForm from './components/PaymentForm'
import PaymentHistory from './components/PaymentHistory'
import PaymentMethodForm from './components/PaymentMethodForm'
import MapSimulator from './components/MapSimulator'
import './styles.css'
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"

const USER_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3001'
const DRIVER_URL = import.meta.env.VITE_DRIVER_SERVICE_URL || 'http://localhost:3002'

export default function App() {
  // App.jsx
const onRideCreated = (ride) => {
  // 1. Thêm vào bảng tin (Log)
  addLog(`Hệ thống: Chuyến đi ${ride.ride_id} đã được tạo.`);
  addLog(`Thông báo: Đang tìm tài xế xung quanh điểm đón (${ride.startLoc.y}, ${ride.startLoc.x})...`);

  // 2. Cập nhật vị trí bản đồ để hiển thị Marker điểm đón/đến
  setRideLocations({
    pickup: [ride.startLoc.y, ride.startLoc.x],
    dropoff: [ride.endLoc.y, ride.endLoc.x]
  });

  // 3. Lưu ID chuyến đi đang chọn
  setSelectedRideId(ride.ride_id);
};
  
  const [users, setUsers] = useState([])
  const [drivers, setDrivers] = useState([])

  const [msg, setMsg] = useState('')

  const [editingUser, setEditingUser] = useState(null)
  const [editingDriver, setEditingDriver] = useState(null)
  const [selectedRideId, setSelectedRideId] = useState(null)

  const [rideHistory, setRideHistory] = useState([])
  
  const currentUserId = 'user-demo-123' // adjust as needed

  const [pos, setPos] = useState([10.762622, 106.660172]) // HCM

  // Thêm vào cùng các useState khác trong App.jsx
const [rideLocations, setRideLocations] = useState({
  pickup: null,   // { lat: ..., lng: ... }
  dropoff: null
});
    

  useEffect(() => {
    fetchUsers()
    fetchDrivers()
  }, [])

  async function fetchUsers() {
    try {
      const r = await fetch(`${USER_URL}/users`)
      const j = await r.json()
      setUsers(j || [])
      setMsg('Users loaded')
    } catch (e) {
      setMsg('Error loading users: ' + e.message)
    }
  }

  async function fetchDrivers() {
    try {
      const r = await fetch(`${DRIVER_URL}/drivers`)
      const j = await r.json()
      setDrivers(j || [])
      setMsg('Drivers loaded')
    } catch (e) {
      setMsg('Error loading drivers: ' + e.message)
    }
  }

  // Users CRUD
  async function createUser(data) {
    try {
      const r = await fetch(`${USER_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const j = await r.json()
      setUsers(prev => [j, ...prev])
      setMsg('User created')
    } catch (e) { setMsg('Create user error: ' + e.message) }
  }

  async function updateUser(id, data) {
    try {
      const r = await fetch(`${USER_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const j = await r.json()
      setUsers(prev => prev.map(u => u._id === id ? j : u))
      setEditingUser(null)
      setMsg('User updated')
    } catch (e) { setMsg('Update user error: ' + e.message) }
  }

  async function deleteUser(id) {
    if (!confirm('Xác nhận xóa user?')) return
    try {
      await fetch(`${USER_URL}/users/${id}`, { method: 'DELETE' })
      setUsers(prev => prev.filter(u => u._id !== id))
      setMsg('User deleted')
    } catch (e) { setMsg('Delete user error: ' + e.message) }
  }

  // Drivers CRUD
  async function createDriver(data) {
    try {
      const r = await fetch(`${DRIVER_URL}/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const j = await r.json()
      setDrivers(prev => [j, ...prev])
      setMsg('Driver created')
    } catch (e) { setMsg('Create driver error: ' + e.message) }
  }

  async function updateDriver(id, data) {
    try {
      const r = await fetch(`${DRIVER_URL}/drivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const j = await r.json()
      setDrivers(prev => prev.map(d => d._id === id ? j : d))
      setEditingDriver(null)
      setMsg('Driver updated')
    } catch (e) { setMsg('Update driver error: ' + e.message) }
  }

  async function deleteDriver(id) {
    if (!confirm('Xác nhận xóa driver?')) return
    try {
      await fetch(`${DRIVER_URL}/drivers/${id}`, { method: 'DELETE' })
      setDrivers(prev => prev.filter(d => d._id !== id))
      setMsg('Driver deleted')
    } catch (e) { setMsg('Delete driver error: ' + e.message) }
  }

  return (
    <div className="container">
      <h1>Driver Booking — Full Platform</h1>

      <section>
        <h2>💰 Tính Phí & Đặt Xe</h2>
        <FareCalculator />
        <RideBooking 
  userId={"69393b9733261c2d0231aef7"} 
  onRideCreated={(ride) => {
    setRideHistory(prev => [ride, ...prev]);
    setSelectedRideId(ride.ride_id);

    // CẬP NHẬT TỌA ĐỘ LÊN BẢN ĐỒ
    if (ride.startLoc && ride.endLoc) {
      setRideLocations({
        pickup: [ride.startLoc.y, ride.startLoc.x], // Leaflet dùng [lat, lng]
        dropoff: [ride.endLoc.y, ride.endLoc.x]
      });
      // Di chuyển tâm bản đồ về điểm đón
      setPos([ride.startLoc.y, ride.startLoc.x]);
    }
  }} 
/>
      </section>

      <hr />

      {selectedRideId && (
        <section>
          <RideDetail rideId={selectedRideId} onBack={() => setSelectedRideId(null)} />
          <RideCancel rideId={selectedRideId} userId={currentUserId} onCancel={() => setSelectedRideId(null)} />
          <RideStatusUpdate rideId={selectedRideId} />
        </section>
      )}

      <hr />

      <section>
        <h2>📋 Lịch Sử Chuyến Đi</h2>
        {rideHistory.length === 0 ? <p>No rides</p> : (
          <ul>
            {rideHistory.map(ride => (
              <li key={ride.ride_id} style={{ marginBottom: 8, cursor: 'pointer', padding: 8, background: '#f5f5f5' }} onClick={() => setSelectedRideId(ride.ride_id)}>
                <strong>#{ride.ride_id}</strong> - {ride.status} - ${ride.estimated_fare}
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr />

      <section>
        <h2>Users</h2>
        <UserForm
          key={editingUser ? editingUser._id : 'new-user'}
          initialData={editingUser}
          onCancel={() => setEditingUser(null)}
          onSubmit={(data) => editingUser ? updateUser(editingUser._id, data) : createUser(data)}
        />
        <div>
          {users.length === 0 ? <p>No users</p> : (
            <ul>
              {users.map(u => (
                <li key={u._id} style={{marginBottom:10}}>
                  <strong>{u.name}</strong> — {u.phone} — rating: {u.rating}
                  <div>
                    <button onClick={() => setEditingUser(u)}>Sửa</button>
                    <button onClick={() => deleteUser(u._id)}>Xóa</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <hr />

      <section>
        <h2>Drivers</h2>
        <DriverForm
          key={editingDriver ? editingDriver._id : 'new-driver'}
          initialData={editingDriver}
          onCancel={() => setEditingDriver(null)}
          onSubmit={(data) => editingDriver ? updateDriver(editingDriver._id, data) : createDriver(data)}
        />
        <div>
          {drivers.length === 0 ? <p>No drivers</p> : (
            <ul>
              {drivers.map(d => (
                <li key={d._id} style={{marginBottom:10}}>
                  <strong>{d.name}</strong> — {d.vehicleType} ({d.vehiclePlate}) — {d.status}
                  <div>
                    <button onClick={() => setEditingDriver(d)}>Sửa</button>
                    <button onClick={() => deleteDriver(d._id)}>Xóa</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <hr />

      <section>
        <h2>💳 Payments</h2>
        <PaymentMethodForm userId={currentUserId} onAdded={() => { /* optionally refresh methods */ }} />
        <PaymentForm userId={currentUserId} onResult={(tx) => { /* optionally add to history */ }} />
        <PaymentHistory userId={currentUserId} />
      </section>

      <hr />

      <section>
  <h2>🗺️ Bản đồ chuyến đi</h2>
  <div className="map-wrapper"> {/* Sử dụng class CSS bạn đã định nghĩa */}
    <MapContainer
      center={pos}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Marker mặc định (vị trí hiện tại hoặc trung tâm) */}
      <Marker position={pos}>
        <Popup>Vị trí của bạn</Popup>
      </Marker>

      {/* Hiển thị điểm Đón nếu có */}
      {rideLocations.pickup && (
        <Marker position={rideLocations.pickup}>
          <Popup>📍 Điểm đón khách</Popup>
        </Marker>
      )}

      {/* Hiển thị điểm Đến nếu có */}
      {rideLocations.dropoff && (
        <Marker position={rideLocations.dropoff}>
          <Popup>🏁 Điểm đến</Popup>
        </Marker>
      )}
      
    </MapContainer>
  </div>
</section>
    </div>
  )
}