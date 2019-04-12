import Component from 'vue-class-component';

@Component({
  props: {
    url: {
      type: String,
      default: ''
    },
    favIconUrl: String
  }
})
export default class TabInfo {
  get urlHost() {
    return this.url ? new URL(this.url).host : '';
  }

  render() {
    return (
      <section>
        <b-taglist attached class="is-centered">
          <b-tag>
            <img src={this.favIconUrl} width="24px" />
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
