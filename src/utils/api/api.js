import axios from 'axios'

export const API = axios.create({
  baseURL: 'http://localhost:8005', // change if your backend runs elsewhere
  timeout: 10000,
})

// ---------- Stations ----------
export async function getStations() {
  const { data } = await API.get('/stations')
  // Normalize minimal shape + pass-thru meta so App can display topics per station
  return (data || []).map(s => ({
    id: s.id,
    name: s.name,
    broker_b_host: s.broker_b_host,
    broker_b_port: s.broker_b_port,
    broker_b_username: s.broker_b_username || '',
    topic_uplink: s.topic_uplink,
    topic_downlink: s.topic_downlink,
    // health meta (per-station)
    health_host: s.health_host,
    health_port: s.health_port,
    health_sband_topic: s.health_sband_topic,
    health_xband_topic: s.health_xband_topic,
  }))
}

// ---------- Bridge control / status ----------
export async function getStatus(station) {
  const { data } = await API.get('/status', { params: { station } })
  return data
}

export async function connectBridge(station) {
  const { data } = await API.post('/connect', null, { params: { station } })
  return data
}

export async function disconnectBridge(station) {
  const { data } = await API.post('/disconnect', null, { params: { station } })
  return data
}

// ---------- Topic messages ----------
export async function fetchMessages(station, topic, limit = 200, offset = 0) {
  const { data } = await API.get('/messages', {
    params: { station, topic, limit, offset }
  })
  return data
}

// ---------- Health streams ----------
export async function fetchHealth(stationId, band, limit = 200, offset = 0) {
  const { data } = await API.get('/health/messages', {
    params: { station: stationId, band, limit, offset }
  })
  return data?.items || []
}
