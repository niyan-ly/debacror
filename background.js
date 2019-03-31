chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    color: "#ffca28"
  })
})