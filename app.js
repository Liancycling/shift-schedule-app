// 百貨專櫃 AI 智慧排班系統 - v3.0 雲端即時多人多端同步版 (Firebase Cloud Firestore)
(function() {
  function initApp() {
    console.log("Initializing Department Store Schedule App with Firebase Cloud Sync...");

    // 1. Firebase 初始化
    const firebaseConfig = {
      projectId: "dalab-ae4d7",
      appId: "1:1030780337201:web:2f96e29cc1714b17002910",
      storageBucket: "dalab-ae4d7.firebasestorage.app",
      apiKey: "AIzaSyB3ldt87CpJLI92m_AQUo2eZT4zQznSM54",
      authDomain: "dalab-ae4d7.firebaseapp.com",
      messagingSenderId: "1030780337201"
    };

    let db = null;
    let isCloudOnline = false;

    try {
      if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        isCloudOnline = true;
        console.log("Firebase Firestore successfully initialized!");
      }
    } catch (e) {
      console.warn("Firebase initialization failed, falling back to LocalStorage:", e);
    }

    // State
    let currentStore = "DP";
    let currentYearMonth = "2026-08";
    let selectedRoleCategory = "兼職";
    let selectedShiftCode = "C13";

    const STORAGE_SCHEDULE_KEY = "DEPT_SCHEDULE_DATA_V2";
    const STORAGE_EMP_KEY = "DEPT_EMP_DATA_V2";
    const STORAGE_SHIFT_KEY = "DEPT_SHIFT_DATA_V2";

    // 預設資料庫
    const defaultEmployees = (window.INITIAL_EMPLOYEES && window.INITIAL_EMPLOYEES.length > 0) ? window.INITIAL_EMPLOYEES : [
      { code: "SL0003", name: "李靖為", role: "正職機動", store: "DP" },
      { code: "SL0074", name: "洪孟函", role: "正職", store: "DP" },
      { code: "SL0027", name: "賴可欣", role: "兼職", store: "DP" },
      { code: "SL0067", name: "薄錫毓", role: "兼職機動", store: "DP" },
      { code: "SL0060", name: "黃佩儀", role: "兼職", store: "DP" },
      { code: "SL0091", name: "支援人員A", role: "兼職機動", store: "DP" },
      { code: "SL0037", name: "翁墨璽", role: "兼職", store: "TAINAN" },
      { code: "SL0040", name: "周欣沂", role: "兼職", store: "TAINAN" },
      { code: "SL0078", name: "陳雅琳", role: "兼職", store: "TAINAN" },
      { code: "SL0092", name: "跨店機動B", role: "正職機動", store: "TAINAN" },
      { code: "SL0062", name: "陳佳樺", role: "正職", store: "DREAM" },
      { code: "SL0066", name: "陳嵩岳", role: "兼職", store: "DREAM" },
      { code: "SL0063", name: "張怡婷", role: "兼職", store: "DREAM" },
      { code: "SL0093", name: "機動支援C", role: "兼職機動", store: "DREAM" },
      { code: "SL0073", name: "吳芸慈", role: "正職", store: "SKM" },
      { code: "SL0070", name: "盧詠沂", role: "兼職", store: "SKM" },
      { code: "SL0071", name: "蘇啟", role: "兼職", store: "SKM" },
      { code: "SL0076", name: "吳奕姍", role: "兼職", store: "SKM" },
      { code: "SL0077", name: "沈泓岳", role: "兼職", store: "SKM" },
      { code: "SL0094", name: "高雄機動D", role: "兼職機動", store: "SKM" }
    ];

    const defaultShifts = (window.SHIFT_DEFINITIONS && window.SHIFT_DEFINITIONS.length > 0) ? window.SHIFT_DEFINITIONS : [
      { code: "C07", name: "直營9.0H早班(1030-1930)正職", start: 1030, end: 1930, hours: 8.0, type: "平日", role: "正職", group: "morning" },
      { code: "C34", name: "直營9.0H晚班(1230-2130)正職", start: 1230, end: 2130, hours: 8.0, type: "平日", role: "正職", group: "night" },
      { code: "C32", name: "直營9.0H早班(1000-1900)正職", start: 1000, end: 1900, hours: 8.0, type: "平日", role: "正職", group: "morning" },
      { code: "C08", name: "直營9.0H晚班(1300-2200)正職", start: 1300, end: 2200, hours: 8.0, type: "平日", role: "正職", group: "night" },
      { code: "C39", name: "直營11H全班(1030-2130)正職", start: 1030, end: 2130, hours: 10.0, type: "平日", role: "正職", group: "all" },
      { code: "C13", name: "直營6.0H早班(1030-1630)兼職", start: 1030, end: 1630, hours: 5.5, type: "平日", role: "兼職", group: "morning" },
      { code: "C11", name: "直營6.0H晚班(1530-2130)兼職", start: 1530, end: 2130, hours: 5.5, type: "平日", role: "兼職", group: "night" },
      { code: "C12", name: "直營6.5H晚班(1530-2200)兼職", start: 1530, end: 2200, hours: 6.0, type: "平日", role: "兼職", group: "night" },
      { code: "C04", name: "直營4.0H晚班(1800-2200)兼職", start: 1800, end: 2200, hours: 4.0, type: "平日", role: "兼職", group: "night" },
      { code: "C18", name: "DP假日直營6.5H早班(1030-1630)兼職", start: 1030, end: 1630, hours: 5.5, type: "假日", role: "兼職", group: "morning" },
      { code: "C50", name: "DP假日直營6.5H晚班(1530-2200)兼職", start: 1530, end: 2200, hours: 6.0, type: "假日", role: "兼職", group: "night" }
    ];

    let scheduleData = {};
    let employees = [...defaultEmployees];
    let customShifts = [...defaultShifts];

    // LocalStorage Initial fallback & auto-migrate roles
    try {
      const savedSched = localStorage.getItem(STORAGE_SCHEDULE_KEY);
      if (savedSched) scheduleData = JSON.parse(savedSched);

      const savedEmp = localStorage.getItem(STORAGE_EMP_KEY);
      if (savedEmp) {
        const parsed = JSON.parse(savedEmp);
        if (Array.isArray(parsed) && parsed.length > 0) {
          employees = parsed.map(emp => {
            if (emp.name === "李靖為" || emp.code === "SL0003") return { ...emp, role: "正職機動" };
            if (emp.name === "薄錫毓" || emp.code === "SL0067") return { ...emp, role: "兼職機動" };
            return emp;
          });
        }
      }

      const savedShift = localStorage.getItem(STORAGE_SHIFT_KEY);
      if (savedShift) {
        const parsed = JSON.parse(savedShift);
        if (Array.isArray(parsed) && parsed.length > 0) customShifts = parsed;
      }
    } catch (err) {
      console.warn("LocalStorage parse error:", err);
    }

    let currentModalTarget = { store: "", empCode: "", empName: "", day: null, weekday: "" };

    // DOM Elements
    const storeSelect = document.getElementById("storeSelect");
    const yearMonthSelect = document.getElementById("yearMonthSelect");
    const filterRole = document.getElementById("filterRole");
    const currentStoreTitle = document.getElementById("currentStoreTitle");
    const scheduleTable = document.getElementById("scheduleTable");
    const codeRefTbody = document.getElementById("codeRefTbody");
    const statEmpCount = document.getElementById("statEmpCount");
    const statTotalHours = document.getElementById("statTotalHours");
    const statConflicts = document.getElementById("statConflicts");
    const btnAiAutoSchedule = document.getElementById("btnAiAutoSchedule");
    const btnExportHr = document.getElementById("btnExportHr");
    const btnExportStore = document.getElementById("btnExportStore");
    const toggleCodeRef = document.getElementById("toggleCodeRef");
    const codeRefContent = document.getElementById("codeRefContent");
    const btnResetData = document.getElementById("btnResetData");
    const syncStatusText = document.getElementById("syncStatusText");
    const syncStatusDot = document.getElementById("syncStatusDot");

    const stepRoleButtons = document.getElementById("stepRoleButtons");
    const stepShiftButtons = document.getElementById("stepShiftButtons");
    const badgeActiveShift = document.getElementById("badgeActiveShift");

    const leaveModalOverlay = document.getElementById("leaveModalOverlay");
    const leaveModalTitle = document.getElementById("leaveModalTitle");
    const leaveModalSubtitle = document.getElementById("leaveModalSubtitle");
    const leaveModalCloseBtn = document.getElementById("leaveModalCloseBtn");
    const leaveModalCancelBtn = document.getElementById("leaveModalCancelBtn");
    const leaveModalSaveBtn = document.getElementById("leaveModalSaveBtn");
    const leaveModalClearBtn = document.getElementById("leaveModalClearBtn");
    const leaveModalCurrentCode = document.getElementById("leaveModalCurrentCode");
    const leaveModalCurrentName = document.getElementById("leaveModalCurrentName");
    const leaveModalStdHours = document.getElementById("leaveModalStdHours");
    const leaveModalOvertimeHours = document.getElementById("leaveModalOvertimeHours");
    const leaveModalDeductHours = document.getElementById("leaveModalDeductHours");
    const leaveModalActualHours = document.getElementById("leaveModalActualHours");
    const leaveModalNote = document.getElementById("leaveModalNote");
    const leaveModalChangeShift = document.getElementById("leaveModalChangeShift");

    // Auth State & Elements
    const STORAGE_AUTH_KEY = "DEPT_AUTH_USER_V1";
    let currentUser = localStorage.getItem(STORAGE_AUTH_KEY) || null;

    const authGuestBox = document.getElementById("authGuestBox");
    const authAdminBox = document.getElementById("authAdminBox");
    const btnOpenLoginModal = document.getElementById("btnOpenLoginModal");
    const loginModalOverlay = document.getElementById("loginModalOverlay");
    const loginModalCloseBtn = document.getElementById("loginModalCloseBtn");
    const loginModalCancelBtn = document.getElementById("loginModalCancelBtn");
    const loginSubmitBtn = document.getElementById("loginSubmitBtn");
    const loginUsername = document.getElementById("loginUsername");
    const loginPassword = document.getElementById("loginPassword");
    const loginErrorMsg = document.getElementById("loginErrorMsg");
    const btnLogout = document.getElementById("btnLogout");
    const loggedUserBadge = document.getElementById("loggedUserBadge");

    function updateAuthUI() {
      if (currentUser) {
        if (authGuestBox) authGuestBox.style.display = "none";
        if (authAdminBox) authAdminBox.style.display = "flex";
        if (loggedUserBadge) loggedUserBadge.textContent = currentUser;
      } else {
        if (authGuestBox) authGuestBox.style.display = "flex";
        if (authAdminBox) authAdminBox.style.display = "none";
      }
    }

    if (btnOpenLoginModal) {
      btnOpenLoginModal.addEventListener("click", () => {
        if (loginUsername) loginUsername.value = "";
        if (loginPassword) loginPassword.value = "";
        if (loginErrorMsg) loginErrorMsg.style.display = "none";
        if (loginModalOverlay) loginModalOverlay.style.display = "flex";
        setTimeout(() => { if (loginUsername) loginUsername.focus(); }, 100);
      });
    }

    function closeLoginModal() {
      if (loginModalOverlay) loginModalOverlay.style.display = "none";
    }
    if (loginModalCloseBtn) loginModalCloseBtn.addEventListener("click", closeLoginModal);
    if (loginModalCancelBtn) loginModalCancelBtn.addEventListener("click", closeLoginModal);

    function handleLogin() {
      const u = loginUsername ? loginUsername.value.trim() : "";
      const p = loginPassword ? loginPassword.value.trim() : "";

      // 預設帳密：DALAB / 1234
      if (u.toUpperCase() === "DALAB" && p === "1234") {
        currentUser = "DALAB";
        localStorage.setItem(STORAGE_AUTH_KEY, currentUser);
        updateAuthUI();
        closeLoginModal();
        alert("🎉 登入成功！已解鎖人員管理、班別字典與考勤匯出等主管功能。");
      } else {
        if (loginErrorMsg) loginErrorMsg.style.display = "block";
      }
    }

    if (loginSubmitBtn) loginSubmitBtn.addEventListener("click", handleLogin);
    if (loginPassword) {
      loginPassword.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleLogin();
      });
    }

    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        if (confirm("確定要登出主管權限嗎？")) {
          currentUser = null;
          localStorage.removeItem(STORAGE_AUTH_KEY);
          updateAuthUI();
        }
      });
    }

    const btnManageEmployees = document.getElementById("btnManageEmployees");
    const empModalOverlay = document.getElementById("empModalOverlay");
    const empModalCloseBtn = document.getElementById("empModalCloseBtn");
    const empModalDoneBtn = document.getElementById("empModalDoneBtn");
    const btnAddNewEmp = document.getElementById("btnAddNewEmp");
    const newEmpCode = document.getElementById("newEmpCode");
    const newEmpName = document.getElementById("newEmpName");
    const newEmpRole = document.getElementById("newEmpRole");
    const newEmpStore = document.getElementById("newEmpStore");
    const empManageTbody = document.getElementById("empManageTbody");
    const totalEmpBadge = document.getElementById("totalEmpBadge");

    const btnManageShifts = document.getElementById("btnManageShifts");
    const shiftManageModalOverlay = document.getElementById("shiftManageModalOverlay");
    const shiftManageModalCloseBtn = document.getElementById("shiftManageModalCloseBtn");
    const shiftManageModalDoneBtn = document.getElementById("shiftManageModalDoneBtn");
    const btnAddNewShift = document.getElementById("btnAddNewShift");
    const newShiftCode = document.getElementById("newShiftCode");
    const newShiftName = document.getElementById("newShiftName");
    const newShiftStart = document.getElementById("newShiftStart");
    const newShiftEnd = document.getElementById("newShiftEnd");
    const newShiftHours = document.getElementById("newShiftHours");
    const newShiftType = document.getElementById("newShiftType");
    const newShiftRole = document.getElementById("newShiftRole");
    const shiftManageTbody = document.getElementById("shiftManageTbody");
    const totalShiftBadge = document.getElementById("totalShiftBadge");

    // 🌟 雲端即時同步器 (Firestore Real-time Listener)
    let unsubscribeSchedule = null;

    function setupCloudListeners() {
      if (!db) return;

      // 監聽排班表即時變更
      const scheduleDocRef = db.collection("schedules").doc(currentYearMonth);
      if (unsubscribeSchedule) unsubscribeSchedule();

      unsubscribeSchedule = scheduleDocRef.onSnapshot((doc) => {
        if (doc.exists) {
          const cloudData = doc.data();
          if (cloudData && cloudData.shifts) {
            scheduleData = cloudData.shifts;
            localStorage.setItem(STORAGE_SCHEDULE_KEY, JSON.stringify(scheduleData));
            renderScheduleTable();
            updateSyncStatus(true);
          }
        } else {
          // 若雲端尚未有此月份資料，同步本地資料上去
          if (Object.keys(scheduleData).length > 0) {
            scheduleDocRef.set({ shifts: scheduleData }, { merge: true });
          }
        }
      }, (error) => {
        console.warn("Firestore schedule snapshot error:", error);
        updateSyncStatus(false);
      });

      // 監聽員工名單即時變更
      db.collection("settings").doc("employees").onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (data && Array.isArray(data.list) && data.list.length > 0) {
            employees = data.list;
            localStorage.setItem(STORAGE_EMP_KEY, JSON.stringify(employees));
            renderEmployeeManagementTable();
            renderScheduleTable();
          }
        } else {
          db.collection("settings").doc("employees").set({ list: employees });
        }
      });

      // 監聽班別字典即時變更
      db.collection("settings").doc("shifts").onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (data && Array.isArray(data.list) && data.list.length > 0) {
            customShifts = data.list;
            localStorage.setItem(STORAGE_SHIFT_KEY, JSON.stringify(customShifts));
            renderShiftManagementTable();
            renderCodeReference();
            renderShiftOptionsForRole();
            renderScheduleTable();
          }
        } else {
          db.collection("settings").doc("shifts").set({ list: customShifts });
        }
      });
    }

    function updateSyncStatus(isSynced) {
      if (!syncStatusText || !syncStatusDot) return;
      if (isSynced) {
        syncStatusDot.className = "status-indicator online";
        syncStatusText.textContent = "☁️ 雲端已即時連線（多店長即時同步中）";
      } else {
        syncStatusDot.className = "status-indicator";
        syncStatusDot.style.background = "#f59e0b";
        syncStatusText.textContent = "⚠️ 離線暫存模式（已保存於本機）";
      }
    }

    function syncScheduleToCloud() {
      localStorage.setItem(STORAGE_SCHEDULE_KEY, JSON.stringify(scheduleData));
      if (db) {
        db.collection("schedules").doc(currentYearMonth).set({
          shifts: scheduleData,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => {
          console.warn("Failed syncing schedule to Firestore:", err);
        });
      }
    }

    function syncEmployeesToCloud() {
      localStorage.setItem(STORAGE_EMP_KEY, JSON.stringify(employees));
      if (db) {
        db.collection("settings").doc("employees").set({
          list: employees,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => console.warn("Sync emp error:", err));
      }
    }

    function syncShiftsToCloud() {
      localStorage.setItem(STORAGE_SHIFT_KEY, JSON.stringify(customShifts));
      if (db) {
        db.collection("settings").doc("shifts").set({
          list: customShifts,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => console.warn("Sync shift error:", err));
      }
    }

    function renderCodeReference() {
      if (!codeRefTbody) return;
      codeRefTbody.innerHTML = "";
      customShifts.forEach(sc => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong style="color:var(--primary);">${sc.code}</strong></td>
          <td>${sc.name}</td>
          <td>${formatTime(sc.start)} ~ ${formatTime(sc.end)}</td>
          <td><strong>${sc.hours} hr</strong></td>
          <td><span class="badge">${sc.type}</span></td>
          <td>${sc.role}</td>
        `;
        codeRefTbody.appendChild(tr);
      });

      if (leaveModalChangeShift) {
        leaveModalChangeShift.innerHTML = '<option value="">-- 維持原班別 --</option>';
        customShifts.forEach(sc => {
          const opt = document.createElement("option");
          opt.value = sc.code;
          opt.textContent = `${sc.code} | ${sc.name} (${sc.hours}h)`;
          leaveModalChangeShift.appendChild(opt);
        });
      }
    }

    function formatTime(val) {
      if (!val) return "";
      const s = String(val).padStart(4, "0");
      return `${s.slice(0, 2)}:${s.slice(2)}`;
    }

    function getDaysInMonth(yearMonth) {
      const [year, month] = yearMonth.split("-").map(Number);
      const date = new Date(year, month, 0);
      const totalDays = date.getDate();
      const days = [];
      const weekdayNames = ["日", "一", "二", "三", "四", "五", "六"];

      for (let d = 1; d <= totalDays; d++) {
        const dt = new Date(year, month - 1, d);
        const dayOfWeek = dt.getDay();
        days.push({
          day: d,
          weekday: weekdayNames[dayOfWeek],
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6
        });
      }
      return days;
    }

    function initStepper() {
      if (!stepRoleButtons) return;
      stepRoleButtons.querySelectorAll(".btn-step").forEach(btn => {
        btn.addEventListener("click", () => {
          stepRoleButtons.querySelectorAll(".btn-step").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          selectedRoleCategory = btn.getAttribute("data-role");
          renderShiftOptionsForRole();
        });
      });

      renderShiftOptionsForRole();
    }

    function renderShiftOptionsForRole() {
      if (!stepShiftButtons) return;
      stepShiftButtons.innerHTML = "";

      if (selectedRoleCategory === "CLEAR") {
        selectedShiftCode = "CLEAR";
        stepShiftButtons.innerHTML = '<span class="text-muted" style="padding:8px; white-space:nowrap;">❌ 橡皮擦：點選月曆格子清除</span>';
        updateActiveShiftBadge();
        return;
      }

      if (selectedRoleCategory === "休假") {
        const offList = window.OFF_DEFINITIONS || [
          { code: ";H", name: "休息日 (排休)", type: "平日/休息" },
          { code: ";H2", name: "例假日 (例休)", type: "假日/例休" }
        ];
        offList.forEach((off, idx) => {
          const itemBtn = document.createElement("div");
          const isActive = (selectedShiftCode === off.code || (idx === 0 && !selectedShiftCode.startsWith(";H")));
          if (isActive) selectedShiftCode = off.code;

          itemBtn.className = `btn-shift-item ${isActive ? "active" : ""}`;
          itemBtn.innerHTML = `<strong>${off.code}</strong><span class="shift-time">${off.name}</span>`;
          itemBtn.addEventListener("click", () => {
            stepShiftButtons.querySelectorAll(".btn-shift-item").forEach(b => b.classList.remove("active"));
            itemBtn.classList.add("active");
            selectedShiftCode = off.code;
            updateActiveShiftBadge();
          });
          stepShiftButtons.appendChild(itemBtn);
        });
        updateActiveShiftBadge();
        return;
      }

      let shiftsToShow = [];
      if (selectedRoleCategory === "正職") {
        shiftsToShow = customShifts.filter(s => s.role === "正職");
      } else if (selectedRoleCategory === "兼職") {
        shiftsToShow = customShifts.filter(s => s.role === "兼職");
      } else if (selectedRoleCategory === "機動") {
        shiftsToShow = customShifts;
      }

      let isFirst = true;
      shiftsToShow.forEach(sc => {
        const itemBtn = document.createElement("div");
        const isActive = (selectedShiftCode === sc.code || isFirst);
        if (isActive) {
          selectedShiftCode = sc.code;
          isFirst = false;
        }

        itemBtn.className = `btn-shift-item ${isActive ? "active" : ""}`;
        itemBtn.innerHTML = `
          <strong>${sc.code} · ${sc.hours}h</strong>
          <span class="shift-time">${formatTime(sc.start)}~${formatTime(sc.end)}</span>
        `;

        itemBtn.addEventListener("click", () => {
          stepShiftButtons.querySelectorAll(".btn-shift-item").forEach(b => b.classList.remove("active"));
          itemBtn.classList.add("active");
          selectedShiftCode = sc.code;
          updateActiveShiftBadge();
        });

        stepShiftButtons.appendChild(itemBtn);
      });

      updateActiveShiftBadge();
    }

    function updateActiveShiftBadge() {
      if (!badgeActiveShift) return;
      if (selectedShiftCode === "CLEAR") {
        badgeActiveShift.innerHTML = `<span style="color:red; font-weight:700;">❌ 橡皮擦 (點選清除)</span>`;
        return;
      }

      if (selectedShiftCode.startsWith(";H")) {
        const offList = window.OFF_DEFINITIONS || [];
        const offDef = offList.find(o => o.code === selectedShiftCode);
        const name = offDef ? offDef.name : "休假";
        badgeActiveShift.innerHTML = `<span style="color:#475569; font-weight:700;">🏖️ ${selectedShiftCode} (${name})</span>`;
        return;
      }

      const shiftDef = customShifts.find(s => s.code === selectedShiftCode);
      if (shiftDef) {
        badgeActiveShift.innerHTML = `
          <span style="color:#1d4ed8; font-weight:700;">${shiftDef.code} | ${formatTime(shiftDef.start)}~${formatTime(shiftDef.end)} (${shiftDef.hours}h)</span>
        `;
      }
    }

    // 渲染排班月曆表格
    function renderScheduleTable() {
      if (!scheduleTable) return;
      const storeNames = {
        DP: "DREAM PLAZA (DP)",
        TAINAN: "台南三越",
        DREAM: "夢時代",
        SKM: "SKM PARK"
      };
      if (currentStoreTitle) {
        currentStoreTitle.textContent = `${storeNames[currentStore] || currentStore} - ${currentYearMonth} 排班表`;
      }

      const days = getDaysInMonth(currentYearMonth);
      const roleFilter = filterRole ? filterRole.value : "ALL";
      const storeEmployees = employees.filter(e => {
        if (e.store !== currentStore) return false;
        if (roleFilter === "ALL") return true;
        if (roleFilter === "機動") return e.role.includes("機動");
        return e.role === roleFilter;
      });

      let totalMonthHours = 0;
      let conflictCount = 0;

      let theadHtml = `
        <thead>
          <tr>
            <th class="emp-col">姓名/職位</th>
      `;
      days.forEach(d => {
        const weekendCls = d.isWeekend ? "weekend-header" : "";
        theadHtml += `<th class="${weekendCls}">${d.day}<br><small>${d.weekday}</small></th>`;
      });
      theadHtml += `
            <th class="total-col">工時</th>
            <th class="total-col">休假</th>
          </tr>
        </thead>
      `;

      let tbodyHtml = "<tbody>";
      if (storeEmployees.length === 0) {
        tbodyHtml += `<tr><td colspan="${days.length + 3}" style="padding: 24px; color: #64748b;">該門市目前尚無人員資料，請點擊上方「👥 人員管理」新增！</td></tr>`;
      } else {
        storeEmployees.forEach(emp => {
          let empActualHours = 0;
          let empOffDays = 0;
          let consecutiveWorkDays = 0;

          let rowHtml = `<tr><td class="emp-col"><strong>${emp.name}</strong><br><small class="text-muted">${emp.role}</small></td>`;

          days.forEach(d => {
            const key = `${currentStore}_${emp.code}_${d.day}`;
            const record = scheduleData[key];
            const shiftCode = record ? (typeof record === 'string' ? record : record.code) : "";
            const weekendCls = d.isWeekend ? "weekend-cell" : "";

            let cellClass = "shift-cell";
            let displayCode = shiftCode;
            let hoursSubText = "";
            let leaveTag = "";
            let otTag = "";

            if (shiftCode === ";H" || shiftCode === ";H2" || shiftCode === ";H3" || shiftCode === ";H4") {
              cellClass += " cell-off";
              if (shiftCode === ";H2") displayCode = "例休";
              else if (shiftCode === ";H4") displayCode = "國休";
              else if (shiftCode === ";H") displayCode = "休";
              else displayCode = shiftCode;
              empOffDays++;
              consecutiveWorkDays = 0;
            } else if (shiftCode) {
              const shiftDef = customShifts.find(s => s.code === shiftCode);
              const stdH = shiftDef ? shiftDef.hours : 0;
              let actH = stdH;
              
              if (record && typeof record === 'object' && record.actualHours !== undefined) {
                actH = Number(record.actualHours);
                if (record.overtimeHours && Number(record.overtimeHours) > 0) {
                  otTag = `<span class="cell-ot-tag">+${record.overtimeHours}h</span>`;
                }
                if (record.leaveHours && Number(record.leaveHours) > 0) {
                  leaveTag = `<span class="cell-leave-tag">-${record.leaveHours}h</span>`;
                }
              }

              empActualHours += actH;
              hoursSubText = `${actH}h`;

              if (shiftDef) {
                if (shiftDef.group === "morning") cellClass += " cell-morning";
                else if (shiftDef.group === "night") cellClass += " cell-night";
                else if (shiftDef.group === "all") cellClass += " cell-all";
              }
            }

            const cellInner = displayCode ? `
              <div class="cell-content-box">
                <span class="cell-code">${displayCode}</span>
                ${hoursSubText ? `<span class="cell-hours">${hoursSubText}</span>` : ''}
                ${otTag}
                ${leaveTag}
              </div>
            ` : '';

            rowHtml += `<td class="${cellClass} ${weekendCls}" data-emp="${emp.code}" data-name="${emp.name}" data-day="${d.day}" data-weekday="${d.weekday}">${cellInner}</td>`;
          });

          totalMonthHours += empActualHours;
          tbodyHtml += rowHtml + `
            <td class="total-col">${empActualHours.toFixed(1)}h</td>
            <td class="total-col">${empOffDays}天</td>
          </tr>`;
        });
      }

      tbodyHtml += "</tbody>";
      scheduleTable.innerHTML = theadHtml + tbodyHtml;

      if (statEmpCount) statEmpCount.textContent = storeEmployees.length;
      if (statTotalHours) statTotalHours.textContent = totalMonthHours.toFixed(1);

      bindCellEvents();
    }

    function bindCellEvents() {
      document.querySelectorAll(".shift-cell").forEach(cell => {
        const empCode = cell.getAttribute("data-emp");
        const empName = cell.getAttribute("data-name");
        const day = Number(cell.getAttribute("data-day"));
        const weekday = cell.getAttribute("data-weekday");
        const key = `${currentStore}_${empCode}_${day}`;

        let longPressTriggered = false;
        let pressTimer = null;

        // 點擊執行 (清除 或 塗刷班別)
        const handleCellAction = () => {
          if (selectedShiftCode === "CLEAR") {
            delete scheduleData[key];
          } else {
            const shiftDef = customShifts.find(s => s.code === selectedShiftCode);
            const stdH = shiftDef ? shiftDef.hours : 0;
            scheduleData[key] = {
              code: selectedShiftCode,
              actualHours: stdH,
              leaveHours: 0,
              note: ""
            };
          }
          syncScheduleToCloud();
          renderScheduleTable();
        };

        cell.onclick = (e) => {
          if (longPressTriggered) {
            longPressTriggered = false;
            return;
          }
          handleCellAction();
        };

        // 右鍵跳出工時微調
        cell.oncontextmenu = (e) => {
          e.preventDefault();
          openLeaveModal(empCode, empName, day, weekday);
        };

        // 觸控長按支援
        cell.addEventListener("touchstart", (e) => {
          longPressTriggered = false;
          pressTimer = setTimeout(() => {
            longPressTriggered = true;
            openLeaveModal(empCode, empName, day, weekday);
          }, 600);
        }, { passive: true });

        const clearTouchTimer = () => {
          if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
          }
        };

        cell.addEventListener("touchend", clearTouchTimer);
        cell.addEventListener("touchmove", clearTouchTimer);
        cell.addEventListener("touchcancel", clearTouchTimer);
      });
    }

    function openLeaveModal(empCode, empName, day, weekday) {
      if (!leaveModalOverlay) return;
      currentModalTarget = { store: currentStore, empCode, empName, day, weekday };
      const key = `${currentStore}_${empCode}_${day}`;
      const record = scheduleData[key];
      const currentCode = record ? (typeof record === 'string' ? record : record.code) : selectedShiftCode;
      const overtimeHours = (record && typeof record === 'object') ? (record.overtimeHours || 0) : 0;
      const leaveHours = (record && typeof record === 'object') ? (record.leaveHours || 0) : 0;
      const note = (record && typeof record === 'object') ? (record.note || '') : '';

      if (leaveModalTitle) leaveModalTitle.textContent = `出勤工時微調 - ${empName}`;
      if (leaveModalSubtitle) leaveModalSubtitle.textContent = `${currentYearMonth}-${String(day).padStart(2, '0')} (${weekday})`;

      if (leaveModalCurrentCode) leaveModalCurrentCode.textContent = currentCode || "(未排班)";
      const shiftDef = customShifts.find(s => s.code === currentCode);
      if (shiftDef) {
        if (leaveModalCurrentName) leaveModalCurrentName.textContent = `(${shiftDef.name} · ${shiftDef.hours}h)`;
        if (leaveModalStdHours) leaveModalStdHours.value = shiftDef.hours;
      } else {
        if (leaveModalCurrentName) leaveModalCurrentName.textContent = currentCode.startsWith(";H") ? "(休假/例休)" : "";
        if (leaveModalStdHours) leaveModalStdHours.value = 0;
      }

      if (leaveModalOvertimeHours) leaveModalOvertimeHours.value = overtimeHours > 0 ? overtimeHours : 0;
      if (leaveModalDeductHours) leaveModalDeductHours.value = leaveHours > 0 ? leaveHours : 0;
      if (leaveModalNote) leaveModalNote.value = note || "";
      if (leaveModalChangeShift) leaveModalChangeShift.value = "";

      updateLeaveModalActual();
      leaveModalOverlay.style.display = "flex";
    }

    function updateLeaveModalActual() {
      if (!leaveModalStdHours || !leaveModalActualHours) return;
      const std = Number(leaveModalStdHours.value) || 0;
      const ot = Number(leaveModalOvertimeHours ? leaveModalOvertimeHours.value : 0) || 0;
      const deduct = Number(leaveModalDeductHours ? leaveModalDeductHours.value : 0) || 0;
      const actual = Math.max(0, std + ot - deduct);
      leaveModalActualHours.value = actual.toFixed(1);
    }

    if (leaveModalOvertimeHours) leaveModalOvertimeHours.addEventListener("input", updateLeaveModalActual);
    if (leaveModalDeductHours) leaveModalDeductHours.addEventListener("input", updateLeaveModalActual);

    // 加班快捷按鈕
    document.querySelectorAll(".btn-quick-overtime").forEach(btn => {
      btn.addEventListener("click", () => {
        const ot = Number(btn.getAttribute("data-ot"));
        if (leaveModalOvertimeHours) leaveModalOvertimeHours.value = ot;
        if (leaveModalNote && ot > 0 && !leaveModalNote.value) {
          leaveModalNote.value = `加班${ot}小時`;
        }
        updateLeaveModalActual();
      });
    });

    // 請假快捷按鈕
    document.querySelectorAll(".btn-quick-leave").forEach(btn => {
      btn.addEventListener("click", () => {
        const deduct = Number(btn.getAttribute("data-deduct"));
        if (leaveModalDeductHours) leaveModalDeductHours.value = deduct;
        if (leaveModalNote) {
          if (deduct === 0.5 && !leaveModalNote.value) leaveModalNote.value = "請假30分鐘";
          else if (deduct === 1.0 && !leaveModalNote.value) leaveModalNote.value = "請假1小時";
          else if (deduct === 0 && leaveModalNote.value.includes("請假")) leaveModalNote.value = "";
        }
        updateLeaveModalActual();
      });
    });

    if (leaveModalChangeShift) {
      leaveModalChangeShift.addEventListener("change", (e) => {
        const newCode = e.target.value;
        if (newCode) {
          const def = customShifts.find(s => s.code === newCode);
          if (def) {
            if (leaveModalCurrentCode) leaveModalCurrentCode.textContent = def.code;
            if (leaveModalCurrentName) leaveModalCurrentName.textContent = `(${def.name} · ${def.hours}h)`;
            if (leaveModalStdHours) leaveModalStdHours.value = def.hours;
            updateLeaveModalActual();
          }
        }
      });
    }

    function closeLeaveModal() {
      if (leaveModalOverlay) leaveModalOverlay.style.display = "none";
    }
    if (leaveModalCloseBtn) leaveModalCloseBtn.addEventListener("click", closeLeaveModal);
    if (leaveModalCancelBtn) leaveModalCancelBtn.addEventListener("click", closeLeaveModal);
    if (leaveModalOverlay) {
      leaveModalOverlay.addEventListener("click", (e) => {
        if (e.target === leaveModalOverlay) closeLeaveModal();
      });
    }

    if (leaveModalSaveBtn) {
      leaveModalSaveBtn.addEventListener("click", () => {
        const key = `${currentModalTarget.store}_${currentModalTarget.empCode}_${currentModalTarget.day}`;
        let code = (leaveModalChangeShift && leaveModalChangeShift.value) || (leaveModalCurrentCode && leaveModalCurrentCode.textContent.trim());
        if (code === "(未排班)") code = selectedShiftCode;

        const ot = Number(leaveModalOvertimeHours ? leaveModalOvertimeHours.value : 0) || 0;
        const deduct = Number(leaveModalDeductHours ? leaveModalDeductHours.value : 0) || 0;
        const actual = Number(leaveModalActualHours ? leaveModalActualHours.value : 0) || 0;
        const note = leaveModalNote ? leaveModalNote.value.trim() : "";

        scheduleData[key] = {
          code: code,
          actualHours: actual,
          overtimeHours: ot,
          leaveHours: deduct,
          note: note
        };

        syncScheduleToCloud();
        closeLeaveModal();
        renderScheduleTable();
      });
    }

    if (leaveModalClearBtn) {
      leaveModalClearBtn.addEventListener("click", () => {
        const key = `${currentModalTarget.store}_${currentModalTarget.empCode}_${currentModalTarget.day}`;
        delete scheduleData[key];
        syncScheduleToCloud();
        closeLeaveModal();
        renderScheduleTable();
      });
    }

    // 人員管理
    function renderEmployeeManagementTable() {
      if (!empManageTbody) return;
      empManageTbody.innerHTML = "";
      if (totalEmpBadge) totalEmpBadge.textContent = employees.length;
      employees.forEach((emp, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${emp.code}</strong></td>
          <td>${emp.name}</td>
          <td><span class="badge">${emp.role}</span></td>
          <td>${emp.store}</td>
          <td><button class="btn btn-sm btn-danger btn-del-emp" data-idx="${idx}">刪除</button></td>
        `;
        empManageTbody.appendChild(tr);
      });

      document.querySelectorAll(".btn-del-emp").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const idx = Number(e.target.getAttribute("data-idx"));
          if (confirm(`確定要移除員工 ${employees[idx].name} 嗎？`)) {
            employees.splice(idx, 1);
            syncEmployeesToCloud();
            renderEmployeeManagementTable();
            renderScheduleTable();
          }
        });
      });
    }

    if (btnManageEmployees) {
      btnManageEmployees.addEventListener("click", () => {
        renderEmployeeManagementTable();
        if (empModalOverlay) empModalOverlay.style.display = "flex";
      });
    }
    if (empModalCloseBtn) empModalCloseBtn.addEventListener("click", () => empModalOverlay.style.display = "none");
    if (empModalDoneBtn) empModalDoneBtn.addEventListener("click", () => empModalOverlay.style.display = "none");

    if (btnAddNewEmp) {
      btnAddNewEmp.addEventListener("click", () => {
        const code = newEmpCode.value.trim();
        const name = newEmpName.value.trim();
        const role = newEmpRole.value;
        const store = newEmpStore.value;

        if (!code || !name) {
          alert("請輸入工號與姓名！");
          return;
        }

        employees.push({ code, name, role, store });
        syncEmployeesToCloud();
        newEmpCode.value = "";
        newEmpName.value = "";
        renderEmployeeManagementTable();
        renderScheduleTable();
        alert(`成功新增員工：${name} (${code})！`);
      });
    }

    // 班別管理
    function renderShiftManagementTable() {
      if (!shiftManageTbody) return;
      shiftManageTbody.innerHTML = "";
      if (totalShiftBadge) totalShiftBadge.textContent = customShifts.length;
      customShifts.forEach((sc, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong style="color:var(--primary);">${sc.code}</strong></td>
          <td>${sc.name}</td>
          <td>${formatTime(sc.start)}~${formatTime(sc.end)}</td>
          <td>${sc.hours}h</td>
          <td>${sc.type}</td>
          <td>${sc.role}</td>
          <td><button class="btn btn-sm btn-danger btn-del-shift" data-idx="${idx}">刪除</button></td>
        `;
        shiftManageTbody.appendChild(tr);
      });

      document.querySelectorAll(".btn-del-shift").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const idx = Number(e.target.getAttribute("data-idx"));
          if (confirm(`確定要刪除班別 ${customShifts[idx].code} 嗎？`)) {
            customShifts.splice(idx, 1);
            syncShiftsToCloud();
            renderShiftManagementTable();
            renderCodeReference();
            renderShiftOptionsForRole();
            renderScheduleTable();
          }
        });
      });
    }

    if (btnManageShifts) {
      btnManageShifts.addEventListener("click", () => {
        renderShiftManagementTable();
        if (shiftManageModalOverlay) shiftManageModalOverlay.style.display = "flex";
      });
    }
    if (shiftManageModalCloseBtn) shiftManageModalCloseBtn.addEventListener("click", () => shiftManageModalOverlay.style.display = "none");
    if (shiftManageModalDoneBtn) shiftManageModalDoneBtn.addEventListener("click", () => shiftManageModalOverlay.style.display = "none");

    if (btnAddNewShift) {
      btnAddNewShift.addEventListener("click", () => {
        const code = newShiftCode.value.trim().toUpperCase();
        const name = newShiftName.value.trim();
        const start = Number(newShiftStart.value);
        const end = Number(newShiftEnd.value);
        const hours = Number(newShiftHours.value);
        const type = newShiftType.value;
        const role = newShiftRole.value;

        if (!code || !name || !hours) {
          alert("請輸入完整的班別代碼、名稱與工時！");
          return;
        }

        const group = (start <= 1100 && hours >= 9.5) ? "all" : (start >= 1200 ? "night" : "morning");
        customShifts.push({ code, name, start, end, hours, type, role, group });
        syncShiftsToCloud();

        newShiftCode.value = "";
        newShiftName.value = "";
        newShiftStart.value = "";
        newShiftEnd.value = "";
        newShiftHours.value = "";

        renderShiftManagementTable();
        renderCodeReference();
        renderShiftOptionsForRole();
        renderScheduleTable();
        alert(`成功新增班別：${code} (${name})！`);
      });
    }

    // 國定假日資料庫 (包含 2025、2026、2027 年常見國定假日)
    const TAIWAN_NATIONAL_HOLIDAYS = {
      // 2025
      "2025-01-01": "元旦", "2025-01-27": "除夕前", "2025-01-28": "除夕", "2025-01-29": "春節", "2025-01-30": "春節", "2025-01-31": "春節",
      "2025-02-28": "和平紀念日", "2025-04-03": "兒童節補假", "2025-04-04": "清明節", "2025-05-01": "勞動節", "2025-05-31": "端午節",
      "2025-10-06": "中秋節", "2025-10-10": "國慶日",
      // 2026 (115年)
      "2026-01-01": "元旦", "2026-02-15": "除夕前", "2026-02-16": "除夕", "2026-02-17": "春節", "2026-02-18": "春節", "2026-02-19": "春節",
      "2026-02-28": "和平紀念日", "2026-04-04": "兒童節/清明節", "2026-04-05": "清明節補假", "2026-05-01": "勞動節", "2026-06-19": "端午節",
      "2026-09-25": "中秋節", "2026-10-10": "國慶日",
      // 2027
      "2027-01-01": "元旦", "2027-02-05": "除夕前", "2027-02-06": "除夕", "2027-02-07": "春節", "2027-02-08": "春節", "2027-02-09": "春節",
      "2027-02-28": "和平紀念日", "2027-04-04": "兒童節", "2027-04-05": "清明節", "2027-05-01": "勞動節", "2027-06-09": "端午節",
      "2027-09-15": "中秋節", "2027-10-10": "國慶日"
    };

    // 🤖 AI 一鍵智慧排班演算法
    // 規則：
    // 1. 遇國定假日：若當天是國定假日，自動給職員 ;H4 (國定假日)；若同仁已填 ;H 亦自動轉換為 ;H4
    // 2. 7天內至少給1個 ;H (休息日)
    // 3. ;H2 (例假日) 由 AI 自動排上 (主要分派在週末或每週例休)
    // 4. 同仁自填休假不足時，AI 自動補足排班，並維持每日精準 2 人上班 (正兼搭或雙兼)，早晚班重疊交接
    // 5. 機動同仁全部留空待命
    function runAiAutoSchedule() {
      const days = getDaysInMonth(currentYearMonth);
      const storeEmployees = employees.filter(e => e.store === currentStore);
      if (storeEmployees.length === 0) {
        alert("此門市尚無設定員工名單！");
        return;
      }

      // 僅篩選純『正職』與純『兼職』進行例行排班，所有機動人員（正職機動、兼職機動）保持留空
      const fulltimers = storeEmployees.filter(e => (e.role === "正職" || e.role === "主管") && !e.role.includes("機動"));
      const parttimers = storeEmployees.filter(e => e.role === "兼職" && !e.role.includes("機動"));

      // 步驟 1: 預先檢查國定假日並將所有職員 (或已填 ;H 者) 轉換為 ;H4
      days.forEach(d => {
        const dateStr = `${currentYearMonth}-${String(d.day).padStart(2, '0')}`;
        const isNationalHoliday = !!TAIWAN_NATIONAL_HOLIDAYS[dateStr];

        storeEmployees.forEach(emp => {
          if (emp.role.includes("機動")) return; // 所有機動人員不自動預排
          const key = `${currentStore}_${emp.code}_${d.day}`;
          const currentRecord = scheduleData[key];
          const currentCode = currentRecord ? (typeof currentRecord === 'string' ? currentRecord : currentRecord.code) : "";

          // 若當天為國定假日，或同仁已填 ;H 且當天為國定假日，自動設定/轉換為 ;H4
          if (isNationalHoliday) {
            if (!currentCode || currentCode === ";H" || currentCode === ";H2" || currentCode === ";H3") {
              scheduleData[key] = {
                code: ";H4",
                actualHours: 0,
                overtimeHours: 0,
                leaveHours: 0,
                note: TAIWAN_NATIONAL_HOLIDAYS[dateStr] || "國定假日"
              };
            }
          }
        });
      });

      // 追蹤每位同仁自上次休假以來的連續工作天數與月工時
      const daysSinceLastOff = {};
      const monthlyHours = {};
      storeEmployees.forEach(e => {
        daysSinceLastOff[e.code] = 0;
        monthlyHours[e.code] = 0;
      });

      // 步驟 2: 逐日執行智慧排班
      days.forEach(d => {
        const isWeekend = d.isWeekend;
        const targetStaffCount = 2; // 每日精準 2 人上班
        const dateStr = `${currentYearMonth}-${String(d.day).padStart(2, '0')}`;
        const isNationalHoliday = !!TAIWAN_NATIONAL_HOLIDAYS[dateStr];

        let alreadyWorking = [];
        let notAvailable = new Set(); // 當天排休假、國假、請假或強制七休一的人員不可選為上班

        storeEmployees.forEach(emp => {
          if (emp.role.includes("機動")) return;
          const key = `${currentStore}_${emp.code}_${d.day}`;
          const currentRecord = scheduleData[key];
          const currentCode = currentRecord ? (typeof currentRecord === 'string' ? currentRecord : currentRecord.code) : "";

          if (currentCode) {
            if (currentCode.startsWith(";H") || (currentRecord && currentRecord.leaveHours > 0 && currentRecord.actualHours === 0)) {
              notAvailable.add(emp.code); // 已排休假/國假
              daysSinceLastOff[emp.code] = 0; // 重置連續工作計數
            } else {
              alreadyWorking.push(emp.code); // 已手動排上班
              notAvailable.add(emp.code);
              daysSinceLastOff[emp.code]++;
            }
          } else {
            // 七天內需要給一個 H：若已連上 6 天，第 7 天必須強迫排休 (;H)
            if (daysSinceLastOff[emp.code] >= 6) {
              notAvailable.add(emp.code);
            }
          }
        });

        // 挑選今日上班人員 (目標補足至 2 人)
        let assignedToday = [];

        // (A) 優先選 1 位正職 (早班)
        const availableFt = fulltimers.filter(ft => !notAvailable.has(ft.code));
        availableFt.sort((a, b) => (monthlyHours[a.code] - monthlyHours[b.code]));

        if (alreadyWorking.length === 0 && availableFt.length > 0) {
          const chosenFt = availableFt[0];
          // 正職：平日 C07 (10:30-19:30 8h) 或 假日 C32 (10:00-19:00 8h)
          const ftShift = isWeekend ? "C32" : "C07";
          assignedToday.push({ emp: chosenFt, code: ftShift, hours: 8.0, isMorning: true });
          notAvailable.add(chosenFt.code);
        }

        // (B) 挑選兼職補足至 2 人 (晚班收尾，15:30~19:30 重疊交接)
        const availablePt = parttimers.filter(pt => !notAvailable.has(pt.code));
        availablePt.sort((a, b) => (monthlyHours[a.code] - monthlyHours[b.code]));

        const neededCount = targetStaffCount - (alreadyWorking.length + assignedToday.length);
        for (let i = 0; i < neededCount && i < availablePt.length; i++) {
          const chosenPt = availablePt[i];
          let ptShift = "";
          let ptH = 0;

          if (assignedToday.length === 0 && alreadyWorking.length === 0) {
            // 沒有正職上班時，第 1 位兼職負責早班 (10:30-16:30 5.5h)
            ptShift = isWeekend ? "C18" : "C13";
            ptH = 5.5;
            assignedToday.push({ emp: chosenPt, code: ptShift, hours: ptH, isMorning: true });
          } else {
            // 搭配晚班，與早班在 15:30~19:30 重疊交接換班，並涵蓋到 22:00 打烊 (15:30-22:00 6.0h)
            ptShift = isWeekend ? "C50" : "C12";
            ptH = 6.0;
            assignedToday.push({ emp: chosenPt, code: ptShift, hours: ptH, isMorning: false });
          }
          notAvailable.add(chosenPt.code);
        }

        // (C) 寫入排班與自動指派 H / H2 休假
        storeEmployees.forEach(emp => {
          if (emp.role.includes("機動")) return; // 所有機動同仁完全留空

          const key = `${currentStore}_${emp.code}_${d.day}`;
          const currentRecord = scheduleData[key];
          const currentCode = currentRecord ? (typeof currentRecord === 'string' ? currentRecord : currentRecord.code) : "";

          // 若已經有班表 (包含國假 ;H4、自填休假等)，予以保留
          if (currentCode) return;

          const assigned = assignedToday.find(a => a.emp.code === emp.code);
          if (assigned) {
            scheduleData[key] = {
              code: assigned.code,
              actualHours: assigned.hours,
              overtimeHours: 0,
              leaveHours: 0,
              note: ""
            };
            monthlyHours[emp.code] += assigned.hours;
            daysSinceLastOff[emp.code]++;
          } else {
            // 今日未排到上班 ➔ AI 自動排休 (週末排 ;H2 例休，平日排 ;H 休息日)
            const offCode = isWeekend ? ";H2" : ";H";
            scheduleData[key] = {
              code: offCode,
              actualHours: 0,
              overtimeHours: 0,
              leaveHours: 0,
              note: ""
            };
            daysSinceLastOff[emp.code] = 0;
          }
        });
      });

      syncScheduleToCloud();
      renderScheduleTable();
      alert("✨ AI 智慧排班完成！\n• 遇國定假日自動指派 / 轉換為【;H4 國定假日】\n• 7天內必定保證安排【;H 休息日】\n• 週末由 AI 自動分派【;H2 例假日】\n• 同仁休假不足時由 AI 自動補足排班\n• 每日精準 2 人上班 (正兼搭/雙兼)，15:30~19:30 重疊交接\n• 機動人員保持全部留空待命！");
    }

    // 匯出考勤表
    function exportHrImportExcel() {
      const days = getDaysInMonth(currentYearMonth);
      const [year, month] = currentYearMonth.split("-");

      const header1 = ["請輸入排班年月ê", "月份", ...days.map(() => Number(month))];
      const header2 = [Number(year), "日期", ...days.map(d => d.day)];
      const header3 = [Number(month), "星期", ...days.map(d => d.weekday)];
      const header4 = ["排班人員", "人員姓名", ...days.map(() => "班別代碼")];

      const rows = [header1, header2, header3, header4];

      employees.forEach(emp => {
        const empRow = [emp.code, `${emp.name}(直營通路部)`];
        days.forEach(d => {
          const key = `${emp.store}_${emp.code}_${d.day}`;
          const record = scheduleData[key];
          const code = record ? (typeof record === 'string' ? record : record.code) : "";
          empRow.push(code);
        });
        rows.push(empRow);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "人員排班表(匯入用）");

      XLSX.writeFile(wb, `${year}年${month}月_AI自動生成_人員排班匯入表.xlsx`);
    }

    // 匯出門市時數統計
    function exportStoreReportExcel() {
      const days = getDaysInMonth(currentYearMonth);
      const [year, month] = currentYearMonth.split("-");
      const storeEmployees = employees.filter(e => e.store === currentStore);

      const rows = [
        [`${currentStore}人力`, "日期", ...days.map(d => `${year}-${month.padStart(2, '0')}-${String(d.day).padStart(2, '0')} 00:00:00`), "總計"],
        ["平日/假日班別定義", "星期", ...days.map(d => `星期${d.weekday}`), ""]
      ];

      storeEmployees.forEach(emp => {
        const shiftRow = [emp.name, "班表"];
        const hourRow = [emp.name, "時數"];
        let totalH = 0;

        days.forEach(d => {
          const key = `${currentStore}_${emp.code}_${d.day}`;
          const record = scheduleData[key];
          const code = record ? (typeof record === 'string' ? record : record.code) : "";
          
          let actH = 0;
          if (record && typeof record === 'object' && record.actualHours !== undefined) {
            actH = Number(record.actualHours);
          } else if (code) {
            const def = customShifts.find(s => s.code === code);
            actH = def ? def.hours : 0;
          }

          let shiftDisplay = code;
          let notesArr = [];
          if (record && record.overtimeHours > 0) notesArr.push(`加${record.overtimeHours}h`);
          if (record && record.leaveHours > 0) notesArr.push(`請${record.leaveHours}h`);
          if (notesArr.length > 0) shiftDisplay += `(${notesArr.join('/')})`;

          shiftRow.push(shiftDisplay);
          hourRow.push(actH > 0 ? actH : "");
          totalH += actH;
        });

        shiftRow.push("");
        hourRow.push(totalH);
        rows.push(shiftRow, hourRow);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `${year}年${month}月時數統計表`);
      XLSX.writeFile(wb, `${currentStore}_${year}年${month}月_上下班時數統計表.xlsx`);
    }

    // 事件監聽
    if (storeSelect) {
      storeSelect.addEventListener("change", (e) => {
        currentStore = e.target.value;
        renderScheduleTable();
      });
    }

    if (yearMonthSelect) {
      yearMonthSelect.addEventListener("change", (e) => {
        currentYearMonth = e.target.value;
        setupCloudListeners();
        renderScheduleTable();
      });
    }

    if (filterRole) {
      filterRole.addEventListener("change", () => {
        renderScheduleTable();
      });
    }

    const btnClearStoreSchedule = document.getElementById("btnClearStoreSchedule");
    if (btnClearStoreSchedule) {
      btnClearStoreSchedule.addEventListener("click", () => {
        const storeNames = {
          DP: "DREAM PLAZA (DP)",
          TAINAN: "台南三越",
          DREAM: "夢時代",
          SKM: "SKM PARK"
        };
        const storeLabel = storeNames[currentStore] || currentStore;
        if (confirm(`確定要清空【${storeLabel}】在 ${currentYearMonth} 的所有排班紀錄嗎？\n（此動作將清空該門市所有人員的本月班表並同步雲端）`)) {
          const storeEmployees = employees.filter(e => e.store === currentStore);
          const days = getDaysInMonth(currentYearMonth);
          
          storeEmployees.forEach(emp => {
            days.forEach(d => {
              const key = `${currentStore}_${emp.code}_${d.day}`;
              delete scheduleData[key];
            });
          });

          syncScheduleToCloud();
          renderScheduleTable();
          alert(`已成功清空【${storeLabel}】${currentYearMonth} 的所有班表！`);
        }
      });
    }

    if (btnAiAutoSchedule) btnAiAutoSchedule.addEventListener("click", runAiAutoSchedule);
    if (btnExportHr) btnExportHr.addEventListener("click", exportHrImportExcel);
    if (btnExportStore) btnExportStore.addEventListener("click", exportStoreReportExcel);

    if (toggleCodeRef && codeRefContent) {
      toggleCodeRef.addEventListener("click", () => {
        const isHidden = codeRefContent.style.display === "none";
        codeRefContent.style.display = isHidden ? "block" : "none";
        toggleCodeRef.querySelector(".toggle-icon").textContent = isHidden ? "▼" : "▲";
      });
    }

    if (btnResetData) {
      btnResetData.addEventListener("click", () => {
        if (confirm("確定要重設名單並同步到雲端嗎？")) {
          employees = [...defaultEmployees];
          customShifts = [...defaultShifts];
          syncEmployeesToCloud();
          syncShiftsToCloud();
          renderCodeReference();
          initStepper();
          renderScheduleTable();
          alert("已成功重設名單並同步到雲端！");
        }
      });
    }

    // 立即啟動各模組渲染
    updateAuthUI();
    renderCodeReference();
    initStepper();
    renderScheduleTable();
    setupCloudListeners();
    console.log("Department Store Schedule App v3.0 Ready!");
  }

  // 雙重保險啟動
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
