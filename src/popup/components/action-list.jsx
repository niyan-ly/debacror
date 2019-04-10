import Component from 'vue-class-component';
import ActionTag from './action-tag';

@Component({
  props: {
    dataSource: {
      type: Array,
      default: () => []
    }
  }
})
export default class ActionList {
  render() {
    return (
      <section class="action-list">
        {
          this.dataSource.map(d => (
            <ActionTag {...{props: d}} />
          ))
        }
      </section>
    );
  }
}
