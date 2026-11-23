# aria2c Downloader for Firefox

Firefox extension that can send a pasted URL to aria2c or optionally hand off normal Firefox HTTP(S) downloads. aria2c is configured with 16 connections and 16 splits.

## Features
- Toolbar popup for pasting a direct download URL.
- Use the active tab URL as the source.
- Optional automatic handoff of Firefox HTTP(S) downloads.
- aria2c arguments: `-x16 -s16 -k1M --continue=true`.
- Optional destination folder.
- If the native host cannot start, automatic handoff leaves the original Firefox download running.

## Requirements
- Windows 10 or 11.
- Firefox 109 or newer.
- aria2 installed and `aria2c` available in PowerShell PATH.
- Python 3 available as `python` (only for the one-time native-host build).

## Install
1. Install aria2. For example: `winget install -e --id aria2.aria2`.
2. Open a new PowerShell window and confirm `aria2c --version` works.
3. Install Python 3 and enable **Add Python to PATH**.
4. Extract this repository to a permanent folder.
5. Open PowerShell in that folder and run:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\install-host.ps1
   ```
6. Restart Firefox.
7. Open `about:debugging#/runtime/this-firefox`.
8. Choose **Load Temporary Add-on…** and select this repository's `manifest.json`.
9. Click the extension icon. Paste a direct URL, or enable automatic handoff.

Temporary add-ons are removed when Firefox restarts. Load the manifest again after restarting Firefox. Permanent distribution requires Mozilla signing.

## Limitations
- The native host starts aria2c locally; URLs are not sent to a third-party service.
- Automatic handoff is off by default.
- This implementation does not transfer Firefox login cookies, POST bodies, or all request headers. Authenticated or session-bound downloads may fail; disable automatic handoff for those sites.
- Servers may limit parallel connections. The 16x16 settings request up to 16 connections and 16 splits but cannot force a server to allow them.
- FTP links are accepted in the popup but are not automatically intercepted.
