import { storage } from './util'

function startRecord() {
  chrome.tabs.query(condition, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action: 'START' });
  });
}

async function update() {
  const { targets = [] } = await storage.get(['targets'])
  list.innerHTML = ''
  targets.map(({ action, value, target }) => {
    const li = document.createElement('li')
    li.innerHTML = `${action} -> ${target} -> <span style="color:red">${value || ''}</span>`
    list.appendChild(li)
  })
}

function clearRecordHistory() {
  storage.set({ targets: [] })
  update()
}

function stopRecord() {
  chrome.tabs.query(condition, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action: 'END' })
  })
}

const messageHandler = {
  update
}

chrome.runtime.onMessage.addListener(request => {
  if (request.type === 'inner') {
    const handler = messageHandler[request.action]
    handler instanceof Function ? handler() : null;
  }
})

const recordBtn = document.querySelector('.record')
const clearBtn = document.querySelector('.clear')
const list = document.querySelector(".bottom")
const stopBtn = document.querySelector('.stop')

const condition = { active: true, currentWindow: true };


recordBtn.addEventListener('click', startRecord)
clearBtn.addEventListener('click', clearRecordHistory)
stopBtn.addEventListener('click', stopRecord)

update()