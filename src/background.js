import { storage, communicator } from './util';

const allowedProtocol = ['http:', 'https:'];

communicator.onMessageForBG = ({ action, data }) => {
  if (action === 'SAVE') {
    storage.add('targets', data);
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
          64: 'img/bot_disabled_64.png'
        }
      });
    }
  });
});
