import React, { useState } from 'react'
import './ConnectionPanel.css';
import { GoDotFill } from "react-icons/go";

export default function ConnectionPanel({ status, stationId, stationMeta, onConnect, onDisconnect }) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <section className="panel conn">
        <div className='panel-title-wrapper'>
          <div className="panel-title">Connection</div>
          <button className="tiny-btn" onClick={() => setShowDetails(true)} disabled={!stationMeta}>
            Details
          </button>
        </div>
        <div className='row-lines'>
          <div className="row-heading">
            <div className="section-title">
              MCS Connection
              <span className={`status-badge ${status.a_connected ? 'ok' : 'off'}`}>
                <GoDotFill color={status.a_connected ? 'green' : '#ff3864'} /> {status.a_connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="kv-line">
            <div className="kv"><span className="k">Host</span><div className='value-seg' value="localhost">localhost</div></div>
            <div className="kv"><span className="k">Port</span><div className='value-seg' value={2147}>2147</div></div>
          </div>
        </div>

        {/* Broker B (from selected station) */}
        <div className='row-lines'>
          <div className="row-heading">
            <div className="section-title">
              GS Connection
              <span className={`status-badge ${status.b_connected ? 'ok' : 'off'}`}>
                <GoDotFill color={status.b_connected ? 'green' : '#ff3864'} />{status.b_connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Kept compact: only host/port on card */}
          <div className="kv-line">
            <div className="kv">
              <span className="k">Host</span>
              <div className='value-seg' value="localhost">{stationMeta?.broker_b_host || ''}</div>
            </div>
            <div className="kv">
              <span className="k">Port</span>
              <div className='value-seg' value="localhost">{stationMeta?.broker_b_port || ''}</div>
            </div>
          </div>
        </div>
        {/* Removed the inline .collapsible block to save space */}

        <div className="row footer-row">
          <div />
          <div className="actions">
            <button className="btn btn-primary" onClick={onConnect} disabled={!stationId}>Connect</button>
            <button className="btn btn-ghost" onClick={onDisconnect} disabled={!stationId}>Disconnect</button>
          </div>
        </div>
      </section>

      {/* Lightweight modal for the abstracted details */}
      {showDetails && (
        <div className="conn-modal-backdrop" onClick={() => setShowDetails(false)}>
          <div className="conn-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="conn-modal-head">
              <div className="conn-modal-title">Ground Station Details</div>
              <button className="tiny-btn" onClick={() => setShowDetails(false)} aria-label="Close">Close</button>
            </div>
            <div className="conn-modal-body scroll">
              <div className="conn-modal-grid">
                <h4>Station</h4>
                <div className="kv"><span className="k">ID</span><input value={stationId || ''} readOnly /></div>
                <div className="kv"><span className="k">Name</span><input value={stationMeta?.name || ''} readOnly /></div>

                <h4>Broker B</h4>
                <div className="kv"><span className="k">Host</span><input value={stationMeta?.broker_b_host || ''} readOnly /></div>
                <div className="kv"><span className="k">Port</span><input value={stationMeta?.broker_b_port ?? ''} readOnly /></div>
                <div className="kv"><span className="k">User</span><input value={stationMeta?.broker_b_username || ''} readOnly /></div>
                <div className="kv"><span className="k">Pass</span><input value={stationMeta?.broker_b_password ? '••••••••' : ''} readOnly /></div>

                <h4>Topics</h4>
                <div className="kv"><span className="k">Uplink</span><input value={stationMeta?.topic_uplink || ''} readOnly /></div>
                <div className="kv"><span className="k">Downlink</span><input value={stationMeta?.topic_downlink || ''} readOnly /></div>

                {(stationMeta?.health_host || stationMeta?.health_port || stationMeta?.health_sband_topic || stationMeta?.health_xband_topic) && (
                  <>
                    <h4>Health</h4>
                    <div className="kv"><span className="k">Host</span><input value={stationMeta?.health_host || ''} readOnly /></div>
                    <div className="kv"><span className="k">Port</span><input value={stationMeta?.health_port ?? ''} readOnly /></div>
                    <div className="kv"><span className="k">S-band</span><input value={stationMeta?.health_sband_topic || ''} readOnly /></div>
                    <div className="kv"><span className="k">X-band</span><input value={stationMeta?.health_xband_topic || ''} readOnly /></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
