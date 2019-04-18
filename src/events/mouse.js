function mouseEvent(eventName) {
  const event = new Event(eventName, {
    bubbles: true,
    cancelable: true
  });
  this.dispatchEvent(event);
}

export {
  mouseEvent
};
