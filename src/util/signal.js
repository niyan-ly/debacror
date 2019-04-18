/**
 * @enum {String}
 */
const EMsgType = {
  TO_CS: 'TO_CS',
  TO_BG: 'TO_BG',
  TO_POPUP: 'TO_POPUP',
};

class Signal {
  contentScriptCallback = [];
  backgroundCallback = [];
  popupCallback = [];

  set onMessageForCS(callback) {
    this.contentScriptCallback.push(callback);
  }
  set onMessageForBG(callback) {
    this.backgroundCallback.push(callback);
  }
  set onMessageForPopUp(callback) {
    this.popupCallback.push(callback);
  }

  constructor() {
    chrome.runtime.onMessage.addListener((request, ...rest) => {
      const executor = {
        TO_CS: (...arg) => {
          this.contentScriptCallback.map(c => c(...arg));
        },
        TO_BG: (...arg) => {
          this.backgroundCallback.map(c => c(...arg));
        },
        TO_POPUP: (...arg) => {
          this.popupCallback.map(c => c(...arg));
        },
      };

      const handler = executor[request.type];
      handler ? handler(request, ...rest) : this.warn(request.type);
    });
  }

  /**
   * @param {string} type
   */
  warn(type) {
    console.warn(`unregistered message type of ${type}`);
  }

  /**
   * @param {EMsgType} to
   * @param {Object} message
   */
  send(to, message) {
    chrome.runtime.sendMessage({
      ...message,
      type: to,
    });
  }

  /**
   * @description send message to both specific tab and runtime(backgound, popup)
   */
  broadcast(tabId, message) {
    if (tabId) {
      this.toContentScript(tabId, message);
    }
    this.send(EMsgType.TO_BG, message);
    this.send(EMsgType.TO_POPUP);
  }

  toContentScript(tabId, message, callback) {
    chrome.tabs.sendMessage(
      tabId,
      {
        ...message,
        type: EMsgType.TO_CS,
      },
      callback,
    );
  }

  toBackground(message) {
    this.send(EMsgType.TO_BG, message);
  }

  toPopUp(message) {
    this.send(EMsgType.TO_POPUP, message);
  }
}

export const signal = new Signal();
