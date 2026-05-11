import * as utils from '@iobroker/adapter-core';

type AlarmMode = 'disarmed' | 'perimeter' | 'armed' | 'countdown' | 'alarm' | 'panic';

class AlarmSystemAdapter extends utils.Adapter {
  private mode: AlarmMode = 'disarmed';

  public constructor(options: Partial<utils.AdapterOptions> = {}) {
    super({ ...options, name: 'alarmsystem' });
    this.on('ready', this.onReady.bind(this));
    this.on('stateChange', this.onStateChange.bind(this));
  }

  private async onReady(): Promise<void> {
    await this.setStateAsync('runtime.mode', this.mode, true);
    await this.setStateAsync('runtime.alarmActive', false, true);

    this.subscribeStates('commands.armFull');
    this.subscribeStates('commands.armPerimeter');
    this.subscribeStates('commands.disarm');

    this.log.info('AlarmSystem adapter started');
    this.log.info('No secrets are preconfigured. Configure credentials in adapter settings.');
  }

  private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
    if (!state || state.ack) return;

    const localId = id.replace(this.namespace + '.', '');
    if (localId === 'commands.armFull' && state.val === true) {
      await this.transitionTo('armed');
      await this.setStateAsync('commands.armFull', false, true);
      return;
    }

    if (localId === 'commands.armPerimeter' && state.val === true) {
      await this.transitionTo('perimeter');
      await this.setStateAsync('commands.armPerimeter', false, true);
      return;
    }

    if (localId === 'commands.disarm' && state.val === true) {
      await this.transitionTo('disarmed');
      await this.setStateAsync('commands.disarm', false, true);
      return;
    }
  }

  private async transitionTo(next: AlarmMode): Promise<void> {
    if (this.mode === next) return;
    this.mode = next;
    await this.setStateAsync('runtime.mode', this.mode, true);
    await this.setStateAsync('runtime.alarmActive', this.mode === 'alarm' || this.mode === 'panic', true);
    this.log.info(`Mode changed to ${this.mode}`);
  }
}

if (require.main !== module) {
  module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new AlarmSystemAdapter(options);
} else {
  (() => new AlarmSystemAdapter())();
}
