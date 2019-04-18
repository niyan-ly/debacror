import urlCompare from 'compare-urls';
import { mouseEvent, keyBoardEvent } from '../events';
import { dom, Storage } from '.';

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
      await delay(200);
    }
  },
  redirect(href) {
    location.href = href;
  }
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
   */
  async init() {
    this.record = await this.store.get();
    this.actions = this.record.actions || [];
    this.index = await this.findIndex();
  }

  async automate(duration = 400) {
    const isEnd = await this.step();
    if (!isEnd) {
      await delay(duration);
      await this.automate(duration);
    }
  }

  step() {
    const { selector, type, value } = this.actions[this.index];

    if (this.index < 0) {
      executor.redirect(this.record.initialURL);
      this.index = 0;
      return this.index >= this.actions.length;
    }

    const handler = executor[type];
    handler ? handler(dom.get(selector), value) : null;

    this.index++;
    return this.index >= this.actions.length;
  }

  /** decide from which node to exexute */
  async findIndex() {
    const urlIndex = this.actions.findIndex(item => {
      const typeMatch = item.type === 'redirect';
      const urlMatch = item.value && urlCompare(item.value, location.href);
  
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

export {
  Executor
};
