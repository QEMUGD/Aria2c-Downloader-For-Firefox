async function sendToAria2(message) {
  return browser.runtime.sendNativeMessage("com.openai.aria2c16", {
    action: "download",
    url: message.url,
    dir: message.dir || "",
    filename: message.filename || ""
  });
}

browser.runtime.onMessage.addListener(message => {
  if (message.type !== "aria2-download") return;
  return sendToAria2(message).catch(error => ({ok: false, error: error.message}));
});

// Optional automatic handoff. If aria2c cannot start, Firefox's original download stays active.
browser.downloads.onCreated.addListener(async item => {
  const {autoDownload} = await browser.storage.local.get({autoDownload: false});
  if (!autoDownload || !item.url || !/^https?:\/\//i.test(item.url) ||
      item.state === "complete" || item.byExtensionId) return;

  const parts = (item.filename || "").split(/[\\/]/);
  const filename = parts.pop() || "";
  const dir = parts.length ? parts.join("\\") : "";

  try {
    const result = await sendToAria2({url: item.url, dir, filename});
    if (result && result.ok) {
      await browser.downloads.cancel(item.id);
      await browser.downloads.erase({id: item.id});
    }
  } catch (error) {
    console.error("aria2c handoff failed; Firefox download remains active:", error);
  }
});