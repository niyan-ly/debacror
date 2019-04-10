import Vue from 'vue';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';

import App from './components/app';
import './style/style.css';
import './style/solid.min.css';
import './style/fontawesome.min.css';

Vue.use(Buefy);
Vue.component(
  'g-space',
  Vue.extend({
    render(h) {
      return <div style="display:inline-block;width: 8px;height:2px" />;
    },
  }),
);

new Vue({
  el: '#app',
  /**
   * since there is CSP restriction in chrome, we'd better use render function
   */
  render(h) {
    return <App />;
  },
});
