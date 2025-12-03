// src/components/FileUploadGUI.jsx
import React, { useEffect, useRef, useState } from "react";
import {
    uploadFileMock,
    getHistoryMock,
    connectMockStream,
} from "./FileUploadData.jsx";
import "./FileUpload.space.css";
import { MdOutlineFileUpload } from "react-icons/md";

export default function FileUploadGUI() {
    const [file, setFile] = useState(null);
    const [mtu, setMtu] = useState(1350);
    const [delay, setDelay] = useState(10);
    const [ackMode, setAckMode] = useState(1); // 1 = ACK, 0 = UNACK

    const [history, setHistory] = useState([]);
    const [progress, setProgress] = useState(0);
    const [packets, setPackets] = useState({ current: 0, total: 0 });
    const [speed, setSpeed] = useState("-");
    const [timeTaken, setTimeTaken] = useState("-");
    const [status, setStatus] = useState("-");
    const [logs, setLogs] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef(null);
    const unsubscribeStreamRef = useRef(null);

    // load initial history (from mock)
    useEffect(() => {
        getHistoryMock().then(setHistory);
    }, []);

    const openFileDialog = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
    };

    const resetStatus = () => {
        setProgress(0);
        setPackets({ current: 0, total: 0 });
        setSpeed("-");
        setTimeTaken("-");
        setStatus("-");
        setLogs([]);
    };

    const handleUploadClick = async () => {
        if (!file || uploading) return;
        resetStatus();
        setUploading(true);

        try {
            // call mock "upload" API
            const res = await uploadFileMock({
                file,
                mtu,
                delay_ms: delay,
                ack_mode: ackMode,
            });

            const sessionId = res.session_id;
            setActiveSessionId(sessionId);
            setStatus("RUNNING");

            // open mock "stream"
            if (unsubscribeStreamRef.current) {
                unsubscribeStreamRef.current();
            }
            unsubscribeStreamRef.current = connectMockStream(sessionId, {
                onLog: (line) =>
                    setLogs((prev) => [...prev.slice(-300), line]), // keep last 300 lines
                onProgress: ({ packet, total, percent }) => {
                    setPackets({ current: packet, total: total || 0 });
                    if (percent != null) setProgress(percent);
                },
                onDone: ({ status: st, elapsed_sec, speed_kbps }) => {
                    setStatus(st);
                    setTimeTaken(`${elapsed_sec.toFixed(1)} s`);
                    if (speed_kbps != null)
                        setSpeed(`${speed_kbps.toFixed(1)} Kbits/s`);

                    // refresh history from mock store
                    getHistoryMock().then(setHistory);
                    setUploading(false);
                },
            });
        } catch (e) {
            console.error(e);
            setStatus("FAILED");
            setUploading(false);
        }
    };

    return (

        <div className="fu-wrapper">
            <div className="fu-top-wrapper">
                <div className="fu-file-builder">
                    <div className="fu-file-header">File Upload Builder</div>
                    <div className="fu-upload-file-wrap">
                        <div className="fu-filename-box" onClick={openFileDialog}>
                            {file ? file.name : "FileName"}
                        </div>
                        <button
                            className="fu-upload-icon-btn"
                            type="button"
                            onClick={openFileDialog}
                        >
                            <MdOutlineFileUpload size={20} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="fu-input-wrapper">
                        <div className="fu-param-row">
                            <span>MTU</span>
                            <input
                                className="fu-param-row-input"
                                type="number"
                                value={mtu}
                                onChange={(e) => setMtu(Number(e.target.value))}
                            />
                        </div>
                        <div className="fu-param-row">
                            <span>FTDS Delay (ms)</span>
                            <input
                                type="number"
                                value={delay}
                                onChange={(e) => setDelay(Number(e.target.value))}
                            />
                        </div>
                        <div className="fu-param-row">
                            <span>ACK/UNACK Mode</span>
                            <select
                            className="fu-select"
                                value={ackMode}
                                onChange={(e) => setAckMode(Number(e.target.value))}
                            >
                                <option value={1}>ACK (1)</option>
                                <option value={0}>UNACK (0)</option>
                            </select>
                        </div>
                    </div>
                    <div className="fu-upload-btnn">
                    <button
                        className="fu-upload-btn"
                        type="button"
                        onClick={handleUploadClick}
                        disabled={!file || uploading}
                    >
                        {uploading ? "Uploading..." : "Upload"}
                    </button>
                    </div>
                </div>
                <div className="fu-file-history">
                    <div className="fu-file-history-topic">Upload Files History</div>
                    <div className="fu-scroll fu-stats-table-wrap">
                        <table className="fu-stats-table">
                            <thead>
                                <tr>
                                    <th>File Name</th>
                                    <th>Size</th>
                                    <th>Status</th>
                                    <th>Packet</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="fu-history-empty">
                                            No Histories Yet
                                        </td>
                                    </tr>
                                )}
                                {history.map(row => (
                                    <tr
                                        key={row.id}
                                        className={
                                            row.id === activeSessionId ? "fu-history-active" : ""
                                        }
                                    >
                                        <td className="fu-num">{row.filename}</td>
                                        <td className="fu-num">{row.size_bytes ?? "-"}</td>
                                        <td className="fu-num">{row.status}</td>
                                        <td className="fu-num">{row.total_packets ?? "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="fu-bottom-wrapper">
                <div className="fu-status-wrapper">
                    <div className="fu-status-wrapper-topic">File Upload Status</div>
                    <div className="fu-progress-bar-wrap">
                        <div className="progress-header">File Upload Progress</div>
                        <div className="fu-progress-bar">
                            <div
                                className="fu-progress-bar-inner"
                                style={{ width: `${progress}%`, color: 'green' }}
                            />
                        </div>
                    </div>
                    <div className="fu-log-messages-wrapper">
                        <div className="fu-log-message-header">Log Messages</div>
                        {logs.length === 0 ? (
                            <div className="no-logs">Upload the files then logs will appear here</div>
                        ) : (
                            <div className="fu-log-wrapper">
                                {logs.map((l, i) => (
                                    <div className="fu-log" key={i}>{l}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="fu-file-upload-details">
                    <div className="fu-file-details-header">File Upload Details</div>
                    <div className="fu-detail-row">
                        <span>Packets:</span>
                        <span className="fu-detail-value">
                            {packets.current}/{packets.total || "-"}
                        </span>
                    </div>
                    <div className="fu-detail-row">
                        <span>Speed:</span>
                        <span className="fu-detail-value">{speed}</span>
                    </div>
                    <div className="fu-detail-row">
                        <span>Time taken for upload:</span>
                        <span className="fu-detail-value">{timeTaken}</span>
                    </div>
                    <div className="fu-detail-row">
                        <span>Status:</span>
                        <span className="fu-detail-value">{status}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
