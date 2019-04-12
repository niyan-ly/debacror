import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { Storage } from '../../util';
import Empty from './empty';

@Component({
  props: {
    selectedTabIndex: Boolean,
  },
})
export default class Snapshot {
  snapshotList = new Storage({ namespace: 'SNAPSHOT_NAME_LIST' });
  renderList = [];

  @Watch('selectedTabIndex')
  async updateView() {
    if (this.selectedTabIndex === 1) {
      this.renderList = [];
      const snapshotNames = await this.snapshotList.get('all');
      for (const name of snapshotNames || []) {
        const store = new Storage({ namespace: name });
        this.renderList.push(await store.get());
      }
    }
  }

  render() {
    return (
      <section style="padding-left:2rem">
        {this.renderList.map(({ favIconUrl, description }) => (
          <div class="columns is-mobile">
            <div class="column is-2">
              {favIconUrl ? (
                <figure class="image is-32x32">
                  <img class="is-rounded" src={favIconUrl} />
                </figure>
              ) : (
                <b-icon pack="fas" icon="question-circle" />
              )}
            </div>
            <div class="column">
              <span class="is-6">{description}</span>
            </div>
            <div class="column align-right">
              <div class="buttons is-right has-addons show-on-hover">
                <a class="button is-small is-primary">restore</a>
                <a class="button is-small">
                  <span class="is-small icon">
                    <i class="fas fa-times"></i>
                  </span>
                </a>
              </div>
            </div>
          </div>
        ))}
        <Empty
          empty={!this.renderList.length}
          tips="No Snapshot Captured"
        />
      </section>
    );
  }
}
