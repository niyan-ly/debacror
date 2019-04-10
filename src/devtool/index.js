// import Vue from 'vue';
// import Buefy from 'buefy';
// import 'buefy/dist/buefy.css';

// import App from './app';

// Vue.use(Buefy);

// new Vue({
//   el: '#app',
//   render(h) {
//     return <App />;
//   }
// });
chrome.devtools.panels.create(
  'My Panel',
  'MyPanelIcon.png',
  'Panel.html',
  function() {
    // code invoked on panel creation
  },
);
