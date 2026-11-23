import json
import os
import shutil
import struct
import subprocess
import sys
from urllib.parse import urlparse

def read_message():
    header = sys.stdin.buffer.read(4)
    if len(header) != 4:
        return None
    size = struct.unpack("=I", header)[0]
    payload = sys.stdin.buffer.read(size)
    if len(payload) != size:
        return None
    return json.loads(payload.decode("utf-8"))

def send_message(data):
    payload = json.dumps(data).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("=I", len(payload)))
    sys.stdout.buffer.write(payload)
    sys.stdout.buffer.flush()

def main():
    while True:
        message = read_message()
        if message is None:
            return
        url = message.get("url", "")
        parsed = urlparse(url)
        if message.get("action") != "download":
            send_message({"ok": False, "error": "Unsupported action"})
            continue
        if parsed.scheme not in ("http", "https", "ftp") or not parsed.netloc:
            send_message({"ok": False, "error": "Invalid or unsupported URL"})
            continue
        aria2c = shutil.which("aria2c.exe") or shutil.which("aria2c")
        if not aria2c:
            send_message({"ok": False, "error": "aria2c was not found in PATH"})
            continue
        args = [
            aria2c, "-x16", "-s16", "-k1M", "--continue=true",
            "--allow-overwrite=false", "--auto-file-renaming=true",
            "--content-disposition=true"
        ]
        directory = message.get("dir", "")
        filename = message.get("filename", "")
        if directory:
            args.extend(["--dir", directory])
        if filename:
            args.extend(["--out", os.path.basename(filename)])
        args.append(url)
        try:
            flags = getattr(subprocess, "CREATE_NEW_CONSOLE", 0)
            subprocess.Popen(args, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                             stderr=subprocess.DEVNULL, shell=False, creationflags=flags)
            send_message({"ok": True})
        except Exception as error:
            send_message({"ok": False, "error": str(error)})

if __name__ == "__main__":
    main()