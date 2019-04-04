import { storage } from './util'

const recordBtn = document.querySelector('.record')
const list = document.querySelector(".bottom")

function startRecord() {
  const condition = { active: true, currentWindow: true };
  chrome.tabs.query(condition, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action: 'START' });
  });
}

async function update() {
  const { targets = [] } = await storage.get(['targets'])
  list.innerHTML = ''
  targets.map(text => {
    const li = document.createElement('li')
    li.innerText = text
    list.appendChild(li)
  })
}

recordBtn.addEventListener('click', startRecord)
chrome.runtime.onMessage.addListener(update);

update()