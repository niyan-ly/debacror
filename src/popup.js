import { storage, dom, communicator } from './util'

const CONDITION = { active: true, currentWindow: true };

function startRecord() {
  chrome.tabs.query(CONDITION, ([tab]) => {
    communicator.toContentScript(tab.id, {
      action: 'START_RECORD'
    })
  });
}

/**
 * update popup page
 */
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
  chrome.tabs.query(CONDITION, ([tab]) => {
    communicator.toContentScript(tab.id, { action: 'END_RECORD' })
  })
}

/**
 * do roboticized workflow
 */
async function restore() {
  chrome.tabs.query(CONDITION, ([tab]) => {
    communicator.toContentScript(tab.id, {
      action: 'RESTORE',
      delayValue: document.querySelector('input[name="delay"]').value
    })
  })
}

const messageHandler = {
  UPDATE_VIEW: update
}

communicator.onMessageForPopUp = request => {
  const handler = messageHandler[request.action]
  handler instanceof Function ? handler() : null;
}

const [
  recordBtn,
  clearBtn,
  list,
  stopBtn,
  restoreBtn
] = dom.get(['.record', '.clear', '.bottom', '.stop', '.restore'])

recordBtn.addEventListener('click', startRecord)
clearBtn.addEventListener('click', clearRecordHistory)
stopBtn.addEventListener('click', stopRecord)
restoreBtn.addEventListener('click', restore)

update()