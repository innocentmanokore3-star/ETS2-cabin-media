const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 8000;

// Enable Cross-Origin Resource Sharing (CORS) for front-end access
app.use(cors());
app.use(express.json());

// Set up file storage layout for local file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

/* ==========================================================================
   STATE SIMULATION ENGINE (Connect this to your actual game/API integrations)
   ========================================================================== */
let systemState = {
  local: { track_name: "Trucking Beats Vol. 1", artist: "In-Game Radio Deck", game_running: true, is_playing: true },
  spotify: { track_name: "Midnight City", artist: "M83", is_playing: false, active_device: "desktop_client" },
  radio: { track_name: "Hot Hits Live", artist: "Simulator Web FM", is_playing: true },
  apps: { track_name: "Custom Podcast Ep. 4", artist: "Third Party Player", is_playing: false }
};

/* ==========================================================================
   1. STANDARD PC PLAYER / ETS2 ENGINE API
   ========================================================================== */
// Get live telemetry/status
app.get('/api/status', (req, res) => {
  res.json(systemState.local);
});

// Control hardware playback macros
app.post('/api/control/:action', (req, res) => {
  const { action } = req.params;
  console.log(`[PC Player] Executing action: ${action}`);
  
  if (action === 'toggle') systemState.local.is_playing = !systemState.local.is_playing;
  res.sendStatus(200);
});

/* ==========================================================================
   2. SPOTIFY INTEGRATION ENGINE (With Player Targets Matrix)
   ========================================================================== */
// Get live status of Spotify stream
app.get('/api/spotify/status', (req, res) => {
  res.json(systemState.spotify);
});

// Forward media commands directly to Spotify accounts
app.post('/api/spotify/:action', (req, res) => {
  const { action } = req.params;
  console.log(`[Spotify Core] Executing action: ${action}`);
  
  if (action === 'toggle') systemState.spotify.is_playing = !systemState.spotify.is_playing;
  res.sendStatus(200);
});

// Fetch discovered network devices available to hand over playback streams to
app.get('/api/spotify/devices', (req, res) => {
  // If integrating with official Spotify Web API, you would forward requests to:
  // https://api.spotify.com/v1/me/player/devices
  const dummyDevicesList = [
    { id: "phone_spotify", name: "📱 Smartphone (Spotify App)" },
    { id: "phone_default", name: "🎵 Phone Native Media Player" },
    { id: "truck_cabin", name: "🚛 ETS2 Cabin Audio Rig" },
    { id: "desktop_client", name: "💻 PC Spotify Client" }
  ];
  res.json(dummyDevicesList);
});

// Hand off ongoing playback to a specific device target
app.post('/api/spotify/transfer', (req, res) => {
  const { device_id } = req.body;
  console.log(`[Spotify Device Engine] Transferring active session to device context: ${device_id}`);
  systemState.spotify.active_device = device_id;
  systemState.spotify.is_playing = true; // Wake up player
  res.status(200).json({ success: true, message: `Handoff completed to ${device_id}` });
});

/* ==========================================================================
   3. WEB RADIO & THIRD PARTY EXTENSION CHANNELS
   ========================================================================== */
// Web Radio Status & Control
app.get('/api/radio/status', (req, res) => res.json(systemState.radio));
app.post('/api/radio/:action', (req, res) => {
  if (req.params.action === 'toggle') systemState.radio.is_playing = !systemState.radio.is_playing;
  res.sendStatus(200);
});

// Third Party Apps Status & Control
app.get('/api/apps/status', (req, res) => res.json(systemState.apps));
app.post('/api/apps/:action', (req, res) => {
  if (req.params.action === 'toggle') systemState.apps.is_playing = !systemState.apps.is_playing;
  res.sendStatus(200);
});

/* ==========================================================================
   4. FILE STORAGE STREAM DECK DEPLOYER
   ========================================================================== */
app.post('/api/play/mobile', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Audio transmission contains no binary block payload.');
  }
  
  console.log(`[File Ingestion Engine] Received structural storage file asset: ${req.file.filename}`);
  
  // Instantly map the UI HUD metadata strings to match your new custom uploaded track file
  systemState.local.track_name = req.file.originalname.replace(/\.[^/.]+$/, ""); // Strip extension
  systemState.local.artist = "Local Uploaded Track Asset";
  systemState.local.is_playing = true;

  res.status(200).json({ success: true, file: req.file.filename });
});

/* ==========================================================================
   SERVER INITIALIZATION ORCHESTRATOR
   ========================================================================== */
// Ensure storage directory is created safely on initialization
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚚 ETS2 CABIN AUDIO TELEMETRY API ONLINE ON PORT: ${PORT}`);
  console.log(`=======================================================`);
});