import React, { useState, useEffect } from 'react'

const RIDE_URL = import.meta.env.VITE_RIDE_SERVICE_URL || 'http://localhost:3003'
const DRIVER_URL = import.meta.env.VITE_DRIVER_SERVICE_URL || 'http://localhost:3002';

export default function RideDetail({ rideId, onBack }) {
  const [ride, setRide] = useState(null)

  const [driver, setDriver] = useState(null)

  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  
  const updateRideStatus = async (rideId, action) => {
  // action có thể là: 'accept', 'start', 'finish'
  const method = (action === 'accept') ? 'POST' : 'PUT';
  const url = `http://localhost:3000/rides/${rideId}/${action}`; 

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: action === 'accept' ? JSON.stringify({ driverId: "ID_TAI_XE_MAU" }) : null
    });
    
    if (response.ok) {
      const updatedRide = await response.json();
      addLog(`Trạng thái mới: ${updatedRide.status}`);
      // Sau khi cập nhật trạng thái thành công, mới bắt đầu chạy animateCar
    }
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái:", err);
  }
};

// GET /rides/{id} => ride._id
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

      // Nếu chuyến xe đã có tài xế (driverId không null)
      const dId = j.driverId || j.candidate_drivers[0].driverId;
      if (dId) {
        const dr = await fetch(`${DRIVER_URL}/drivers/${dId}`);
        const dj = await dr.json();
        setDriver(dj); // Lưu thông tin tài xế vào state
      }

    } catch (e) {
      setMsg('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading...</p>
  if (!ride) return <p>Ride not found</p>

  // const statusColor = {
  //   SEARCHING_DRIVER: '#ffc107',
  //   DRIVER_ACCEPTED: '#17a2b8',
  //   DRIVER_ARRIVED: '#28a745',
  //   STARTED: '#007bff',
  //   COMPLETED: '#ffaa00',
  //   CANCELED: '#dc3545'
  // }

  const statusColor = {
    REQUESTED: '#ffc107',
    IN_PROGRESS: '#17a2b8',
    DRIVER_ARRIVED: '#28a745',
    ON_TRIP: '#007bff',
    COMPLETED: '#ffaa00',
    CANCELED: '#dc3545'
  }

  const dx = ride.endLoc.x - ride.startLoc.x;
  const dy = ride.endLoc.y - ride.startLoc.y;
  const distance = Math.sqrt(dx * dx + dy * dy);


  return (
    <div style={{ border: '2px solid #17a2b8', padding: 12, marginBottom: 12, borderRadius: 6 }}>
      <button onClick={onBack}>← Quay lại</button>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3>Chuyến đi #{ride._id}</h3>
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
    </div>

    {/* --- BẢNG THÔNG TIN CHUYẾN XE --- */}
      <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
        <thead style={{ background: '#eee' }}>
          <tr><th colSpan="2" style={{ padding: 5 }}>CHI TIẾT CHUYẾN ĐI</th></tr>
        </thead>        
        
        <tbody>
          <tr>
            <td><strong>User ID:</strong></td>
            <td>{ride.userId}</td>
          </tr>
          <tr>
            <td><strong>Driver ID:</strong></td>
            <td>{ride.driverId || 'Searching...'}</td>
          </tr>
          <tr>
            <td><strong>Pickup:</strong></td>
            <td>lat:{ride.startLoc?.y}, lng:{ride.startLoc?.x}</td>
          </tr>
          <tr>
            <td><strong>Dropoff:</strong></td>
            <td>lat:{ride.endLoc?.y}, lng:{ride.endLoc?.x}</td>
          </tr>
          <tr>
            <td><strong>Estimated Fare:</strong></td>
            <td>{Math.round(ride.price || 0).toLocaleString()} VND</td>
          </tr>
          <tr>
            <td><strong>Distance:</strong></td>
            <td>{distance.toFixed(2)} km </td>
          </tr>
          <tr>
            <td><strong>Created:</strong></td>
            <td>{new Date(ride.createdAt).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    {/* --- BẢNG THÔNG TIN CHUYẾN XE --- */}


  {/* --- BẢNG THÔNG TIN TÀI XẾ (Chỉ hiện khi có driver) --- */}
      {driver ? (
        <table style={{ width: '100%', marginTop: 15, borderCollapse: 'collapse', fontSize: '0.9em', border: '1px solid #28a745' }}>
          <thead style={{ background: '#d4edda' }}>
            <tr><th colSpan="2" style={{ padding: 5, color: '#155724' }}>🚖 THÔNG TIN TÀI XẾ</th></tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ width: '35%' }}><strong>Mã tài xế:</strong></td>
              <td>{driver._id}</td>
            </tr>
            <tr>
              <td><strong>Trạng thái:</strong></td>
              <td>
                <span style={{ color: driver.status !== 'AVAILABLE' ? 'green' : 'red', fontWeight: 'bold' }}>
                  {driver.status}
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>Vị trí hiện tại:</strong></td>
              <td>
                X: {driver.location?.x?.toFixed(4)}, Y: {driver.location?.y?.toFixed(4)}
              </td>
            </tr>
            <tr>
              <td><strong>Chuyến hiện tại:</strong></td>
              <td>{driver.current_ride_id || 'Trống'}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div style={{ marginTop: 15, padding: 10, textAlign: 'center', background: '#fff3cd', borderRadius: 4 }}>
          <small>Đang tìm kiếm tài xế gần nhất...</small>
        </div>
      )}

{/* --- BẢNG THÔNG TIN TÀI XẾ (Chỉ hiện khi có driver) --- */}

       <p className="msg" style={{ color: 'red', fontSize: '0.8em' }}>{msg}</p>
    </div>
  )
}