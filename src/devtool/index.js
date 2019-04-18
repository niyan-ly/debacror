import Vue from 'vue';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';

import App from './app';
import { Storage } from '../util';

Vue.use(Buefy);
const store = new Storage({
  namespace: 'SNAPSHOT_NAME_LIST',
});

new Vue({
  el: '#app',
  render() {
    return <App store={store} style="user-select:none" />;
  },
});
