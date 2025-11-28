import React, { useEffect, useMemo, useRef, useState } from 'react'
import './TopicPanel.css'
import { fetchMessages } from '../../utils/api/api'
import { subscribe } from '../../utils/api/ws'

export default function TopicPanel({ stationId, topicKey, title }) {
  const [rows, setRows] = useState([])
  const [rawMode, setRawMode] = useState(true)
  const [loading, setLoading] = useState(false)

  const scrollRef = useRef(null)
  const timerRef = useRef(null)
  const reqTokenRef = useRef(0) // increments per request; ignore stale responses

  // Persisted cutoff per station/topic (ID-based)
  const cutoffKey = useMemo(
    () => `clearCutoffId:${stationId || 'none'}:${topicKey}`,
    [stationId, topicKey]
  )
  const [cutoffId, setCutoffId] = useState(() => {
    const v = localStorage.getItem(cutoffKey)
    return v ? Number(v) : 0
  })
  // Keep state in sync if station/topic changes
  useEffect(() => {
    const v = localStorage.getItem(cutoffKey)
    setCutoffId(v ? Number(v) : 0)
  }, [cutoffKey])

  const load = async () => {
    if (!stationId) { setRows([]); return }
    setLoading(true)
    const myToken = ++reqTokenRef.current
    try {
      const data = await fetchMessages(stationId, topicKey, 300, 0)
      if (myToken !== reqTokenRef.current) return // stale response; ignore
      const filtered = (data || []).filter(r => Number(r.id) > cutoffId)
      setRows(filtered)
    } finally {
      if (myToken === reqTokenRef.current) setLoading(false)
    }
  }

  // initial + polling every 2s
  useEffect(() => {
    // clear any prior interval
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    load()
    timerRef.current = setInterval(load, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, topicKey, cutoffId])

  // WS nudge: reload when a message for this station/topic arrives
  useEffect(() => {
    const off = subscribe('message', (msg) => {
      if (msg?.station === stationId && msg?.topic === topicKey) load()
    })
    return () => { off && off() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, topicKey])

  const formatted = useMemo(() => {
    return rows.map(r => {
      if (!rawMode) {
        return `Message ${r.direction || '-'} • ${r.bytes} bytes • ${r.ts_utc}`
      }
      if (topicKey === 'SatOS/downlink') {
        try {
          const obj = JSON.parse(r.display_text || '{}')
          return JSON.stringify(obj, null, 2)
        } catch {
          return (r.display_text || '').trim()
        }
      }
      const s = (r.display_text || '').trim()
      if (/^[0-9a-fA-F]+$/.test(s)) return s.replace(/([0-9a-fA-F]{2})/g, '$1 ').trim()
      return s
    })
  }, [rows, rawMode, topicKey])

  const handleClear = () => {
    // Determine current highest ID and set it as the new cutoff
    const maxId = rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)
    const newCutoff = maxId > 0 ? maxId : cutoffId
    localStorage.setItem(cutoffKey, String(newCutoff))
    setCutoffId(newCutoff)      // update state so future loads filter correctly
    setRows([])                 // instant UI clear
    reqTokenRef.current++       // invalidate any in-flight fetch
  }

  // // keep scrolled to bottom on refresh
  // useEffect(() => {
  //   const el = scrollRef.current
  //   if (!el) return
  //   el.scrollTop = el.scrollHeight
  // }, [rows, rawMode])

  return (
    <section className="panel topic">
      <div className="topic-head">
        <div className="panel-title">{title}</div>
        <div className='topic-top'>


          {/* Only show while loading */}
                  {loading && <div className="topic-loading-bar" />}
<div className="topic-actions">
          <label className="switch">
            <input
              aria-label="Toggle raw view"
              type="checkbox"
              checked={rawMode}
              onChange={e => setRawMode(e.target.checked)}
            />
            <span>Raw</span>
          </label>
          <button className="btn btn-danger sm" onClick={handleClear}>Clear</button>
          </div>
        </div>

      </div>

      <div className="scroll topic-body" ref={scrollRef}>
        {(!stationId) ? (
          <div className="empty">Select a ground station to view messages.</div>
        ) : rows.length === 0 ? (
          <div className="empty">No messages.</div>
        ) : (
          <ul className="msg-list">
            {rows.map((r, idx) => (
              <li key={r.id} className="msg">
                <div className="meta">
                  <span className={`pill dir-${(r.direction || '').toLowerCase()}`}>{r.direction || '-'}</span>
                  <span className="ts">{r.ts_utc}</span>
                  <span className="bytes">{r.bytes} bytes</span>
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
