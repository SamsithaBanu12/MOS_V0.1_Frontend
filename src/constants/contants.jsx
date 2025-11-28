export const backend_api = "http://127.0.0.1:2900/openc3-api";
export const PASS_ENDPOINT = "http://127.0.0.1:8001/status";

export const method_types = {
  POST: "POST",
  GET: "GET"
};
export const headers = {
  "Content-Type": "application/json",
  Authorization: "mos12345"
};
export const method_name = {
  GET_ALL_COMMANDS: "get_all_cmds",
  COMMAND: "cmd",
  SEND_COMMAND: "get_tlm_packet",
};
export const target_name = "EMULATOR";

export const selectedOptions = [
  {
    id: 1,
    label: "Type",
    defaultData: "EMULATOR",
    isFromTelemetry: false,
    data: []
  },
  {
    id: 2,
    label: "Component",
    defaultData: "All",
    isFromTelemetry: false,
    data: []
  },
  {
    id: 3,
    label: "Command",
    defaultData: "Telecommands",
    isFromTelemetry: true,
    data: []
  }
];

export const editedCommandsHistory = [
  {
    id: 1,
    targetName: "EMULATOR",
    packetName: "200_EPS_TC_GET_SUB_SYS_INFO",
    params: [
      { name: "parameter", value: "CSPHEADER" },
      { name: "maxValue", value: "2562356736" },
      { name: "minValue", value: "2562356736" },
      { name: "dataType", value: "UINT" },
      { name: "bitSize", value: "32" },
      { name: "default", value: "0" },
      { name: "endianness", value: "BIG_ENDIAN" },
      { name: "description", value: "CSPHEADER is the header of the packet." }
    ]
  },
  {
    id: 2,
    targetName: "EMULATOR",
    packetName: "200_EPS_TC_GET_SUB_SYS_INFO",
    params: [
      { name: "parameter", value: "SOF1" },
      { name: "maxValue", value: "256235636" },
      { name: "minValue", value: "256236734" },
      { name: "dataType", value: "UINT" },
      { name: "bitSize", value: "8" },
      { name: "default", value: "0" },
      { name: "endianness", value: "BIG_ENDIAN" },
      { name: "description", value: "CSPHEADER is the header of the packet." }
    ]
  },
  {
    id: 3,
    targetName: "EMULATOR",
    packetName: "200_EPS_TC_GET_SUB_SYS_INFO",
    params: [
      { name: "parameter", value: "SOF2" },
      { name: "maxValue", value: "256235636" },
      { name: "minValue", value: "256236734" },
      { name: "dataType", value: "UINT" },
      { name: "bitSize", value: "32" },
      { name: "default", value: "0" },
      { name: "endianness", value: "BIG_ENDIAN" },
      { name: "description", value: "CSPHEADER is the header of the packet." }
    ]
  },
  {
    id: 4,
    targetName: "EMULATOR",
    packetName: "200_EPS_TC_GET_SUB_SYS_INFO",
    params: [
      { name: "parameter", value: "TC_CTRL" },
      { name: "maxValue", value: "2562356736" },
      { name: "minValue", value: "123" },
      { name: "dataType", value: "UINT" },
      { name: "bitSize", value: "32" },
      { name: "default", value: "0" },
      { name: "endianness", value: "BIG_ENDIAN" },
      { name: "description", value: "CSPHEADER is the header of the packet." }
    ]
  },
  {
    id: 5,
    targetName: "EMULATOR",
    packetName: "200_EPS_TC_GET_SUB_SYS_INFO",
    params: [
      { name: "parameter", value: "RM_ID" },
      { name: "maxValue", value: "190" },
      { name: "minValue", value: "186" },
      { name: "dataType", value: "UINT" },
      { name: "bitSize", value: "8" },
      { name: "default", value: "0" },
      { name: "endianness", value: "BIG_ENDIAN" },
      { name: "description", value: "CSPHEADER is the header of the packet." }
    ]
  }
];

export const channelNoOptions = [
  {
    id: 1,
    name: '0',
    value: '0',
    isDefault: true
  },
  {
    id: 2,
    name: 'PSBoard',
    value: '3',
    isDefault: false
  },
  {
    id: 3,
    name: 'EdgeBoard',
    value: '15',
    isDefault: false
  },
  {
    id: 4,
    name: 'Thruster',
    value: '17',
    isDefault: false
  },
  {
    id: 5,
    name: 'PL2',
    value: '20',
    isDefault: false
  },
]

export const channelStateOptions = [
  {
    id: 1,
    name: 'on',
    value: '1',
    isDefault: true
  },
  {
    id: 2,
    name: 'off',
    value: '0',
    isDefault: false
  }
]

export const OC3 = {
  ENDPOINT: "http://127.0.0.1:2900/openc3-api/api",
  AUTH: "mos12345",
  METHOD: "get_tlm_packet",
  TARGET: "EMULATOR",
  SCOPE: "DEFAULT",
  PACKET: "411_Beacon_Data",
};

export const Parameters = [
  "CSPHEADER", "SOF1", "SOF2", "TC_CTRL", "SEQ_NO", "SAT_ID", "GND_ID", "QOS", "SA_ID", "DA_ID", "TC_LEN"
]

export const passPlanData = [
  {
    id: 1,
    name: 'S-band health Data check',
    comments: '3',
    status: 'Success',
  },
  {
    id: 2,
    name: 'Time Synchronization',
    comments: '4',
    status: 'In-progress',
  },
  {
    id: 3,
    name: 'X-band Downlink Start Status',
    comments: '4',
    status: 'Waiting',
  },
  {
    id: 4,
    name: 'Schedule Upload',
    comments: '13',
    status: 'Failed',
  }
]

export const upcomingPassPlans = [
  {
    id: 1,
    name: '12-11-2025-PLAN-A',
    gs_name: 'NZ-0098',
    AOS: '2025-10-25 06:00:00',
    LOS: '2024-10-25 06:20:00',
    drafted_by: 'Kalpass',
    editor: '-',
    last_edit: '-',
    active: true,
    procedure: [
      "Beacon Data Check", "Schedule Upload", "File Upload"
    ],
    procedure_details: [
      {
        id: 1,
        name: "Beacon Data Check",
        comments: 27,
        status: 'Queued',
        runId: null,
        events: []
      },
      {
        id: 2,
        name: "Time Synchronization",
        comments: 27,
        status: 'Queued',
        runId: null,
        events: []
      },
      {
        id: 3,
        name: "Schedule Upload",
        comments: 27,
        status: 'Queued',
        runId: null,
        events: []
      },
      // {
      //   id: 3,
      //   name: "DTC File Upload",
      //   comments: 27,
      //   status: 'Queued',
      //   runId: null,
      //   events:[]
      // },
    ]
  },
  //  {
  //     id: 2,
  //     name: '06-10-2025-PLAN-A',
  //     gs_name: 'NZ-0098',
  //     AOS: '2025-10-25 06:00:00',
  //     LOS:'2024-10-25 06:20:00',
  //     drafted_by: 'Kalpass',
  //     editor: '-',
  //     last_edit: '-',
  //     active: true,
  //     procedure: [
  //       "Beacon Data Check", "Schedule Upload", "File Upload"
  //     ],
  //     procedure_details: [
  // {
  //         id: 1,
  //         name: "Beacon Data Check",
  //         comments: 27,
  //         status: 'Queued',
  //         runId:null,
  //         events:[]
  //       },
  //       {
  //         id: 2,
  //         name: "Time Synchronization",
  //         comments: 27,
  //         status: 'Queued',
  //         runId:null,
  //         events:[]
  //       },
  //       // {
  //       //   id: 2,
  //       //   name: "Schedule Upload",
  //       //   comments: 27,
  //       //   status: 'Queued',
  //       //   runId:null,
  //       //   events:[]
  //       // },
  //       // {
  //       //   id: 3,
  //       //   name: "DTC File Upload",
  //       //   comments: 27,
  //       //   status: 'Queued',
  //       //   runId: null,
  //       //   events:[]
  //       // },
  //     ]
  //   },
  // {
  //   id: 3,
  //   name: '08-10-2025-PlAN-B',
  //   gs_name: 'NZ-0098',
  //   AOS: '2025-10-25 08:00:00',
  //   LOS:'2024-10-25 08:20:00',
  //   drafted_by: 'Kalpass',
  //   editor: '-',
  //   last_edit: '-',
  //   active: false,
  //   procedure: [
  //     "Beacon Data Check", "Schedule Upload", "File Upload"
  //   ],
  //   procedure_details: [
  //     {
  //       id: 1,
  //       name: "Beacon Data Check",
  //       comments: 9,
  //       status: 'Queued'
  //     },
  //     {
  //       id: 2,
  //       name: "Schedule Upload",
  //       comments: 27,
  //       status: 'Queued'
  //     },
  //     {
  //       id: 3,
  //       name: 'File Upload',
  //       comments: 14,
  //       status: 'Queued'
  //     }
  //   ]
  // },
  // {
  //   id: 4,
  //   name: '20-10-2025-PlAN-A',
  //   gs_name: 'NZ-0098',
  //   AOS: '2025-10-25 09:00:00',
  //   LOS:'2024-10-25 09:20:00',
  //   drafted_by: 'Shiva',
  //   editor: 'Kishan',
  //   last_edit: '2024-10-01 10:00:00',
  //   active: false,
  //   procedure: [
  //     "Beacon Data Check", "Schedule Upload", "File Upload"
  //   ],
  //   procedure_details: [
  //     {
  //       id: 1,
  //       name: "Beacon Data Check",
  //       comments: 9,
  //       status: 'Queued'
  //     },
  //     {
  //       id: 2,
  //       name: "Schedule Upload",
  //       comments: 27,
  //       status: 'Queued'
  //     },
  //     {
  //       id: 3,
  //       name: 'File Upload',
  //       comments: 14,
  //       status: 'Queued'
  //     }
  //   ]
  // },
  // {
  //   id: 5,
  //   name: '20-10-2025-PlAN-B',
  //   gs_name: 'NZ-0098',
  //   AOS: '2025-10-25 10:00:00',
  //   LOS:'2024-10-25 10:20:00',
  //   drafted_by: 'shiva',
  //   editor: 'Jayanth',
  //   last_edit: '2024-06-01 10:00:00',
  //   active: false,
  //   procedure: [
  //     "Beacon Data Check", "Schedule Upload", "File Upload"
  //   ],
  //   procedure_details: [
  //     {
  //       id: 1,
  //       name: "Beacon Data Check",
  //       comments: 9,
  //       status: 'Queued'
  //     },
  //     {
  //       id: 2,
  //       name: "Schedule Upload",
  //       comments: 27,
  //       status: 'Queued'
  //     },
  //     {
  //       id: 3,
  //       name: 'File Upload',
  //       comments: 14,
  //       status: 'Queued'
  //     }
  //   ]
  // },
]

//script runner

export const USE_PROXY = true;
export const BASE = USE_PROXY ? "" : "http://localhost:2900";
export const TOKEN = "VCmQ9mz_9iqZ_JhqHhG2CA";
export const SCOPE = "DEFAULT";
export const AUTO_LOCK = true;

export const WS_URL = USE_PROXY
  ? `${window.location.protocol === "https:" ? "wss://" : "ws://"}${window.location.host}/script-api/cable`
  : (BASE.replace("http://", "ws://").replace("https://", "wss://") + "/script-api/cable");

export const WS_SUBPROTOCOLS = ["actioncable-v1-json"];
export const HTTP_HEADERS = { Authorization: TOKEN, "Content-Type": "application/json" };

export const SEVERITY_ORDER = { info: 0, warn: 1, error: 2 };
export const STATUS_RANK = { idle: 0, waiting: 1, running: 2, error: 4, success: 3 };

export const SUCCESS_PATTERNS = [
  /script\s*completed:?/i,
  /\bcompleted(?:\s*successfully)?\b/i,
  /\bfinished\b/i,
  /\ball\s*done\b/i,
  /\bsuccess(?:ful(?:ly)?)?\b/i,
  /(time\s*sync|timesync).*(done|complete(?:d)?|success)/i,
  /(schedule|upload).*(done|complete(?:d)?|success)/i
];

export const allProcedures = [
  {
    id: 1,
    name: 'Beacon Data Check',
    comments: 9,
    status: 'Queued'
  },
  {
    id: 2,
    name: 'Time Synchronization',
    comments: 4,
    status: 'Queued'
  },
  {
    id: 3,
    name: 'X-band Downlink Start Status',
    comments: 8,
    status: 'Queued'
  },
  {
    id: 4,
    name: 'Schedule Upload',
    comments: 24,
    status: 'Queued'
  },
  {
    id: 5,
    name: 'DTC File Upload',
    comments: 10,
    status: 'Queued'
  },
  {
    id: 6,
    name: 'S-band uplink status',
    comments: 6,
    status: 'Queued'
  }
];
export const allScheduleFiles = [
  {
    id: 1,
    name: 'schedule.json'
  },
  {
    id: 2,
    name: 'schedule_updated.json'
  },
  {
    id: 3,
    name: 'schedule_older.json'
  }
]

export const allDTCFiles = [
  {
    id: 1,
    name: 'ftm_tx_log.txt'
  },
  {
    id: 2,
    name: 'ftm_log1.txt'
  },
  {
    id: 3,
    name: 'ftm_log2.txt'
  }
]

// command sender

export const API_URL = "http://localhost:2900/openc3-api/api";
export const AUTH = "mos12345";

export const DERIVED_HIDE = new Set([
  "PACKET_TIMESECONDS",
  "PACKET_TIMEFORMATTED",
  "RECEIVED_TIMESECONDS",
  "RECEIVED_TIMEFORMATTED",
  "RECEIVED_COUNT",
]);

export const HEADER_NAMES = new Set([
  "CSPHEADER",
  "SOF1",
  "SOF2",
  "TC_CTRL",
  "TIMESTAMP",
  "SEQ_NO",
  "SAT_ID",
  "GND_ID",
  "QOS",
  "SA_ID",
]);

export const ROUTING_NAMES = new Set(["DA_ID", "RM_ID", "TC_ID"]);