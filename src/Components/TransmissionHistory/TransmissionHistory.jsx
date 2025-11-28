// TransmissionHistory.jsx
import { useEffect, useMemo, useState } from "react";
import "./TransmissionHistory.space.css";
import { IoClose } from "react-icons/io5";
import { toUTCYmdHms, toUTCYmdHmsnn } from "../../utils/utils";

const CMD_BASE = "http://127.0.0.1:8009";
const TLM_BASE = "http://127.0.0.1:8010";

function useFetchJSON(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(url);
      const j = await res.json();
      setData(j);
    } catch (e) {
      console.error("Fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, reload: load };
}

function TimeCell({ iso, useLocal }) {
  if (!iso) return <span className="th-muted">—</span>;
  return <span title={iso}>{useLocal ? new Date(iso).toLocaleString() : iso}</span>;
}

function ChipListKV({ obj }) {
  const entries = Object.entries(obj || {});
  if (!entries.length) return <span className="th-muted">—</span>;
  return (
    <div className="th-chiplist">
      {entries.map(([k, v]) => (
        <span key={k} className="th-chip th-mono" title={`${k}=${typeof v === "string" ? v : JSON.stringify(v)}`}>
          {k}:{String(v)}
        </span>
      ))}
    </div>
  );
}

function Tabs({ active, onChange, activeTabNames }) {
  return (
    <div className="th-tabs">
      <button className={`th-tab ${active === "CMD" ? "active" : ""}`} onClick={() => {
        onChange("CMD");
        activeTabNames("CMD")
      }}>
        Commands
      </button>
      <button className={`th-tab ${active === "TLM" ? "active" : ""}`} onClick={() => {
        onChange("TLM");
        activeTabNames("TLM")
      }}>
        Telemetry
      </button>
    </div>
  );
}

export default function TransmissionHistory({ transmissionData}) {
  const [activeTab, setActiveTab] = useState("CMD");
  const [filter, setFilter] = useState("");
  const [useLocalTime, setUseLocalTime] = useState(true);
  const [commandData, setCommandData] = useState([]);
  const [isRowSelected, setIsRowSelected] = useState(false);
  const [activeTabNames, setActiveTabNames] = useState('')

  // const { data: cmdsData, loading: cmdsLoading, reload: reloadCmds } = useFetchJSON(`${CMD_BASE}/history?limit=200`, []);
  // const { data: tlmData, loading: tlmLoading, reload: reloadTlm } = useFetchJSON(`${TLM_BASE}/tlm/history?limit=200`, []);

  const cmdsData = transmissionData;


  const cmds = Array.isArray(cmdsData) ? cmdsData : [];
  const tlms = Array.isArray(cmdsData) ? cmdsData : [];
  // const loading = activeTab === "CMD" ? cmdsLoading : tlmLoading;
  // const refresh = activeTab === "CMD" ? reloadCmds : reloadTlm;

  const filterFn = (r, keys) => {
    const f = filter.trim().toLowerCase();
    if (!f) return true;
    return keys.some(k => {
      const v = typeof k === "string" ? r[k] : "";
      return (v || "").toLowerCase().includes(f);
    });
  };

  const filteredCmds = useMemo(() => {
    return cmds.filter(r => filterFn(r, ["command", "hex_stream", "payload", "topic"]));
  }, [cmds, filter]);

  const filteredTlms = useMemo(() => {
    return tlms.filter(r => filterFn(r, ["packet_name", "hex_stream", "topic"]));
  }, [tlms, filter]);

  console.log('tele-metry', filteredCmds, filteredTlms);

  const getDescription = (command) => {
    let findCommand = commands.find(item => item.packet_name === command);
    if (findCommand) {
      return findCommand.description;
    } else {
      return '-'
    }
  }

  const handleRowClick = (cmd) => {
    setCommandData(cmd);
    setIsRowSelected(true);
  };

  console.log('isrow', isRowSelected, commandData, transmissionData)

  return (
    <div className="th-card">
      <div className="th-card-head">
        <div className="th-title">Transmission History</div>
        {/* <div className="th-subtitle"> */}
        {/* <span className="th-tag">cosmos/command • cosmos/telemetry</span> */}
        <div className="th-tag">
          {activeTab === "CMD" ? `${cmds.length} commands` : `${tlms.length} telemetry`}
          {/* </div> */}
        </div>
      </div>

      <Tabs active={activeTab} onChange={(val) => {
        setActiveTab(val);
        setCommandData({});
        setIsRowSelected(false);
      }} activeTabNames={setActiveTabNames} />

      <div className="th-controls">
        <input
          className="th-input"
          placeholder={
            activeTab === "CMD"
              ? "Filter by command, param, hex, payload, or topic…"
              : "Filter by packet, header, routing, params, hex, or topic…"
          }
          value={filter}
          onChange={e => {
            setFilter(e.target.value);
            setCommandData({});
            setIsRowSelected(false);
          }}
        />
        <label className="th-label">
          <input type="checkbox" checked={useLocalTime} onChange={e => setUseLocalTime(e.target.checked)} />
          Local time
        </label>
        {/* <button className="th-btn" onClick={refresh} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button> */}
      </div>

      <div className={`th-table-wrap ${isRowSelected ? "row-selected" : ""}`}>
        {activeTab === "CMD" ? (
          <table className="th-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Packet Name</th>
                <th>Time</th>
                <th>Parameters</th>
                {/* <th>Parameters</th> */}
                {/* <th>Topic</th>
                <th>Hex Stream</th>
                <th>Payload</th> */}
              </tr>
            </thead>
            <tbody className={`${isRowSelected && commandData && filteredCmds ? 'row-selected' : ''}`}>
              {filteredCmds.length === 0 ? (
                <tr><td colSpan={6} className="th-muted"></td></tr>
              ) :
                (
                  filteredCmds.map((r, i) => (
                    <tr key={i} onClick={() => handleRowClick(r)}>
                      <td className="th-mono">{r?.__type}</td>
                      <td className="th-mono">{r.__packet || "—"}</td>
                    <td>{toUTCYmdHmsnn(r?.__time)}</td>
                      <td><button className="view-btn">view</button></td>                                   
                      {/* <td><ChipListKV obj={r.params || {}} /></td> */}
                      {/* <td className="th-mono">{r.topic || "—"}</td>
                    <td className="th-mono th-ellipsis">{r.hex_stream || "—"}</td>
                    <td className="th-mono th-ellipsis">{r.payload || "—"}</td> */}
                    </tr>
                  )
                  ))
              }
            </tbody>
          </table>
        ) : (
          <table className="th-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Packet Name</th>
                <th>Time</th>
                <th>Parameters</th>
                {/* <th>Topic</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredTlms.length === 0 ? (
                <tr><td colSpan={7} className="th-muted"></td></tr>
              ) : (
                filteredTlms.map((r, i) => (
                    <tr key={i} onClick={() => handleRowClick(r)}>
                    <td className="th-mono">{r.__type || "—"}</td>
                    <td className="th-mono">{r.__packet || "—"}</td>
                    <td>{toUTCYmdHmsnn(r?.__time)}</td>
                    <td><button className="view-btn">view</button></td>                 
                    {/* <td><ChipListKV obj={r.routing || {}} /></td> */}
                    {/* <td className="th-mono">{r.topic || "—"}</td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* {isRowSelected &&
        <div >
          {activeTab === "CMD" ?
          <div className="command-details">
                <div className="command-details-header">
                  <div className="header1">Tele-Command Details</div>
                  <button className="close" onClick={() => setIsRowSelected(false)}>
                    <IoClose size={20} />
                  </button>
                </div>

                <div className="command-details-body">
                  <div className="left-side-wrapper">
                    <div className="packet-name">
                      <span>
                        {commandData?.command}
                      </span>
                    </div>

                    <div className="packet-details-wrapper">
                      <div className="heading">Packet Details</div>
                      <pre className="packetjson-content">
                        {JSON.stringify(commandData?.params, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className="parameter">
                    {commandData?.hex_stream?.replace(/\s+/g,"").replace(/0x/gi,"")}
                    </div>
                </div>
              </div>
              :
              <div className="command-details">
                <div className="command-details-header">
                  <div className="header1">Telemetry Details</div>
                  <button className="close" onClick={() => setIsRowSelected(false)}>
                    <IoClose size={20} />
                  </button>
                </div>

                <div className="command-details-body">
                  <div className="left-side-wrapper">
                    <div className="packet-name">
                      <span>
                        {commandData?.packet_name}
                      </span>
                    </div>

                    <div className="packet-details-wrapper">
                      <div className="heading">Packet Details</div>
                      <pre className="packetjson-content">
                        {JSON.stringify(commandData?.params, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className="parameter">
                    {commandData?.hex_stream}
                    </div>
                </div>
              </div>
              }
          </div>} */}
    </div>
  );
}
