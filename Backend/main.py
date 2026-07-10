import os
import sys
import threading
import keyboard  # Used EXCLUSIVELY to listen to user keys, NOT to fake push buttons
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Connect directly to your local audio playback script (play.py)
try:
    from play import CabinPlayer
    player = CabinPlayer()
    print("[Audio Engine] Successfully linked to play.py cabin playback system.")
except ImportError:
    player = None
    print("[Error] play.py not found inside the Backend folder! Audio engine failed to start.")

# ==========================================================================
# ⚙️ END-USER HARDWARE KEY MAPPING CONFIGURATION
# Tell the script what physical buttons change tracks or volume on the PC/Wheel.
# Change these values to match your specific game settings!
# ==========================================================================
USER_KEYBINDS = {
    "toggle_pause": "play/pause media",  # Default media play key
    "next_track": "right bracket",        # e.g., ']' key or whatever bind is preferred
    "prev_track": "left bracket",         # e.g., '[' key
    "volume_up": "num +",                 # e.g., Numpad Plus
    "volume_down": "num -"                # e.g., Numpad Minus
}

# ==========================================================================
# DYNAMIC FRONTEND/BACKEND CROSS-ROUTING ENGINE
# ==========================================================================
if getattr(sys, 'frozen', False):
    BACKEND_DIR = os.path.dirname(sys.executable)
else:
    BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

ROOT_DIR = os.path.abspath(os.path.join(BACKEND_DIR, '..'))
FRONTEND_DIR = os.path.join(ROOT_DIR, 'Frontend')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)  

UPLOAD_FOLDER = os.path.join(BACKEND_DIR, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_local_playlist():
    supported_formats = ('.mp3', '.wav', '.ogg', '.m4a')
    try:
        return [f for f in os.listdir(UPLOAD_FOLDER) if f.lower().endswith(supported_formats)]
    except Exception:
        return []

current_track_index = 0

system_state = {
    "local": {"track_name": "No Track Loaded", "artist": "Cabin Audio Deck", "game_running": True, "is_playing": False},
    "spotify": {"track_name": "Ready for Direct URL", "artist": "Web Stream Mode", "is_playing": False},
    "radio": {"track_name": "Simulator Web FM", "artist": "Live Stream Feed", "is_playing": False},
    "apps": {"track_name": "Third Party Channel", "artist": "Extension Deck", "is_playing": False}
}

# ==========================================================================
# CORE CORE AUDIO WORKFLOWS (Shared by both Phone and Hardware Keys)
# ==========================================================================
def trigger_audio_action(action):
    global current_track_index
    playlist = get_local_playlist()
    if not player:
        return

    if action == 'toggle':
        player.toggle_pause()
        system_state["local"]["is_playing"] = not system_state["local"]["is_playing"]
        print("[Audio System] Play/Pause state toggled.")
        
    elif action == 'next':
        if playlist:
            current_track_index = (current_track_index + 1) % len(playlist)
            target_file = os.path.join(UPLOAD_FOLDER, playlist[current_track_index])
            player.play_file(target_file)
            system_state["local"]["is_playing"] = True
            print(f"[Audio System] Skipped Forward -> {playlist[current_track_index]}")

    elif action == 'previous':
        if playlist:
            current_track_index = (current_track_index - 1 + len(playlist)) % len(playlist)
            target_file = os.path.join(UPLOAD_FOLDER, playlist[current_track_index])
            player.play_file(target_file)
            system_state["local"]["is_playing"] = True
            print(f"[Audio System] Skipped Backward -> {playlist[current_track_index]}")

    elif action == 'volume/up':
        if hasattr(player, 'volume_up'): 
            player.volume_up()
            print("[Audio System] Volume Up triggered.")
    elif action == 'volume/down':
        if hasattr(player, 'volume_down'): 
            player.volume_down()
            print("[Audio System] Volume Down triggered.")

# ==========================================================================
# ⌨️ HARDWARE BACKGROUND INTERCEPTOR THREAD
# This listens for the keys the user mapped without injecting blocking actions
# ==========================================================================
def start_hardware_key_listener():
    print(f"\n[Hardware Link] Key hook listener initialized using mappings:")
    print(f" -> Next Track Key: '{USER_KEYBINDS['next_track']}'")
    print(f" -> Prev Track Key: '{USER_KEYBINDS['prev_track']}'\n")

    keyboard.add_hotkey(USER_KEYBINDS["toggle_pause"], lambda: trigger_audio_action('toggle'))
    keyboard.add_hotkey(USER_KEYBINDS["next_track"], lambda: trigger_audio_action('next'))
    keyboard.add_hotkey(USER_KEYBINDS["prev_track"], lambda: trigger_audio_action('previous'))
    keyboard.add_hotkey(USER_KEYBINDS["volume_up"], lambda: trigger_audio_action('volume/up'))
    keyboard.add_hotkey(USER_KEYBINDS["volume_down"], lambda: trigger_audio_action('volume/down'))

# Launch listener cleanly as an isolated thread context
listener_thread = threading.Thread(target=start_hardware_key_listener, daemon=True)
listener_thread.start()

# ==========================================================================
# FRONTEND API ROUTING (Phone Hooks)
# ==========================================================================
@app.route('/', methods=['GET'])
def home_page():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/app.js', methods=['GET'])
def serve_js():
    return send_from_directory(FRONTEND_DIR, 'app.js')

@app.route('/api/status', methods=['GET'])
def get_status():
    playlist = get_local_playlist()
    if playlist and current_track_index < len(playlist):
        system_state["local"]["track_name"] = os.path.splitext(playlist[current_track_index])[0]
        system_state["local"]["artist"] = "Local Cabin Track"
    return jsonify(system_state["local"])

@app.route('/api/control/<path:action>', methods=['POST'])
def local_control(action):
    # Triggers the exact same internal player engine call used by physical hardware
    trigger_audio_action(action)
    return '', 200

# ==========================================================================
# STREAMING / DIRECT INPUT ROUTER
# ==========================================================================
@app.route('/api/spotify/status', methods=['GET'])
def spotify_status():
    return jsonify(system_state["spotify"])

@app.route('/api/spotify/<path:action>', methods=['POST'])
def spotify_control(action):
    if action == 'toggle': trigger_audio_action('toggle')
    return '', 200

@app.route('/api/spotify/transfer', methods=['POST'])
def transfer_spotify_playback():
    data = request.get_json() or {}
    stream_url = data.get('device_id') 
    
    if not stream_url or not stream_url.startswith(('http://', 'https://')):
        return jsonify({"success": False, "message": "Please enter a valid HTTP/HTTPS link."}), 400

    if player and hasattr(player, 'play_url'):
        player.play_url(stream_url)
        system_state["spotify"]["track_name"] = "Live Web Feed Stream"
        system_state["spotify"]["artist"] = "Internet Audio Link"
        system_state["spotify"]["is_playing"] = True
        return jsonify({"success": True, "message": "Stream linked directly to cabin!"}), 200
    return jsonify({"success": False, "message": "Audio module failed to stream."}), 500

# ==========================================================================
# FILE UPLOAD ENGINE
# ==========================================================================
@app.route('/api/play/mobile', methods=['POST'])
def upload_file_stream():
    global current_track_index
    if 'file' not in request.files: return jsonify({"error": "No file container submitted"}), 400
    file = request.files['file']
    if file.filename == '': return jsonify({"error": "Empty reference target"}), 400
        
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        playlist = get_local_playlist()
        if filename in playlist:
            current_track_index = playlist.index(filename)
        
        if player and hasattr(player, 'play_file'):
            player.play_file(file_path)
            system_state["local"]["is_playing"] = True
        return jsonify({"success": True, "file": filename}), 200

if __name__ == '__main__':
    print("=======================================================")
    print("🚚 ETS2 AUDIO SERVER: MOBILE & RIG HARDWARE SYNCED ")
    print("=======================================================")
    app.run(host='0.0.0.0', port=8000, debug=True)