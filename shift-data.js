// 36 組百貨專櫃班別代碼與規則資料庫
const SHIFT_DEFINITIONS = [
  // 兼職平日
  { code: "C03", name: "直營9.0H早班(1030-1930)兼職", start: 1030, end: 1930, hours: 8.0, type: "平日", role: "兼職", group: "morning" },
  { code: "C04", name: "直營4.0H晚班(1800-2200)兼職", start: 1800, end: 2200, hours: 4.0, type: "平日", role: "兼職", group: "night" },
  { code: "C05", name: "直營9.0H晚班(1300-2200)兼職", start: 1300, end: 2200, hours: 8.0, type: "平日", role: "兼職", group: "night" },
  { code: "C06", name: "直營6.5H晚班(1400-2030)兼職", start: 1400, end: 2030, hours: 6.0, type: "平日", role: "兼職", group: "night" },
  { code: "C11", name: "直營6.0H晚班(1530-2130)兼職", start: 1530, end: 2130, hours: 5.5, type: "平日", role: "兼職", group: "night" },
  { code: "C12", name: "直營6.5H晚班(1530-2200)兼職", start: 1530, end: 2200, hours: 6.0, type: "平日", role: "兼職", group: "night" },
  { code: "C13", name: "直營6.0H早班(1030-1630)兼職", start: 1030, end: 1630, hours: 5.5, type: "平日", role: "兼職", group: "morning" },
  { code: "C16", name: "直營9.0H晚班(1300-2200)兼職", start: 1300, end: 2200, hours: 8.0, type: "平日", role: "兼職", group: "night" },
  { code: "C35", name: "直營9.0H早班(1000-1900)兼職", start: 1000, end: 1900, hours: 8.0, type: "平日", role: "兼職", group: "morning" },
  { code: "C36", name: "直營9.0H晚班(1330-2230)兼職", start: 1330, end: 2230, hours: 8.0, type: "平日", role: "兼職", group: "night" },
  { code: "C37", name: "直營7.0H晚班(1530-2230)兼職", start: 1530, end: 2230, hours: 6.5, type: "平日", role: "兼職", group: "night" },
  { code: "C38", name: "直營8.5H晚班(1300-2130)兼職", start: 1300, end: 2130, hours: 8.0, type: "平日", role: "兼職", group: "night" },
  { code: "C44", name: "直營11H全班(1030-2130)兼職", start: 1030, end: 2130, hours: 10.0, type: "平日", role: "兼職", group: "all" },
  { code: "C45", name: "直營11.5H全班(1030-2200)兼職", start: 1030, end: 2200, hours: 10.5, type: "平日", role: "兼職", group: "all" },
  { code: "C46", name: "直營12H全班(1030-2230)兼職", start: 1030, end: 2230, hours: 11.0, type: "平日", role: "兼職", group: "all" },
  { code: "C47", name: "直營12.5H全班(1000-2230)兼職", start: 1000, end: 2230, hours: 11.5, type: "平日", role: "兼職", group: "all" },
  { code: "C48", name: "直營12H全班(1000-2200)兼職", start: 1000, end: 2200, hours: 11.0, type: "平日", role: "兼職", group: "all" },
  { code: "C52", name: "直營6.5H早班(1000-1630)兼職", start: 1000, end: 1630, hours: 6.0, type: "平日", role: "兼職", group: "morning" },

  // 兼職假日
  { code: "C17", name: "DP假日直營4.0H早班(1030-1400)兼職", start: 1030, end: 1400, hours: 3.5, type: "假日", role: "兼職", group: "morning" },
  { code: "C18", name: "DP假日直營6.5H早班(1030-1630)兼職", start: 1030, end: 1630, hours: 5.5, type: "假日", role: "兼職", group: "morning" },
  { code: "C23", name: "DP假日直營9.0H早班(1000-1900)兼職", start: 1000, end: 1900, hours: 8.0, type: "假日", role: "兼職", group: "morning" },
  { code: "C29", name: "DP假日直營8.5H晚班(1300-2130)兼職", start: 1300, end: 2130, hours: 8.0, type: "假日", role: "兼職", group: "night" },
  { code: "C30", name: "DP假日直營9.0H晚班(1300-2200)兼職", start: 1300, end: 2200, hours: 8.0, type: "假日", role: "兼職", group: "night" },
  { code: "C49", name: "DP假日百貨9.0H早班(1030-1930)兼職", start: 1030, end: 1930, hours: 8.0, type: "假日", role: "兼職", group: "morning" },
  { code: "C50", name: "DP假日直營6.5H晚班(1530-2200)兼職", start: 1530, end: 2200, hours: 6.0, type: "假日", role: "兼職", group: "night" },
  { code: "C51", name: "DP假日直營6H晚班(1530-2130)兼職", start: 1530, end: 2130, hours: 5.5, type: "假日", role: "兼職", group: "night" },

  // 正職平日
  { code: "C07", name: "直營9.0H早班(1030-1930)正職", start: 1030, end: 1930, hours: 8.0, type: "平日", role: "正職", group: "morning" },
  { code: "C08", name: "直營9.0H晚班(1300-2200)正職", start: 1300, end: 2200, hours: 8.0, type: "平日", role: "正職", group: "night" },
  { code: "C32", name: "直營9.0H早班(1000-1900)正職", start: 1000, end: 1900, hours: 8.0, type: "平日", role: "正職", group: "morning" },
  { code: "C33", name: "直營9.0H晚班(1330-2230)正職", start: 1330, end: 2230, hours: 8.0, type: "平日", role: "正職", group: "night" },
  { code: "C34", name: "直營9.0H晚班(1230-2130)正職", start: 1230, end: 2130, hours: 8.0, type: "平日", role: "正職", group: "night" },
  { code: "C39", name: "直營11H全班(1030-2130)正職", start: 1030, end: 2130, hours: 10.0, type: "平日", role: "正職", group: "all" },
  { code: "C40", name: "直營11.5H全班(1030-2200)正職", start: 1030, end: 2200, hours: 10.5, type: "平日", role: "正職", group: "all" },
  { code: "C41", name: "直營12H全班(1030-2230)正職", start: 1030, end: 2230, hours: 11.0, type: "平日", role: "正職", group: "all" },
  { code: "C42", name: "直營12.5H全班(1000-2230)正職", start: 1000, end: 2230, hours: 11.5, type: "平日", role: "正職", group: "all" },
  { code: "C43", name: "直營12H全班(1000-2200)正職", start: 1000, end: 2200, hours: 11.0, type: "平日", role: "正職", group: "all" }
];

// 空班/休假代碼
const OFF_DEFINITIONS = [
  { code: ";H", name: "休息日 (排休)", type: "平日/休息" },
  { code: ";H2", name: "例假日 (例休)", type: "假日/例休" },
  { code: ";H3", name: "非法定休息日", type: "其他" },
  { code: ";H4", name: "國定假日", type: "國定" }
];

// 初始員工資料（包含 正職、兼職、機動）
const INITIAL_EMPLOYEES = [
  // DREAM PLAZA
  { code: "SL0003", name: "李靖為", role: "正職", store: "DP" },
  { code: "SL0074", name: "洪孟函", role: "正職", store: "DP" },
  { code: "SL0027", name: "賴可欣", role: "兼職", store: "DP" },
  { code: "SL0067", name: "薄錫毓", role: "兼職", store: "DP" },
  { code: "SL0060", name: "黃佩儀", role: "兼職", store: "DP" },
  { code: "SL0091", name: "支援人員A", role: "機動", store: "DP" },
  
  // 台南三越
  { code: "SL0037", name: "翁墨璽", role: "兼職", store: "TAINAN" },
  { code: "SL0040", name: "周欣沂", role: "兼職", store: "TAINAN" },
  { code: "SL0078", name: "陳雅琳", role: "兼職", store: "TAINAN" },
  { code: "SL0092", name: "跨店機動B", role: "機動", store: "TAINAN" },
  
  // 夢時代
  { code: "SL0062", name: "陳佳樺", role: "正職", store: "DREAM" },
  { code: "SL0066", name: "陳嵩岳", role: "兼職", store: "DREAM" },
  { code: "SL0063", name: "張怡婷", role: "兼職", store: "DREAM" },
  { code: "SL0093", name: "機動支援C", role: "機動", store: "DREAM" },
  
  // SKM PARK
  { code: "SL0073", name: "吳芸慈", role: "正職", store: "SKM" },
  { code: "SL0070", name: "盧詠沂", role: "兼職", store: "SKM" },
  { code: "SL0071", name: "蘇啟", role: "兼職", store: "SKM" },
  { code: "SL0076", name: "吳奕姍", role: "兼職", store: "SKM" },
  { code: "SL0077", name: "沈泓岳", role: "兼職", store: "SKM" },
  { code: "SL0094", name: "高雄機動D", role: "機動", store: "SKM" }
];

window.SHIFT_DEFINITIONS = SHIFT_DEFINITIONS;
window.OFF_DEFINITIONS = OFF_DEFINITIONS;
window.INITIAL_EMPLOYEES = INITIAL_EMPLOYEES;
