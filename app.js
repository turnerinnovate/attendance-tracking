const STORAGE_KEY = "campActivityVideos";
const form = document.getElementById("activity-form");
const activityList = document.getElementById("activity-list");
const filterType = document.getElementById("filter-type");
const sortBy = document.getElementById("sort-by");
const statusMessage = document.getElementById("recording-status");
const cameraPreview = document.getElementById("camera-preview");
const startCameraBtn = document.getElementById("start-camera");
const startRecordingBtn = document.getElementById("start-recording");
const stopRecordingBtn = document.getElementById("stop-recording");
const videoUpload = document.getElementById("video-upload");
const cardTemplate = document.getElementById("activity-card-template");

let mediaRecorder;
let cameraStream;
let recordedChunks = [];
let recordedBlob;
let activities = loadActivities();

startCameraBtn.addEventListener("click", startCamera);
startRecordingBtn.addEventListener("click", startRecording);
stopRecordingBtn.addEventListener("click", stopRecording);
videoUpload.addEventListener("change", () => {
  if (videoUpload.files.length > 0) {
    recordedBlob = null;
    statusMessage.textContent = `Video selected: ${videoUpload.files[0].name}`;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const file = videoUpload.files[0];
  const videoBlob = recordedBlob ?? file;

  if (!videoBlob) {
    statusMessage.textContent = "Please record a video or upload one before saving.";
    return;
  }

  const videoUrl = await blobToDataURL(videoBlob);

  const entry = {
    id: crypto.randomUUID(),
    activityName: formData.get("activityName"),
    activityTime: formData.get("activityTime"),
    gameType: formData.get("gameType"),
    multiplayer: formData.get("multiplayer"),
    focusArea: formData.get("focusArea"),
    duration: Number(formData.get("duration")),
    speedLevel: formData.get("speedLevel"),
    notes: formData.get("notes") || "No notes provided.",
    videoUrl,
    createdAt: Date.now(),
  };

  activities.push(entry);
  persistActivities();
  renderActivities();

  form.reset();
  recordedBlob = null;
  statusMessage.textContent = "Activity saved to your library.";
});

filterType.addEventListener("change", renderActivities);
sortBy.addEventListener("change", renderActivities);

renderActivities();

function loadActivities() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function persistActivities() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

function renderActivities() {
  activityList.innerHTML = "";

  const filtered = activities
    .filter((item) => filterType.value === "all" || item.gameType === filterType.value)
    .sort(applySort);

  if (filtered.length === 0) {
    activityList.innerHTML = "<p>No activities yet. Record or upload your first camp video.</p>";
    return;
  }

  filtered.forEach((activity) => {
    const fragment = cardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".activity-card");
    const video = fragment.querySelector(".activity-video");
    const title = fragment.querySelector(".title");
    const meta = fragment.querySelector(".meta");
    const tags = fragment.querySelector(".tags");
    const notes = fragment.querySelector(".notes");

    card.dataset.id = activity.id;
    video.src = activity.videoUrl;
    title.textContent = activity.activityName;
    meta.textContent = `${new Date(activity.activityTime).toLocaleString()} • ${activity.duration} min`;

    [
      activity.gameType,
      activity.multiplayer,
      activity.focusArea,
      `Speed: ${activity.speedLevel}`,
    ].forEach((tagText) => {
      const tag = document.createElement("li");
      tag.textContent = tagText;
      tags.appendChild(tag);
    });

    notes.textContent = activity.notes;
    activityList.appendChild(fragment);
  });
}

function applySort(a, b) {
  const speedScore = { Low: 1, Medium: 2, High: 3 };

  switch (sortBy.value) {
    case "oldest":
      return a.createdAt - b.createdAt;
    case "duration-high":
      return b.duration - a.duration;
    case "duration-low":
      return a.duration - b.duration;
    case "speed-high":
      return speedScore[b.speedLevel] - speedScore[a.speedLevel];
    case "speed-low":
      return speedScore[a.speedLevel] - speedScore[b.speedLevel];
    default:
      return b.createdAt - a.createdAt;
  }
}

async function startCamera() {
  if (cameraStream) {
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    cameraPreview.srcObject = cameraStream;
    statusMessage.textContent = "Camera started. Ready to record.";
  } catch (error) {
    statusMessage.textContent = `Unable to access camera: ${error.message}`;
  }
}

function startRecording() {
  if (!cameraStream) {
    statusMessage.textContent = "Start the camera first.";
    return;
  }

  recordedChunks = [];
  mediaRecorder = new MediaRecorder(cameraStream);

  mediaRecorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  });

  mediaRecorder.addEventListener("stop", () => {
    recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
    videoUpload.value = "";
    statusMessage.textContent = "Recording complete. Save activity to keep it.";
  });

  mediaRecorder.start();
  startRecordingBtn.disabled = true;
  stopRecordingBtn.disabled = false;
  statusMessage.textContent = "Recording in progress...";
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  startRecordingBtn.disabled = false;
  stopRecordingBtn.disabled = true;
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
