const callScreen = document.getElementById("call-screen");
const endCallButton = document.getElementById("end-call");
const styleModal = document.getElementById("style-modal");
const styleInput = document.getElementById("style-input");
const cancelStyle = document.getElementById("cancel-style");
const confirmStyle = document.getElementById("confirm-style");
const storyboard = document.getElementById("storyboard");
const sceneImage = document.getElementById("scene-img");
const sceneTitle = document.getElementById("scene-title");
const sceneNarration = document.getElementById("scene-narration");
const prevScene = document.getElementById("prev-scene");
const nextScene = document.getElementById("next-scene");
const transcriptText = document.getElementById("transcript-text");

const transcriptBox = document.getElementById("transcript-box");

let scenes = [];
let imagePaths = [];
let currentIndex = 0;
let loadingOverlay;

function ensureLoadingOverlay() {
  if (!loadingOverlay) {
    loadingOverlay = document.createElement("div");
    loadingOverlay.id = "loading-overlay";
    loadingOverlay.innerHTML = "<div class=\"spinner\"></div><p>Generating your shared memory...</p>";
    document.body.appendChild(loadingOverlay);
  }
}

function showLoading() {
  ensureLoadingOverlay();
  loadingOverlay.classList.remove("hidden");
}

function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.add("hidden");
  }
}

async function loadTranscript() {
  try {
    const response = await fetch("/transcript");
    if (!response.ok) {
      throw new Error("Failed to load transcript");
    }
    const payload = await response.json();
    transcriptText.textContent = payload.text || "";
  } catch (error) {
    console.error("Could not load transcript", error);
    transcriptText.textContent = "Transcript unavailable";
  }
}

function showModal() {
  styleInput.value = "";
  styleModal.classList.add("active");
  styleModal.classList.remove("hidden");
}

function hideModal() {
  styleModal.classList.add("hidden");
  styleModal.classList.remove("active");
}

function renderScene(index) {
  if (!scenes.length) {
    return;
  }
  const scene = scenes[index];
  sceneTitle.textContent = scene.title;
  sceneNarration.textContent = scene.narration;
  sceneImage.src = imagePaths[index];
  sceneImage.alt = scene.title;
}

async function triggerGeneration(stylePreference) {
  showLoading();
  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ style: stylePreference }),
    });
    if (!response.ok) {
      throw new Error("Failed to generate story");
    }
    const payload = await response.json();
    scenes = payload.story.scenes;
    imagePaths = payload.image_paths;
    currentIndex = 0;
    renderScene(currentIndex);
    callScreen.classList.add("hidden");
    transcriptBox.classList.add("hidden");
    storyboard.classList.remove("hidden");
    storyboard.classList.add("visible");
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  } finally {
    hideLoading();
  }
}

endCallButton.addEventListener("click", () => {
  showModal();
});

cancelStyle.addEventListener("click", () => {
  hideModal();
  callScreen.classList.remove("hidden");
  transcriptBox.classList.remove("hidden");
});

confirmStyle.addEventListener("click", async () => {
  const style = styleInput.value.trim();
  hideModal();
  await triggerGeneration(style);
});

prevScene.addEventListener("click", () => {
  if (!scenes.length) return;
  currentIndex = (currentIndex - 1 + scenes.length) % scenes.length;
  renderScene(currentIndex);
});

nextScene.addEventListener("click", () => {
  if (!scenes.length) return;
  currentIndex = (currentIndex + 1) % scenes.length;
  renderScene(currentIndex);
});

window.addEventListener("DOMContentLoaded", () => {
  loadTranscript();
  ensureLoadingOverlay();
  hideLoading();
  callScreen.classList.remove("hidden");
  storyboard.classList.add("hidden");
  storyboard.classList.remove("visible");
  styleModal.classList.add("hidden");
});

