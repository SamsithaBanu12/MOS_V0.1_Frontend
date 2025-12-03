// src/App.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:8008/api";

// value: "YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS"
function isoFromLocalDatetime(value) {
  if (!value) return "";
  // datetime-local has no timezone; treat it as UTC and append Z
  if (value.endsWith("Z")) return value;
  return value + "Z";
}

function humanFromEpoch(epoch) {
  if (epoch === null || epoch === undefined || epoch === "") return "—";
  const n = Number(epoch);
  if (Number.isNaN(n)) return String(epoch);
  return new Date(n * 1000).toISOString().replace(".000Z", "Z");
}

function ScheduleUploadList() {
  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [baseEntries, setBaseEntries] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [startTime, setStartTime] = useState(""); // datetime-local (with seconds)
  const [delays, setDelays] = useState([]);

  const [generatedEntries, setGeneratedEntries] = useState([]);
  const [generatedFilename, setGeneratedFilename] = useState("");

  const [rightTableRows, setRightTableRows] = useState([]);

  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);

  // run + execution status
  const [runId, setRunId] = useState(null);
  const [executionBanner, setExecutionBanner] = useState(""); // "", "IN_PROGRESS", "COMPLETED"

  // telemetry modal
  const [telemetryModal, setTelemetryModal] = useState(null);

  // Live UTC clock
  const [nowUtc, setNowUtc] = useState(new Date());

const showToast = (title, msg, type = "success") => {
  console.log("title", title, msg);

  const content = (
    <div>
          <div className="toast-title">{title}</div>
          <div className="toast-msg">{msg}</div>
        </div>
  );

  if (type === "error") {
    toast.error(content);
  } else if (type === "info") {
    toast.info(content);
  } else {
    toast.success(content);
  }
};

  // Tick UTC clock every second
  useEffect(() => {
    const id = setInterval(() => {
      setNowUtc(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Load schedule options on mount AND restore last run if present
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(`${API_BASE}/schedules`);
        if (!res.ok) throw new Error("Failed to load schedules");
        const data = await res.json();
        setScheduleOptions(data);

        // Restore last run if present
        const savedRunId = localStorage.getItem("lastRunId");
        if (savedRunId) {
          setRunId(savedRunId);
          setExecutionBanner("IN_PROGRESS"); // will be updated correctly after first poll
          showToast(
            "Session restored",
            "Resuming last schedule execution tracking.",
            "success"
          );
        }
      } catch (err) {
        console.error(err);
        showToast("Error", "Could not load schedules from backend", "error");
      }
    };
    fetchSchedules();
  }, []);

  const fetchScheduleEntries = async (filename) => {
    try {
      const res = await fetch(
        `${API_BASE}/schedules/${encodeURIComponent(filename)}`
      );
      if (!res.ok) throw new Error("Failed to load schedule");
      const data = await res.json();
      const entries = data.entries || [];
      setBaseEntries(entries);
      setIsEditing(false);
      setGeneratedEntries([]);
      setGeneratedFilename("");
      // don't clear rightTableRows or runId here; user might be viewing a running session

      setDelays(new Array(entries.length).fill(0));

      // default start time = "now" truncated to seconds
      const now = new Date();
      const iso = new Date(now.getTime() - now.getMilliseconds())
        .toISOString()
        .slice(0, 19); // "YYYY-MM-DDTHH:MM:SS"
      setStartTime(iso);
    } catch (err) {
      console.error(err);
      showToast("Error", "Could not load schedule file", "error");
    }
  };

  // const handleScheduleChange = async (e) => {
  //   const filename = e.target.value;
  //   setSelectedSchedule(filename);

  //   // If user picked the placeholder "Select schedule file"
  //   if (!filename) {
  //     setBaseEntries([]);
  //     setGeneratedEntries([]);
  //     setGeneratedFilename("");
  //     setIsEditing(false);
  //     return;
  //   }

  //   await fetchScheduleEntries(filename);
  // };
  const handleScheduleChange = async (selectedOption) => {
  // react-select passes the whole option object: { value, label } or null
  const filename = selectedOption ? selectedOption.value : "";
  setSelectedSchedule(filename);

  // If user cleared the selection
  if (!filename) {
    setBaseEntries([]);
    setGeneratedEntries([]);
    setGeneratedFilename("");
    setIsEditing(false);
    return;
  }

  await fetchScheduleEntries(filename);
};


  const handleDelayChange = (idx, value) => {
    const v = value === "" ? 0 : parseInt(value, 10) || 0;
    setDelays((prev) => {
      const copy = [...prev];
      copy[idx] = v;
      return copy;
    });
  };

  const handleGenerate = async () => {
    if (!selectedSchedule) {
      showToast("No schedule", "Select a schedule file first", "error");
      return;
    }
    if (!startTime) {
      showToast("Start time missing", "Enter a starting execution time", "error");
      return;
    }
    if (baseEntries.length === 0) {
      showToast("Empty schedule", "Selected schedule has no commands", "error");
      return;
    }

    const isoStart = isoFromLocalDatetime(startTime);
    setLoadingGenerate(true);

    try {
      const payload = {
        schedule_name: selectedSchedule,
        start_time_utc: isoStart,
        delays:
          delays.length === baseEntries.length
            ? delays
            : new Array(baseEntries.length).fill(0),
      };

      const res = await fetch(`${API_BASE}/schedules/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || "Failed to generate schedule");
      }
      const data = await res.json();
      setGeneratedEntries(data.entries || []);
      setGeneratedFilename(data.generated_filename);
      showToast("Schedule generated", "New schedule file created successfully");
    } catch (err) {
      console.error(err);
      showToast("Error", err.message || "Failed to generate schedule", "error");
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleUpload = async () => {
    if (!generatedFilename) {
      showToast("No generated file", "Generate a schedule first", "error");
      return;
    }
    setLoadingUpload(true);
    try {
      const res = await fetch(`${API_BASE}/schedules/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generated_filename: generatedFilename }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Scheduler script failed");
      }
      showToast("Upload complete", "Scheduler script ran successfully 🎯");

      // Set run & initial table from backend
      if (data.run_id) {
        setRunId(data.run_id);
        localStorage.setItem("lastRunId", data.run_id);
      }

      if (data.commands) {
        const rows = data.commands.map((cmd) => ({
          commandName: cmd.commandName,
          lookUpTable: cmd.lookUpTable,
          scheduledTimestamp: cmd.scheduledTimestamp,
          delay: cmd.delay,
          receivedTimestamp: cmd.receivedTimestamp,
          status: cmd.status,
          telemetry: cmd.telemetry,
        }));
        setRightTableRows(rows);
      }

      setExecutionBanner("IN_PROGRESS");
    } catch (err) {
      console.error(err);
      showToast("Error", err.message || "Error running scheduler script", "error");
    } finally {
      setLoadingUpload(false);
    }
  };

  // Clear previous execution session (after completed)
  const handleClearExecution = () => {
    setRightTableRows([]);
    setRunId(null);
    setExecutionBanner("");
    setTelemetryModal(null);
    localStorage.removeItem("lastRunId");
  };

  // Poll run status every 0.5s, including after refresh if runId was restored
  useEffect(() => {
    if (!runId) return;

    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch(`${API_BASE}/runs/${runId}`);

        if (res.status === 404) {
          // Backend forgot this run (server restarted, etc.)
          if (!cancelled) {
            localStorage.removeItem("lastRunId");
            setRunId(null);
            setExecutionBanner("");
            showToast(
              "Session expired",
              "Backend no longer has this run (server restart?).",
              "error"
            );
          }
          return;
        }

        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        if (data.commands) {
          const rows = data.commands.map((cmd) => ({
            commandName: cmd.commandName,
            lookUpTable: cmd.lookUpTable,
            scheduledTimestamp: cmd.scheduledTimestamp,
            delay: cmd.delay,
            receivedTimestamp: cmd.receivedTimestamp,
            status: cmd.status,
            telemetry: cmd.telemetry,
          }));
          setRightTableRows(rows);
        }

        if (data.all_done) {
          setExecutionBanner("COMPLETED");
        } else {
          setExecutionBanner("IN_PROGRESS");
        }
      } catch (err) {
        console.error(err);
      }
    };

    const interval = setInterval(tick, 500);
    // also run once immediately so UI updates fast after refresh
    tick();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [runId]);

  const previewEntries = generatedEntries.length > 0 ? generatedEntries : baseEntries;

  const openTelemetryModal = (row) => {
    if (!row.telemetry) return;
    setTelemetryModal({
      commandName: row.commandName,
      lookUpTable: row.lookUpTable,
      telemetry: row.telemetry,
    });
  };

  const closeTelemetryModal = () => setTelemetryModal(null);

  const statusClass = (status) => {
    if (!status) return "su-status-badge su-status-unknown";
    const s = status.toUpperCase();
    if (s === "SCHEDULED") return "su-status-badge su-status-scheduled";
    if (s === "EXECUTED") return "su-status-badge su-status-executed";
    if (s === "FAILED") return "su-status-badge su-status-failed";
    return "su-status-badge su-status-unknown";
  };

  // UTC clock formatted without milliseconds
  const epochNow = Math.floor(nowUtc.getTime() / 1000);
  const humanNow =
    nowUtc.toISOString().slice(0, 19).replace("T", " ") + " UTC";

  const commandSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#30586b",
      borderRadius: 8,
      borderColor: state.isFocused
        ? "#5bd4ff"
        : "rgba(90, 150, 255, 0.4)",
      minHeight: 32,
      boxShadow: "none",
      cursor: "pointer",
      "&:hover": {
        borderColor: "rgba(255, 255, 255, 0.4)",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "4px 8px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#fff",
      fontSize: 14,
    }),
    input: (base) => ({
      ...base,
      color: "#fff",
      fontSize: 14,
    }),
    placeholder: (base) => ({
      ...base,
      color: "rgba(255, 255, 255, 10)",
      fontSize: 13,
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#30586b",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      zIndex: 10,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: 13,
      padding: "6px 8px",
      cursor: "pointer",
      backgroundColor: state.isSelected
        ? "rgba(255, 255, 255, 0.12)"
        : state.isFocused
          ? "#30586b"
          : "transparent",
      color: "#fff",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: 4,
    }),
  };

  const scheduleSelectOptions = scheduleOptions.map((opt) => ({
    value: opt.filename,
    label: opt.label,
  }));

  return (
    <div className="su-whole-wrapper">
      {/* LEFT SIDE */}
      <div className="su-app">
        <div className="su-header">Schedule Builder</div>

        {/* Schedule file selector */}
        <div className="su-card">
          <div className="su-card-header">
            <div className="su-card-title">Select schedule file</div>
            <div className="su-chip">
              <span>{scheduleOptions.length || 0} file available</span>
            </div>
          </div>
          {/* <label className="field-label">Sample schedule</label>
            <select value={selectedSchedule} onChange={handleScheduleChange}>
              <option value="">Select schedule file</option>
              {scheduleOptions.map((opt) => (
                <option key={opt.filename} value={opt.filename}>
                  {opt.label}
                </option>
              ))}
            </select> */}
          <div className="su-flex">
            <div style={{ flex: 1 }}>
              <Select
                options={scheduleSelectOptions}
                value={
                  scheduleSelectOptions.find(
                    (opt) => opt.value === selectedSchedule
                  ) || null
                }
                onChange={handleScheduleChange}
                placeholder="Select schedule file"
                // optional styling / behavior props:
                isClearable
                className="schedule-select"
                classNamePrefix="schedule-select"
                styles={commandSelectStyles}
              />
            </div>
          </div>
        </div>

        {/* Preview + inline editor — only after user selects a schedule */}
        {selectedSchedule && (
          <>
          <div className="su-card" style={{ flex: 1 }}>
            <div className="su-card-header">
              <div>
                <div className="su-card-title">
                  {generatedEntries.length > 0
                    ? "Generated schedule preview"
                    : "Current schedule preview"}
                </div>
                {generatedFilename && (
                  <div className="su-card-subtitle">
                    File: <code>{generatedFilename}</code>
                  </div>
                )}
              </div>
              <button
                className="su-btn su-btn-secondary su-btn-small"
                type="button"
                onClick={() => setIsEditing((v) => !v)}
                disabled={baseEntries.length === 0}
              >
                {isEditing ? "Done editing" : "Edit timing"}
              </button>
            </div>

            {/* Start time editor, only when editing */}
            {isEditing && baseEntries.length > 0 && (
              <div className="su-time-wrapper">
                <label className="su-field-label">
                  Start execution time (UTC, for Command #1)
                </label>
                <div className="su-datetime-input-wrapper">
                  <input
                    type="datetime-local"
                    step="1" // seconds precision
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  {/* <span className="su-datetime-tz-tag">UTC</span> */}
                </div>
              </div>
            )}

            {previewEntries.length === 0 ? (
              <div className="su-card-subtitle">
                No commands in this schedule yet.
              </div>
            ) : (
              <div className="su-scroll su-stats-table-wrap">
                <table className="su-stats-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th style={{width:110}}>Subsystem</th>
                      <th>Command</th>
                      <th>Timestamp</th>
                      <th style={{ width: 120 }}>Delay (s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewEntries.map((cmd, idx) => (
                      <tr key={idx}>
                        <td className="su-num">#{idx + 1}</td>
                        <td style={{width: 110}} className="su-num">{cmd.subsystemName}</td>
                        <td className="su-num">{cmd.commandName}</td>
                        <td className="su-num">
                          <div className="su-delay-pill">
                            {humanFromEpoch(cmd.Timestamp)}
                          </div>
                        </td>
                        <td className="su-num">
                          {idx === 0 ? (
                            <span className="su-timestamp-human">0 (start)</span>
                          ) : isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={delays[idx] ?? 0}
                              onChange={(e) =>
                                handleDelayChange(idx, e.target.value)
                              }
                              style={{ width: "80px" }}
                            />
                          ) : (
                            <span className="su-delay-pill">
                              +{delays[idx] ?? 0}s
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
            )}

            <div className="su-button-row" style={{ marginTop: 10 }}>
              <button
                className="su-btn su-btn-primary"
                type="button"
                onClick={handleGenerate}
                disabled={loadingGenerate}
              >
                {loadingGenerate ? "Generating…" : "Generate schedule file"}
              </button>

              {/* <button
                className="su-btn su-btn-secondary"
                type="button"
                onClick={handleUpload}
                disabled={!generatedFilename || loadingUpload}
              >
                {loadingUpload
                  ? "Uploading & running…"
                  : "Upload schedule & run script"}
              </button> */}
            </div>
            
          </div>
          <div className="su-button-secondary-wrapper">
          <button
                className="su-btn su-btn-secondary1"
                type="button"
                onClick={handleUpload}
                disabled={!generatedFilename || loadingUpload}
              >
                {loadingUpload
                  ? "Uploading & running…"
                  : "Upload schedule & run script"}
              </button>
              </div>
          </>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="su-panel-right">
        <div className="su-section-title-row">
          <div className="su-header">Execution status</div>
          {executionBanner === "COMPLETED" && rightTableRows.length > 0 && (
            <button
              className="su-btn su-btn-ghost su-btn-small"
              type="button"
              onClick={handleClearExecution}
            >
              Clear session
            </button>
          )}
        </div>

        {executionBanner && (
          <div className="su-execution-banner">
            {executionBanner === "IN_PROGRESS"
              ? "Execution of schedule file in progress…"
              : "Schedule execution completed."}
          </div>
        )}

        {rightTableRows.length === 0 ? (
          <div className="su-right-placeholder">
            {runId
              ? "Restoring run… if you just refreshed, execution data will appear as soon as telemetry is polled."
              : "Upload a generated schedule on the left to populate this execution table and start telemetry polling."}
          </div>
        ) : (
          <div className="su-card" style={{ flex: 1 }}>
            <div className="su-card-header">
              <div className="su-card-title">Command run sheet</div>
            </div>
            <div className="su-stats-table-wrapper su-scroll">
              <table className="su-stats-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th style={{width:120}}>Command Name</th>
                    <th style={{width:50}}>Lookup Table</th>
                    <th style={{width:150}}>Scheduled (UTC)</th>
                    <th>Delay</th>
                    <th style={{width:150}}>Received Ts</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {rightTableRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="su-num">#{idx + 1}</td>
                      <td className="su-num">{row.commandName}</td>
                      <td className="su-num">{row.lookUpTable}</td>
                      <td className="su-num">
                        <div className="su-delay-pill">
                          {humanFromEpoch(row.scheduledTimestamp)}
                        </div>
                      </td>
                      <td className="su-num">
                        <span className="su-delay-pill">+{row.delay}s</span>
                      </td>
                      <td className="su-num">
                        {row.receivedTimestamp
                          ? humanFromEpoch(row.receivedTimestamp)
                          : "—"}
                      </td>
                      <td className="su-num">
                        <span className={statusClass(row.status)}>
                          {row.status || "—"}
                        </span>
                      </td>
                      <td className="su-num">
                        <button
                          className="su-btn su-btn-ghost su-btn-view"
                          type="button"
                          disabled={!row.telemetry}
                          onClick={() => openTelemetryModal(row)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {/* {toast && (
        <div className={`toast ${toast.type === "error" ? "error" : ""}`}>
          <div className="toast-title">{toast.title}</div>
          <div className="toast-msg">{toast.msg}</div>
        </div>
      )} */}

      {/* Telemetry modal */}
      {telemetryModal && (
        <div className="su-modal-backdrop" onClick={closeTelemetryModal}>
          <div className="su-modal" onClick={(e) => e.stopPropagation()}>
            <div className="su-modal-header">
              <div>
                <div className="su-modal-title">Telemetry details</div>
                <div className="su-modal-subtitle">
                  {telemetryModal.commandName} &nbsp;(
                  LUT {telemetryModal.lookUpTable})
                </div>
              </div>
              <button
                className="su-btn su-btn-ghost su-close"
                type="button"
                onClick={closeTelemetryModal}
              >
                ✕
              </button>
            </div>
            <div className="su-modal-body">
              <div className="su-table-wrapper">
                <table className="su-table">
                  <thead>
                    <tr>
                      <th style={{ width: "40%" }}>Parameter</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(telemetryModal.telemetry || {}).map(
                      ([key, value]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleUploadList;
