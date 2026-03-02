const STORAGE_KEY = "camp-attendance-state-v1";
const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const state = loadState();

const configForm = document.querySelector("#camp-config-form");
const weekCountInput = document.querySelector("#week-count");
const dayCountSelect = document.querySelector("#day-count");
const configNote = document.querySelector("#config-note");

const camperForm = document.querySelector("#camper-form");
const camperNameInput = document.querySelector("#camper-name");
const camperList = document.querySelector("#camper-list");

const weekSelect = document.querySelector("#week-select");
const attendanceWrapper = document.querySelector("#attendance-wrapper");
const summary = document.querySelector("#summary");
const statusTemplate = document.querySelector("#status-template");

configForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.weekCount = Number.parseInt(weekCountInput.value, 10);
  state.dayCount = Number.parseInt(dayCountSelect.value, 10);
  state.activeWeek = Math.min(state.activeWeek, state.weekCount);
  pruneAttendance();
  saveAndRender("Updated camp schedule.");
});

camperForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = camperNameInput.value.trim();
  if (!name) return;
  state.campers.push({ id: crypto.randomUUID(), name });
  camperNameInput.value = "";
  saveAndRender(`Added camper: ${name}`);
});

weekSelect.addEventListener("change", () => {
  state.activeWeek = Number.parseInt(weekSelect.value, 10);
  saveAndRender();
});

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    return JSON.parse(raw);
  }

  return {
    weekCount: 8,
    dayCount: 5,
    activeWeek: 1,
    campers: [],
    attendance: {},
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveAndRender(note) {
  saveState();
  render(note);
}

function pruneAttendance() {
  Object.keys(state.attendance).forEach((camperId) => {
    Object.keys(state.attendance[camperId]).forEach((week) => {
      if (Number(week) > state.weekCount) {
        delete state.attendance[camperId][week];
      }
    });

    Object.keys(state.attendance[camperId]).forEach((week) => {
      const days = state.attendance[camperId][week];
      Object.keys(days).forEach((dayIndex) => {
        if (Number(dayIndex) >= state.dayCount) {
          delete days[dayIndex];
        }
      });
    });
  });
}

function getStatus(camperId, week, dayIndex) {
  return state.attendance?.[camperId]?.[week]?.[dayIndex] || "present";
}

function setStatus(camperId, week, dayIndex, value) {
  state.attendance[camperId] ??= {};
  state.attendance[camperId][week] ??= {};
  state.attendance[camperId][week][dayIndex] = value;
  saveAndRender();
}

function removeCamper(camperId) {
  state.campers = state.campers.filter((camper) => camper.id !== camperId);
  delete state.attendance[camperId];
  saveAndRender("Removed camper.");
}

function render(note = "") {
  weekCountInput.value = state.weekCount;
  dayCountSelect.value = String(state.dayCount);
  configNote.textContent = note;

  weekSelect.innerHTML = "";
  for (let week = 1; week <= state.weekCount; week += 1) {
    const option = document.createElement("option");
    option.value = String(week);
    option.textContent = `Week ${week}`;
    option.selected = week === state.activeWeek;
    weekSelect.append(option);
  }

  camperList.innerHTML = "";
  state.campers.forEach((camper) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${camper.name}</span>`;
    const button = document.createElement("button");
    button.textContent = "Remove";
    button.type = "button";
    button.addEventListener("click", () => removeCamper(camper.id));
    li.append(button);
    camperList.append(li);
  });

  renderAttendanceTable();
  renderSummary();
}

function renderAttendanceTable() {
  if (!state.campers.length) {
    attendanceWrapper.innerHTML = '<p class="empty">Add campers to begin recording attendance.</p>';
    return;
  }

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.innerHTML = `<th>Camper</th>${DAY_LABELS.slice(0, state.dayCount)
    .map((day) => `<th>${day}</th>`)
    .join("")}`;
  thead.append(headRow);
  table.append(thead);

  const tbody = document.createElement("tbody");
  state.campers.forEach((camper) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = camper.name;
    row.append(nameCell);

    for (let dayIndex = 0; dayIndex < state.dayCount; dayIndex += 1) {
      const cell = document.createElement("td");
      const select = statusTemplate.content.firstElementChild.cloneNode(true);
      select.value = getStatus(camper.id, state.activeWeek, dayIndex);
      select.addEventListener("change", (event) => {
        setStatus(camper.id, state.activeWeek, dayIndex, event.target.value);
      });
      cell.append(select);
      row.append(cell);
    }

    tbody.append(row);
  });

  table.append(tbody);
  attendanceWrapper.innerHTML = "";
  attendanceWrapper.append(table);
}

function renderSummary() {
  if (!state.campers.length) {
    summary.innerHTML = '<p class="empty">No summary yet.</p>';
    return;
  }

  const totals = state.campers
    .map((camper) => {
      const counts = { present: 0, absent: 0, late: 0, excused: 0 };
      for (let week = 1; week <= state.weekCount; week += 1) {
        for (let dayIndex = 0; dayIndex < state.dayCount; dayIndex += 1) {
          const status = getStatus(camper.id, week, dayIndex);
          counts[status] += 1;
        }
      }
      return { name: camper.name, counts };
    })
    .map(
      ({ name, counts }) => `
        <div class="legend">
          <strong>${name}</strong>
          <span><span class="pill present">Present</span> ${counts.present}</span>
          <span><span class="pill absent">Absent</span> ${counts.absent}</span>
          <span><span class="pill late">Late</span> ${counts.late}</span>
          <span><span class="pill excused">Excused</span> ${counts.excused}</span>
        </div>
      `,
    )
    .join("");

  summary.innerHTML = totals;
}

render();
