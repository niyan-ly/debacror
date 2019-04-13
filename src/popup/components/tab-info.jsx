import Component from 'vue-class-component';
import { Storage, recordPrefix } from '../../util';

@Component
export default class TabInfo {
  url = '';

  get urlHost() {
    return this.url ? new URL(this.url).host : '';
  }

  mounted() {
    const currentTab = {
      active: true,
      currentWindow: true
    };
    chrome.tabs.query(currentTab, async ([tab]) => {
      const storage = new Storage({
        namespace: recordPrefix.concat(tab.id)
      });
      const origin = await storage.get('initialURL');
      this.url = origin || tab.url;
    });
  }

  render() {
    return (
      <section>
        <b-taglist attached class="is-centered">
          <b-tag>
            from
          </b-tag>
          <b-tag type="is-primary">
            {/* ? how to do filter in jsx */}
            <span>{this.urlHost}</span>
          </b-tag>
        </b-taglist>
      </section>
    );
  }
}
