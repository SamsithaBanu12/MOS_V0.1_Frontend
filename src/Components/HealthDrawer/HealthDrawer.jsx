import React, { useEffect, useMemo, useRef, useState } from 'react'
import './HealthDrawer.css'
import { fetchHealth } from '../../utils/api/api'
import { subscribe } from '../../utils/api/ws'

function HealthPanel({ stationId, band, title }) {
  const [rows, setRows] = useState([])
  const [rawMode, setRawMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  const load = async () => {
    if (!stationId) return
    setLoading(true)
    try {
      const data = await fetchHealth(stationId, band, 300, 0)
      setRows(data)
    } finally {
      setLoading(false)
    }
  }

  // initial + polling
  useEffect(() => {
    let t = null
    load()
    t = setInterval(load, 2000)
    return () => t && clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, band])

  // WS nudge (only for this band AND this station)
  useEffect(() => {
    const off = subscribe('health', (msg) => {
      if (!stationId) return
      if (msg?.station === stationId) {
        if (band === 'sband' && /sband\/health/i.test(msg.topic)) load()
        if (band === 'xband' && /xband\/health/i.test(msg.topic)) load()
      }
    })
    return () => off && off()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, band])

  // auto scroll to bottom on refresh/toggle
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [rows, rawMode])

  const formatted = useMemo(() => {
    return rows.map(r => {
      if (rawMode) {
        // Health is usually JSON/text
        return (r.display_text || '').trim()
      }
      return `Health • ${r.mqtt_topic} • ${r.bytes} bytes • ${r.ts_utc}`
    })
  }, [rows, rawMode])

  return (
    <section className="health-panel panel">
      <div className="health-head">
        <div className="panel-title">{title}</div>
        <div className="topic-actions">
          <label className="switch">
            <input
              type="checkbox"
              checked={rawMode}
              onChange={e => setRawMode(e.target.checked)}
              aria-label="Toggle raw"
            />
            <span>Raw</span>
          </label>
          <button className="btn btn-ghost sm" onClick={load} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="scroll health-body" ref={scrollRef}>
        {rows.length === 0 ? (
          <div className="empty">No messages.</div>
        ) : (
          <ul className="msg-list">
            {rows.map((r, idx) => (
              <li key={`${band}-${r.id}`} className="msg">
                <div className="meta">
                  <span className="ts">{r.ts_utc}</span>
                  <span className="bytes">{r.bytes} bytes</span>
                  <span className="topic">{r.mqtt_topic}</span>
                </div>
                {rawMode ? (
                  <pre className="payload">{formatted[idx]}</pre>
                ) : (
                  <div className="summary-line">{formatted[idx]}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default function HealthDrawer({ open, onClose, stationId }) {
  if (!open) return null
  return (
    <div className="health-drawer">
      <div className="health-content">
        <div className="health-topbar">
          <div className="title">Ground Station Health</div>
          <button className="btn btn-danger sm" onClick={onClose}>Close</button>
        </div>

        <div className="health-grid">
          <HealthPanel stationId={stationId} band="sband" title="S-Band Health (sband/health)" />
          <HealthPanel stationId={stationId} band="xband" title="X-Band Health (xband/health)" />
        </div>
      </div>
    </div>
  )
}
