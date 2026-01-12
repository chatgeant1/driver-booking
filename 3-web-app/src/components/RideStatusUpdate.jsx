import React, { useState } from 'react'

const RIDE_URL = import.meta.env.VITE_RIDE_SERVICE_URL || 'http://localhost:3003'

export default function RideStatusUpdate({ ride, onStatusUpdate }) {

  if (!ride) {
    return <div style={{ padding: 10 }}>⌛ Đang tải dữ liệu chuyến xe...</div>;
  }

  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // const statuses = ['DRIVER_ARRIVED', 'STARTED', 'COMPLETED']

  async function handleUpdate(actionName) {
    try {
      setLoading(true)
      const r = await fetch(`${RIDE_URL}/rides/${ride._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rideId: ride._id,
          action: actionName,
          timestamp: new Date().toISOString()
        })
      })
      
      const updatedData = await r.json()
      if (updatedData.error) {
        setMsg('Lỗi từ Server: ' + updatedData.error)
      } else {
        // Nếu không lỗi, lúc này mới lấy status đã chuẩn hóa
        const displayStatus = updatedData.status || "N/A"
        setMsg('Cập nhật thành công: ' + displayStatus)
}

      if (onStatusUpdate) onStatusUpdate(updatedData)

    } catch (e) {
      setMsg('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

   return (
    <div className="driver-controls" style={{ marginTop: 15, padding: 15, background: '#f0f0f0', borderRadius: 8 }}>
      <h5> Driver Simulator (Giả lập tài xế)</h5>
      
      {/* Hiển thị nút dựa trên trạng thái hiện tại của ride */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        
        {ride.status === 'REQUESTED' && (
          <button 
            onClick={() => handleUpdate('ACCEPT')} 
            disabled={loading}
            style={{ backgroundColor: '#28a745', color: 'white' }}
          >
            {loading ? 'Đang xử lý...' : '✅ Tài xế nhận chuyến (ACCEPT)'}
          </button>
        )}
        
        {ride.status === 'IN_PROGRESS' && (
          <button 
            onClick={() => handleUpdate('START')} 
            disabled={loading}
            style={{ backgroundColor: '#007bff', color: 'white' }}
          >
            {loading ? 'Đang xử lý...' : '🚕 Khách lên xe - Bắt đầu (START)'}
          </button>
        )}

        {ride.status === 'ON_TRIP' && (
          <button 
            onClick={() => handleUpdate('COMPLETE')} 
            disabled={loading}
            style={{ backgroundColor: '#dc3545', color: 'white' }}
          >
            {loading ? 'Đang xử lý...' : '🏁 Đã đến nơi - Hoàn thành (COMPLETE)'}
          </button>
        )}

        {ride.status === 'COMPLETED' && (
          <p style={{ color: '#28a745', fontWeight: 'bold' }}>✨ Chuyến đi đã hoàn thành thành công!</p>
        )}
      </div>

      <p style={{ fontSize: '0.8em', color: '#666', marginTop: 10 }}>{msg}</p>
    </div>
  )
}


{/* <form onSubmit={handleUpdate} style={{ marginTop: 8, padding: 8, background: '#f9f9f9', borderRadius: 4 }}>
  <h5>Cập nhật Trạng thái</h5>
  <select value={status} onChange={e => setStatus(e.target.value)}>
    {statuses.map(s => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>
  <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
    {loading ? 'Updating...' : 'Update'}
  </button>
  <p className="msg">{msg}</p>
</form> */}