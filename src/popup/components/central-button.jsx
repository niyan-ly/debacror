import Component from 'vue-class-component';
import { signal } from '../../util';

@Component({
  props: {
    statu: String,
    allowShot: {
      type: Boolean,
      default: false,
    },
    allowClear: {
      type: Boolean,
      default: false,
    },
  },
})
export default class CentralButton {
  openCollapse = false;
  desc = '';

  get icon() {
    const statuMapper = {
      pause: 'play-circle',
      record: 'pause-circle',
      reload: 'redo',
    };

    return statuMapper[this.statu];
  }

  showSaveForm() {
    if (!this.allowShot) return;
    this.openCollapse = !this.openCollapse;
  }

  createSnapshot() {
    if (!this.desc)
      return;
    const condition = {
      active: true,
      currentWindow: true,
    };
    chrome.tabs.query(condition, ([tab]) => {
      signal.toBackground({
        action: 'CREATE_SNAPSHOT',
        data: {
          host: new URL(tab.url).hostname,
          ...tab,
          description: this.desc,
          time: new Date().toLocaleString()
        },
      });

      this.openCollapse = false;
      this.desc = '';
      this.$emit('capture');
    });
  }

  toggleRecord() {
    switch (this.statu) {
      case 'pause':
        this.$emit('start');
        break;
      case 'record':
        this.$emit('pause');
        break;
      case 'reload':
        this.$emit('reload');
        break;
    }
  }

  render() {
    return (
      <section>
        <div class="buttons has-addons is-centered">
          <a class={{button: true, 'is-danger': this.statu === 'record'}} onClick={this.toggleRecord}>
            <b-tooltip
              active={this.statu === 'reload'}
              label="this page need to reload."
              position="is-bottom"
              always
            >
              <b-icon size="is-small" pack="fas" icon={this.icon} />
              <span>Record</span>
            </b-tooltip>
          </a>
          <a
            class={{ button: true, 'is-primary': this.openCollapse }}
            onClick={this.showSaveForm}
            disabled={!this.allowShot}
          >
            <b-icon size="is-small" pack="fas" icon="camera" />
            <span>Shot</span>
          </a>
          <a
            class="button"
            disabled={!this.allowClear}
            onClick={() => this.$emit('clear')}
          >
            <span class="icon is-small">
              <i class="fas fa-broom" />
            </span>
            <span>Clear</span>
          </a>
        </div>
        <b-collapse open={this.openCollapse}>
          <b-field position="is-centered" style="margin-bottom:8px">
            <b-input
              value={this.desc}
              placeholder="Description..."
              type="search"
              icon="info"
              icon-pack="fas"
              maxlength={20}
              onInput={v => this.desc = v}
            />
            <p class="control">
              <button
                class="button is-primary"
                onClick={this.createSnapshot}
                disabled={!this.desc}
              >
                save
              </button>
            </p>
          </b-field>
        </b-collapse>
      </section>
    );
  }
}
