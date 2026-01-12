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
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import L from "leaflet"
import {PaymentFormV2} from './components/PaymentForm'

const USER_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3001'
const DRIVER_URL = import.meta.env.VITE_DRIVER_SERVICE_URL || 'http://localhost:3002'
const RIDE_URL = import.meta.env.VITE_RIDE_SERVICE_URL || 'http://localhost:3003/rides'
const PAYMENT_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:3004/payments'


export default function App() { 
  const [users, setUsers] = useState([])
  const [drivers, setDrivers] = useState([])

  const [msg, setMsg] = useState('')

  const [editingUser, setEditingUser] = useState(null)
  const [editingDriver, setEditingDriver] = useState(null)
  const [selectedRideId, setSelectedRideId] = useState(null)

  const [rideHistory, setRideHistory] = useState([])
  const [paymentHistory, setPaymentHistory] = useState([])
  
  const [currentRide, setCurrentRide] = useState({})
  const currentUserId = users[0] || '69393b9733261c2d0231aef7' // adjust as needed

  // 10.762622, 106.660172 - HCM
  // 10.848171606710341, 106.78664690351987 - PTIT
  // 10.789662937835404, 106.70060819055709 - Open Uni.
  const [pos, setPos] = useState([10.848171606710341, 106.78664690351987]) // HCM

  // Thêm vào cùng các useState khác trong App.jsx
const [rideLocations, setRideLocations] = useState({
  pickup: null,   // { lat: ..., lng: ... }
  dropoff: null
});
    
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


  useEffect(() => {
    fetchUsers();
    fetchDrivers();
    fetchRideHistory();
    fetchPaymentHistory();
  }, [])

// 1. Hàm lấy danh sách người dùng  
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

// 2. Hàm lấy danh sách tài xế  
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

// 3. Hàm lấy lịch sử chuyến đi
async function fetchRideHistory() {
  try {
    // Lưu ý: Trong thực tế bạn nên truyền userId vào query để lọc
    // ví dụ: ${RIDE_URL}?userId=${currentUserId}
    const response = await fetch(`${RIDE_URL}`);
    const data = await response.json();
    
    // Nếu Backend trả về mảng, ta cập nhật state
    if (Array.isArray(data)) {
      setRideHistory(data);
      setMsg('Ride history updated');
    }
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử:", error);
    setMsg('Failed to load ride history');
  }
}

// 4. Hàm lấy lịch sử THANH TOÁN
async function fetchPaymentHistory() {
  try {
    const response = await fetch(`${PAYMENT_URL}`);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      setPaymentHistory(data);
      setMsg('Payment history updated');
    }
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử:", error);
    setMsg('Failed to load payment history');
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

  async function getRide(rideId){
    try{
      const r = await fetch(`${RIDE_URL}/${rideId}`)
      const j = await r.json()
      setCurrentRide(j || {})
      setMsg('Ride loaded')
    }catch (e) {setMsg(e.message)}
  }

// ON_STATUS_UPDATE  
const handleStatusRefresh = (updatedRide) => {
  // 1. Cập nhật currentRide bằng cách gộp (merge) để không mất trường 'price'
  setCurrentRide(prev => ({
    ...prev,          // Giữ lại tất cả dữ liệu cũ (bao gồm price, startLoc...)
    ...updatedRide    // Ghi đè các dữ liệu mới (status, driver_status...)
  }));

  // 2. Cập nhật trong danh sách rideHistory tương tự
  setRideHistory(prev => prev.map(r => 
    (r._id === updatedRide._id || r.ride_id === updatedRide.ride_id) 
    ? { ...r, ...updatedRide } 
    : r
  ));
};


// Tìm xem trong lịch sử thanh toán đã có bản ghi nào của ride này mà status là 'PAID' chưa
const isPaid = paymentHistory.some(p => (p.rideId === selectedRideId || p.ride_id === selectedRideId) && p.status === 'PAID');



  return (
    <div className="container">
      <h1>Driver Booking — Full Platform</h1>

      <section>
        <h2>💰 Tính Phí & Đặt Xe</h2>
        <FareCalculator />
        <RideBooking 
            userId={currentUserId} 
            onRideCreated={(ride) => {
                getRide(ride.ride_id);
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

      {selectedRideId && currentRide && (
        <section>
          <RideDetail rideId={selectedRideId} onBack={() => setSelectedRideId(null)} />
          <RideCancel rideId={selectedRideId} userId={currentUserId} onCancel={() => setSelectedRideId(null)} />
          
          {/* Tìm trực tiếp object trong mảng history dựa trên ID đang chọn */}
          <RideStatusUpdate 
            ride={rideHistory.find(r => (r._id === selectedRideId || r.ride_id === selectedRideId))} 
            onStatusUpdate={handleStatusRefresh}
          />
        </section>
      )}

      <hr />


<section>
        <h2>💳 Payments</h2>
        <PaymentFormV2 
            userId={currentUserId} 
            selectedRide={currentRide}
            isPaid={isPaid} 
            onResult={(paymentData) => {
                console.log("Trả tiền xong!", paymentData);
                // Sau khi trả tiền, có thể load lại lịch sử thanh toán hoặc thông báo xong xuôi
                fetchPaymentHistory(); 
            }}
        />    
</section>

{/* BẢN ĐỒ BẢN ĐỒ BẢN ĐỒ  */}
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

        {/* Vẽ đường thẳng nối 2 điểm nếu có đủ pickup và dropoff */}
        {rideLocations.pickup && rideLocations.dropoff && (
          <Polyline 
            positions={[rideLocations.pickup, rideLocations.dropoff]} 
            color="blue" 
            dashArray="5, 10" // Tạo hiệu ứng đường đứt đoạn cho đẹp
          />
        )}
        
      </MapContainer>
    </div>
</section>
{/* BẢN ĐỒ BẢN ĐỒ BẢN ĐỒ  */}


{/* LỊCH SỬ CHUYẾN ĐI */}
<section className="history-section">
  <h2>📋 Lịch Sử Chuyến Đi</h2>
  {rideHistory.length === 0 ? (
    <div className="no-data">
      <p>Chưa có chuyến đi nào được ghi nhận.</p>
      <button onClick={fetchRideHistory}>Thử tải lại</button>
    </div>
  ) : (
    <div className="ride-list-container">
      <ul className="ride-list">
        {rideHistory.map(ride => (
          <li 
            key={ride._id} 
            className={`ride-item ${selectedRideId === ride._id ? 'active' : ''}`}
            onClick={() => {
              setSelectedRideId(ride._id);
              setCurrentRide(ride);
            }}
          >
            <div className="ride-info">
              <span className="ride-id">#{ride._id}</span>
              <span className={`status-badge ${ride.status?.toLowerCase() || ''}`}>
                ---{ride.status || 'N/A'}---
              </span>
            </div>
            <div className="ride-meta">
              <span>Số tiền: {Math.round(ride.price || 0).toLocaleString()} VNĐ</span> <br />
              <span>Vị trí: START: ({ride.startLoc?.x}, {ride.startLoc?.y}), END: ({ride.endLoc?.x}, {ride.endLoc?.y})</span>
            </div>
            <hr />
          </li>
          
        ))}
      </ul>
    </div>
  )}
</section>
{/* LỊCH SỬ CHUYẾN ĐI */}

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
                  <strong>{d.name}</strong> — {d.vehicleType} ({d.vehiclePlate}) — {d.status} — Vị trí: ({d.location.x}; {d.location.y})
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
        {/* <PaymentHistory userId={currentUserId} /> */}
        <div className="history-section">
          <h2>Lịch Sử Thanh Toán</h2>
          {paymentHistory.length === 0 ? (
            <div className="no-data">
              <p>Chưa có dữ liệu nào được ghi nhận.</p>
              <button onClick={fetchPaymentHistory}>Thử tải lại</button>
            </div>
          ) : (
            <div className="payment-list-container">
              <ul className="payment-list">
                {
                  paymentHistory.map(payment => (
                    <li 
                      key={payment._id} 
                      className={`payment-item ${selectedRideId === payment.rideId ? 'active' : ''}`}
                      onClick={() => setSelectedRideId(payment.rideId)}
                      style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}
                    >
                      <div className="payment-info" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="payment-id">💳 GD: #{payment._id.slice(-6)}</span>
                        <span className={`status-badge ${payment.status.toLowerCase()}`}>
                          {payment.status === 'PAID' ? '✅ Đã thanh toán' : '⏳ Chờ xử lý'}
                        </span>
                      </div>

                      <div className="payment-meta" style={{ fontSize: '1em', color: '#666', marginTop: '5px' }}>
                        <div>💰 Số tiền: <strong>{Math.round(payment.amount || 0).toLocaleString()} VNĐ</strong></div>
                        <div>🔌 Phương thức: {payment.method === 'wallet' ? 'Ví điện tử' : 'Tiền mặt'}</div>
                        <div>🆔 Mã chuyến: {payment.rideId}</div>
                        {/* Hiển thị thời gian từ timestamps */}
                        <div style={{ fontSize: '1em', color: '#999' }}>
                          ⏰ {new Date(payment.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </li>
                  ))
                }
              </ul>
            </div>
          )}
        </div>
        {/* LỊCH SỬ THANH TOÁN */}

      </section>

      <hr />


</div>
  )
}