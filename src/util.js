/**
 * @enum {String}
 */
const EMsgType = {
  TO_CS: 'TO_CS',
  TO_BG: 'TO_BG',
  TO_POPUP: 'TO_POPUP',
};

function isEmpty(obj) {
  if (!obj) {
    return true;
  }

  if (Array.isArray(obj)) {
    return !obj.length;
  }

  if (typeof obj === 'object') {
    return !Object.getOwnPropertyNames(obj).length;
  }
}

class Signal {
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

/**
 * @description use this chrome storage helper for
 * namspaced storage and performance optimization.
 *
 * !NOTE: wait for [init] before doing anything.
 */
class Storage {
  /** indicate save action is busy or not */
  lock = false;
  /** cache the latest snapshot */
  cahce = null;

  constructor({ namespace = '' }) {
    this.namespace = namespace;
  }

  empty() {
    return new Promise(res => {
      chrome.storage.sync.remove(this.namespace, res);
    });
  }

  /**
   * @description return whole storage under namespace when receive empty param
   * @param {String} key
   */
  get(key) {
    return new Promise(res => {
      chrome.storage.sync.get(
        this.namespace,
        ({ [this.namespace]: result = {} }) => {
          res(key ? result[key] : result);
        },
      );
    });
  }

  /**
   * @param {String[]} keys
   */
  async getKeys(keys) {
    const store = await this.get();
    const r = {};

    keys.map(key => {
      r[key] = store[key];
    });

    return r;
  }

  /**
   * @param {Object} dictionary
   */
  async set(dictionary) {
    /** cache will always point to the newest snapshot */
    this.cahce = dictionary;
    /**
     * each save action will keep their own snapshot
     */
    await this.save(dictionary);
  }

  /**
   * @description internal called only
   * @private
   */
  async save(snapshot) {
    if (this.lock || !snapshot) return;

    const store = await this.get();

    await new Promise(async res => {
      chrome.storage.sync.set(
        {
          [this.namespace]: { ...store, ...snapshot },
        },
        async () => {
          /**
           * when cache has been updated after last save action,
           * then, an update to chrome storage is needed
           */
          if (this.cahce !== snapshot) {
            this.lock = false;
            await this.save(this.cahce);
          } else {
            /** notify popup page to update view */
            signal.toPopUp({
              action: 'UPDATE_VIEW',
            });
          }

          res();
        },
      );
    });
  }
}

export const dom = new DOMManipulator();
export const signal = new Signal();
export { Storage, isEmpty };
