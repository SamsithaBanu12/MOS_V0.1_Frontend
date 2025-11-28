import React, { useEffect, useRef, useState, useCallback } from 'react'
import './StationSelector.css'
import { getStations } from '../../utils/api/api'
import { FaChevronDown } from "react-icons/fa6";
import { FaChevronUp } from "react-icons/fa";

const KEY = 'bridge.currentStation'

export default function StationSelector({ value, onChange, connected = false }) {
  const [stations, setStations] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0, width: 0 })

  const wrapRef = useRef(null)
  const btnRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    (async () => {
      try {
        const list = await getStations()
        setStations(list)
        const saved = localStorage.getItem(KEY)
        if (!value && saved && list.find(s => s.id === saved)) {
          onChange(saved, list.find(s => s.id === saved))
        } else if (!value && list.length) {
          onChange(list[0].id, list[0])
        }
      } catch {
        setStations([])
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = stations.find(s => s.id === value) || null

  const positionMenu = useCallback(() => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setMenuPos({
      left: Math.round(r.left + window.scrollX),
      top: Math.round(r.bottom + 6 + window.scrollY),
      width: Math.round(r.width)
    })
  }, [])

  const openMenu = useCallback(() => {
    if (!stations.length || loading) return
    positionMenu()
    setOpen(true)
    const idx = Math.max(0, stations.findIndex(s => s.id === value))
    setActiveIdx(idx === -1 ? 0 : idx)
  }, [stations, loading, value, positionMenu])

  const closeMenu = useCallback(() => {
    setOpen(false)
    setActiveIdx(-1)
  }, [])

  // click outside -> close
  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current) return
      const target = e.target
      const inButton = wrapRef.current.contains(target)
      const inMenu = document.getElementById('gs-menu')?.contains(target)
      if (!inButton && !inMenu) closeMenu()
    }
    if (open) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open, closeMenu])

  // keep menu anchored on resize/scroll
  useEffect(() => {
    if (!open) return
    const handler = () => positionMenu()
    window.addEventListener('resize', handler, { passive: true })
    window.addEventListener('scroll', handler, { passive: true })
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler)
    }
  }, [open, positionMenu])

  const choose = (s) => {
    localStorage.setItem(KEY, s.id)
    onChange(s.id, s)
    closeMenu()
  }

  const scrollIntoViewIfNeeded = (idx) => {
    const list = listRef.current
    if (!list) return
    const item = list.querySelector(`[data-idx="${idx}"]`)
    if (!item) return
    const lb = list.getBoundingClientRect()
    const ib = item.getBoundingClientRect()
    if (ib.top < lb.top) list.scrollTop -= (lb.top - ib.top)
    if (ib.bottom > lb.bottom) list.scrollTop += (ib.bottom - lb.bottom)
  }

  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openMenu()
      }
      return
    }
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => {
        const ni = Math.min((i < 0 ? -1 : i) + 1, stations.length - 1)
        scrollIntoViewIfNeeded(ni); return ni
      })
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => {
        const ni = Math.max((i < 0 ? 0 : i) - 1, 0)
        scrollIntoViewIfNeeded(ni); return ni
      })
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && stations[activeIdx]) choose(stations[activeIdx])
    }
  }

  return (
    <div className="station-select">
      <label className="label">Ground Station</label>

      <div
        className={`custom-select ${open ? 'open' : ''} ${loading ? 'is-loading' : ''}`}
        ref={wrapRef}
      >
        <button
          type="button"
          className="select-btn"
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={onKeyDown}
          ref={btnRef}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {/* dot reflects CONNECTION state, not selection */}
          <span
            className={`dot ${connected ? 'ok' : 'off'}`}
            title={connected ? 'Connected' : 'Disconnected'}
          />
          <span className="sel-text">
            {loading ? 'Loading…' : (current ? current.name : 'Choose a station…')}
          </span>
          <span className="chev" aria-hidden>{!open ? <FaChevronDown size={12} /> : <FaChevronUp size={12} />}</span>
        </button>
      </div>

      {open && (
        <div
          id="gs-menu"
          className="menu-fixed"
          role="listbox"
          ref={listRef}
          style={{ left: `${menuPos.left}px`, top: `${menuPos.top}px`, width: `${menuPos.width}px` }}
        >
          {stations.map((s, i) => (
            <div
              role="option"
              aria-selected={value === s.id}
              key={s.id}
              data-idx={i}
              className={`item ${i === activeIdx ? 'active' : ''} ${value === s.id ? 'selected' : ''}`}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseDown={(e) => { e.preventDefault() }} /* keep focus */
              onClick={() => choose(s)}
            >
              <div className="item-name">{s.name}</div>
              <div className="item-sub">{s.id}</div>
            </div>
          ))}
          {!stations.length && (
            <div className="item disabled">No stations found</div>
          )}
        </div>
      )}
    </div>
  )
}
