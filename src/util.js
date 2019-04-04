class Storage {
  /**
   * @param {String[]} key 
   */
  get(key) {
    return new Promise(res => {
      chrome.storage.sync.get(key, res)
    })
  }

  /**
   * @param {Object} data 
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
  async add(key, value) {
    const { [key]: existedValue = [] } = (await this.get([key])) || []
    const useValue = Array.isArray(value) ? value : [value]
    await this.set({[key]: [...existedValue, ...useValue]})
  }
}

const storage = new Storage()

export {
  storage
}