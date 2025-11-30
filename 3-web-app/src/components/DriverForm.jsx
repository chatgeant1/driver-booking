import React, { useEffect, useState } from 'react'

export default function DriverForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicleType, setVehicleType] = useState('motorbike')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [status, setStatus] = useState('offline')
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setPhone(initialData.phone || '')
      setVehicleType(initialData.vehicleType || 'motorbike')
      setVehiclePlate(initialData.vehiclePlate || '')
      setStatus(initialData.status || 'offline')
      setLat(initialData.location?.lat ?? '')
      setLon(initialData.location?.lon ?? '')
    } else {
      setName(''); setPhone(''); setVehicleType('motorbike'); setVehiclePlate(''); setStatus('offline'); setLat(''); setLon('')
    }
  }, [initialData])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name || !phone || !vehiclePlate) {
      alert('Vui lòng nhập tên, số điện thoại và biển số')
      return
    }
    const payload = {
      name, phone, vehicleType, vehiclePlate, status,
      location: { lat: lat === '' ? null : parseFloat(lat), lon: lon === '' ? null : parseFloat(lon) }
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} style={{marginBottom:12, border:'1px solid #eee', padding:8}}>
      <h3>{initialData ? 'Sửa Driver' : 'Tạo Driver'}</h3>
      <div><input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} /></div>
      <div><input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} /></div>
      <div>
        <input placeholder="Vehicle plate" value={vehiclePlate} onChange={e=>setVehiclePlate(e.target.value)} />
      </div>
      <div>
        <select value={vehicleType} onChange={e=>setVehicleType(e.target.value)}>
          <option value="motorbike">Motorbike</option>
          <option value="car">Car</option>
        </select>
        <select value={status} onChange={e=>setStatus(e.target.value)} style={{marginLeft:8}}>
          <option value="available">available</option>
          <option value="busy">busy</option>
          <option value="offline">offline</option>
        </select>
      </div>
      <div>
        <input placeholder="Lat" value={lat} onChange={e=>setLat(e.target.value)} style={{width:100}} />
        <input placeholder="Lon" value={lon} onChange={e=>setLon(e.target.value)} style={{width:100, marginLeft:6}} />
      </div>
      <div style={{marginTop:6}}>
        <button type="submit">{initialData ? 'Lưu' : 'Tạo'}</button>
        {initialData && <button type="button" onClick={onCancel} style={{marginLeft:6}}>Hủy</button>}
      </div>
    </form>
  )
}