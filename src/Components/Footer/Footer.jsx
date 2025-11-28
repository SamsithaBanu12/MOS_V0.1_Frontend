import React from 'react'
import './Footer.css'

export default function Footer({ wsReady }) {
  return (
    <footer className="footer panel">
      <div>© GLX • Bridge </div>
      <div className="ws-badge">
        MCS Connection:
        <span className={wsReady ? 'led led-ok' : 'led led-off'} />
        {wsReady ? 'Connected' : 'Disconnected'}
      </div>
    </footer>
  )
}
