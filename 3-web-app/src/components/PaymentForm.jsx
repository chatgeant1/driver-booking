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

  // Tự động lấy dữ liệu từ chuyến xe đang chọn
  const rideId = selectedRide?.ride_id || '';
  const amount = selectedRide?.price || 0;

  async function handlePay(e) {
    e.preventDefault()
    if (!rideId) { setMsg('Không có chuyến xe nào cần thanh toán'); return }
    
    setLoading(true); setMsg('')
    try {
      const payload = { rideId }
      const payment_url = import.meta.env.VITE_PAYMENT_SERVICE_URL || "http://localhost:3000/payments"

      const r = await fetch(`${payment_url}`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      })
      
      const j = await r.json()
      setMsg(`Thanh toán thành công! Mã GD: ${j.transaction_id || 'OK'}`)
      if (onResult) onResult(j)
    } catch (err) {
      setMsg('Lỗi thanh toán: ' + err.message)
    } finally { setLoading(false) }
  }

  if (!selectedRide) return null; // Nếu chưa chọn ride thì không hiện form

  return (
    <div style={{border:'2px solid #28a745', padding:15, borderRadius:8, marginBottom:10}}>
      <h4>💳 Xác nhận thanh toán</h4>
      <p>Mã chuyến đi: <strong>{rideId}</strong></p>
      <p>Số tiền cần trả: <span style={{color:'red', fontSize:'1.2em'}}>{amount.toLocaleString()} VNĐ</span></p>
      
      <button 
        onClick={handlePay} 
        disabled={loading}
        style={{backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 5, cursor: 'pointer'}}
      >
        {loading ? 'Đang xử lý...' : 'XÁC NHẬN THANH TOÁN NGAY'}
      </button>
      <p className="msg">{msg}</p>
    </div>
  )
}