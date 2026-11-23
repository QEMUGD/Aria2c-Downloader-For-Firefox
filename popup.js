const urlBox = document.getElementById("url");
const dirBox = document.getElementById("dir");
const statusBox = document.getElementById("status");
const autoBox = document.getElementById("auto");

async function loadSettings() {
  const settings = await browser.storage.local.get({ autoDownload: false });
  autoBox.checked = settings.autoDownload;
}

autoBox.addEventListener("change", async () => {
  await browser.storage.local.set({ autoDownload: autoBox.checked });
  statusBox.textContent = autoBox.checked
    ? "Automatic aria2c handoff enabled."
    : "Automatic aria2c handoff disabled.";
});

document.getElementById("current").addEventListener("click", async () => {
  const [tab] = await browser.tabs.query({active: true, currentWindow: true});
  if (tab && tab.url) {
    urlBox.value = tab.url;
    statusBox.textContent = "Current tab URL inserted. Use a direct file URL.";
  }
});

document.getElementById("download").addEventListener("click", async () => {
  const url = urlBox.value.trim();
  if (!url) { statusBox.textContent = "Paste a download URL first."; return; }
  try {
    const parsed = new URL(url);
    if (!["http:", "https:", "ftp:"].includes(parsed.protocol)) {
      throw new Error("Only HTTP, HTTPS, and FTP URLs are supported.");
    }
    statusBox.textContent = "Starting aria2c...";
    const result = await browser.runtime.sendMessage({
      type: "aria2-download", url, dir: dirBox.value.trim(), filename: ""
    });
    statusBox.textContent = result && result.ok
      ? "Download started in aria2c."
      : "Could not start: " + (result?.error || "Unknown error");
  } catch (error) { statusBox.textContent = error.message; }
});

loadSettings().catch(error => { statusBox.textContent = "Settings error: " + error.message; });