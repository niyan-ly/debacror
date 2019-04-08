/**
 * @enum {String}
 */
const EMsgType = {
  TO_CS: 'TO_CS',
  TO_BG: 'TO_BG',
  TO_POPUP: 'TO_POPUP',
};

class Communicator {
  onMessageForCS() {}
  onMessageForBG() {}
  onMessageForPopUp() {}

  constructor() {
    chrome.runtime.onMessage.addListener((request, ...rest) => {
      const executor = {
        TO_CS: this.onMessageForCS,
        TO_BG: this.onMessageForBG,
        TO_POPUP: this.onMessageForPopUp,
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
   * @description actually, all messages that have been sent
   * is broadcast, this method is just a literal restraint.
   */
  broadcast(message) {
    this.send(null, message);
  }

  toContentScript(tabId, message, callback) {
    chrome.tabs.sendMessage(
      tabId,
      {
        ...message,
        type: EMsgType.TO_CS,
      },
      callback
    );
  }

  toBackground(message) {
    this.send(EMsgType.TO_BG, message);
  }

  toPopUp(message) {
    this.send(EMsgType.TO_POPUP, message);
  }
}

class DOMManipulator {
  /**
   * @description alias of document.queryselector
   * @param {String|String[]} cssSelector
   * @returns {Element}
   */
  get(cssSelector) {
    const isArray = Array.isArray(cssSelector);
    const useSelectors = isArray ? cssSelector : [cssSelector];
    const result = useSelectors.map(s => document.querySelector(s));
    return isArray ? result : result[0];
  }
}

class Storage {
  queue = [];
  locked = false;
  /**
   * @param {String[]} key
   * @returns {Promise<Object>}
   */
  get(key) {
    return new Promise(res => {
      chrome.storage.sync.get(key, res);
    });
  }

  /**
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  set(data) {
    return new Promise(res => {
      chrome.storage.sync.set(data, res);
    });
  }

  /**
   * @param {String} key
   * @param {String} value
   */
  add(key, value) {
    this.queue.push({ key, value });
    if (!this.locked) {
      this.equeue();
    }
  }

  /**
   * @description DO NOT call this method manually
   */
  async equeue() {
    this.locked = true;

    const { key, value } = this.queue.shift();
    // retrieve existed record
    const { [key]: existedValue = [] } = (await this.get([key])) || {};
    // transform non-Array value into array
    const useValue = Array.isArray(value) ? value : [value];
    // set new value
    await this.set({ [key]: [...existedValue, ...useValue] });
    if (this.queue.length) {
      // execute next action
      await this.equeue();
    } else {
      // do clean up
      this.locked = false;
      // notify popup to update UI
      communicator.toPopUp({
        action: 'UPDATE_VIEW',
      });
    }
  }
}

export const storage = new Storage();
export const dom = new DOMManipulator();
export const communicator = new Communicator();
