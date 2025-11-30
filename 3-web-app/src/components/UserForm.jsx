import React, { useEffect, useState } from 'react'

export default function UserForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [rating, setRating] = useState(5.0)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setPhone(initialData.phone || '')
      setRating(initialData.rating ?? 5.0)
    } else {
      setName('')
      setPhone('')
      setRating(5.0)
    }
  }, [initialData])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name || !phone) {
      alert('Vui lòng nhập tên và số điện thoại')
      return
    }
    onSubmit({ name, phone, rating })
  }

  return (
    <form onSubmit={handleSubmit} style={{marginBottom:12, border:'1px solid #eee', padding:8}}>
      <h3>{initialData ? 'Sửa User' : 'Tạo User'}</h3>
      <div>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      </div>
      <div>
        <input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
      </div>
      <div>
        <input type="number" step="0.1" min="0" max="5" placeholder="Rating" value={rating} onChange={e=>setRating(parseFloat(e.target.value))} />
      </div>
      <div style={{marginTop:6}}>
        <button type="submit">{initialData ? 'Lưu' : 'Tạo'}</button>
        {initialData && <button type="button" onClick={onCancel} style={{marginLeft:6}}>Hủy</button>}
      </div>
    </form>
  )
}