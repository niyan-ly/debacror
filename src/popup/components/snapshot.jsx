import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { Storage, signal } from '../../util';
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
        this.renderList.push({
          ...(await store.get()),
          name,
        });
      }
    }
  }

  mounted() {
    signal.onMessageForPopUp = request => {
      const executor = {
        UPDATE_VIEW: this.updateView.bind(this)
      };

      const handler = executor[request.action];
      handler ? handler(request) : null;
    };
  }

  removeItem(name) {
    signal.toBackground({
      action: 'RM_SNAPSHOT',
      data: {
        name
      },
    });
  }

  render() {
    return (
      <section class="snapshot">
        {this.renderList.map(
          ({ favIconUrl, description, time, name }) => (
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
                <p class="is-6">{description}</p>
                <p class="subtitle is-7">{time}</p>
              </div>
              <div class="column align-right">
                <div class="buttons is-right has-addons show-on-hover">
                  <a class="button is-small is-primary">restore</a>
                  <a
                    class="button is-small"
                    onClick={() => this.removeItem(name)}
                  >
                    <span class="is-small icon">
                      <i class="fas fa-times" />
                    </span>
                  </a>
                </div>
              </div>
            </div>
          ),
        )}
        <Empty
          empty={!this.renderList.length}
          tips="No Snapshot Captured"
        />
      </section>
    );
  }
}
