import React, { useEffect } from 'react'
import './Modal.css'

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost sm" onClick={onClose} aria-label="Close">Close</button>
        </div>
        <div className="modal-body scroll">
          {children}
        </div>
      </div>
    </div>
  )
}
