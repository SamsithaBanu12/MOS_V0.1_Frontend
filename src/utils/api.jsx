import {
  method_types,
  backend_api,
  headers,
  method_name,
  target_name,
  OC3,
  SCOPE
} from "../constants/contants";
import { httpPost } from "./utils";

export const getAllCommands = async () => {
  const res = await fetch(`${backend_api}/api`, {
    method: method_types["POST"],
    headers: headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: method_name["GET_ALL_COMMANDS"],
      params: [target_name],
      id: 1234567890,
      keyword_params: { scope: "DEFAULT" }
    })
  });

  const data = await res.json();
  return data;
};

export const getTlmPacket = async ({ tlmName }) => {
  const res = await fetch(`${backend_api}/api`, {
    method: method_types["POST"],
    headers: headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: method_name["SEND_COMMAND"],
      params: [target_name, tlmName],
      id: 1234567890,
      keyword_params: { scope: "DEFAULT" }
    })
  });

  const data = await res.json();
  return data;
}

export const sendEditedCommand = async (command) => {
  try {
    const res = await fetch(`${backend_api}/api`, {
      method: method_types["POST"],
      headers: headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: method_name["COMMAND"],
        params: command,
        id: 9,
        keyword_params: {
          scope: "DEFAULT"
        }
      })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      return await res.json();
    }
  } catch (error) {
    console.error("Error sending command:", error);
    return error;
  }
};

export const storeEditedCommand = async (editedCommands) => {
  try {
    const res = await fetch('http://100.71.21.42:8004/edit-commands/', {
      method: method_types["POST"],
      headers: headers,
      body: JSON.stringify(editedCommands)
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error storing edited command:", error);
    return error;
  }
}

export const getStoredEditedCommands = async () => {
  try {
    const res = await fetch('http://100.71.21.42:8004/edit-commands/', {
      method: method_types["GET"],
      headers: headers,
    });
    const data = await res.json();
    console.log('fetched stored edited commands', data);
    return data;
  } catch (error) {
    console.error("Error fetching stored edited commands:", error);
    return error;
  }
};

export const fetchBeacon = async () => {
  const body = {
    jsonrpc: "2.0",
    method: OC3.METHOD,
    params: [OC3.TARGET, OC3.PACKET],
    id: 9,
    keyword_params: { scope: OC3.SCOPE },
  };
  const res = await fetch(OC3.ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: OC3.AUTH },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  const list = Array.isArray(data?.result) ? data.result : [];
  const out = {};
  for (let i = 0; i < list.length; i++) {
    const name = String(list[i]?.[0] ?? `field_${i}`);
    const value = list[i]?.[1];
    out[name] = value;
  }
  return out;
}

//script runner API calls

const q = encodeURIComponent;

export async function lockScript(filename) {
  const safe = encodeURIComponent(filename).replace(/%2F/g, "/");
  return httpPost(`/script-api/scripts/${safe}/lock?scope=${q(SCOPE)}`);
}
export async function unlockScript(filename) {
  const safe = encodeURIComponent(filename).replace(/%2F/g, "/");
  return httpPost(`/script-api/scripts/${safe}/unlock?scope=${q(SCOPE)}`);
}

export async function startScript(filename) {
  const safe = encodeURIComponent(filename).replace(/%2F/g, "/");
  return httpPost(`/script-api/scripts/${safe}/run?scope=${q(SCOPE)}`);
}
export async function stopRun(runId) {
  return httpPost(`/script-api/running-script/${runId}/stop?scope=${q(SCOPE)}`);
}
export async function goRun(runId) {
  return httpPost(`/script-api/running-script/${runId}/go?scope=${q(SCOPE)}`);
}
export async function retryRun(runId) {
  return httpPost(`/script-api/running-script/${runId}/retry?scope=${q(SCOPE)}`);
}
export async function pauseRun(runId) {
  return httpPost(`/script-api/running-script/${runId}/pause?scope=${q(SCOPE)}`);
}
export async function sendPromptResponse(runId, method, answer, prompt_id, multiple) {
  const payload = { method, answer, prompt_id, multiple: multiple || null };
  const url = `/script-api/running-script/${runId}/prompt?scope=${SCOPE}`;
  console.log("📡 Sending prompt response to:", url, payload);
  return httpPost(url, payload);
}
