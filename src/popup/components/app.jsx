import Component from 'vue-class-component';
import Logo from '../assets/logo.svg';
import { Storage, signal, recordPrefix } from '../../util';
// import AppFooter from './footer';
import ActionList from './action-list';
import CentralButton from './central-button';
import Snapshot from './snapshot';
import TabInfo from './tab-info';

@Component
export default class App {
  isRecording = false;
  actions = [];
  /**
   * @type {Storage}
   */
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
        namespace: recordPrefix.concat(tab.id),
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
  async fetchActions() {
    const actions = await this.store.get('actions');

    return actions || [];
  }

  async updateView() {
    this.actions = await this.fetchActions();
    console.log(this.actions);
  }

  startRecord() {
    this.isRecording = true;
    chrome.tabs.query(this.CONDITION, ([tab]) => {
      signal.broadcast(tab.id, {
        action: 'START_RECORD',
        data: tab,
      });
    });
  }

  async clearRecordHistory() {
    await this.store.empty();
    this.updateView();
  }

  stopRecord() {
    this.isRecording = false;
    chrome.tabs.query(this.CONDITION, ([tab]) => {
      signal.broadcast(tab.id, {
        action: 'END_RECORD',
        data: tab
      });
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
          <span class="title is-4">debacror</span>
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
              allow-shot={this.actions.length}
              allow-clear={this.actions.length}
              onStart={this.startRecord}
              onPause={this.stopRecord}
              onReload={this.reloadCurrentPage}
              onClear={this.clearRecordHistory}
            />
            <TabInfo />
            <p class="title is-5">Actions</p>
            <hr style="margin:8px 0;" />
            <ActionList data-source={this.actions} />
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
