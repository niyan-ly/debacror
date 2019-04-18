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

export const dom = new DOMManipulator();
export const recordPrefix = 'TEMP-';
export { signal } from './signal';
export { Storage } from './storage';
export { isEmpty };
