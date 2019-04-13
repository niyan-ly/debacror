import Vue from 'vue';
import Buefy from 'buefy';

import App from './components/app';
import './style/style.scss';
import './style/solid.min.css';
import './style/fontawesome.min.css';

Vue.use(Buefy);

new Vue({
  el: '#app',
  /**
   * since there is CSP restriction in chrome, we'd better use render function
   */
  render() {
    return <App />;
  },
});
