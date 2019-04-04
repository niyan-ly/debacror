class Storage {
  queue = []
  locked = false
  /**
   * @param {String[]} key 
   * @returns {Promise<Object>}
   */
  get(key) {
    return new Promise(res => {
      chrome.storage.sync.get(key, res)
    })
  }

  /**
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  set(data) {
    return new Promise(res => {
      chrome.storage.sync.set(data, res)
    })
  }

  /**
   * @param {String} key 
   * @param {String} value 
   */
  add(key, value) {
    this.queue.push({ key, value })
    if (!this.locked) {
      this.equeue()
    }
  }

  /**
   * @description DO NOT call this method manually
   */
  async equeue() {
    this.locked = true
    
    const { key, value } = this.queue.shift()
    // retrieve existed record
    const { [key]: existedValue = [] } = (await this.get([key])) || {}
    // transform non-Array value into array
    const useValue = Array.isArray(value) ? value : [value]
    // set new value
    await this.set({ [key]: [...existedValue, ...useValue] })
    if (this.queue.length) {
      // execute next action
      await this.equeue()
    } else {
      // do clean up
      this.locked = false
      // notify popup to update UI
      chrome.runtime.sendMessage({
        type: 'inner',
        action: 'update'
      })
    }
  }
}

const storage = new Storage()

export {
  storage
}