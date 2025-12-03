import React, { useEffect, useMemo, useState } from 'react'
import './ConnectPage.css'
import { openBridgeWS } from '../utils/api/ws'
import { getStatus, connectBridge, disconnectBridge } from '../utils/api/api'

import Header from '../Components/Header/Header'
import StationSelector from '../Components/StationSelector/StationSelector'
import ConnectionPanel from '../Components/ConnectionPanel/ConnectionPanel'
import StatsPanel from '../Components/StatsPanel/StatsPanel'
import TopicPanel from '../Components/TopicPanel/TopicPanel'
import Footer from '../Components/Footer/Footer'

// Health overlay
import HealthDrawer from '../Components/HealthDrawer/HealthDrawer'
import { useGettingConnectionStatus } from '../utils/hooks'

function ConnectionPage() {
  const [stationId, setStationId] = useState(null)
  const [stationMeta, setStationMeta] = useState(null)
  const [status, setStatus] = useState({ a_connected: false, b_connected: false, counters: {} })
  const [wsReady, setWsReady] = useState(false)

  // Health overlay state
  const [healthOpen, setHealthOpen] = useState(false)
  useGettingConnectionStatus(stationId, setStatus);

  console.log('status values', status, stationId)

  // WebSocket wiring
  useEffect(() => {
    const ws = openBridgeWS({
      onOpen: () => setWsReady(true),
      onClose: () => setWsReady(false),
      onMessage: (msg) => {
        // Soft-refresh status when this station's connection state changes
        if (msg?.station && msg.station === stationId && msg.type === 'status') {
          if (stationId) getStatus(stationId).then(setStatus).catch(() => { })
        }
      }
    })
    return () => ws.close()
  }, [stationId])

  const handleStationChange = (id, meta) => {
    setStationId(id)
    setStationMeta(meta || null)
  }

  const handleConnect = async () => {
    if (!stationId) return
    await connectBridge(stationId)
  }

  const handleDisconnect = async () => {
    if (!stationId) return
    await disconnectBridge(stationId)
  }

  // Dynamic topic headings: COSMOS fixed; GS topics from stationMeta
  const topics = useMemo(() => ([
    { key: 'cosmos/command', title: 'COSMOS / command' },
    { key: 'cosmos/telemetry', title: 'COSMOS / telemetry' },
    { key: 'SatOS/uplink', title: stationMeta?.topic_uplink || 'SatOS/uplink' },
    { key: 'SatOS/downlink', title: stationMeta?.topic_downlink || 'SatOS/downlink' },
  ]), [stationMeta])

  // 👇 overall connection state for the selected station
  const connected = Boolean(status?.a_connected && status?.b_connected)

  return (
    <div className="app-root">
      <div className="app-grid">
        {/* Header row */}
        {/* <Header onOpenHealth={() => setHealthOpen(true)} /> */}

        {/* Content row */}
        <main className="content-grid">
          <div className="left-rail">
            <section className="panel">
              <StationSelector
                value={stationId}
                onChange={handleStationChange}
                connected={connected}
              />
            </section>

            <ConnectionPanel
              status={status}
              stationId={stationId}
              stationMeta={stationMeta}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />

            <StatsPanel
              counters={status.counters || {}}
              aOk={status.a_connected}
              bOk={status.b_connected}
              stationId={stationId}
            />
          </div>

          <div className="right-rail">
            {topics.map(t => (
              <TopicPanel
                key={t.key}
                stationId={stationId}
                topicKey={t.key}   // logical key for /messages
                title={t.title}    // visual heading (station-specific)
              />
            ))}
          </div>
        </main>

        {/* Footer row */}
        {/* <Footer wsReady={wsReady} /> */}

        {/* Health overlay drawer */}
        <HealthDrawer
          open={healthOpen}
          onClose={() => setHealthOpen(false)}
          stationId={stationId}
        />
      </div>
    </div>
  )
}
export default ConnectionPage;