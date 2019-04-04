import { storage } from './util'

chrome.runtime.onMessage.addListener(({ type, ...others }) => {
  if (type === 'outer') {
    storage.add('targets', others)
  }
});