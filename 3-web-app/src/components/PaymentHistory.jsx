import React, { useState, useEffect } from 'react'

const PAYMENT_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:3004'

export default function PaymentHistory({ userId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { if (userId) fetchHistory() }, [userId])

  async function fetchHistory() {
    if (!userId) return
    setLoading(true); setMsg('')
    try {
      const r = await fetch(`${PAYMENT_URL}/api/v1/payments/${encodeURIComponent(userId)}`)
      const j = await r.json()
      setItems(Array.isArray(j) ? j : [])
    } catch (err) {
      setMsg('Error: ' + err.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={{border:'1px solid #eee', padding:10}}>
      <h4>Lịch sử giao dịch</h4>
      {!userId ? <p>Chưa có user</p> : loading ? <p>Loading...</p> : (
        <>
          {msg && <p className="msg">{msg}</p>}
          {items.length === 0 ? <p>No transactions</p> : (
            <ul>
              {items.map(tx => (
                <li key={tx.transaction_id || tx.id} style={{marginBottom:6}}>
                  <strong>{tx.transaction_id}</strong> — {tx.status} — ${tx.amount} — {new Date(tx.created_at || tx.timestamp || tx.created || Date.now()).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}