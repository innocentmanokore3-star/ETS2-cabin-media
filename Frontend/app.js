/**
 * ETS2 Cabin Media Controller - Communication Engine
 * File: app.js
 */

const API = ""; 
let source = "local"; 

function setSource(s) {
  source = s;
  
  const buttonIds = ["btnLocal", "btnSpotify", "btnRadio", "btnApps"];
  buttonIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.style.background = "#1c1f26";
      btn.style.color = "#cbd5e1";
    }
  });

  const spotifyDeck = document.getElementById("spotifyDeviceDeck");
  if (spotifyDeck) {
    if (s === "spotify") {
      spotifyDeck.style.display = "flex";
      fetchAvailableDevices(); 
    } else {
      spotifyDeck.style.display = "none";
    }
  }

  const activeMap = {
    'local':   { id: 'btnLocal',   label: '💻 DECK: PC LOCAL' },
    'spotify': { id: 'btnSpotify', label: '🟢 DECK: SPOTIFY' },
    'radio':   { id: 'btnRadio',   label: '📻 DECK: WEB STREAM' },
    'apps':    { id: 'btnApps',    label: '🚀 DECK: THIRD PARTY' }
  };

  if (activeMap[s]) {
    const activeBtn = document.getElementById(activeMap[s].id);
    if (activeBtn) {
      activeBtn.style.background = "#ffb400";
      activeBtn.style.color = "#111";
    }
    document.getElementById("hudSourceLabel").textContent = activeMap[s].label;
  }
  
  refreshStatus();
}

async function control(action) {
  let finalPath;
  if (source === "spotify") {
    finalPath = `/api/spotify/${action}`;
  } else if (source === "radio") {
    finalPath = `/api/radio/${action}`;
  } else if (source === "apps") {
    finalPath = `/api/apps/${action}`;
  } else {
    finalPath = `/api/control/${action}`;
  }

  try {
    const res = await fetch(API + finalPath, { method: "POST" });
    if (!res.ok) console.warn(`Control request failed: ${res.status}`);
  } catch (e) { 
    console.warn("Communication failure executing remote hardware command:", e); 
  }
  
  setTimeout(refreshStatus, 150);
}

async function fetchAvailableDevices() {
  try {
    const res = await fetch(API + "/api/spotify/devices");
    if (res.ok) {
      const devices = await res.json();
    }
  } catch(e) {
    console.warn("Unable to fetch backend device network maps:", e);
  }
}

async function playOnTargetDevice() {
  const selector = document.getElementById("mediaPlayerSelect");
  const selectedDevice = selector.value;
  
  if (!selectedDevice) {
    alert("Please select a valid media player device target first.");
    return;
  }

  try {
    const res = await fetch(API + "/api/spotify/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: selectedDevice })
    });
  } catch(e) {
    console.warn("Could not handle target device stream placement:", e);
  }
  refreshStatus();
}

async function uploadTrack() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) return;

  const form = new FormData();
  form.append("file", file);

  try {
    const res = await fetch(API + "/api/play/mobile", { method: "POST", body: form });
    if(res.ok) {
      fileInput.value = ""; 
    }
  } catch (e) {
    console.warn("Audio container integration payload processing failed:", e);
  }
  setTimeout(refreshStatus, 300);
}

async function refreshStatus() {
  const gs = document.getElementById("gameStatus");
  const eq = document.getElementById("eqVisualizer");
  
  try {
    if (source === "spotify" || source === "radio" || source === "apps") {
      const res = await fetch(API + `/api/${source}/status`);
      if (res.ok) {
        const data = await res.json();
        document.getElementById("trackName").textContent = data.track_name || "Streaming Feed Active";
        document.getElementById("trackArtist").textContent = data.artist || "Cloud Stream Service";
        
        if (data.is_playing) {
          eq.classList.add("playing");
        } else {
          eq.classList.remove("playing");
        }
      } else {
        document.getElementById("trackName").textContent = "Service Idle";
        document.getElementById("trackArtist").textContent = `Waiting for ${source} sync...`;
        eq.classList.remove("playing");
      }
      gs.textContent = "ONLINE";
      gs.className = "status live";
      
    } else {
      const res = await fetch(API + "/api/status");
      if (res.ok) {
        const data = await res.json();
        document.getElementById("trackName").textContent = data.track_name || "No Track Loading";
        document.getElementById("trackArtist").textContent = data.game_running ? "In-Game Audio Deck" : "ETS2 Simulator Offline";
        
        gs.textContent = data.game_running ? "ETS2 RUNNING" : "ETS2 OFFLINE";
        gs.className = "status" + (data.game_running ? " live" : "");
        
        if (data.game_running && data.is_playing !== false) {
          eq.classList.add("playing");
        } else {
          eq.classList.remove("playing");
        }
      } else {
        throw new Error("Local service offline");
      }
    }
  } catch (e) { 
    document.getElementById("trackName").textContent = "SYSTEM STANDBY";
    document.getElementById("trackArtist").textContent = "Check API backend host link status";
    gs.textContent = "OFFLINE";
    gs.className = "status";
    eq.classList.remove("playing");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setSource("local");
  setInterval(refreshStatus, 2000);
});