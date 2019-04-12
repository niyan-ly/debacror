import Component from 'vue-class-component';
import Logo from '../assets/logo.svg';
import { Storage, signal } from '../../util';
// import AppFooter from './footer';
import ActionList from './action-list';
import CentralButton from './central-button';
import Snapshot from './snapshot';
import TabInfo from './tab-info';

@Component
export default class App {
  isRecording = false;
  records = [];
  store = null;
  needReload = false;
  selectedTabIndex = 0;
  /** current tab */
  tab = {};
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
      return 'record';
    } else return 'pause';
  }

  async mounted() {
    const messageHandler = {
      UPDATE_VIEW: this.updateView.bind(this),
    };

    signal.onMessageForPopUp = request => {
      const handler = messageHandler[request.action];
      handler instanceof Function ? handler() : null;
    };

    chrome.tabs.query(this.CONDITION, ([tab]) => {
      this.tab = tab;
      this.store = new Storage({
        namespace: new URL(tab.url).hostname
      });

      this.updateView();

      signal.toContentScript(
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
  }

  /**
   * fetch stored record
   */
  async fetchRecords() {
    const record = await this.store.get(this.tab.url);

    return record && record.actions || [];
  }

  async updateView() {
    this.records = await this.fetchRecords();
  }

  startRecord() {
    this.isRecording = true;
    chrome.tabs.query(this.CONDITION, ([tab]) => {
      signal.toContentScript(tab.id, {
        action: 'START_RECORD',
      });
    });
  }

  async clearRecordHistory() {
    await this.store.set({
      [this.tab.url]: {}
    });
    this.updateView();
  }

  stopRecord() {
    this.isRecording = false;
    chrome.tabs.query(this.CONDITION, ([tab]) => {
      signal.toContentScript(tab.id, { action: 'END_RECORD' });
    });
  }

  // restore() {
  //   chrome.tabs.query(this.CONDITION, ([tab]) => {
  //     signal.toContentScript(tab.id, {
  //       action: 'RESTORE',
  //       delayValue: this.delayValue,
  //     });
  //   });
  // }

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
          onChange={index => (this.selectedTabIndex = index)}
        >
          <b-tab-item label="RECORD" icon-pack="fas" icon="video">
            <CentralButton
              statu={this.recordStatu}
              allow-shot={this.records.length}
              allow-clear={this.records.length}
              onStart={this.startRecord}
              onPause={this.stopRecord}
              onReload={this.reloadCurrentPage}
              onClear={this.clearRecordHistory}
            />
            <TabInfo
              url={this.tab.url}
              favIconUrl={this.tab.favIconUrl}
            />
            <p class="title is-5">Actions</p>
            <hr style="margin:8px 0;" />
            <ActionList data-source={this.records} />
          </b-tab-item>
          <b-tab-item
            label="SNAPSHOTS"
            icon-pack="fas"
            icon="history"
          >
            <Snapshot selected-tab-index={this.selectedTabIndex} />
          </b-tab-item>
        </b-tabs>
        {/* <AppFooter /> */}
      </div>
    );
  }
}
