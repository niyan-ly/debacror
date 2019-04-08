import { storage, communicator } from './util';

communicator.onMessageForBG = ({ action, data }) => {
  if (action === 'SAVE') {
    storage.add('targets', data);
  }
};
