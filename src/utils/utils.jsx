import { toast } from "react-toastify";
import { FaRegClock } from "react-icons/fa6";
import { IoReloadOutline } from "react-icons/io5";
import { SiTicktick } from "react-icons/si";
import { IoCloseCircleOutline } from "react-icons/io5";
import { BASE, DERIVED_HIDE, HEADER_NAMES, HTTP_HEADERS, ROUTING_NAMES, SCOPE, SEVERITY_ORDER } from "../constants/contants";
import moment from 'moment';

export const getDisplayValue = (isHex, value) => {
  if (value == null) return "";

  // --- Handle objects with raw byte arrays ---
  if (typeof value === "object" && Array.isArray(value.raw)) {
    const bytes = value.raw;

    // HEX view → compact continuous hex
    if (isHex) {
      const hexStr = bytes
        .map((v) => v.toString(16).padStart(2, "0").toUpperCase())
        .join("");
      return "0x" + hexStr;
    }

    // Decimal (human readable) view → interpret as little-endian number
    const num = bytes.reduce((acc, b, i) => acc + (b << (8 * i)), 0);
    return String(num);
  }

  // --- Handle plain numbers ---
  if (typeof value === "number") {
    return isHex
      ? "0x" + value.toString(16).toUpperCase()
      : String(value);
  }

  // --- Handle strings (could be "0x..." already) ---
  if (typeof value === "string") {
    if (/^0x[0-9A-Fa-f]+$/.test(value)) {
      // Clean formatted hex (always uppercase, always prefixed)
      return isHex ? value.toUpperCase() : String(parseInt(value, 16));
    }

    // Normal string (not hex)
    return value;
  }

  // --- Fallback ---
  return String(value);
};


export const filterPacketDetails = (packetDetails) => {
  return packetDetails?.[0]?.items.filter(
    (item) =>
      item?.name !== "PACKET_TIMESECONDS" &&
      item?.name !== "PACKET_TIMEFORMATTED" &&
      item?.name !== "RECEIVED_TIMESECONDS" &&
      item?.name !== "RECEIVED_TIMEFORMATTED" &&
      item?.name !== "RECEIVED_COUNT"
  );
};
export const getHex = (name) => {
  if (name === "DA_ID" || name === "TC_ID" || name === 'RM_ID') {
    return true;
  }
  return false;
}

export const getToastMessage = (message) => {
  if (message?.error) {
    toast.error(`Error: ${message.error.message}`);
  } else if (message?.result) {
    toast.success(`Edited command sent successfully`);
  } else {
    toast.warn("Unknown response");
  }
}

export const getParamsString = (packetDetails) => {
  return packetDetails
    .map((row) => `${row.name} ${getDisplayValue(getHex(row.name), row.default) ?? 0}`)
    .join(", ");
}

export const getStoreParamsString = (packetDetails) => {
  return packetDetails
    .map((row) => `${getDisplayValue(true, row.default) ?? 0}`)
    .join(" ");
}

export const ecefToLla = (x, y, z) => {
  const a = 6378137.0, f = 1 / 298.257223563, b = a * (1 - f);
  const e2 = 1 - (b * b) / (a * a), ep2 = (a * a) / (b * b) - 1;
  const p = Math.hypot(x, y);
  const th = Math.atan2(a * z, b * p);
  const lon = Math.atan2(y, x);
  const sinTh = Math.sin(th), cosTh = Math.cos(th);
  const lat = Math.atan2(z + ep2 * b * sinTh * sinTh * sinTh, p - e2 * a * cosTh * cosTh * cosTh);
  const sinLat = Math.sin(lat);
  const N = a / Math.sqrt(1 - e2 * sinLat * sinLat);
  const alt = p / Math.cos(lat) - N;
  return { lat: (lat * 180) / Math.PI, lon: ((lon * 180) / Math.PI + 540) % 360 - 180, alt };
}

export function fmtTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleString();
}

export function formatClock(totalSeconds) {
  if (totalSeconds == null || isNaN(totalSeconds)) return "—";
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return hrs > 0
    ? `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function parseLine(line) {
  if (typeof line !== "string" || line.includes("(HEX)")) return [];
  const iObj = line.indexOf("{"), iArr = line.indexOf("[");
  let start = -1;
  if (iObj !== -1 && iArr !== -1) start = Math.min(iObj, iArr);
  else start = iObj !== -1 ? iObj : iArr;
  if (start === -1) return [];
  try {
    const parsed = JSON.parse(line.slice(start).trim());
    if (Array.isArray(parsed)) return parsed.filter((x) => x && typeof x === "object");
    if (parsed && typeof parsed === "object") return [parsed];
  } catch { }
  return [];
}

export function mergeFromLogs(logArray) {
  const acc = {};
  for (const line of logArray) {
    const objs = parseLine(line);
    for (const o of objs) for (const [k, v] of Object.entries(o)) acc[k] = v;
  }
  return acc;
}

export function pickByAliases(raw, canonicalKey) {
  const variants = ALIASES[canonicalKey] || [canonicalKey];
  for (const k of variants) {
    if (raw[k] !== undefined && raw[k] !== null) return raw[k];
    const found = Object.keys(raw).find((rk) => rk.toLowerCase() === k.toLowerCase());
    if (found) return raw[found];
  }
  return undefined;
}

export function formatValue(key, val) {
  if (val === undefined || val === null || val === "") return "—";
  if (["pll_status", "psk_demodulator_status", "bit_synchronizer_status", "viterbi_decoder_status"].includes(key))
    return String(val);
  if (key === "ber") {
    const num = Number(val);
    return Number.isFinite(num) ? (num < 1e-2 ? num.toExponential(2) : num.toFixed(4)) : String(val);
  }
  if (key === "ebn0" || key === "power_level") {
    const num = Number(val);
    return Number.isFinite(num) ? num.toFixed(2) : String(val);
  }
  if (key.includes("offset")) {
    const num = Number(val);
    return Number.isFinite(num) ? num.toFixed(1) : String(val);
  }
  if (key.includes("counter")) {
    const num = Number(val);
    return Number.isFinite(num) ? String(num) : String(val);
  }
  return String(val);
}

// Extract a "stamp" that changes when new data arrives.
// Prefer max timestamp in JSON objects (keys: ts | timestamp). Fallback to last line text.
export function computeStamp(logs) {
  if (!Array.isArray(logs) || logs.length === 0) return null;

  let bestTs = null; // ms since epoch
  for (const line of logs) {
    const objs = parseLine(line);
    for (const o of objs) {
      const rawTs = o.ts ?? o.timestamp ?? o.time ?? o.utc;
      if (rawTs !== undefined && rawTs !== null) {
        let ms = Date.parse(String(rawTs));
        if (!Number.isFinite(ms)) {
          const num = Number(rawTs);
          if (Number.isFinite(num)) {
            // seconds -> ms
            ms = num < 1e12 ? num * 1000 : num;
          }
        }
        if (Number.isFinite(ms)) {
          if (bestTs === null || ms > bestTs) bestTs = ms;
        }
      }
    }
  }
  if (bestTs !== null) return `ts:${bestTs}`;
  // fallback: last line text (assuming new logs append)
  return `line:${logs[logs.length - 1]}`;
}

export function getStatusIcon(status) {
  if (status === 'Success') {
    return <SiTicktick color="#1b8f41ff" size={25} />
  } else if (status === 'In-progress') {
    return <IoReloadOutline color="#bb7e3cff" size={27} />
  } else if (status === 'error') {
    return <IoCloseCircleOutline color="#c72d3aff" size={27} />
  } else if (status === 'Waiting') {
    return <FaRegClock color="gray" size={25} />
  } else {
    return <FaRegClock color="gray" size={25} />
  }
}

//script runner helpers function 

export const getProcedureStatusIcon = (status) => {
  if (status === 'queued') {
    return <FaRegClock color="gray" size={22} />
  } else if (status === 'running' || status === 'in-progress') {
    return <IoReloadOutline color="#bb7e3cff" size={22} />
  } else if (status === 'ready') {
    return <SiTicktick color="#1b8f41ff" size={22} />
  } else if (status === 'error') {
    return <IoCloseCircleOutline color="#c72d3aff" size={22} />
  } else {
    return <FaRegClock color="gray" size={22} />
  }
}

export const getStatusName = (status) => {
  if (status === 'idle') {
    return 'Queued';
  } else if (status === 'running' || status === 'in-progress') {
    return 'In-progress';
  } else if (status === 'ready') {
    return 'Completed';
  } else {
    return status;
  }
}

export const getFileInputName = (file) => {
  if (file === 'Beacon Data Check') {
    return '__TEMP__/BeaconCheckLoopTest.rb';
  } else if (file === 'Time Synchronization') {
    return '__TEMP__/TimeSync.rb';
  } else if (file === 'Schedule Upload') {
    return '__TEMP__/ScheduleUpload.rb';
  } else if ((file === 'DTC File Upload') || (file === 'File Upload')) {
    return '__TEMP__/FileUpload.rb';
  }
}
export const getFileOutputname = (file) => {
  if (file === '__TEMP__/BeaconCheckLoopTest.rb') {
    return 'Beacon Data Check'
  } else if (file === '__TEMP__/TimeSync.rb') {
    return 'Time Synchronization';
  } else if (file === '__TEMP__/ScheduleUpload.rb') {
    return 'Schedule Upload'
  } else if (file === '__TEMP__/FileUpload.rb') {
    return 'DTC File Upload'
  }
}
export const injectStyle = (css) => {
  const id = "mission-console-css";
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const fmtTimeScript = (ts) => {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], { hour12: false });
}
export const jsonl = (e) => JSON.stringify(e);

export const eventSeverity = (e) => e.severity || "info";
export const escalate = (seg, sev) => {
  if (SEVERITY_ORDER[sev] > SEVERITY_ORDER[seg.severity])
    seg.severity = sev;
};
export const downloadText = (filename, text) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
export async function httpPost(path, payload) {
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers: HTTP_HEADERS, body: payload === undefined ? undefined : JSON.stringify(payload) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.text();
}

const parseUTC = (s) => moment.utc(s, "YYYY-MM-DD HH:mm:ss", true); // strict

// HH:MM:SS for a moment.duration (supports negative)
const formatHMS = (dur) => {
  const sign = dur.asMilliseconds() < 0 ? "-" : "";
  const abs = moment.duration(Math.abs(dur.asMilliseconds()));
  const h = String(Math.floor(abs.asHours())).padStart(2, "0");   // keeps >24h
  const m = String(abs.minutes()).padStart(2, "0");
  const s = String(abs.seconds()).padStart(2, "0");
  return `${sign}${h}:${m}:${s}`;
};

// Delta from NOW(UTC) to a target UTC time
export function deltaToUTC(targetStr) {
  const target = parseUTC(targetStr);
  const now = moment.utc();
  const dur = moment.duration(target.diff(now));
  return { text: formatHMS(dur), ms: dur.asMilliseconds() };
}

// AOS → LOS duration (both UTC strings)
export function passDurationUTC(aosStr, losStr) {
  const aos = parseUTC(aosStr);
  const los = parseUTC(losStr);
  const dur = moment.duration(los.diff(aos));
  return { text: formatHMS(dur), ms: dur.asMilliseconds() };
}

export function toUTCYmdHms(input) {
  // input can be: Date | number (ms or seconds) | ISO string
  const d = input instanceof Date
    ? input
    : typeof input === "number"
      ? new Date(input < 1e12 ? input * 1000 : input) // seconds vs ms
      : new Date(input);

  const pad = (n) => String(n).padStart(2, "0");

  const Y = d.getUTCFullYear();
  const M = pad(d.getUTCMonth() + 1);
  const D = pad(d.getUTCDate());
  const h = pad(d.getUTCHours());
  const m = pad(d.getUTCMinutes());
  const s = pad(d.getUTCSeconds());

  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}
export function formatMmSs(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
export const mmss = (a, b) => moment.utc(Math.abs(a - b) * 1000).format("mm:ss");

export function detectSeverity(line) {
  const low = String(line ?? "").toLowerCase();
  if (/(exception|fatal|stacktrace|traceback|unhandled)/i.test(low)) return "error";
  if (/\bfailed\b|\bfailure\b|\berror\b/i.test(low)) return "error";
  if (/(httpclientexception|http\s*error)/i.test(low)) return "error";
  if (/\b[45]\d{2}\b/.test(low)) return "error";
  if (/status\s*(:|=)\s*[45]\d{2}/i.test(low)) return "error";
  if (/\bwarn(ing)?\b/i.test(low)) return "warn";
  return "info";
}

export function tagFor(e) {
  if (e.type === "line") {
    if (e.subtype === "waiting") return "line_waiting";
    if (e.subtype === "error") return "line_error";
    return "line_running";
  }
  if (e.type === "output") {
    return e.severity === "warn"
      ? "output_warn"
      : e.severity === "error"
        ? detectSeverity(e.text)
        : "output_info";
  }
  if (e.type === "http") return "http";
  if (e.type === "ws") return "ws";
  if (e.type === "prompt") return "prompt";
  return "dim";
}

export const aosTargetUtc = (activePassDetails) => {
  if (activePassDetails?.status === 'waiting') {
    return toUTCYmdHms(activePassDetails.startTime)
  }
  else {
    return null;
  }
}
export const losTargetUtc = (activePassDetails) => {
  if (activePassDetails?.status === 'active') {
    return toUTCYmdHms(activePassDetails.endTime)
  } else {
    return null;
  }
}
export const editProcedureApplicable = ['schedule upload', 'file upload', 'dtc file upload'];

//command-sender

export function partitionItems(items) {
  const filtered = items.filter((i) => !DERIVED_HIDE.has(i.name));
  const headerItems = filtered.filter((i) => HEADER_NAMES.has(i.name));
  const routingItems = filtered.filter((i) => ROUTING_NAMES.has(i.name));
  const tcLenIdx = filtered.findIndex((i) => i.name === "TC_LEN");
  const payloadItems =
    tcLenIdx >= 0
      ? filtered.slice(tcLenIdx + 1).filter((i) => !HEADER_NAMES.has(i.name) && !ROUTING_NAMES.has(i.name))
      : [];
  return { headerItems, routingItems, payloadItems };
}

export function toHexByte(b) {
  return Number(b & 0xff).toString(16).padStart(2, "0").toUpperCase();
}

export function fmtNumHex(value, bitSize = 8) {
  if (value == null || isNaN(Number(value))) return "—";
  const bytes = Math.max(1, Math.ceil(bitSize / 8));
  const v32 = Number(value) >>> 0;
  let hex = v32.toString(16).toUpperCase().padStart(bytes * 2, "0").slice(-bytes * 2);
  return "0x" + hex;
}

export function fmtBlockHex(defObj) {
  if (!defObj?.raw) return "—";
  return "0x" + defObj.raw.map((b) => toHexByte(b)).join("");
}

export function getDefaultDisplay(item) {
  const { data_type, bit_size, default: defVal } = item;
  if (item.states) return null;
  if (data_type === "UINT") return fmtNumHex(defVal, bit_size);
  if (data_type === "BLOCK") return fmtBlockHex(defVal || item.id_value);
  return "—";
}

export function getStatesInfo(item) {
  const states = item.states;
  if (!states) return null;
  const options = Object.entries(states).map(([label, obj]) => ({
    label,
    value: obj?.value,
  }));
  let selectedLabel = options[0]?.label ?? "";
  if (item?.default != null && typeof item.default !== "object") {
    const match = options.find((o) => o.value === Number(item.default));
    if (match) selectedLabel = match.label;
  }
  return { options, selectedLabel };
}

export function getHighlightClass(timeString) {
  if (!timeString || typeof timeString !== "string") return "";
  const parsedUTC = moment.utc(timeString, "YYYY/MM/DD HH:mm:ss.SSS");
  if (!parsedUTC.isValid()) return "";
  const nowUTC = moment.utc();

  const diffMinutes = nowUTC.diff(parsedUTC, "minutes", true);
  let value = diffMinutes < 2 ? "white" : "pinky";
  return value;
}

export const payloadForTemplate = (payloadItems, payload) => {
  console.log('payload', payload, payloadItems);

  return payloadItems?.map((it) =>
    it.states
      ? {
        name: it.name,
        kind: "state",
        value:
          getStatesInfo(it)?.options.find(
            (o) => o.label === payload[it.name]
          )?.value ?? null,
      }
      : {
        name: it.name,
        kind: "hex",
        value: payload[it.name],
      }
  ) ?? [];
};

export function normalizeToHex(input) {
  if (!input) return "";

  input = input.trim();

  // Already hex
  if (input.startsWith("0x") || input.startsWith("0X")) {
    return "0x" + input.slice(2).toUpperCase();
  }

  // Decimal → Hex
  if (/^\d+$/.test(input)) {
    const hex = Number(input).toString(16).toUpperCase();
    return "0x" + hex;
  }

  return "";
}

export function formatForDisplay(raw, isHex) {
  if (!raw) return "";

  const num = Number(raw);

  if (isHex) {
    return "0x" + num.toString(16).toUpperCase();
  }

  return String(num);
}
// Convert internal hex → readable format for UI
export function displayValue(hex, isHex) {
  if (!hex || typeof hex !== "string") return "—";

  hex = hex.trim();
  if (!hex) return "—";

  if (!hex.startsWith("0x") && !hex.startsWith("0X")) return "—";

  if (isHex) {
    return hex.toUpperCase();  // show hex as-is
  }

  // Convert HEX -> Decimal
  const n = parseInt(hex, 16);

  if (Number.isFinite(n)) return String(n);

  return "—";
}

export function toUTCYmdHmsnn(input) {
  let d;

  if (input instanceof Date) {
    d = input;
  } 
  else if (typeof input === "number") {
    // Detect nanoseconds, microseconds, milliseconds, seconds
    let ns = input;

    if (ns > 1e15) {
      // nanos → ms
      ns = ns / 1e6;
    } else if (ns > 1e12) {
      // micros → ms
      ns = ns / 1e3;
    } else if (ns < 1e12 && ns > 1e10) {
      // seconds? (10-digit seconds)
      ns = ns * 1000;
    }

    d = new Date(ns);
  } 
  else {
    d = new Date(input);
  }

  const pad = (n) => String(n).padStart(2, "0");

  const Y = d.getUTCFullYear();
  const M = pad(d.getUTCMonth() + 1);
  const D = pad(d.getUTCDate());
  const h = pad(d.getUTCHours());
  const m = pad(d.getUTCMinutes());
  const s = pad(d.getUTCSeconds());

  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

export const getAllTlmsData = (transmissionData) => {
  return transmissionData.filter(
    (item) => item?.__packet?.toLowerCase().includes("__tlm__")
  );
};

export const getAllCmdsData = (transmissionData) => {
  return transmissionData.filter(
    (item) => item?.__packet?.toLowerCase().includes("__cmd__")
  );
};

export function base64ToHex(base64) {
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

export const findHealthCommand=(value)=>{
  if(value.includes("__CMD__")){
    return "Cmd";
  }else if(value.includes("TLM")){
    if(value.includes("__HEALTH")){
      return "Health";
    }else{
      return "Tlm";
    }
  }
}
export const getCommandName = (value) => {
  if (value?.includes("__EMULATOR__")) {
    return value.split("__EMULATOR__")[1]; 
  }
  return value; 
};
export function rawToHex(raw) {
  if (!Array.isArray(raw)) return "";
  const hex = raw
    .map(n => n.toString(16).padStart(2, "0"))
    .join("");
  return "0x" + hex.toUpperCase(); 
}

export const getTcTmId = (value) => {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (value && typeof value === "object" && Array.isArray(value.raw)) {
    return rawToHex(value.raw);
  }

  return "";
};

