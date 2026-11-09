#!/usr/bin/env python3
"""Serve the Wave Breathing app on http://127.0.0.1:8766/."""
import argparse
import json
import mimetypes
import os
import signal
import subprocess
import sys
import time
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent
PUBLIC = (ROOT / "public").resolve()
ASSET_ROOT = (Path.home() / "Desktop/Wave_Breathing_Assets").resolve()
WORKSPACE_ID = "wave-breathing-local-v1"
HOST = "127.0.0.1"
PORT = 8766
BASE = "http://%s:%s" % (HOST, PORT)
APP_URL = BASE + "/app/"
CONTENT_TYPES = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
}


def listeners(port):
    try:
        value = subprocess.check_output(
            ["/usr/sbin/lsof", "-nP", "-iTCP:%s" % port, "-sTCP:LISTEN", "-t"],
            stderr=subprocess.DEVNULL,
            text=True,
        )
    except subprocess.CalledProcessError:
        return []
    return sorted({int(pid) for pid in value.split()})


def our_server_is_up():
    request = urllib.request.Request(APP_URL, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=1) as response:
            return response.status == 200 and response.headers.get("X-Wave-Breathing") == "main-app"
    except OSError:
        return False


def server_process_is_ours(pid):
    """Identify only the exact `launch.py --serve` process created by this workspace."""
    try:
        command = subprocess.check_output(
            ["/bin/ps", "-p", str(pid), "-o", "command="],
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        return False
    return str((ROOT / "launch.py").resolve()) in command and "--serve" in command.split()


def stop_verified_server():
    """Stop a stale canonical server, never an unrelated listener."""
    pids = listeners(PORT)
    if len(pids) != 1 or not our_server_is_up() or not server_process_is_ours(pids[0]):
        raise RuntimeError(
            "Port %s has a stale or unverified process. It was left alone." % PORT
        )
    pid = pids[0]
    os.kill(pid, signal.SIGTERM)
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        if pid not in listeners(PORT):
            return
        time.sleep(0.05)
    raise RuntimeError(
        "The stale Wave Breathing server did not stop. It was not force-killed."
    )


def content_type(path):
    extra = CONTENT_TYPES.get(path.suffix.lower())
    if extra:
        return extra
    guessed = mimetypes.guess_type(path.name)[0]
    return guessed or "application/octet-stream"


def resolve_public(relative):
    relative = unquote(relative).lstrip("/")
    if relative in ("", "."):
        relative = "index.html"
    candidate = (PUBLIC / relative).resolve()
    try:
        candidate.relative_to(PUBLIC)
    except ValueError:
        return None
    if candidate.is_dir():
        candidate = candidate / "index.html"
    if not candidate.is_file():
        return None
    return candidate


class AppHandler(BaseHTTPRequestHandler):
    server_version = "WaveBreathingApp/1"

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def do_HEAD(self):
        self._respond(write_body=False)

    def do_GET(self):
        self._respond(write_body=True)

    def _respond(self, write_body):
        route = urlparse(self.path).path
        if route == "/api/workspace":
            self._send_json(200, {
                "workspaceId": WORKSPACE_ID,
                "appRoot": str(PUBLIC),
                "assetRoot": str(ASSET_ROOT),
            }, write_body)
            return
        if route in ("/", "/index.html"):
            self.send_response(307)
            self.send_header("Location", "/app/")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", "0")
            self.send_header("X-Wave-Breathing", "main-app")
            self.end_headers()
            return
        if route in ("/app", "/app/"):
            relative = "index.html"
        elif route.startswith("/app/"):
            relative = route[len("/app/"):]
        else:
            self._send(404, b"Not found.\n", "text/plain; charset=utf-8", write_body)
            return
        file = resolve_public(relative)
        if file is None:
            self._send(404, b"Missing app file.\n", "text/plain; charset=utf-8", write_body)
            return
        self._send(200, file.read_bytes(), content_type(file), write_body)

    def _send_json(self, status, value, write_body=True):
        body = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self._send(status, body, "application/json; charset=utf-8", write_body)

    def _send(self, status, body, mime, write_body, marker="main-app"):
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Wave-Breathing", marker)
        self.end_headers()
        if write_body:
            self.wfile.write(body)


def serve():
    if not (PUBLIC / "index.html").is_file():
        raise RuntimeError("The main app was not found at %s." % PUBLIC)
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print("Main app: " + APP_URL)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping the main app.")
    finally:
        server.server_close()


def launch(no_open):
    if not (PUBLIC / "index.html").is_file():
        raise RuntimeError("The main app was not found at %s." % PUBLIC)
    if not our_server_is_up():
        if listeners(PORT):
            raise RuntimeError("Port %s belongs to another app. It was left alone." % PORT)
        log_path = Path("/tmp/wave-breathing-main-app-8766.log")
        with log_path.open("ab") as log:
            child = subprocess.Popen(
                [sys.executable, str(ROOT / "launch.py"), "--serve"],
                cwd=str(ROOT),
                stdin=subprocess.DEVNULL,
                stdout=log,
                stderr=subprocess.STDOUT,
                start_new_session=True,
            )
        deadline = time.monotonic() + 8
        while time.monotonic() < deadline:
            if our_server_is_up():
                break
            if child.poll() is not None:
                raise RuntimeError("The main app could not start. See %s." % log_path)
            time.sleep(0.1)
        else:
            raise RuntimeError("The main app did not become ready. See %s." % log_path)
        print("Started the Wave Breathing main app.")
    else:
        print("Reusing the Wave Breathing main app.")
    print("Main app: " + APP_URL)
    if not no_open:
        webbrowser.open(APP_URL)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--no-open", action="store_true", help="Start or reuse the main app without opening a browser")
    parser.add_argument("--serve", action="store_true", help=argparse.SUPPRESS)
    args = parser.parse_args()
    try:
        serve() if args.serve else launch(args.no_open)
    except (RuntimeError, OSError) as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
