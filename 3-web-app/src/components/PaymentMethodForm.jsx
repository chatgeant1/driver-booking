import React, { useState } from 'react'

const PAYMENT_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:3004'

export default function PaymentMethodForm({ userId, onAdded }) {
  const [cardType, setCardType] = useState('visa')
  const [cardToken, setCardToken] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd(e) {
    e.preventDefault()
    if (!userId || !cardToken) { setMsg('Vui lòng điền token thẻ'); return }
    setLoading(true); setMsg('')
    try {
      const payload = { user_id: userId, card_type: cardType, card_token: cardToken }
      const r = await fetch(`${PAYMENT_URL}/api/v1/payments/method`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      })
      const j = await r.json()
      setMsg(`Added ${j.payment_method_id || 'n/a'} — ${j.status}`)
      if (onAdded) onAdded(j)
      setCardToken('')
    } catch (err) {
      setMsg('Error: ' + err.message)
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleAdd} style={{border:'1px solid #eee', padding:10, marginBottom:10}}>
      <h4>Thêm Phương thức Thanh toán</h4>
      <div>
        <select value={cardType} onChange={e=>setCardType(e.target.value)}>
          <option value="visa">Visa</option>
          <option value="mastercard">MasterCard</option>
          <option value="amex">AMEX</option>
        </select>
        <input placeholder="Card token (tokenized)" value={cardToken} onChange={e=>setCardToken(e.target.value)} style={{marginLeft:8}} />
      </div>
      <div style={{marginTop:8}}>
        <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Method'}</button>
      </div>
      <p className="msg">{msg}</p>
    </form>
  )
}