import finder from '@medv/finder';
import { communicator, Storage, dom } from './util';

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

    communicator.toBackground(message);
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

  communicator.toBackground(message);
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

async function delay(millisecond) {
  await new Promise(res => {
    setTimeout(res, millisecond);
  });
}

async function restore({ delayValue = 400 }) {
  const store = new Storage({ namespace: location.hostname });
  const record = await store.get(location.href);

  for (const action of record.actions) {
    const element = dom.get(action.selector);
    await delay(Number(delayValue));

    if (action.type === 'input') {
      element.value = action.value;
      action.value &&
        action.value.split('').map(letter => {
          const event = new Event('input', {
            bubbles: true,
            cancelable: true,
            data: letter,
          });

          element.dispatchEvent(event);
        });
    }

    if (action.type === 'click') {
      const event = new Event('click', {
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(event);
    }
  }
}

communicator.onMessageForCS = (request, ...others) => {
  const executor = {
    START_RECORD: inject,
    END_RECORD: detach,
    RESTORE: restore,
    IS_RECORDING(request, sender, sendResponse) {
      sendResponse({
        result: HAS_INJECTED,
      });
    },
  };

  const doThis = executor[request.action];
  doThis instanceof Function ? doThis(request, ...others) : null;
};

/**
 * tell extesion is available or not
 */
communicator.toBackground({
  action: 'AVAILABLE'
});
