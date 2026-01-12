import React, { useState } from 'react'

const PAYMENT_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:3004'

export default function PaymentForm({ userId, onResult }) {
  const [rideId, setRideId] = useState('')
  const [amount, setAmount] = useState('')
  const [methodId, setMethodId] = useState('')
  const [methodType, setMethodType] = useState('card')
  const [cardToken, setCardToken] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handlePay(e) {
    e.preventDefault()
    if (!rideId || !userId || !amount) { setMsg('Vui lòng điền đầy đủ'); return }
    setLoading(true); setMsg('')
    try {
      const payload = {
        ride_id: rideId,
        user_id: userId,
        amount: parseFloat(amount),
        // prefer method_id if present, else send tokenized method info
        payment_method_id: methodId || undefined,
        method: methodId ? undefined : { type: methodType, token: cardToken }
      }
      const r = await fetch(`${PAYMENT_URL}/api/v1/payments`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      })
      const j = await r.json()
      setMsg(`Tx ${j.transaction_id || 'n/a'} — ${j.status}`)
      if (onResult) onResult(j)
      setRideId(''); setAmount(''); setMethodId(''); setCardToken('')
    } catch (err) {
      setMsg('Error: ' + err.message)
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handlePay} style={{border:'1px solid #ddd',padding:10,marginBottom:10}}>
      <h4>Thực hiện Thanh toán</h4>
      <div><input placeholder="Ride ID" value={rideId} onChange={e=>setRideId(e.target.value)} /></div>
      <div><input placeholder="Amount" type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} /></div>
      <div>
        <input placeholder="Payment method id (optional)" value={methodId} onChange={e=>setMethodId(e.target.value)} />
      </div>
      <div style={{marginTop:6}}>
        <select value={methodType} onChange={e=>setMethodType(e.target.value)}>
          <option value="card">Card</option>
          <option value="wallet">Wallet</option>
        </select>
        <input placeholder="Card token (if no method id)" value={cardToken} onChange={e=>setCardToken(e.target.value)} style={{marginLeft:8}} />
      </div>
      <div style={{marginTop:8}}>
        <button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Pay'}</button>
      </div>
      <p className="msg">{msg}</p>
    </form>
  )
}

// Thêm prop 'selectedRide' để lấy dữ liệu từ App.jsx
export function PaymentFormV2({ userId, selectedRide, onResult }) {
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // Tự động trích xuất dữ liệu từ Object ride truyền vào
  const rideId = selectedRide?._id || selectedRide?.ride_id;
  const amount = selectedRide?.price || selectedRide?.estimated_fare || 0;

  async function handlePay() {
    if (!rideId) return;
    
    setLoading(true); setMsg('')
    try {
      // Đúng theo script của bạn: Chỉ cần gửi rideId lên
      const payload = { rideId }
      const PAYMENT_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || "http://localhost:3000"

      const r = await fetch(`${PAYMENT_URL}/payments`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      })
      
      const j = await r.json()
      
      if (r.ok) {
        setMsg(`✅ Thanh toán thành công! Mã GD: ${j.transaction_id || 'SUCCESS'}`)
        if (onResult) onResult(j) // Gọi hàm để App.jsx biết đã trả tiền xong
      } else {
        setMsg('❌ Lỗi: ' + (j.error || 'Giao dịch thất bại'))
      }
    } catch (err) {
      setMsg('❌ Lỗi kết nối Service Thanh toán')
    } finally { setLoading(false) }
  }

  // CHỈ HIỆN KHI CHUYẾN XE ĐÃ HOÀN THÀNH
  if (selectedRide?.status !== 'COMPLETED') return null;

  return (
    <div style={{
      border: '2px solid #28a745', 
      padding: '20px', 
      borderRadius: '10px', 
      background: '#f8fff9',
      marginTop: '20px'
    }}>
      <h3 style={{color: '#28a745', marginTop: 0}}>💰 Bước cuối: Thanh toán</h3>
      <p>Mã chuyến đi: <code>{rideId}</code></p>
      <p>Số tiền: <strong style={{fontSize: '1.5em', color: '#d9534f'}}>{amount.toLocaleString()} VNĐ</strong></p>
      
      <button 
        onClick={handlePay} 
        disabled={loading}
        style={{
          backgroundColor: '#28a745', 
          color: 'white', 
          padding: '12px 25px', 
          border: 'none', 
          borderRadius: '5px', 
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%'
        }}
      >
        {loading ? '🔄 Đang xử lý giao dịch...' : 'XÁC NHẬN THANH TOÁN'}
      </button>
      {msg && <p style={{marginTop: 10, fontWeight: '500'}}>{msg}</p>}
    </div>
  )
}