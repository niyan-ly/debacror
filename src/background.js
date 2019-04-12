import { Record, Storage, communicator } from './util';

const allowedProtocol = ['http:', 'https:'];
const record = new Record({
  name: 'record',
});
const snapshotList = new Storage({
  namespace: 'SNAPSHOT_NAME_LIST'
});

communicator.onMessageForBG = async ({ action, data }) => {
  // console.log(await record.storage.get());
  if (action === 'SAVE') {
    record.addActions(data);
  }

  if (action === 'CREATE_SNAPSHOT') {
    /** 
     * [warn] this may cause issues when multiple snapshot
     * is created at the same time.
     */
    const originList = (await snapshotList.get('all')) || [];
    const frame = await record.storage.get();
    const snapshotName = `snapshot-${originList.length + 1}`;
    const snapshotStore = new Record({ name: snapshotName });
    snapshotList.set({
      all: [...originList, snapshotName]
    });
    snapshotStore.storage.set(frame);
  }
};

chrome.tabs.onActivated.addListener(({ windowId, tabId }) => {
  chrome.tabs.getSelected(windowId, tab => {
    const url = new URL(tab.url);
    if (!allowedProtocol.includes(url.protocol)) {
      chrome.browserAction.setIcon({
        tabId,
        path: {
          16: 'img/bot_disabled_16.png',
          32: 'img/bot_disabled_32.png',
          64: 'img/bot_disabled_64.png',
        },
      });
    }
  });
});
