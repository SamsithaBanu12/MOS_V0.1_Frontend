// src/api/ftmMockApi.js

// ---- SAMPLE HISTORY DATA ----
const SAMPLE_HISTORY = [
  {
    id: 1,
    filename: "image_1.jpg",
    size_bytes: 8623,
    status: "SUCCESS",
    total_packets: 7,
    started_at: "2025-12-02T10:30:00Z",
    finished_at: "2025-12-02T10:30:02Z",
  },
  {
    id: 2,
    filename: "large_file.bin",
    size_bytes: 2000000,
    status: "FAILED",
    total_packets: 20,
    started_at: "2025-12-02T11:00:00Z",
    finished_at: "2025-12-02T11:00:05Z",
  },
];

// simple in-memory log store per session (for the mock only)
const sessionLogs = {};
let nextSessionId = 3;

// ---- MOCK: upload file ----
// In real app: POST /ftm/upload (multipart/form-data)
export function uploadFileMock({ file, mtu, delay_ms, ack_mode }) {
  return new Promise((resolve) => {
    const sessionId = nextSessionId++;

    // create fake history row
    SAMPLE_HISTORY.unshift({
      id: sessionId,
      filename: file.name,
      size_bytes: file.size,
      status: "RUNNING",
      total_packets: 7,
      started_at: new Date().toISOString(),
      finished_at: null,
    });

    // create some initial logs
    sessionLogs[sessionId] = [
      "==== FTM Sender with Python Bridge (OpenC3) ====",
      "Connected to bridge at 127.0.0.1:8129",
      `File ${file.name} is ready for transfer (${file.size} bytes)`,
      `FTDS delay set : ${delay_ms}`,
      `MTU size : ${mtu}`,
      `ACK mode : ${ack_mode === 1 ? "ACK" : "UNACK"}`,
    ];

    setTimeout(() => resolve({ session_id: sessionId }), 300);
  });
}

// ---- MOCK: get history ----
// In real app: GET /ftm/history
export function getHistoryMock() {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...SAMPLE_HISTORY]), 150);
  });
}

// ---- MOCK: "WebSocket" for logs & progress ----
// In real app: new WebSocket("ws://localhost:8000/ftm/ws/" + sessionId)
export function connectMockStream(sessionId, { onLog, onProgress, onDone }) {
  const totalPackets = 7;
  let current = 0;

  // replay initial logs
  (sessionLogs[sessionId] || []).forEach((line) => onLog(line));

  const interval = setInterval(() => {
    current += 1;
    const line = `[FTM TX] Packet #${current} sent`;
    onLog(line);

    onProgress({
      packet: current,
      total: totalPackets,
      percent: Math.round((current / totalPackets) * 100),
    });

    if (current >= totalPackets) {
      clearInterval(interval);
      onLog("Upload success");
      onLog(
        "Session Info:: a. File size - 8 kilobyte (8623 bytes) b. Packet Interval time in ms - 10 c. MTU - 1350 d. Total packets - 7"
      );
      onDone({
        status: "SUCCESS",
        size_bytes: 8623,
        total_packets: totalPackets,
        elapsed_sec: 2,
        speed_kbps: 33.7,
      });

      // update mock history row
      const idx = SAMPLE_HISTORY.findIndex((h) => h.id === sessionId);
      if (idx >= 0) {
        SAMPLE_HISTORY[idx] = {
          ...SAMPLE_HISTORY[idx],
          status: "SUCCESS",
          finished_at: new Date().toISOString(),
        };
      }
    }
  }, 500);

  // return unsubscribe function
  return () => clearInterval(interval);
}
