import Component from 'vue-class-component';

@Component({
  props: {
    type: String,
    selector: String,
    value: [String, Number],
  },
})
export default class ActionTag {
  get actionType() {
    const actionMap = {
      input: 'is-info',
      click: 'is-warning',
    };

    return actionMap[this.type];
  }

  get valueLength() {
    const value = this.value || '';
    return value.length > 10 ? 10 : value.length;
  }

  cut(str = '', length = 8) {
    const substr = str.substr(0, length).concat('...');

    return str.length > length ? substr : str;
  }

  render() {
    return (
      <section class="action-tag">
        <b-taglist attached>
          <b-tag type={this.actionType}>{this.type}</b-tag>
          <b-tag>
            <b-tooltip
              position="is-bottom"
              label={this.selector}
              size="is-small"
              type="is-dark"
              multilined
            >
              {this.cut(this.selector, 26 - this.valueLength)}
            </b-tooltip>
          </b-tag>
          {this.value ? (
            <b-tag type="is-dark">
              <b-tooltip
                position="is-bottom"
                label={this.value}
                size="is-small"
                type="is-dark"
                multilined
              >
                {this.cut(this.value, this.valueLength)}
              </b-tooltip>
            </b-tag>
          ) : (
            <span />
          )}
          <b-tag class="tag-close">
            <b-icon pack="fas" icon="times" />
          </b-tag>
        </b-taglist>
      </section>
    );
  }
}
