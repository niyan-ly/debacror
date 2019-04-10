import Component from 'vue-class-component';
import Logo from '../assets/logo.svg';
import { storage, communicator } from '../../util';
import AppFooter from './footer';
import ActionList from './action-list';
import CentralButton from './central-button';

@Component
export default class App {
  delayValue = 400;
  isRecording = false;
  records = [];
  needReload = false;
  /**
   * chrome tab filter
   */
  CONDITION = {
    active: true,
    currentWindow: true,
  };

  get recordStatu() {
    if (this.needReload) return 'reload';
    if (this.isRecording) {
      return 'pause';
    } else return 'record';
  }

  async mounted() {
    const messageHandler = {
      UPDATE_VIEW: this.updateView.bind(this),
    };

    communicator.onMessageForPopUp = request => {
      const handler = messageHandler[request.action];
      handler instanceof Function ? handler() : null;
    };

    chrome.tabs.query(this.CONDITION, ([tab]) => {
      communicator.toContentScript(
        tab.id,
        {
          action: 'IS_RECORDING',
        },
        /**
         * called without arguments and an error will be thrown
         * when message failed
         */
        response => {
          if (response) {
            this.isRecording = response.result;
          } else this.needReload = true;
        },
      );
    });

    this.updateView();
  }

  /**
   * fetch stored record
   */
  async fetchRecords() {
    const { targets = [] } = await storage.get(['targets']);

    return targets;
  }

  async updateView() {
    this.records = await this.fetchRecords();
  }

  startRecord() {
    this.isRecording = true;
    chrome.tabs.query(this.CONDITION, ([tab]) => {
      communicator.toContentScript(tab.id, {
        action: 'START_RECORD',
      });
    });
  }

  clearRecordHistory() {
    storage.set({ targets: [] });
    this.updateView();
  }

  stopRecord() {
    this.isRecording = false;
    chrome.tabs.query(this.CONDITION, ([tab]) => {
      communicator.toContentScript(tab.id, { action: 'END_RECORD' });
    });
  }

  restore() {
    chrome.tabs.query(this.CONDITION, ([tab]) => {
      communicator.toContentScript(tab.id, {
        action: 'RESTORE',
        delayValue: this.delayValue,
      });
    });
  }

  updateDelayValue(value) {
    this.delayValue = Number(value);
  }

  reloadCurrentPage() {
    chrome.tabs.reload();
    window.close();
  }

  render() {
    return (
      <div>
        <div class="bg-mask" />
        <div class="title is-5 app-top">
          <img src={Logo} width="32px" />
          <span class="title is-4">Chrome-Ext</span>
        </div>
        <b-tabs
          class="app-tab"
          position="is-centered"
          size="is-small"
          type="is-toggle"
        >
          <b-tab-item label="RECORD" icon-pack="fas" icon="video">
            <CentralButton
              type={this.recordStatu}
              onPause={this.stopRecord}
              onRecord={this.startRecord}
              onReload={this.reloadCurrentPage}
            />
            <p class="title is-5">Actions</p>
            <button class="button is-small" onClick={this.restore}>
              restore
            </button>
            <button class="button is-small" onClick={this.clearRecordHistory}>
              clean
            </button>
            <hr style="margin:8px 0;" />
            <ActionList dataSource={this.records} />
          </b-tab-item>
          <b-tab-item label="ACTIONS" icon-pack="fas" icon="history" />
        </b-tabs>
        <AppFooter />
      </div>
    );
  }
}
