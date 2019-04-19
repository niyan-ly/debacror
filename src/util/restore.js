import urlCompare from 'compare-urls';
import { mouseEvent, keyBoardEvent } from '../events';
import { dom, Storage, signal } from '.';

const executor = {
  click(target) {
    mouseEvent.call(target, 'mousedown');
    mouseEvent.call(target, 'mouseup');
    mouseEvent.call(target, 'click');
  },
  async input(target, value) {
    for (const c of value.split('')) {
      /** trigger event in sequence */
      keyBoardEvent.call(target, c, 'keydown');
      keyBoardEvent.call(target, c, 'keypress');

      target.value = `${target.value}${c}`;

      keyBoardEvent.call(target, c, 'input');
      keyBoardEvent.call(target, c, 'keyup');
      await delay(100);
    }
  },
  redirect(_, href) {
    location.href = href;
  },
};

async function delay(millisecond) {
  await new Promise(res => {
    setTimeout(res, millisecond);
  });
}

class Executor {
  constructor(snapshotName) {
    this.store = new Storage({ namespace: snapshotName });
  }

  /**
   * all method should call after init
   * @param {Number} step
   */
  async init(step) {
    this.record = await this.store.get();
    this.actions = this.record.actions || [];
    /** since step could be start from zero */
    if (typeof step === 'number') {
      this.index = step;
      return;
    }

    this.index = await this.findIndex();
  }

  async automate(duration = 400) {
    const isEnd = await this.step();
    if (!isEnd) {
      await delay(duration);
      await this.automate(duration);
    }
  }

  signStatu() {
    /** send current statu to background page */
    signal.toBackground({
      action: 'RESTORE_STATU',
      data: {
        step: this.index,
        name: this.store.namespace,
      },
    });
  }

  async step() {
    /** redirect to initialURL first */
    if (this.index < 0) {
      this.signStatu();
      executor.redirect(null, this.record.initialURL);
      this.index = 0;
      return this.index >= this.actions.length;
    }

    const { selector, type, value } = this.actions[this.index];
    const handler = executor[type];
    const isLastStep = this.index >= this.actions.length - 1;
    let target = null;

    if (type === 'redirect' && !isLastStep) {
      this.signStatu();
    } else {
      target = await this.retrieveElement(selector, 5, 300);
    }

    handler ? await handler(target, value) : null;

    this.index++;
    return this.index >= this.actions.length;
  }

  /**
   * @description try to get some element in specific behavior
   * @param {String} selector css selector
   * @param {Number} retryCount retry count
   * @param {Number} duration interval of each retry
   */
  retrieveElement(selector, retryCount, duration) {
    const middleMan = async (count) => {
      const target = dom.get(selector);
      if (!target && count > 0) {
        await delay(duration);
        return middleMan(count - 1);
      }

      return target;
    };

    return middleMan(retryCount);
  }

  /** decide from which node to exexute */
  async findIndex() {
    const urlIndex = this.actions.findIndex(item => {
      const typeMatch = item.type === 'redirect';
      const urlMatch =
        item.value && urlCompare(item.value, location.href);

      return typeMatch && urlMatch;
    });

    if (urlCompare(this.record.initialURL, location.href)) {
      return 0;
    }

    if (urlIndex > 0) {
      return urlIndex;
    }

    return -1;
  }
}

export { Executor };
