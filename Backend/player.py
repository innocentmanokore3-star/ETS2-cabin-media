import vlc
import os

class CabinPlayer:
    def __init__(self):
        self.instance = vlc.Instance('--no-video')
        self.player = self.instance.media_player_new()
        self.current_track = None

    def play_file(self, file_path: str):
        """Plays a local file from the PC system."""
        if not os.path.exists(file_path):
            return {"error": "File path does not exist"}
        
        media = self.instance.media_new(file_path)
        self.player.set_media(media)
        self.player.play()
        self.current_track = os.path.basename(file_path)
        return {"status": "playing", "track": self.current_track}

    def play_url(self, stream_url: str, name: str = "Internet Radio"):
        """Plays a live internet radio stream URL."""
        media = self.instance.media_new(stream_url)
        self.player.set_media(media)
        self.player.play()
        self.current_track = name
        return {"status": "playing", "stream": name}

    def toggle_pause(self):
        """Toggles between play and pause."""
        is_playing = self.player.is_playing()
        self.player.pause()  # VLC pause() acts as a toggle natively
        return {"status": "paused" if is_playing else "playing"}

    def stop(self):
        self.player.stop()
        self.current_track = None
        return {"status": "stopped"}
        
    def get_status(self):
        return {
            "current_track": self.current_track,
            "is_playing": bool(self.player.is_playing())
        }