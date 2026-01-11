import React, { useRef, useEffect, useState } from 'react'

const CANVAS_SIZE = 600
const GRID_MAX = 100
const SCALE = CANVAS_SIZE / GRID_MAX
const TICK_MS = 500
const RANDOM_MOVE_PERIOD_MS = 5000

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}
function stepTowards(src, dst) {
  const dx = Math.sign(dst.x - src.x)
  const dy = Math.sign(dst.y - src.y)
  return { x: src.x + dx, y: src.y + dy }
}

export default function MapSimulator({ initialDrivers }) {
  const canvasRef = useRef(null)
  const [running, setRunning] = useState(false)
  const [drivers, setDrivers] = useState(() => {
    if (initialDrivers && initialDrivers.length) return initialDrivers.map((d, i) => ({ id: d.id || `d${i+1}`, x: d.x, y: d.y, status: 'idle', target: null }))
    return [
      { id: 'driver1', x: 2, y: 18, status: 'idle', target: null },
      { id: 'driver2', x: 9, y: 55, status: 'idle', target: null },
      { id: 'driver3', x: 5, y: 22, status: 'idle', target: null },
    ]
  })
  const [user, setUser] = useState({ x: 5, y: 20 })
  const [destination, setDestination] = useState({ x: 30, y: 60 })
  const lastRandomRef = useRef(Date.now())

  useEffect(() => {
    let timer
    function tick() {
      setDrivers(prev => {
        const now = Date.now()
        const doRandom = now - lastRandomRef.current >= RANDOM_MOVE_PERIOD_MS
        if (doRandom) lastRandomRef.current = now

        return prev.map(d => {
          // behavior by status
          if (d.status === 'on_way' && d.target) {
            // move step-by-step toward user/target
            const next = stepTowards({ x: d.x, y: d.y }, d.target)
            const reached = dist(next, d.target) === 0
            if (reached) {
              // arrived to pickup -> switch to in_ride and set new target = destination
              return { ...d, x: next.x, y: next.y, status: 'in_ride', target: { ...destination } }
            }
            return { ...d, x: next.x, y: next.y }
          } else if (d.status === 'in_ride' && d.target) {
            const next = stepTowards({ x: d.x, y: d.y }, d.target)
            const reached = dist(next, d.target) === 0
            if (reached) {
              return { ...d, x: next.x, y: next.y, status: 'idle', target: null }
            }
            return { ...d, x: next.x, y: next.y }
          } else {
            // idle/random movement occasionally
            if (doRandom) {
              const rx = (Math.random() * 2 - 1) // -1..1
              const ry = (Math.random() * 2 - 1)
              // keep integers for grid effect
              const nx = Math.max(0, Math.min(GRID_MAX, Math.round(d.x + rx)))
              const ny = Math.max(0, Math.min(GRID_MAX, Math.round(d.y + ry)))
              return { ...d, x: nx, y: ny }
            }
            return d
          }
        })
      })
      timer = setTimeout(tick, TICK_MS)
    }
    if (running) tick()
    return () => clearTimeout(timer)
  }, [running, destination])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function render() {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
      // grid background
      ctx.fillStyle = '#f7f7fb'
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      // draw grid lines every 10
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1
      for (let g = 0; g <= GRID_MAX; g += 10) {
        const pos = g * SCALE
        ctx.beginPath()
        ctx.moveTo(pos, 0); ctx.lineTo(pos, CANVAS_SIZE); ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, pos); ctx.lineTo(CANVAS_SIZE, pos); ctx.stroke()
      }

      // draw user
      drawMarker(ctx, user.x, user.y, 'blue', 'U')

      // draw destination
      drawMarker(ctx, destination.x, destination.y, 'green', 'D')

      // draw drivers
      drivers.forEach(d => {
        const color = d.status === 'idle' ? '#888' : d.status === 'on_way' ? '#ff9900' : '#d9534f'
        drawDriver(ctx, d.x, d.y, color, d.id)
        if (d.target) {
          // draw line to target
          ctx.strokeStyle = color
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(d.x * SCALE, d.y * SCALE)
          ctx.lineTo(d.target.x * SCALE, d.target.y * SCALE)
          ctx.stroke()
        }
      })
    }

    function drawMarker(ctx, x, y, color, label) {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x * SCALE, y * SCALE, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, x * SCALE, y * SCALE)
    }
    function drawDriver(ctx, x, y, color, id) {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x * SCALE, y * SCALE, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(id.replace('driver','D'), x * SCALE, y * SCALE)
    }

    render()
    // re-render whenever drivers/user/destination change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drivers, user, destination])

  function assignDriverToPickup(driverId) {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'on_way', target: { ...user } } : d))
    setRunning(true)
  }
  function setDriverIdle(driverId) {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'idle', target: null } : d))
  }
  function addDriver() {
    setDrivers(prev => {
      const id = `driver${prev.length + 1}`
      return [...prev, { id, x: Math.round(Math.random()*GRID_MAX), y: Math.round(Math.random()*GRID_MAX), status: 'idle', target: null }]
    })
  }
  function resetSim() {
    setRunning(false)
    setDrivers([
      { id: 'driver1', x: 2, y: 18, status: 'idle', target: null },
      { id: 'driver2', x: 9, y: 55, status: 'idle', target: null },
      { id: 'driver3', x: 5, y: 22, status: 'idle', target: null },
    ])
    setUser({ x: 5, y: 20 })
    setDestination({ x: 30, y: 60 })
  }
  function randomizeDestination() {
    setDestination({ x: Math.round(Math.random()*GRID_MAX), y: Math.round(Math.random()*GRID_MAX) })
  }

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div>
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} style={{ border: '1px solid #ccc' }} />
        <div style={{ marginTop: 8 }}>
          <button onClick={() => setRunning(r => !r)}>{running ? 'Stop' : 'Start'}</button>
          <button onClick={addDriver} style={{ marginLeft: 8 }}>Add driver</button>
          <button onClick={randomizeDestination} style={{ marginLeft: 8 }}>Random Destination</button>
          <button onClick={resetSim} style={{ marginLeft: 8 }}>Reset</button>
        </div>
      </div>

      <div style={{ width: 320 }}>
        <h3>Simulation Control</h3>
        <div><strong>User:</strong> ({user.x}, {user.y}) <button onClick={() => { const nx = Math.round(Math.random()*GRID_MAX); const ny = Math.round(Math.random()*GRID_MAX); setUser({ x: nx, y: ny }) }} style={{ marginLeft: 8 }}>Randomize</button></div>
        <div style={{ marginTop: 8 }}>
          <label>Assign driver to pickup:</label>
          <div style={{ marginTop: 6 }}>
            <select id="driverSelect">
              {drivers.map(d => <option key={d.id} value={d.id}>{d.id} — ({d.x},{d.y}) — {d.status}</option>)}
            </select>
            <button style={{ marginLeft: 8 }} onClick={() => {
              const sel = document.getElementById('driverSelect')
              if (sel) assignDriverToPickup(sel.value)
            }}>Start Pickup</button>
            <button style={{ marginLeft: 6 }} onClick={() => {
              const sel = document.getElementById('driverSelect')
              if (sel) setDriverIdle(sel.value)
            }}>Set Idle</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <h4>Drivers</h4>
          <ul>
            {drivers.map(d => (
              <li key={d.id} style={{ marginBottom: 6 }}>
                <strong>{d.id}</strong> — ({d.x}, {d.y}) — {d.status}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: 12 }}>
          <h4>Destination</h4>
          <div>({destination.x}, {destination.y})</div>
        </div>
        <p style={{ marginTop: 12, color:'#666' }}><small>Grid: 0..100 (simulated coords). Distance uses Euclidean. Drivers move step-by-step; idle drivers move randomly every 5s.</small></p>
      </div>
    </div>
  )
}