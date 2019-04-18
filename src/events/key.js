import keycode from 'keycode';

function keyBoardEvent(character, eventType) {
  const digitReg = /[0-9]/;
  const lowerCaseReg = /a-z/;
  const capitalReg = /A-Z/;
  const event = new Event(eventType, {
    bubbles: true,
    cancelable: true,
  });
  
  event.key = character;

  if (digitReg.test(character)) {
    event.keyCode = keycode(String(character));
    event.code = `Digit${character}`;
  }
  else if (lowerCaseReg.test(character)) {
    event.keyCode = keycode(character);
    event.code = `Key${character.toUpperCase()}`;
  }
  else if (capitalReg.test(character)) {
    event.keyCode = keycode(character);
    event.code = `Key${character}`;
    /** ignore unspported character type */
  } else return;

  this.dispatchEvent(event);
}

export {
  keyBoardEvent
};
