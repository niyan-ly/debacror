import Component from 'vue-class-component';

@Component({
  props: {
    action: String,
    target: String,
    value: [String, Number],
  },
})
export default class ActionTag {
  get actionType() {
    const actionMap = {
      input: 'is-info',
      click: 'is-warning',
    };

    return actionMap[this.action];
  }

  cut(str = '') {
    const maxLength = 12;
    const substr = str.substr(0, maxLength).concat('...');

    return str.length > maxLength ? substr : str;
  }

  render(h) {
    return (
      <section class="action-tag">
        <b-tag type={this.actionType}>{this.action}</b-tag>
        <span class="title is-6">{this.target}</span>
        <span class="action-tag--content">
          {this.cut(this.value)}
        </span>
      </section>
    );
  }
}
