import React, { useEffect, useMemo, useState } from 'react'
import './StatsPanel.css'

const ORDER = ['cosmos/command','cosmos/telemetry','SatOS/uplink','SatOS/downlink']
const KEYS = ['rx_msgs','rx_bytes','tx_msgs','tx_bytes']
const ZERO = { rx_msgs:0, rx_bytes:0, tx_msgs:0, tx_bytes:0 }

const clone = (x) => { try { return JSON.parse(JSON.stringify(x || {})) } catch { return {} } }
const getTopic = (obj, k) => obj?.[k] ?? ZERO

export default function StatsPanel({ counters, aOk, bOk, stationId }) {
  const LS_KEY = stationId ? `bridge.statsBaseline.${stationId}` : 'bridge.statsBaseline'
  const [baseline, setBaseline] = useState(null)

  // Load baseline on station change
  useEffect(() => {
    if (!stationId) { setBaseline(null); return }
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) { setBaseline(null); return }
    try {
      const obj = JSON.parse(raw)
      setBaseline(clone(obj.baseline))
    } catch { setBaseline(null) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId])

  // If backend counters ever reset below our baseline, re-baseline to current
  useEffect(() => {
    if (!counters || !baseline) return
    let needRebase = false
    for (const t of ORDER) {
      const cur = getTopic(counters, t)
      const base = getTopic(baseline, t)
      for (const k of KEYS) {
        if ((cur[k] || 0) < (base[k] || 0)) { needRebase = true; break }
      }
      if (needRebase) break
    }
    if (needRebase) {
      const snap = clone(counters)
      setBaseline(snap)
      localStorage.setItem(LS_KEY, JSON.stringify({ baseline: snap }))
    }
  }, [counters, baseline, LS_KEY])

  const delta = (topic, key) => {
    const cur = Number(getTopic(counters, topic)[key] || 0)
    const base = Number(getTopic(baseline || {}, topic)[key] || 0)
    const d = cur - base
    return d > 0 ? d : 0
  }

  const rows = useMemo(() => {
    return ORDER.map(t => ({
      topic: t,
      rxm: delta(t,'rx_msgs'),
      rxb: delta(t,'rx_bytes'),
      txm: delta(t,'tx_msgs'),
      txb: delta(t,'tx_bytes'),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counters, baseline, stationId])

  const handleClear = () => {
    const snap = clone(counters || {})
    setBaseline(snap)
    localStorage.setItem(LS_KEY, JSON.stringify({ baseline: snap }))
  }

  return (
    <section className="panel stats">
      <div className="stats-head">
        <div className="panel-title">Statistics</div>
        <div className="stats-actions">
          <button className="btn btn-ghost sm" onClick={handleClear} disabled={!stationId}>Clear</button>
        </div>
      </div>

      <div className="scroll stats-table-wrap">
        <table className="stats-table">
          <thead>
            <tr>
              <th>Topic</th>
              <th>Rx Msgs</th>
              <th>Rx Bytes</th>
              <th>Tx Msgs</th>
              <th>Tx Bytes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.topic}>
                <td>{r.topic}</td>
                <td className="num">{r.rxm}</td>
                <td className="num">{r.rxb}</td>
                <td className="num">{r.txm}</td>
                <td className="num">{r.txb}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
