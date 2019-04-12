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
  set(dictionary) {
    /** cache will always point to the newest snapshot */
    this.cahce = dictionary;
    /**
     * each save action will keep their own snapshot
     */
    this.save(dictionary);
  }

  /** 
   * @description internal called only
   * @private
   */
  async save(snapshot) {
    if (this.lock || !snapshot) return;

    const store = await this.get();

    chrome.storage.sync.set(
      {
        [this.namespace]: { ...store, ...snapshot },
      },
      () => {
        /**
         * when cache has been updated after last save action,
         * then, an update to chrome storage is needed
         */
        if (this.cahce !== snapshot) {
          this.lock = false;
          this.save(this.cahce);
        } else {
          /** notify popup page to update view */
          communicator.toPopUp({
            action: 'UPDATE_VIEW',
          });
        }
      },
    );
  }
}

/**
 * @description A Record means a series of actions
 * Record could manipulate actions
 */
class Record {
  /**
   * @typedef Action
   * @type {Object}
   * @property {Number} id
   * @property {String} selector
   * @property {String} type event type
   * @property {String} value
   */

  constructor({ name }) {
    this.storage = new Storage({ namespace: name });
  }

  setInfo({ description, url }) {
    this.storage.set({
      description,
      url,
    });
  }

  getInfo() {
    return this.storage.getKeys(['name', 'description', 'url']);
  }

  /**
   * - create a new namespace
   * - copy existed data under instance namespace into new one,
   * - point [this.storage] to new namespace
   * - free occupied space
   */
  async rename(name) {
    const newStore = new Storage({ namespace: name });
    const originStoreContent = this.storage.get();
    newStore.set(originStoreContent);
    this.storage = newStore;
    this.storage.empty();
  }

  getActions() {
    return this.storage.get('actions');
  }

  /**
   * @param  {Action[]} actions
   */
  async addActions(...actions) {
    const savedActions = (await this.getActions()) || [];

    savedActions.push(
      ...actions.map((action, index) => ({
        ...action,
        id: savedActions.length + index,
      })),
    );

    this.storage.set({
      actions: savedActions,
    });
  }
}

export const dom = new DOMManipulator();
export const communicator = new Communicator();
export { Storage, Record };
