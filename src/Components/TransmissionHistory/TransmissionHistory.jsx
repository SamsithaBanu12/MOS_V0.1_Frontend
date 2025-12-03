// TransmissionHistory.jsx
import { useEffect, useMemo, useState } from "react";
import "./TransmissionHistory.space.css";
import { IoClose } from "react-icons/io5";
import {
  base64ToHex,
  findHealthCommand,
  getAllCmdsData,
  getAllTlmsData,
  getCommandName,
  getTcTmId,
  toUTCYmdHmsnn,
} from "../../utils/utils";
import { Parameters } from "../../constants/contants";

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

function Tabs({ active, onChange, activeTabNames }) {
  return (
    <div className="th-tabs">
      <button
        className={`th-tab ${active === "CMD" ? "active" : ""}`}
        onClick={() => {
          onChange("CMD");
          activeTabNames("CMD");
        }}
      >
        Commands
      </button>
      <button
        className={`th-tab ${active === "TLM" ? "active" : ""}`}
        onClick={() => {
          onChange("TLM");
          activeTabNames("TLM");
        }}
      >
        Telemetry
      </button>
    </div>
  );
}

export default function TransmissionHistory({ transmissionData }) {
  const [activeTab, setActiveTab] = useState("CMD");
  const [filter, setFilter] = useState("");
  const [useLocalTime, setUseLocalTime] = useState(true);
  const [commandData, setCommandData] = useState(null);
  const [isRowSelected, setIsRowSelected] = useState(false);
  const [activeTabNames, setActiveTabNames] = useState("");

  // If you need API fetch later, you can re-enable:
  // const { data: cmdsDataFromApi, loading: cmdsLoading, reload: reloadCmds } =
  //   useFetchJSON(`${CMD_BASE}/history?limit=200`, []);
  // const { data: tlmDataFromApi, loading: tlmLoading, reload: reloadTlm } =
  //   useFetchJSON(`${TLM_BASE}/tlm/history?limit=200`, []);

  const cmdsData = getAllCmdsData(transmissionData);
  const tlmsData = getAllTlmsData(transmissionData);

  const stripHeaderParams = (rows) => {
    const removeKeys = new Set(Parameters);

    return (rows || []).map((row) => {
      const params = Object.fromEntries(
        Object.entries(row).filter(([key]) => !removeKeys.has(key))
      );

      return {
        ...row,
        params,
      };
    });
  };

  const cmds = useMemo(
    () => stripHeaderParams(Array.isArray(cmdsData) ? cmdsData : []),
    [cmdsData]
  );

  const tlms = useMemo(
    () => stripHeaderParams(Array.isArray(tlmsData) ? tlmsData : []),
    [tlmsData]
  );

  // Fixed filter function
  const filterFn = (row, keys) => {
    const f = filter.trim().toLowerCase();
    if (!f) return true;

    return keys.some((key) => {
      const value = row?.[key];
      if (value == null) return false;
      return String(value).toLowerCase().includes(f);
    });
  };

  const filteredCmds = useMemo(() => {
    return cmds.filter((r) => filterFn(r, ["__packet"]));
  }, [cmds, filter]);

  const filteredTlms = useMemo(() => {
    return tlms.filter((r) => filterFn(r, ["__packet"]));
  }, [tlms, filter]);

  const handleRowClick = (row) => {
    setCommandData(row);
    setIsRowSelected(true);
  };


  return (
    <div className="th-wrapper">
      <div className="th-card">
        <div className="th-card-head">
          <div className="th-title">Transmission History</div>
          <div className="th-tag">
            {activeTab === "CMD"
              ? `${cmds.length} commands`
              : `${tlms.length} telemetry`}
          </div>
        </div>

        <Tabs
          active={activeTab}
          onChange={(val) => {
            setActiveTab(val);
            setCommandData(null);
            setIsRowSelected(false);
          }}
          activeTabNames={setActiveTabNames}
        />

        {/* Controls ALWAYS visible, even if filter returns zero rows */}
        <div className="th-controls">
          <input
            className="th-input"
            placeholder={
              activeTab === "CMD"
                ? "Filter by packet name…"
                : "Filter by packet name…"
            }
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCommandData(null);
              setIsRowSelected(false);
            }}
          />
          <label className="th-label">
            <input
              type="checkbox"
              checked={useLocalTime}
              onChange={(e) => setUseLocalTime(e.target.checked)}
            />
            Local time
          </label>
        </div>

        <div className="th-table-wrap">
          {activeTab === "CMD" ? (
            <table className="th-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Packet Name</th>
                  <th>Time</th>
                  <th>GS Id</th>
                  <th>TC ID</th>
                  <th>Parameters</th>
                </tr>
              </thead>
              <tbody>
                {filteredCmds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="th-muted">
                      No commands
                    </td>
                  </tr>
                ) : (
                  filteredCmds.map((r, i) => (
                    <tr key={i}>
                      <td className="th-mono"> {findHealthCommand(r?.__packet)}</td>
                      <td className="th-mono">{getCommandName(r?.__packet) || "—"}</td>
                      <td>{useLocalTime ? toUTCYmdHmsnn(r?.__time) : r?.__time}</td>
                      <td>{r?.GND_ID}</td>
                      <td>{getTcTmId(r?.TC_ID) || '-'}</td>
                      <td>
                        <button className="view-btn" onClick={() => handleRowClick(r)}>view</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="th-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Packet Name</th>
                  <th>Time</th>
                  <th>GS Id</th>
                  <th>TM_ID</th>
                  <th>Parameters</th>
                </tr>
              </thead>
              <tbody>
                {filteredTlms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="th-muted">
                      No telemetry
                    </td>
                  </tr>
                ) : (
                  filteredTlms.map((r, i) => (
                    <tr key={i}>
                      <td className="th-mono">
                        {findHealthCommand(r?.__packet)}
                      </td>
                      <td className="th-mono">{getCommandName(r?.__packet) || "—"}</td>
                      <td>{useLocalTime ? toUTCYmdHmsnn(r?.__time) : r?.__time}</td>
                      <td>{r?.GND_ID || "-"}</td>
                      <td>{getTcTmId(r?.TM_ID) || "-"}</td>
                      <td>
                        <button className="view-btn" onClick={() => handleRowClick(r)}>view</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details panel */}
      {isRowSelected && commandData && (
        <div>
          {activeTab === "CMD" ? (
            <div className="command-details">
              <div className="command-details-header">
                <div className="header1">Tele-Command Details</div>
                <button
                  className="close"
                  onClick={() => setIsRowSelected(false)}
                >
                  <IoClose size={20} />
                </button>
              </div>
              <div className="command-details-body">
                <div className="left-side-wrapper">
                  <div className="packet-name">
                    <span>{getCommandName(commandData?.__packet)}</span>
                  </div>
                  {/* Add more fields here if needed */}
                  <div className="scrollable2">
                    {Object.entries(commandData?.params || {}).map(([key, value]) => (
                      <div className="ce-item-row" key={key}>
                        <div className="ce-item-name2">
                          <div className="ce-mono">{key}</div>
                        </div>

                        <div className="ce-item-value2">
                          <div className="ce-row-input">
                            {getTcTmId(value) ?? '-'}
                            {/* {String(value ?? "null")} */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="command-details">
              <div className="command-details-header">
                <div className="header1">Telemetry Details</div>
                <button
                  className="close"
                  onClick={() => setIsRowSelected(false)}
                >
                  <IoClose size={20} />
                </button>
              </div>

              <div className="command-details-body">
                <div className="left-side-wrapper">
                  <div className="packet-name">
                    <span>{getCommandName(commandData?.__packet)}</span>
                  </div>
                  <div className="parameter">
                    {findHealthCommand(commandData?.__packet) &&
                      commandData?.buffer
                      ? base64ToHex(commandData.buffer)
                      : commandData?.buffer || ""}
                  </div>
                  <div className="scrollable2">
                    {Object.entries(commandData?.params || {}).map(([key, value]) => (
                      <div className="ce-item-row" key={key}>
                        <div className="ce-item-name2">
                          <div className="ce-mono">{key}</div>
                        </div>

                        <div className="ce-item-value2">
                          <div className="ce-row-input">
                            {getTcTmId(value) ?? '-'}
                            {/* {String(value ?? "null")} */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}