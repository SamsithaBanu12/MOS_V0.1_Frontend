// Network send + the single universal template live here.

const API_URL = "http://127.0.0.1:2900/openc3-api/api";
const AUTH = "mos12345";

/**
 * Build the param string using the universal template:
 * EMULATOR <packet> with DA_ID <hex>, RM_ID <num>, TC_ID <hex>[, name value ...]
 * @param {object} cmd - the selected command object
 * @param {object} routing - { DA_ID: "0x....", RM_ID: "4", TC_ID: "0x...." }
 * @param {Array<{name:string, kind:'hex'|'state', value:string|number}>} payload
 */
export function buildParamsString(cmd, routing, payload) {
  const parts = [
    `DA_ID ${routing.DA_ID ?? ""}`,
    `RM_ID ${routing.RM_ID ?? ""}`,
    `TC_ID ${routing.TC_ID ?? ""}`,
  ];

  for (const p of payload) {
    if (p.kind === "hex") parts.push(`${p.name} ${p.value}`);
    else if (p.kind === "state") parts.push(`${p.name} ${p.value}`); // numeric value for state
  }

  return `EMULATOR ${cmd.packet_name} with ${parts.join(", ")}`;
}

export async function sendCommand(paramString) {
  try {
    const body = {
      jsonrpc: "2.0",
      method: "cmd",
      params: [paramString],
      id: 9,
      keyword_params: { scope: "DEFAULT" },
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch (e) {
    return { ok: false, status: 0, text: e.message || String(e) };
  }
}
