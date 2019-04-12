import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { Storage } from '../../util';
import Empty from './empty';

@Component({
  props: {
    selectedTabIndex: Boolean
  }
})
export default class Snapshot {

  snapshotList = new Storage({ namespace: 'SNAPSHOT_NAME_LIST' });
  renderList = [];
  
  @Watch('selectedTabIndex')
  async updateView() {
    if (this.selectedTabIndex === 1) {
      this.renderList = (await this.snapshotList.get('all')) || [];
    }
  }
  
  render() {
    return (
      <section>
        {
          this.renderList.map(name => (
            <p class="title is-5">{ name }</p>
          ))
        }
        <Empty empty={!this.renderList.length} tips="No Snapshot Captured" />
      </section>
    );
  }
}
