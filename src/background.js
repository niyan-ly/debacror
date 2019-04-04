import { storage } from './util'

chrome.runtime.onMessage.addListener(request => {
  if (request.target) {
    storage.add('targets', request.target)
  }
});