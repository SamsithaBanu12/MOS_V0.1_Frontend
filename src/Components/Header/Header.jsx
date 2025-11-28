import React from 'react'
import './Header.css'

export default function Header({ onOpenHealth }) {
  return (
    <header className="header panel">
      <div className="brand">
        <div className="brand-text">
          <div className="brand-title">GLX Bridge</div>
          <div className="brand-sub">Mission Control ↔ Ground Station</div>
        </div>
      </div>
      <div className="header-r">
        <button className="btn btn-ghost sm" onClick={onOpenHealth}>GS Health</button>
      </div>
    </header>
  )
}
