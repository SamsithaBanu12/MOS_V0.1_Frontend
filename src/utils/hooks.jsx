import { useState, useRef, useEffect, useMemo } from "react";
import { fetchBeacon } from "./api";
import { formatMmSs } from "./utils";
import { getStatus } from "./api/api";

export default function useBeacon(pollMs = 5000) {
  const [b, setB] = useState({
    GNSS_X_POS: undefined, GNSS_Y_POS: undefined, GNSS_Z_POS: undefined,
    GNSS_X_VEL: undefined, GNSS_Y_VEL: undefined, GNSS_Z_VEL: undefined,
    SNS_OBC_TEMP: undefined, SNS_GNSS_TEMP: undefined,
    EPS_TOTALBATTERYVOLT: undefined,
    GNSS_FIXSTATUS: undefined, EPS_CHANNELSTATUS: undefined,
    ADCS_INIT_STS: undefined, ADCS_OP_MODE: undefined,
    TIMESTAMP: undefined,
  });
  const [err, setErr] = useState("");

  // Track freshness
  const [lastUpdatedMs, setLastUpdatedMs] = useState(null);
  const lastStampRef = useRef(null); // last unique sample id

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const obj = await fetchBeacon();
        if (cancelled) return;

        // Update reading
        setB((prev) => ({
          ...prev,
          GNSS_X_POS: Number(obj.GNSS_X_POS),
          GNSS_Y_POS: Number(obj.GNSS_Y_POS),
          GNSS_Z_POS: Number(obj.GNSS_Z_POS),
          GNSS_X_VEL: Number(obj.GNSS_X_VEL),
          GNSS_Y_VEL: Number(obj.GNSS_Y_VEL),
          GNSS_Z_VEL: Number(obj.GNSS_Z_VEL),
          SNS_OBC_TEMP: Number(obj.SNS_OBC_TEMP),
          SNS_GNSS_TEMP: Number(obj.SNS_GNSS_TEMP),
          EPS_TOTALBATTERYVOLT: Number(obj.EPS_TOTALBATTERYVOLT),
          GNSS_FIXSTATUS: obj.GNSS_FIXSTATUS,
          EPS_CHANNELSTATUS: obj.EPS_CHANNELSTATUS,
          ADCS_INIT_STS: obj.ADCS_INIT_STS,
          ADCS_OP_MODE: obj.ADCS_OP_MODE,
          TIMESTAMP: Number(obj.TIMESTAMP),
        }));

        // Determine if this is a NEW sample
        const tsNum = Number(obj.TIMESTAMP);
        const stamp =
          Number.isFinite(tsNum) && tsNum > 0
            ? `ts:${tsNum}`
            : [
              obj.GNSS_X_POS, obj.GNSS_Y_POS, obj.GNSS_Z_POS,
              obj.GNSS_X_VEL, obj.GNSS_Y_VEL, obj.GNSS_Z_VEL,
            ].join("|");

        if (stamp !== lastStampRef.current) {
          lastStampRef.current = stamp;
          setLastUpdatedMs(Date.now());
        }

        setErr("");
      } catch (e) {
        if (!cancelled) setErr(String(e.message || e));
      }
    };

    tick();
    const h = setInterval(tick, pollMs);
    return () => { cancelled = true; clearInterval(h); };
  }, [pollMs]);

  return { b, error: err, lastUpdatedMs };
}

export function useBridgeStatus(pollMs = 2000) {
  const [state, setState] = useState({ bridge_a: false, bridge_b: false, ok: false, error: "" });

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch("http://localhost:8000/status");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const a = !!data?.status?.bridge_a;
        const b = !!data?.status?.bridge_b;
        if (!cancelled) setState({ bridge_a: a, bridge_b: b, ok: a && b, error: "" });
      } catch (e) {
        if (!cancelled) setState((p) => ({ ...p, ok: false, error: String(e.message || e) }));
      }
    };
    tick();
    const h = setInterval(tick, pollMs);
    return () => { cancelled = true; clearInterval(h); };
  }, [pollMs]);
  return state;
}

export function useNowTick(intervalMs = 1000) {
  const [t, setT] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return t;
}

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * @param {string|number|null|undefined} targetUtc
 *   - "YYYY-MM-DD HH:mm:ss" (UTC), or ISO-ish, or epoch seconds
 * Returns { display, done, secondsLeft }
 */
export function useCountdownToUtcDone(targetUtc) {
  const targetMs = useMemo(() => {
    if (targetUtc == null || targetUtc === "") return null;

    if (typeof targetUtc === "number") {
      return targetUtc < 1e12 ? targetUtc * 1000 : targetUtc; // seconds or ms
    }

    const s = String(targetUtc).trim();
    const iso = s.includes("T")
      ? (s.endsWith("Z") ? s : s + "Z")
      : s.replace(" ", "T") + "Z";

    const ms = Date.parse(iso);
    return Number.isFinite(ms) ? ms : null;
  }, [targetUtc]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (targetMs == null) return; // nothing to tick
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [targetMs]);

  if (targetMs == null) {
    return { display: "", done: false, secondsLeft: 0 };
  }

  const secondsLeft = Math.max(0, Math.floor((targetMs - now) / 1000));
  const done = now >= targetMs;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const display = done ? "done" : `${mm}:${ss}`;

  return { display, done, secondsLeft };
}

export function useGettingConnectionStatus(stationId, setStatus) {
  useEffect(() => {
    if (!stationId) return; // nothing selected → no polling

    let t = null;

    async function tick() {
      if (!stationId) return;
      try {
        const s = await getStatus(stationId);
        setStatus(s);
      } catch (e) {
        // you can log if you want
        // console.error(e);
      }
    }

    tick();                        // run once immediately
    t = setInterval(tick, 5000);   // then every 5s

    return () => {
      if (t) clearInterval(t);
    };
  }, [stationId, setStatus]);
}