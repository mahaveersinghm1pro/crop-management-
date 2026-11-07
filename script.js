const storageKey = "crop_log_entries";
let recordsList = JSON.parse(localStorage.getItem(storageKey)) || [];

const cropForm = document.getElementById("crop-entry-form");
const tableRows = document.getElementById("table-rows");
const fieldCountEl = document.getElementById("field-count");
const harvestCountEl = document.getElementById("harvest-count");
const pestCountEl = document.getElementById("pest-count");
const wipeBtn = document.getElementById("wipe-btn");
const locateBtn = document.getElementById("locate-btn");
const geoInfo = document.getElementById("geo-info");

document.addEventListener("DOMContentLoaded", () => {
  displayTable();
  refreshTotals();
});

cropForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const plotNameInput = document.getElementById("plot-name");
  const cropTypeInput = document.getElementById("crop-type");
  const cropStageInput = document.getElementById("crop-stage");
  const logDateInput = document.getElementById("log-date");
  const irrigationInput = document.getElementById("irrigation-notes");
  const fertilizerInput = document.getElementById("fertilizer-used");
  const pestInput = document.getElementById("pest-status");
  const harvestStateInput = document.getElementById("harvest-state");

  const nameError = document.getElementById("plot-name-msg");
  const cropError = document.getElementById("crop-type-msg");
  const stageError = document.getElementById("crop-stage-msg");
  const dateError = document.getElementById("log-date-msg");

  nameError.textContent = "";
  cropError.textContent = "";
  stageError.textContent = "";
  dateError.textContent = "";

  const nameRegex = /^[a-zA-Z0-9\s]{3,20}$/;
  let hasError = false;

  if (!nameRegex.test(plotNameInput.value.trim())) {
    nameError.textContent = "Please enter 3-20 letters or numbers.";
    hasError = true;
  }

  if (cropTypeInput.value.trim() === "") {
    cropError.textContent = "Crop name is required.";
    hasError = true;
  }

  if (cropStageInput.value === "") {
    stageError.textContent = "Select a stage.";
    hasError = true;
  }

  if (logDateInput.value === "") {
    dateError.textContent = "Select a date.";
    hasError = true;
  }

  if (hasError) {
    return;
  }

  const recordItem = {
    id: Date.now().toString(),
    plotName: plotNameInput.value.trim(),
    cropType: cropTypeInput.value.trim(),
    cropStage: cropStageInput.value,
    logDate: logDateInput.value,
    irrigationNotes: irrigationInput.value.trim() || "-",
    fertilizerUsed: fertilizerInput.value.trim() || "-",
    pestStatus: pestInput.value.trim() || "None",
    harvestState: harvestStateInput.value
  };

  recordsList.push(recordItem);
  saveData();
  displayTable();
  refreshTotals();
  cropForm.reset();
});

function displayTable() {
  tableRows.innerHTML = "";

  if (recordsList.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = '<td colspan="9" style="text-align:center; color:#5c677d;">No field records added yet.</td>';
    tableRows.appendChild(emptyRow);
    return;
  }

  recordsList.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${cleanText(entry.plotName)}</td>
      <td>${cleanText(entry.cropType)}</td>
      <td>${cleanText(entry.cropStage)}</td>
      <td>${cleanText(entry.logDate)}</td>
      <td>${cleanText(entry.irrigationNotes)}</td>
      <td>${cleanText(entry.fertilizerUsed)}</td>
      <td>${cleanText(entry.pestStatus)}</td>
      <td>${cleanText(entry.harvestState)}</td>
      <td>
        <button class="btn btn-delete" onclick="removeEntry('${entry.id}')">Delete</button>
      </td>
    `;
    tableRows.appendChild(row);
  });
}

window.removeEntry = function(id) {
  recordsList = recordsList.filter((item) => item.id !== id);
  saveData();
  displayTable();
  refreshTotals();
};

wipeBtn.addEventListener("click", () => {
  if (confirm("Delete all logged field entries?")) {
    recordsList = [];
    saveData();
    displayTable();
    refreshTotals();
  }
});

function refreshTotals() {
  fieldCountEl.textContent = recordsList.length;

  const harvestCount = recordsList.filter(
    (item) => item.cropStage === "Harvesting" || item.harvestState === "Scheduled"
  ).length;
  harvestCountEl.textContent = harvestCount;

  const pestCount = recordsList.filter(
    (item) => item.pestStatus.toLowerCase() !== "none" && item.pestStatus !== "-"
  ).length;
  pestCountEl.textContent = pestCount;
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(recordsList));
}

function cleanText(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    geoInfo.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  geoInfo.textContent = "Fetching coordinates...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude.toFixed(4);
      const lon = pos.coords.longitude.toFixed(4);
      geoInfo.textContent = `Coordinates: Latitude ${lat}, Longitude ${lon}`;
    },
    (err) => {
      geoInfo.textContent = `Unable to fetch location: ${err.message}`;
    }
  );
});