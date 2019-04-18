import { EventEmitter } from 'events';

/**
 * @description use this chrome storage helper for
 * namspaced storage and performance optimization.
 *
 * !NOTE: wait for [init] before doing anything.
 */
class Storage extends EventEmitter {
  /** indicate save action is busy or not */
  lock = false;
  /** cache the latest snapshot */
  cahce = null;

  constructor({ namespace = '' }) {
    super();
    this.namespace = namespace;
    chrome.storage.onChanged.addListener((...args) => {
      this.emit('change', ...args);
    });
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
          }

          res();
        },
      );
    });
  }
}

export {
  Storage
};
