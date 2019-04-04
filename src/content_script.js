import finder from '@medv/finder'

let EVENT_TARGET = null

/**
 * @param {Event} param0 
 */
function onInputEnd({ target }) {
  // ignore empty input action
  if (target.value) {
    const message = {
      type: 'outer',
      action: 'input',
      target: finder(target),
      value: target.value
    }

    chrome.runtime.sendMessage(message)
  }

  // blue mean this action is end-up
  target.removeEventListener('blur', onInputEnd)
  // reset record to null
  EVENT_TARGET = null
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
    target.addEventListener('blur', onInputEnd)
  }

  if (target === null) {
    // only record when new input action trigger
    EVENT_TARGET = target
  }
}

/**
 * @param {Event} e 
 */
function clickListener(e) {
  const message = {
    type: 'outer',
    action: 'click',
    target: finder(e.target)
  }

  chrome.runtime.sendMessage(message)
}

/**
 * inject listener to web page
 */
function inject() {
  document.body.addEventListener('click', clickListener)
  document.body.addEventListener('input', inputListener)
}

/**
 * remove listener
 * NOTE: input listener will be removed automatically
 */
function detach() {
  document.body.removeEventListener('click', clickListener)
}

chrome.runtime.onMessage.addListener((request, sender) => {
  const executor = {
    START: inject,
    END: detach
  };

  const doThis = executor[request.action];
  doThis instanceof Function ? doThis() : null;
})