import Component from 'vue-class-component';
import ActionTag from './action-tag';
import Empty from './empty';

@Component({
  props: {
    dataSource: {
      type: Array,
      default: () => [],
    },
  },
})
export default class ActionList {
  render() {
    return (
      <section class="action-list is-right">
        {this.dataSource.map(d => (
          <ActionTag {...{ props: d }} />
        ))}
        <Empty
          empty={!this.dataSource.length}
          tips="No Action Recorded"
        />
      </section>
    );
  }
}
