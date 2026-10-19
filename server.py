"""Local-only ONCOGUIDE presentation server. Bind only to loopback."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
HOST = "127.0.0.1"
PORT = 8900
ROOT = Path(__file__).resolve().parent
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()
if __name__ == "__main__":
    os.chdir(ROOT)
    print(f"ONCOGUIDE presentation build running at http://localhost:{PORT}")
    print("Local-only demo. Do not use for clinical decisions or real patient data.")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
