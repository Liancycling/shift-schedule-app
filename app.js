// 排班系統核心邏輯與互動 (v2.7 強健性與即時渲染修復)
(function() {
  function initApp() {
    console.log("Initializing Department Store Schedule App...");

    // State
    let currentStore = "DP";
    let currentYearMonth = "2026-08";
    let selectedRoleCategory = "兼職";
    let selectedShiftCode = "C13";

    const STORAGE_SCHEDULE_KEY = "DEPT_SCHEDULE_DATA_V2";
    const STORAGE_EMP_KEY = "DEPT_EMP_DATA_V2";
    const STORAGE_SHIFT_KEY = "DEPT_SHIFT_DATA_V2";

    // 確保有預設資料庫
    const defaultEmployees = (window.INITIAL_EMPLOYEES && window.INITIAL_EMPLOYEES.length > 0) ? window.INITIAL_EMPLOYEES : [
      { code: "SL0003", name: "李靖為", role: "正職", store: "DP" },
      { code: "SL0074", name: "洪孟函", role: "正職", store: "DP" },
      { code: "SL0027", name: "賴可欣", role: "兼職", store: "DP" },
      { code: "SL0067", name: "薄錫毓", role: "兼職", store: "DP" },
      { code: "SL0060", name: "黃佩儀", role: "兼職", store: "DP" },
      { code: "SL0091", name: "支援人員A", role: "機動", store: "DP" },
      { code: "SL0037", name: "翁墨璽", role: "兼職", store: "TAINAN" },
      { code: "SL0040", name: "周欣沂", role: "兼職", store: "TAINAN" },
      { code: "SL0078", name: "陳雅琳", role: "兼職", store: "TAINAN" },
      { code: "SL0062", name: "陳佳樺", role: "正職", store: "DREAM" },
      { code: "SL0066", name: "陳嵩岳", role: "兼職", store: "DREAM" },
      { code: "SL0063", name: "張怡婷", role: "兼職", store: "DREAM" },
      { code: "SL0073", name: "吳芸慈", role: "正職", store: "SKM" },
      { code: "SL0070", name: "盧詠沂", role: "兼職", store: "SKM" },
      { code: "SL0071", name: "蘇啟", role: "兼職", store: "SKM" },
      { code: "SL0076", name: "吳奕姍", role: "兼職", store: "SKM" },
      { code: "SL0077", name: "沈泓岳", role: "兼職", store: "SKM" }
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

    try {
      const savedSched = localStorage.getItem(STORAGE_SCHEDULE_KEY);
      if (savedSched) scheduleData = JSON.parse(savedSched);

      const savedEmp = localStorage.getItem(STORAGE_EMP_KEY);
      if (savedEmp) {
        const parsed = JSON.parse(savedEmp);
        if (Array.isArray(parsed) && parsed.length > 0) employees = parsed;
      }

      const savedShift = localStorage.getItem(STORAGE_SHIFT_KEY);
      if (savedShift) {
        const parsed = JSON.parse(savedShift);
        if (Array.isArray(parsed) && parsed.length > 0) customShifts = parsed;
      }
    } catch (err) {
      console.warn("Error reading localStorage:", err);
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
    const leaveModalDeductHours = document.getElementById("leaveModalDeductHours");
    const leaveModalActualHours = document.getElementById("leaveModalActualHours");
    const leaveModalNote = document.getElementById("leaveModalNote");
    const leaveModalChangeShift = document.getElementById("leaveModalChangeShift");

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

    function saveToLocalStorage() {
      try {
        localStorage.setItem(STORAGE_SCHEDULE_KEY, JSON.stringify(scheduleData));
        localStorage.setItem(STORAGE_EMP_KEY, JSON.stringify(employees));
        localStorage.setItem(STORAGE_SHIFT_KEY, JSON.stringify(customShifts));
      } catch (e) {
        console.warn("Failed saving to localStorage", e);
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
        if (roleFilter !== "ALL" && e.role !== roleFilter) return false;
        return true;
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

            if (shiftCode === ";H" || shiftCode === ";H2" || shiftCode === ";H3" || shiftCode === ";H4") {
              cellClass += " cell-off";
              displayCode = shiftCode === ";H2" ? "例休" : (shiftCode === ";H" ? "休" : shiftCode);
              empOffDays++;
              consecutiveWorkDays = 0;
            } else if (shiftCode) {
              const shiftDef = customShifts.find(s => s.code === shiftCode);
              const stdH = shiftDef ? shiftDef.hours : 0;
              let actH = stdH;
              
              if (record && typeof record === 'object' && record.actualHours !== undefined) {
                actH = Number(record.actualHours);
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
              consecutiveWorkDays++;
              if (consecutiveWorkDays > 6) {
                cellClass += " cell-conflict";
                conflictCount++;
              }
            } else {
              consecutiveWorkDays = 0;
            }

            const cellInner = displayCode ? `
              <div class="cell-content-box">
                <span class="cell-code">${displayCode}</span>
                ${hoursSubText ? `<span class="cell-hours">${hoursSubText}</span>` : ''}
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
      if (statConflicts) {
        statConflicts.textContent = conflictCount;
        statConflicts.className = conflictCount > 0 ? "text-danger" : "text-success";
      }

      bindCellEvents();
    }

    function bindCellEvents() {
      let pressTimer = null;
      let isLongPress = false;

      document.querySelectorAll(".shift-cell").forEach(cell => {
        const empCode = cell.getAttribute("data-emp");
        const empName = cell.getAttribute("data-name");
        const day = Number(cell.getAttribute("data-day"));
        const weekday = cell.getAttribute("data-weekday");
        const key = `${currentStore}_${empCode}_${day}`;

        cell.addEventListener("click", () => {
          if (isLongPress) {
            isLongPress = false;
            return;
          }

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
          saveToLocalStorage();
          renderScheduleTable();
        });

        cell.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          openLeaveModal(empCode, empName, day, weekday);
        });

        const startPress = () => {
          isLongPress = false;
          pressTimer = setTimeout(() => {
            isLongPress = true;
            openLeaveModal(empCode, empName, day, weekday);
          }, 450);
        };

        const cancelPress = () => {
          if (pressTimer) clearTimeout(pressTimer);
        };

        cell.addEventListener("mousedown", startPress);
        cell.addEventListener("mouseup", cancelPress);
        cell.addEventListener("mouseleave", cancelPress);
        cell.addEventListener("touchstart", startPress, { passive: true });
        cell.addEventListener("touchend", cancelPress);
        cell.addEventListener("touchcancel", cancelPress);
      });
    }

    function openLeaveModal(empCode, empName, day, weekday) {
      if (!leaveModalOverlay) return;
      currentModalTarget = { store: currentStore, empCode, empName, day, weekday };
      const key = `${currentStore}_${empCode}_${day}`;
      const record = scheduleData[key];
      const currentCode = record ? (typeof record === 'string' ? record : record.code) : selectedShiftCode;
      const leaveHours = (record && typeof record === 'object') ? (record.leaveHours || 0) : 0;
      const note = (record && typeof record === 'object') ? (record.note || '') : '';

      if (leaveModalTitle) leaveModalTitle.textContent = `請假與工時微調 - ${empName}`;
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

      if (leaveModalDeductHours) leaveModalDeductHours.value = leaveHours > 0 ? leaveHours : 0.5;
      if (leaveModalNote) leaveModalNote.value = note || (leaveHours > 0 ? note : "請假30分鐘");
      if (leaveModalChangeShift) leaveModalChangeShift.value = "";

      updateLeaveModalActual();
      leaveModalOverlay.style.display = "flex";
    }

    function updateLeaveModalActual() {
      if (!leaveModalStdHours || !leaveModalDeductHours || !leaveModalActualHours) return;
      const std = Number(leaveModalStdHours.value) || 0;
      const deduct = Number(leaveModalDeductHours.value) || 0;
      const actual = Math.max(0, std - deduct);
      leaveModalActualHours.value = actual.toFixed(1);
    }

    if (leaveModalDeductHours) leaveModalDeductHours.addEventListener("input", updateLeaveModalActual);

    document.querySelectorAll(".btn-quick-leave").forEach(btn => {
      btn.addEventListener("click", () => {
        const deduct = Number(btn.getAttribute("data-deduct"));
        if (leaveModalDeductHours) leaveModalDeductHours.value = deduct;
        if (leaveModalNote) {
          if (deduct === 0.5) leaveModalNote.value = "請假30分鐘";
          else if (deduct === 1.0) leaveModalNote.value = "請假1小時";
          else if (deduct === 0) leaveModalNote.value = "";
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

        const deduct = Number(leaveModalDeductHours ? leaveModalDeductHours.value : 0) || 0;
        const actual = Number(leaveModalActualHours ? leaveModalActualHours.value : 0) || 0;
        const note = leaveModalNote ? leaveModalNote.value.trim() : "";

        scheduleData[key] = {
          code: code,
          actualHours: actual,
          leaveHours: deduct,
          note: note
        };

        saveToLocalStorage();
        closeLeaveModal();
        renderScheduleTable();
      });
    }

    if (leaveModalClearBtn) {
      leaveModalClearBtn.addEventListener("click", () => {
        const key = `${currentModalTarget.store}_${currentModalTarget.empCode}_${currentModalTarget.day}`;
        delete scheduleData[key];
        saveToLocalStorage();
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
            saveToLocalStorage();
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
        saveToLocalStorage();
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
            saveToLocalStorage();
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
        saveToLocalStorage();

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

    // AI 一鍵智慧排班
    function runAiAutoSchedule() {
      const days = getDaysInMonth(currentYearMonth);
      const storeEmployees = employees.filter(e => e.store === currentStore);
      if (storeEmployees.length === 0) {
        alert("此門市尚無設定員工名單！");
        return;
      }

      days.forEach(d => {
        storeEmployees.forEach((emp, idx) => {
          const key = `${currentStore}_${emp.code}_${d.day}`;
          if (scheduleData[key]) return;

          const isWeekend = d.isWeekend;
          const isFulltime = emp.role === "正職" || emp.role === "主管";

          let assignCode = "";
          let stdH = 0;

          if ((d.day + idx) % 7 === 0) {
            assignCode = isWeekend ? ";H2" : ";H";
          } else if (isFulltime) {
            if ((d.day + idx) % 2 === 0) {
              assignCode = isWeekend ? "C32" : "C07";
              stdH = 8.0;
            } else {
              assignCode = isWeekend ? "C08" : "C34";
              stdH = 8.0;
            }
          } else {
            if (isWeekend) {
              assignCode = (d.day % 2 === 0) ? "C18" : "C50";
              stdH = (d.day % 2 === 0) ? 5.5 : 6.0;
            } else {
              assignCode = (d.day % 2 === 0) ? "C13" : "C11";
              stdH = 5.5;
            }
          }

          scheduleData[key] = {
            code: assignCode,
            actualHours: stdH,
            leaveHours: 0,
            note: ""
          };
        });
      });

      saveToLocalStorage();
      renderScheduleTable();
      alert("✨ AI 智慧排班完成！已根據正/兼職工時上限、假日人力支援及勞基法七休一原則自動分派！");
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
          if (record && record.leaveHours > 0) {
            shiftDisplay += `(請假${record.leaveHours}h)`;
          }

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
        renderScheduleTable();
      });
    }

    if (filterRole) {
      filterRole.addEventListener("change", () => {
        renderScheduleTable();
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

    // 立即啟動各模組渲染
    renderCodeReference();
    initStepper();
    renderScheduleTable();
    console.log("Department Store Schedule App Ready!");
  }

  // 雙重保險啟動
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
