import finder from '@medv/finder';
import { signal } from './util';
import { Executor } from './util/restore';

let EVENT_TARGET = null;
let HAS_INJECTED = false;

/**
 * @param {Event} param0
 */
function onInputEnd({ target }) {
  // ignore empty input action
  if (target.value) {
    const message = {
      action: 'SAVE',
      data: {
        type: 'input',
        selector: finder(target),
        value: target.value,
      },
    };

    signal.toBackground(message);
  }

  // blue mean this action is end-up
  target.removeEventListener('blur', onInputEnd);
  // reset record to null
  EVENT_TARGET = null;
}

/**
 * @param {Event} param0
 */
function inputListener({ target }) {
  /**
   * if event target hasn't been recorded,
   * means it's a new input action
   */
  if (target !== EVENT_TARGET) {
    // attach input listener
    target.addEventListener('blur', onInputEnd);
  }

  if (target === null) {
    // only record when new input action trigger
    EVENT_TARGET = target;
  }
}

/**
 * @param {Event} e
 */
function clickListener(e) {
  const message = {
    action: 'SAVE',
    data: {
      type: 'click',
      selector: finder(e.target),
    },
  };

  signal.toBackground(message);
}

/**
 * inject listener to web page
 */
function inject() {
  HAS_INJECTED = true;
  document.body.addEventListener('click', clickListener);
  document.body.addEventListener('input', inputListener);
}

/**
 * remove listener
 * NOTE: input listener will be removed automatically
 */
function detach() {
  document.body.removeEventListener('click', clickListener);
  HAS_INJECTED = false;
}

signal.onMessageForCS = (request, ...others) => {
  const executor = {
    START_RECORD({ from }) {
      inject();
      if (from === 'BG') {
        signal.toBackground({
          action: 'SAVE',
          data: {
            type: 'redirect',
            value: location.href,
          },
        });
      }
    },
    END_RECORD: detach,
    async RESTORE({ name }) {
      const run = new Executor(name);
      await run.init();
      await run.automate();
      console.log('done');
    },
    IS_RECORDING(request, sender, sendResponse) {
      sendResponse({
        result: HAS_INJECTED,
      });
    },
  };

  const doThis = executor[request.action];
  doThis ? doThis(request, ...others) : null;
};

/**
 * trigger when content script has been injected.
 */
signal.toBackground({
  action: 'AVAILABLE',
});
