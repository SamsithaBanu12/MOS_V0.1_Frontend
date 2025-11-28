import { useEffect, useMemo, useState } from "react";
import { buildParamsString, sendCommand } from "./paramsTransport";
import "./CommandExplorer.space.css";
import { toast } from "react-toastify";
// import TransmissionHistory from "./TransmissionHistory";
import Toggle from "../Toggle/Toggle";
import {
  getDefaultDisplay,
  getDisplayValue,
  getStatesInfo,
  partitionItems,
  payloadForTemplate,
} from "../../utils/utils";
import RoutingRow from "./RoutingRow";
import {
  commandTelemetryEmulator,
  scheduleFileCommands,
  subSystemList,
  targetList,
} from "../../data";
import PayloadRow from "./PayloadRow";
import ReadonlyRow from "./ReadonlyRow";
import CEHeader from "./CEHeader";
import { getAllCommands, getTlmPacket } from "../../utils/api";
import TelemetryList from "./TelemetryList";

// 🔹 NEW: react-select import
import Select from "react-select";

// put this near the top of the file, after imports

const commandSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#10344dff",
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
    backgroundColor: "#10344dff",
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
        ? "#3a86ff"
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


export default function CommandExplorer() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [commands, setCommands] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [telemetry, setTelemetry] = useState([]);
  const [filteredTelemetry, setFilteredTelemetry] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [commandTelemetryMap, setCommandTelemetryMap] = useState(null);
  const [showHeader, setShowHeader] = useState(false);
  const [isHex, setIsHex] = useState(true);
  const [targetValue, setTargetValue] = useState("");
  const [subSystemValue, setSubSystemValue] = useState("");
  const [filteredCommands, setFilteredCommands] = useState([]);

  // 🔹 selected command comes from filteredCommands + selectedIdx
  const selectedCmd =
    filteredCommands.length > 0 ? filteredCommands[selectedIdx] : null;

  const { target_name, packet_name, description, items = [] } = selectedCmd || {};

  const { headerItems, routingItems, payloadItems } = useMemo(
    () => partitionItems(items),
    [items]
  );

  // User-editable state
  const [routing, setRouting] = useState({});
  const [payload, setPayload] = useState({});

  // Reset routing & payload whenever the selected command changes
  useEffect(() => {
    if (!selectedCmd) {
      setRouting({});
      setPayload({});
      return;
    }

    // --- Routing defaults ---
    const routingInit = {};
    for (const it of routingItems) {
      routingInit[it.name] = getDefaultDisplay(it) ?? "";
    }

    // --- Payload defaults ---
    const payloadInit = {};
    for (const it of payloadItems) {
      if (it.states) {
        const info = getStatesInfo(it);
        payloadInit[it.name] = info?.selectedLabel ?? "";
      } else {
        payloadInit[it.name] = getDefaultDisplay(it) ?? "";
      }
    }

    setRouting(routingInit);
    setPayload(payloadInit);
  }, [selectedIdx, selectedCmd, routingItems, payloadItems]);

  // ---------------- Load Commands ----------------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAllCommands();

        if (Array.isArray(data?.result)) {
          setCommands(data.result);
          setSelectedIdx(0);
        } else {
          throw new Error("Invalid JSON-RPC response");
        }
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setFilteredTelemetry([]);
    setTelemetry([]);
    setLastUpdated("");
    setCommandTelemetryMap(null);
  }, [selectedIdx]);

  useEffect(() => {
    if (!selectedCmd) return;

    const mapping = commandTelemetryEmulator.find(
      (m) => m.command === selectedCmd.packet_name
    );
    setCommandTelemetryMap(mapping);

    let cancelled = false;

    const fetchTlm = async () => {
      if (cancelled) return;

      const tlmName = mapping?.telemetry;
      if (!tlmName) return;

      try {
        const data = await getTlmPacket({ tlmName });
        if (!data?.result || cancelled) return;

        const paramKeys = mapping?.parameters?.map((p) => p.toLowerCase()) ?? [];
        const filtered = data.result.filter(([key]) =>
          paramKeys.includes(key.toLowerCase())
        );

        setTelemetry(data.result);
        setFilteredTelemetry(filtered);

        const timeRow = data.result.find(
          ([key]) => key === "RECEIVED_TIMEFORMATTED"
        );
        setLastUpdated(timeRow ? timeRow[1] : "");
      } catch (err) {
        if (!cancelled) setErr(err.message);
      }
    };

    // Fetch immediately
    fetchTlm();

    // Set interval
    const interval = setInterval(fetchTlm, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedIdx, selectedCmd]);

  const handleSend = async () => {
    if (!selectedCmd) {
      toast.error("No command selected");
      return;
    }

    const payloadTemplate = payloadForTemplate(payloadItems, payload);
    console.log("payloadTemplate", payloadTemplate);

    const paramString = buildParamsString(
      selectedCmd,
      routing,
      payloadTemplate
    );

    const res = await sendCommand(paramString);

    if (res.ok) {
      toast.success("Successfully sent the command");
    } else {
      toast.error("Error while sending command");
    }
  };

  // 🔹 Filter by Sub System (Schedule vs all)
useEffect(() => {
  if (!commands.length) return;

  const lower = subSystemValue?.toLowerCase() || "";

  // 1) Schedule filter
  if (subSystemValue === "SCHEDULE") {
    const filtered = commands.filter((item) =>
      scheduleFileCommands.includes(item?.packet_name)
    );
    setFilteredCommands(filtered);
    setSelectedIdx(0);
    return;
  }

  // 2) Show ALL
  if (subSystemValue === "ALL") {
    setFilteredCommands(commands);
    setSelectedIdx(0);
    return;
  }

  // 3) Normal filtering
  const filtered = commands.filter((item) =>
    item.packet_name?.toLowerCase().startsWith(lower)
  );

  setFilteredCommands(filtered);
  setSelectedIdx(0);
}, [subSystemValue, commands]);


  // 🔹 Keep selectedIdx in range when filteredCommands length changes
  useEffect(() => {
    if (selectedIdx >= filteredCommands.length && filteredCommands.length > 0) {
      setSelectedIdx(0);
    }
  }, [filteredCommands.length, selectedIdx]);

  // 🔹 Options for react-select
  const commandOptions = useMemo(
    () =>
      filteredCommands.map((cmd, idx) => ({
        value: idx,
        label: cmd.packet_name,
      })),
    [filteredCommands]
  );

  const selectedOption =
    commandOptions.find((opt) => opt.value === selectedIdx) || null;

  return (
    <div className="ce-whole-wrapper">
      <div className="ce-app">
        <CEHeader />
        <div className="ce-panel">
          <div className="ce-select-panel">
            <div className="ce-column">
              {!loading && !err && (
                <div className="ce-select-row">
                  <div className="ce-top-wrapper">
                    <div className="ce-flex1">
                      <label>Target</label>
                      <select
                        className="ce-select"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                      >
                        {targetList.map((target, idx) => (
                          <option key={idx} value={idx}>
                            {target?.target}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="ce-flex1">
                      <label>Sub System</label>
                      <select
                        className="ce-select"
                        value={subSystemValue}
                        onChange={(e) => setSubSystemValue(e.target.value)}
                      >
                        {subSystemList.map((sub, idx) => (
                          <option key={idx} value={sub?.name}>
                            {sub?.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 🔹 Command with inline search using react-select */}
                  <div className="ce-flex">
                    <label>Command</label>
                    <div style={{ flex: 1 }}>
                      <Select
                        classNamePrefix="ce-command-select"
                        options={commandOptions}
                        value={selectedOption}
                        onChange={(option) => {
                          if (option) setSelectedIdx(option.value);
                        }}
                        isSearchable
                        placeholder="Select command..."
                        styles={commandSelectStyles}   // 🔹 add this
                      />


                    </div>
                  </div>
                </div>
              )}

              {loading && <div className="ce-loading">Loading commands…</div>}
              {err && <div className="ce-error">Error: {err}</div>}

              {!loading && !err && selectedCmd && (
                <section className="ce-card">
                  <div className="item-row2">
                    <div className="title-wrapper">
                      <div className="title-top">
                        <div className="ce-title">{packet_name}</div>
                        <div className="ce-subtitle">
                          {description ?? description}
                        </div>
                      </div>
                      <div className="toggle-wrapper">
                        <Toggle inHex={isHex} setInHex={setIsHex} />
                      </div>
                    </div>
                    {routingItems.map((it) => (
                      <RoutingRow
                        key={it.name}
                        item={it}
                        value={routing[it.name] ?? ""}
                        onChange={(n, v) =>
                          setRouting((p) => ({ ...p, [n]: v }))
                        }
                        isHex={isHex}
                      />
                    ))}
                  </div>
                  <div className="item-row1">
                    <div className="ce-items-head1">
                      <div>Header (read-only)</div>
                      <button
                        className="ce-btn-small"
                        onClick={() => setShowHeader((s) => !s)}
                      >
                        {showHeader ? "" : "Details"}
                      </button>
                    </div>
                    {showHeader && (
                      <div
                        className="conn-modal-backdrop"
                        onClick={() => setShowHeader(false)}
                      >
                        <div
                          className="conn-modal-card"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="conn-modal-head">
                            <div className="conn-modal-title">
                              HEADER(READ-ONLY)
                            </div>
                            <button
                              className="tiny-btn"
                              onClick={() => setShowHeader(false)}
                              aria-label="Close"
                            >
                              Close
                            </button>
                          </div>
                          {headerItems.map((it) => (
                            <ReadonlyRow
                              key={it.name}
                              item={it}
                              isHex={isHex}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Payload */}
                  <div className="item-row">
                    <div className="ce-items-head">Payload</div>
                    {payloadItems.length === 0 ? (
                      <div className="ce-muted ce-small ce-pad">
                        No payload parameters.
                      </div>
                    ) : (
                      <div className="scrollable">
                        {payloadItems.map((it) => (
                          <PayloadRow
                            key={it.name}
                            item={it}
                            value={payload[it.name] ?? ""}
                            onHexChange={(n, v) =>
                              setPayload((p) => ({ ...p, [n]: v }))
                            }
                            onStateLabelChange={(n, l) =>
                              setPayload((p) => ({ ...p, [n]: l }))
                            }
                            isHex={isHex}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>

          {!loading && !err && filteredCommands?.length > 0 && (
            <div className="ce-footer">
              <button
                className="ce-btn"
                onClick={handleSend}
                disabled={!selectedCmd}
              >
                Send Command
              </button>
            </div>
          )}
        </div>
      </div>
      {commandTelemetryMap && filteredTelemetry.length > 0 && (
        <TelemetryList
          commandTelemetryMap={commandTelemetryMap}
          lastUpdated={lastUpdated}
          filteredTelemetry={filteredTelemetry}
        />
      )}
    </div>
  );
}
