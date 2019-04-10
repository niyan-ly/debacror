import Component from 'vue-class-component';

@Component({
  props: {
    type: String,
  },
})
export default class CentralButton {
  get icon() {
    const typeMapper = {
      pause: 'pause-circle',
      record: 'play-circle',
      reload: 'redo',
    };

    return typeMapper[this.type];
  }

  render(h) {
    return (
      <b-tooltip
        label="need reload"
        active={this.type === 'reload'}
        position="is-bottom"
        type="is-dark"
        always
      >
        <button
          class="record-button button is-primary is-large"
          onClick={() => this.$emit(this.type)}
        >
          <b-icon pack="fas" icon={this.icon} />
        </button>
      </b-tooltip>
    );
  }
}
