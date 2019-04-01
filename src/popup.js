chrome.storage.sync.get('color', result => {
  document.querySelector('.color').style.backgroundColor = result.color
})