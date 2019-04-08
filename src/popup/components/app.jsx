import Component from 'vue-class-component';
import Logo from '../assets/logo.svg';
import { storage, communicator } from '../../util'
import AppFooter from './footer'

@Component
export default class App {

  delayValue = 400
  isRecording = false
  records = []
  /**
   * chrome tab filter
   */
  CONDITION = {
    active: true,
    currentWindow: true
  }

  async mounted() {
    const messageHandler = {
      UPDATE_VIEW: this.updateView.bind(this)
    }

    communicator.onMessageForPopUp = request => {
      const handler = messageHandler[request.action]
      handler instanceof Function ? handler() : null;
    }

    chrome.tabs.query(this.CONDITION, ([tab]) => {
      communicator.toContentScript(tab.id, {
        action: 'IS_RECORDING'
      }, ({ result = false }) => {
        this.isRecording = result
      })
    })

    this.updateView()
  }

  /**
   * fetch stored record
   */
  async fetchRecords() {
    const { targets = [] } = await storage.get(['targets'])

    return targets
  }

  async updateView() {
    this.records = await this.fetchRecords();
  }

  startRecord() {
    this.isRecording = true
    chrome.tabs.query(this.CONDITION, ([tab]) => {
      communicator.toContentScript(tab.id, {
        action: 'START_RECORD'
      })
    });
  }

  clearRecordHistory() {
    storage.set({ targets: [] })
    this.updateView()
  }

  stopRecord() {
    this.isRecording = false
    chrome.tabs.query(this.CONDITION, ([tab]) => {
      communicator.toContentScript(tab.id, { action: 'END_RECORD' })
    })
  }

  restore() {
    chrome.tabs.query(this.CONDITION, ([tab]) => {
      communicator.toContentScript(tab.id, {
        action: 'RESTORE',
        delayValue: this.delayValue
      })
    })
  }

  updateDelayValue(value) {
    this.delayValue = Number(value)
  }

  render(h) {
    return (
      <div>
        <div class="bg-mask"></div>
        <div class="title is-5 app-top">
          <img src={Logo} width="32px" />
          <span class="title is-4">Chrome-Ext</span>
        </div>
        <b-tabs class="app-tab" position="is-centered" size="is-small" type="is-toggle">
          <b-tab-item label="RECORD" icon-pack="fas" icon="video">
            <div>
              {
                this.isRecording
                ? <button class="record-button button is-primary is-large" onClick={this.stopRecord}>
                    <b-icon pack="fas" icon="pause-circle"></b-icon>
                  </button>
                : <button class="record-button button is-primary is-large" onClick={this.startRecord}>
                    <b-icon pack="fas" icon="play-circle"></b-icon>
                  </button>
              }
              {/* <button class="button is-small stop-record" onClick={this.stopRecord}>stop</button> */}
              <b-input min="0" size="is-small" type="number" onInput={this.updateDelayValue} value={this.delayValue} />
              <button class="restore-button button is-primary is-small" onClick={this.restore}>restore</button>
              <br />
            </div>
            <ul>
              {
                this.records.map(({ action, value, target }) => (
                  <li>
                    {action} -> {target} -> <span style="color:red;">{value}</span>
                  </li>
                ))
              }
            </ul>
          </b-tab-item>
          <b-tab-item label="ACTIONS" icon-pack="fas" icon="history"></b-tab-item>
        </b-tabs>
        <AppFooter />
      </div>
    )
  }
}