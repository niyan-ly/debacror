import finder from '@medv/finder'

/**
 * @param {Event} e 
 */
function listener(e) {
  const message = {
    target: finder(e.target)
  }

  chrome.runtime.sendMessage(message)
}

function inject() {
  document.body.addEventListener('click', listener)
}

function detach() {
  document.body.removeEventListener('click', listener)
}

chrome.runtime.onMessage.addListener((request, sender) => {
  const executor = {
    START: inject,
    END: detach
  };

  const doThis = executor[request.action];
  doThis instanceof Function ? doThis() : null;
})