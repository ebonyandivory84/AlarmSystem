import * as utils from '@iobroker/adapter-core';

type AlarmMode = 'disarmed' | 'perimeter' | 'armed' | 'countdown' | 'alarm' | 'panic';
type SensorGroup = 'doors' | 'windows' | 'motions' | 'cameraHumans';

interface SensorDef {
  key: string;
  id: string;
  label: string;
  group: SensorGroup;
  activeValues: Array<string | boolean | number>;
  perimeterRelevant?: boolean;
}

interface CameraDef {
  key: string;
  label: string;
  humanStateId: string;
  snapshotUrlTemplate: string;
  streamUrl?: string;
  username?: string;
  password?: string;
  reolinkAlarmId?: string;
  reolinkAlarmOnValue?: number;
  reolinkAlarmOffValue?: number;
  reolinkFlashlightId?: string;
  flashlightDurationMs?: number;
}

interface PinCommand {
  sequence: string;
  action: 'garageOpen' | 'garageClose' | 'pdlcOpen' | 'pdlcClose' | 'armFull' | 'armPerimeter' | 'disarm' | 'panicOn' | 'panicOff';
}

interface AlarmConfig {
  countdownSec: number;
  dedupeMs: number;
  armStateId: string;
  perimeterStateId: string;
  countdownStateId: string;
  sirenStateId: string;
  triggerStateId: string;
  displayId: string;
  clearDisplayId: string;
  buzzerId: string;
  ledRedId: string;
  ledYellowId: string;
  standbyId: string;
  motionSensorId: string;
  panicStateId: string;
  speakId: string;
  garageDoorCommandId: string;
  garageOpenValue: number;
  garageCloseValue: number;
  pdlcId: string;
  pdlcOpenValue: boolean;
  pdlcCloseValue: boolean;
  fingerprintStateId: string;
  fingerprintUsers: string[];
  presenceIds: string[];
  autoArmDelaySec: number;
  sensors: SensorDef[];
  cameras: CameraDef[];
  pinCommands: PinCommand[];
  telegramEnabled: boolean;
  telegramInstance: string;
  telegramChatIds: string[];
}

class AlarmSystemAdapter extends utils.Adapter {
  private mode: AlarmMode = 'disarmed';
  private configParsed!: AlarmConfig;
  private sensorState = new Map<string, boolean>();
  private dedupe = new Map<string, number>();
  private countdownTimer: ioBroker.Timeout | null = null;
  private countdownTickTimer: ioBroker.Interval | null = null;
  private countdownRemainingSec = 0;
  private standbyTimer: ioBroker.Timeout | null = null;
  private autoArmTimer: ioBroker.Timeout | null = null;
  private displayTimer: ioBroker.Interval | null = null;
  private openDisplayQueue: string[] = [];
  private pinBuffer = '';
  private lastTrigger = '';

  public constructor(options: Partial<utils.AdapterOptions> = {}) {
    super({ ...options, name: 'alarmsystem' });
    this.on('ready', this.onReady.bind(this));
    this.on('stateChange', this.onStateChange.bind(this));
  }

  private async onReady(): Promise<void> {
    this.configParsed = this.buildConfig();
    await this.initRuntimeStates();
    await this.subscribeStates('*');
    await this.subscribeForeignInputs();
    await this.refreshSensorStates();
    await this.updateLedAndStatus();
    this.log.info('AlarmSystem adapter started');
  }

  private buildConfig(): AlarmConfig {
    const n = this.config as Record<string, any>;

    const defaultSensors = [
      { key: 'entrance', id: 'mqtt.1.entrance_door_status', label: 'Haustuer', group: 'doors', activeValues: ['open'], perimeterRelevant: true },
      { key: 'sideEntrance', id: 'mqtt.1.side_entrance_door_status', label: 'Nebeneingang', group: 'doors', activeValues: ['open'], perimeterRelevant: true },
      { key: 'terrace', id: 'mqtt.1.terrace_door_status', label: 'Terrassentuer', group: 'doors', activeValues: ['open'], perimeterRelevant: true },
      { key: 'shed', id: 'mqtt.1.Garage.shedDoorStatus', label: 'Schuppentuer', group: 'doors', activeValues: ['open'], perimeterRelevant: true },
      { key: 'wcWindow', id: 'mqtt.1.WC_children.windowStatus', label: 'Fenster KiBa', group: 'windows', activeValues: ['open'], perimeterRelevant: true },
      { key: 'entranceMotion', id: 'mqtt.1.entrance_motion_sensor', label: 'Bewegung Eingang', group: 'motions', activeValues: ['motion detected'] },
      { key: 'livingMotion', id: 'mqtt.1.living_motion_sensor', label: 'Bewegung Wohnzimmer', group: 'motions', activeValues: ['motion detected'] },
      { key: 'camBackyard', id: 'mqtt.2.HumanDetection.CamBackyard', label: 'Cam Backyard', group: 'cameraHumans', activeValues: ['human detected', true] },
      { key: 'camBalkonyNorth', id: 'mqtt.2.HumanDetection.CamBalkonyNorth', label: 'Cam Balkony North', group: 'cameraHumans', activeValues: ['human detected', true] },
      { key: 'camBalkonySouth', id: 'mqtt.2.HumanDetection.CamBalkonySouth', label: 'Cam Balkony South', group: 'cameraHumans', activeValues: ['human detected', true] },
      { key: 'camFrontLeft', id: 'mqtt.2.HumanDetection.CamFrontyardLeft', label: 'Cam Frontyard Left', group: 'cameraHumans', activeValues: ['human detected', true] },
      { key: 'camFrontRight', id: 'mqtt.2.HumanDetection.CamFrontyardRight', label: 'Cam Frontyard Right', group: 'cameraHumans', activeValues: ['human detected', true] },
      { key: 'camTerrace', id: 'mqtt.2.HumanDetection.CamTerrace', label: 'Cam Terrace', group: 'cameraHumans', activeValues: ['human detected', true] }
    ] as SensorDef[];

    const defaultCameras = [
      {
        key: 'balkonySouth',
        label: 'Balkony South',
        humanStateId: 'mqtt.2.reolink.HumanDetection.CamBalkonySouth',
        snapshotUrlTemplate: 'http://192.168.44.37/cgi-bin/api.cgi?cmd=Snap&channel=0&rs=wuuPhkmUCeI9WG7C&user={username}&password={password}',
        streamUrl: 'rtsp://{username}:{password}@192.168.44.37:554/h264Preview_01_main',
        reolinkAlarmId: 'reolink.3.settings.playAlarm',
        reolinkAlarmOnValue: 1,
        reolinkAlarmOffValue: 0,
        reolinkFlashlightId: 'reolink.3.settings.switchLed',
        flashlightDurationMs: 10000
      },
      {
        key: 'balkonyNorth',
        label: 'Balkony North',
        humanStateId: 'mqtt.2.HumanDetection.CamBalkonyNorth',
        snapshotUrlTemplate: 'http://192.168.44.31:8765/picture/6/current/',
        streamUrl: 'rtsp://{username}:{password}@192.168.44.31:554/stream1'
      },
      {
        key: 'frontyardRight',
        label: 'Frontyard Right',
        humanStateId: 'mqtt.2.HumanDetection.CamFrontyardRight',
        snapshotUrlTemplate: 'http://192.168.44.31:8765/picture/5/current/',
        streamUrl: 'rtsp://{username}:{password}@192.168.44.31:554/stream2'
      },
      {
        key: 'frontyardLeft',
        label: 'Frontyard Left',
        humanStateId: 'mqtt.2.reolink.HumanDetection.CamFrontyard',
        snapshotUrlTemplate: 'http://192.168.44.248/cgi-bin/api.cgi?cmd=Snap&channel=0&rs=wuuPhkmUCeI9WG7C&user={username}&password={password}',
        streamUrl: 'rtsp://{username}:{password}@192.168.44.248:554/h264Preview_01_main',
        reolinkAlarmId: 'reolink.1.settings.playAlarm',
        reolinkAlarmOnValue: 1,
        reolinkAlarmOffValue: 0,
        reolinkFlashlightId: 'reolink.1.settings.switchLed',
        flashlightDurationMs: 10000
      },
      {
        key: 'backyard',
        label: 'Backyard',
        humanStateId: 'mqtt.2.reolink.HumanDetection.CamBackyard',
        snapshotUrlTemplate: 'http://192.168.44.249/cgi-bin/api.cgi?cmd=Snap&channel=0&rs=wuuPhkmUCeI9WG7C&user={username}&password={password}',
        streamUrl: 'rtsp://{username}:{password}@192.168.44.249:554/h264Preview_01_main',
        reolinkAlarmId: 'reolink.0.settings.playAlarm',
        reolinkAlarmOnValue: 1,
        reolinkAlarmOffValue: 0,
        reolinkFlashlightId: 'reolink.0.settings.switchLed',
        flashlightDurationMs: 10000
      },
      {
        key: 'terrace',
        label: 'Terrace',
        humanStateId: 'mqtt.2.reolink.HumanDetection.CamTerrace',
        snapshotUrlTemplate: 'http://192.168.44.251/cgi-bin/api.cgi?cmd=Snap&channel=0&rs=wuuPhkmUCeI9WG7C&user={username}&password={password}',
        streamUrl: 'rtsp://{username}:{password}@192.168.44.251:554/h264Preview_01_main',
        reolinkAlarmId: 'reolink.2.settings.playAlarm',
        reolinkAlarmOnValue: 1,
        reolinkAlarmOffValue: 0,
        reolinkFlashlightId: 'reolink.2.settings.switchLed',
        flashlightDurationMs: 10000
      }
    ] as CameraDef[];

    const sensors = this.tryJson<SensorDef[]>(n.sensorsJson, defaultSensors);
    const cameras = this.tryJson<CameraDef[]>(n.camerasJson, defaultCameras).map(c => ({
      ...c,
      username: c.username ?? n.cameraDefaultUsername ?? '',
      password: c.password ?? n.cameraDefaultPassword ?? ''
    }));
    const pinCommands = this.tryJson<PinCommand[]>(n.pinCommandsJson, [
      { sequence: '*1', action: 'garageOpen' },
      { sequence: '*2', action: 'garageClose' },
      { sequence: '*4', action: 'pdlcOpen' },
      { sequence: '*5', action: 'pdlcClose' }
    ]);

    return {
      countdownSec: this.toNumber(n.defaultCountdownSec, 20),
      dedupeMs: this.toNumber(n.eventDedupeMs, 1000),
      armStateId: n.armStateId || 'mqtt.1.AlarmCenter.AlarmSystemArmed',
      perimeterStateId: n.perimeterStateId || 'mqtt.1.AlarmCenter.PerimeterProtection',
      countdownStateId: n.countdownStateId || 'mqtt.1.AlarmCenter.ActivateAlarmCountdown',
      sirenStateId: n.sirenStateId || 'mqtt.1.AlarmCenter.ActivateSiren',
      triggerStateId: n.triggerStateId || 'mqtt.1.AlarmCenter.AlarmTrigger',
      displayId: n.displayId || 'mqtt.1.AlarmCenter.Display',
      clearDisplayId: n.clearDisplayId || 'mqtt.1.AlarmCenter.ClearDisplay',
      buzzerId: n.buzzerId || 'mqtt.1.AlarmCenter.Buzzer',
      ledRedId: n.ledRedId || 'mqtt.1.AlarmCenter.LEDRingRed',
      ledYellowId: n.ledYellowId || 'mqtt.1.AlarmCenter.LEDRingYellow',
      standbyId: n.standbyId || 'mqtt.1.AlarmCenter.StandBy',
      motionSensorId: n.motionSensorId || 'mqtt.1.AlarmCenter.MotionSensor',
      panicStateId: n.panicStateId || '0_userdata.0.AlarmSystem.panic',
      speakId: n.speakId || 'alexa2.0.Echo-Devices.90F0081872670ASA.Commands.speak',
      garageDoorCommandId: n.garageDoorCommandId || 'hmip.0.devices.3014F711A000241F29970E70.channels.1.doorCommand',
      garageOpenValue: this.toNumber(n.garageOpenValue, 0),
      garageCloseValue: this.toNumber(n.garageCloseValue, 2),
      pdlcId: n.pdlcId || 'tuya.0.bf2bb23b342877f2e1maqy.1',
      pdlcOpenValue: n.pdlcOpenValue !== false,
      pdlcCloseValue: n.pdlcCloseValue === true ? true : false,
      fingerprintStateId: n.fingerprintStateId || 'mqtt.1.fingerprintDoorbell.lastLogMessage',
      fingerprintUsers: String(n.fingerprintUsersCsv || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      presenceIds: this.tryJson<string[]>(n.presenceIdsJson, [
        '0_userdata.0.presence_geofence.Sebastian',
        '0_userdata.0.presence_geofence.Teresa',
        '0_userdata.0.presence_at_home.Sebastian',
        '0_userdata.0.presence_at_home.Teresa'
      ]),
      autoArmDelaySec: this.toNumber(n.autoArmDelaySec, 60),
      sensors,
      cameras,
      pinCommands,
      telegramEnabled: !!n.telegram?.enabled,
      telegramInstance: n.telegram?.instance || 'telegram.1',
      telegramChatIds: String(n.telegram?.chatIdsCsv || '').split(',').map((s: string) => s.trim()).filter(Boolean)
    };
  }

  private async initRuntimeStates(): Promise<void> {
    const baseStates: Array<{ id: string; val: ioBroker.StateValue }> = [
      { id: 'runtime.mode', val: this.mode },
      { id: 'runtime.alarmActive', val: false },
      { id: 'runtime.countdownActive', val: false },
      { id: 'runtime.countdownRemainingSec', val: 0 },
      { id: 'runtime.lastTriggerSensor', val: '' },
      { id: 'runtime.lastTriggerTs', val: 0 },
      { id: 'runtime.openDoorCount', val: 0 }
    ];

    for (const s of baseStates) {
      await this.setStateAsync(s.id, s.val, true);
    }
  }

  private async subscribeForeignInputs(): Promise<void> {
    const ids = new Set<string>();
    ids.add(this.configParsed.panicStateId);
    ids.add(this.configParsed.motionSensorId);
    ids.add(this.configParsed.fingerprintStateId);
    ids.add('mqtt.1.AlarmCenter.PIN');

    for (const p of this.configParsed.presenceIds) ids.add(p);
    for (const s of this.configParsed.sensors) ids.add(s.id);
    for (const c of this.configParsed.cameras) ids.add(c.humanStateId);

    for (const id of ids) {
      await this.subscribeForeignStatesAsync(id);
    }
  }

  private async refreshSensorStates(): Promise<void> {
    for (const s of this.configParsed.sensors) {
      const st = await this.getForeignStateAsync(s.id);
      this.sensorState.set(s.id, this.isActiveValue(st?.val, s.activeValues));
    }
  }

  private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
    if (!state) return;

    const localId = id.startsWith(this.namespace + '.') ? id.slice(this.namespace.length + 1) : '';

    if (localId && !state.ack) {
      if (localId === 'commands.armFull' && state.val === true) {
        await this.armFull('manual');
        await this.setStateAsync('commands.armFull', false, true);
        return;
      }
      if (localId === 'commands.armPerimeter' && state.val === true) {
        await this.armPerimeter('manual');
        await this.setStateAsync('commands.armPerimeter', false, true);
        return;
      }
      if (localId === 'commands.disarm' && state.val === true) {
        await this.disarm('manual');
        await this.setStateAsync('commands.disarm', false, true);
        return;
      }
      if (localId === 'commands.panicOn' && state.val === true) {
        await this.setPanic(true, 'manual');
        await this.setStateAsync('commands.panicOn', false, true);
        return;
      }
      if (localId === 'commands.panicOff' && state.val === true) {
        await this.setPanic(false, 'manual');
        await this.setStateAsync('commands.panicOff', false, true);
        return;
      }
      return;
    }

    if (id === this.configParsed.panicStateId) {
      await this.setPanic(state.val === true, 'external');
      return;
    }

    if (id === this.configParsed.motionSensorId) {
      await this.handleStandbyMotion(state.val);
      return;
    }

    if (id === this.configParsed.fingerprintStateId) {
      await this.handleFingerprint(state.val);
      return;
    }

    if (id === 'mqtt.1.AlarmCenter.PIN') {
      await this.handlePin(state.val);
      return;
    }

    if (this.configParsed.presenceIds.includes(id)) {
      await this.handlePresenceChange();
      return;
    }

    const sensor = this.configParsed.sensors.find(s => s.id === id);
    if (sensor) {
      await this.handleSensor(sensor, state.val);
      return;
    }

    const camera = this.configParsed.cameras.find(c => c.humanStateId === id);
    if (camera) {
      await this.handleCameraEvent(camera, state.val);
    }
  }

  private async handleSensor(sensor: SensorDef, raw: ioBroker.StateValue): Promise<void> {
    const active = this.isActiveValue(raw, sensor.activeValues);
    this.sensorState.set(sensor.id, active);
    await this.updateLedAndStatus();
    await this.updateDisplayRotation();

    if (!active) return;
    if (!this.shouldDedupe(sensor.id)) return;

    if (this.mode === 'armed' || (this.mode === 'perimeter' && sensor.perimeterRelevant !== false)) {
      await this.triggerCountdown(sensor.label);
    }

    if (sensor.group === 'doors' && (this.mode === 'disarmed' || this.mode === 'perimeter')) {
      await this.setForeignStateSafe(this.configParsed.buzzerId, 'beep 2x');
    }
  }

  private async handleCameraEvent(camera: CameraDef, raw: ioBroker.StateValue): Promise<void> {
    const active = raw === true || raw === 'human detected';
    if (!active) return;

    if (this.mode === 'armed' || this.mode === 'perimeter' || this.mode === 'alarm' || this.mode === 'panic') {
      if (camera.reolinkAlarmId) {
        await this.setForeignStateSafe(camera.reolinkAlarmId, camera.reolinkAlarmOnValue ?? 1);
      }
      if (camera.reolinkFlashlightId) {
        await this.setForeignStateSafe(camera.reolinkFlashlightId, true);
        const offMs = camera.flashlightDurationMs ?? 10000;
        this.setTimeout(() => void this.setForeignStateSafe(camera.reolinkFlashlightId as string, false), offMs);
      }
      const snapshot = this.buildCameraUrl(camera.snapshotUrlTemplate, camera.username, camera.password);
      await this.sendTelegram(`🚨 Kamera-Trigger: ${camera.label}\nSnapshot: ${snapshot}`);
    }
  }

  private async handleFingerprint(raw: ioBroker.StateValue): Promise<void> {
    if (typeof raw !== 'string') return;
    const text = raw.trim().toLowerCase();
    if (!text) return;

    for (const user of this.configParsed.fingerprintUsers) {
      if (text.includes(user.toLowerCase())) {
        await this.disarm(`fingerprint:${user}`);
        await this.sendTelegram(`${user} erkannt – Alarm deaktiviert`);
        return;
      }
    }
  }

  private async handlePin(raw: ioBroker.StateValue): Promise<void> {
    if (raw === null || raw === undefined) return;
    const s = String(raw).trim();
    if (!s) return;

    for (const ch of s.replace(/[^\d*#]/g, '')) {
      this.pinBuffer = (this.pinBuffer + ch).slice(-2);
      const cmd = this.configParsed.pinCommands.find(p => p.sequence === this.pinBuffer);
      if (cmd) await this.executePinAction(cmd.action);
      if (ch === '#') this.pinBuffer = '';
    }
  }

  private async executePinAction(action: PinCommand['action']): Promise<void> {
    switch (action) {
      case 'garageOpen':
        await this.setForeignStateSafe(this.configParsed.garageDoorCommandId, this.configParsed.garageOpenValue);
        await this.showTempDisplay('   Tor oeffnet...   ');
        break;
      case 'garageClose':
        await this.setForeignStateSafe(this.configParsed.garageDoorCommandId, this.configParsed.garageCloseValue);
        await this.showTempDisplay('  Tor schliesst...  ');
        break;
      case 'pdlcOpen':
        await this.setForeignStateSafe(this.configParsed.pdlcId, this.configParsed.pdlcOpenValue);
        break;
      case 'pdlcClose':
        await this.setForeignStateSafe(this.configParsed.pdlcId, this.configParsed.pdlcCloseValue);
        break;
      case 'armFull':
        await this.armFull('pin');
        break;
      case 'armPerimeter':
        await this.armPerimeter('pin');
        break;
      case 'disarm':
        await this.disarm('pin');
        break;
      case 'panicOn':
        await this.setPanic(true, 'pin');
        break;
      case 'panicOff':
        await this.setPanic(false, 'pin');
        break;
    }
  }

  private async triggerCountdown(triggerLabel: string): Promise<void> {
    if (this.mode === 'countdown' || this.mode === 'alarm' || this.mode === 'panic') return;

    this.lastTrigger = triggerLabel;
    await this.setForeignStateSafe(this.configParsed.triggerStateId, triggerLabel);
    await this.setStateAsync('runtime.lastTriggerSensor', triggerLabel, true);
    await this.setStateAsync('runtime.lastTriggerTs', Date.now(), true);

    this.mode = 'countdown';
    this.countdownRemainingSec = this.configParsed.countdownSec;

    await this.syncModeStates();
    await this.setForeignStateSafe(this.configParsed.countdownStateId, true);
    await this.setForeignStateSafe(this.configParsed.displayId, '  Finger auflegen!  ');

    this.countdownTickTimer && this.clearInterval(this.countdownTickTimer);
    this.countdownTickTimer = this.setInterval(async () => {
      this.countdownRemainingSec = Math.max(0, this.countdownRemainingSec - 1);
      await this.setStateAsync('runtime.countdownRemainingSec', this.countdownRemainingSec, true);
      if (this.countdownRemainingSec > 0 && this.countdownRemainingSec % 3 === 0) {
        await this.setForeignStateSafe(this.configParsed.buzzerId, 'beep long 2x');
      }
    }, 1000);

    this.countdownTimer && this.clearTimeout(this.countdownTimer);
    this.countdownTimer = this.setTimeout(async () => {
      this.countdownTimer = null;
      await this.activateAlarm();
    }, this.configParsed.countdownSec * 1000);
  }

  private async activateAlarm(): Promise<void> {
    if (this.mode !== 'countdown') return;
    this.mode = 'alarm';
    this.countdownTickTimer && this.clearInterval(this.countdownTickTimer);
    this.countdownTickTimer = null;
    await this.syncModeStates();
    await this.setForeignStateSafe(this.configParsed.countdownStateId, false);
    await this.setForeignStateSafe(this.configParsed.sirenStateId, true);
    await this.sendTelegram(`🚨 Alarm!!! Trigger: ${this.lastTrigger || 'unbekannt'}`);
  }

  private async armFull(source: string): Promise<void> {
    this.mode = 'armed';
    await this.syncModeStates();
    await this.setForeignStateSafe(this.configParsed.armStateId, true);
    await this.setForeignStateSafe(this.configParsed.perimeterStateId, false);
    await this.sendTelegram(`Alarm scharf (FULL) via ${source}`);
  }

  private async armPerimeter(source: string): Promise<void> {
    this.mode = 'perimeter';
    await this.syncModeStates();
    await this.setForeignStateSafe(this.configParsed.armStateId, false);
    await this.setForeignStateSafe(this.configParsed.perimeterStateId, true);
    await this.setForeignStateSafe(this.configParsed.buzzerId, 'confirm');
    await this.showTempDisplay('    Schutz aktiv    ');
    await this.sendTelegram(`Perimeterschutz aktiv via ${source}`);
  }

  private async disarm(source: string): Promise<void> {
    this.mode = 'disarmed';
    this.countdownTimer && this.clearTimeout(this.countdownTimer);
    this.countdownTimer = null;
    this.countdownTickTimer && this.clearInterval(this.countdownTickTimer);
    this.countdownTickTimer = null;
    this.countdownRemainingSec = 0;

    await this.syncModeStates();
    await this.setForeignStateSafe(this.configParsed.armStateId, false);
    await this.setForeignStateSafe(this.configParsed.perimeterStateId, false);
    await this.setForeignStateSafe(this.configParsed.countdownStateId, false);
    await this.setForeignStateSafe(this.configParsed.sirenStateId, false);
    await this.setForeignStateSafe(this.configParsed.clearDisplayId, true);
    await this.sendTelegram(`Alarm deaktiviert via ${source}`);
  }

  private async setPanic(on: boolean, source: string): Promise<void> {
    if (on) {
      this.mode = 'panic';
      await this.syncModeStates();
      await this.setForeignStateSafe(this.configParsed.sirenStateId, true);
      await this.sendTelegram(`PANIC aktiviert via ${source}`);
    } else {
      await this.disarm(`panicOff:${source}`);
    }
  }

  private async syncModeStates(): Promise<void> {
    await this.setStateAsync('runtime.mode', this.mode, true);
    await this.setStateAsync('runtime.alarmActive', this.mode === 'alarm' || this.mode === 'panic', true);
    await this.setStateAsync('runtime.countdownActive', this.mode === 'countdown', true);
    await this.setStateAsync('runtime.countdownRemainingSec', this.countdownRemainingSec, true);
  }

  private async updateLedAndStatus(): Promise<void> {
    const doors = this.configParsed.sensors.filter(s => s.group === 'doors');
    const windows = this.configParsed.sensors.filter(s => s.group === 'windows');

    const openDoors = doors.filter(d => this.sensorState.get(d.id));
    const openWindows = windows.filter(w => this.sensorState.get(w.id));

    await this.setStateAsync('runtime.openDoorCount', openDoors.length, true);
    await this.setForeignStateSafe(this.configParsed.ledRedId, openDoors.length > 0);
    await this.setForeignStateSafe(this.configParsed.ledYellowId, openWindows.length > 0);
  }

  private async updateDisplayRotation(): Promise<void> {
    const openRelevant = this.configParsed.sensors
      .filter(s => s.group === 'doors' || s.group === 'windows')
      .filter(s => this.sensorState.get(s.id))
      .map(s => `${s.label} offen`);

    this.openDisplayQueue = openRelevant;

    if (this.displayTimer) {
      this.clearInterval(this.displayTimer);
      this.displayTimer = null;
    }

    if (openRelevant.length === 0) {
      await this.setForeignStateSafe(this.configParsed.clearDisplayId, true);
      return;
    }

    let idx = 0;
    this.displayTimer = this.setInterval(async () => {
      if (this.openDisplayQueue.length === 0) return;
      const text = this.openDisplayQueue[idx % this.openDisplayQueue.length];
      idx++;
      await this.setForeignStateSafe(this.configParsed.displayId, text.padEnd(20, ' ').slice(0, 20));
    }, 2000);
  }

  private async handleStandbyMotion(raw: ioBroker.StateValue): Promise<void> {
    const noMotion = raw === 'no motion';
    if (!noMotion) {
      this.standbyTimer && this.clearTimeout(this.standbyTimer);
      this.standbyTimer = null;
      await this.setForeignStateSafe(this.configParsed.standbyId, false);
      return;
    }

    this.standbyTimer && this.clearTimeout(this.standbyTimer);
    this.standbyTimer = this.setTimeout(async () => {
      await this.setForeignStateSafe(this.configParsed.standbyId, true);
    }, 20000);
  }

  private async handlePresenceChange(): Promise<void> {
    const values = await Promise.all(this.configParsed.presenceIds.map(id => this.getForeignStateAsync(id)));
    const anyoneHome = values.some(v => v?.val === true);

    if (anyoneHome) {
      this.autoArmTimer && this.clearTimeout(this.autoArmTimer);
      this.autoArmTimer = null;
      return;
    }

    if (this.mode !== 'disarmed') return;
    if (this.autoArmTimer) return;

    await this.sendTelegram(`Niemand ist zu Hause. Alarmanlage wird in ${this.configParsed.autoArmDelaySec}s scharfgeschaltet...`);
    this.autoArmTimer = this.setTimeout(async () => {
      this.autoArmTimer = null;
      await this.armFull('autoAway');
    }, this.configParsed.autoArmDelaySec * 1000);
  }

  private async showTempDisplay(text: string): Promise<void> {
    await this.setForeignStateSafe(this.configParsed.displayId, text);
    this.setTimeout(() => void this.setForeignStateSafe(this.configParsed.clearDisplayId, true), 4000);
  }

  private buildCameraUrl(template: string, username?: string, password?: string): string {
    return template
      .replaceAll('{username}', encodeURIComponent(username || '<USERNAME>'))
      .replaceAll('{password}', encodeURIComponent(password || '<PASSWORD>'));
  }

  private async sendTelegram(text: string): Promise<void> {
    if (!this.configParsed.telegramEnabled) return;
    if (!this.configParsed.telegramInstance) return;

    if (this.configParsed.telegramChatIds.length === 0) {
      await this.sendToAsync(this.configParsed.telegramInstance, 'send', { text });
      return;
    }

    for (const chatId of this.configParsed.telegramChatIds) {
      await this.sendToAsync(this.configParsed.telegramInstance, 'send', { text, user: chatId });
    }
  }

  private shouldDedupe(key: string): boolean {
    const now = Date.now();
    const last = this.dedupe.get(key) || 0;
    if (now - last < this.configParsed.dedupeMs) return false;
    this.dedupe.set(key, now);
    return true;
  }

  private isActiveValue(raw: ioBroker.StateValue, activeValues: Array<string | boolean | number>): boolean {
    return activeValues.some(v => raw === v);
  }

  private async setForeignStateSafe(id: string, val: ioBroker.StateValue): Promise<void> {
    try {
      await this.setForeignStateAsync(id, val as any);
    } catch (e) {
      this.log.debug(`setForeignState failed for ${id}: ${String(e)}`);
    }
  }

  private tryJson<T>(raw: unknown, fallback: T): T {
    try {
      if (typeof raw !== 'string' || raw.trim() === '') return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private toNumber(raw: unknown, fallback: number): number {
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }
}

if (require.main !== module) {
  module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new AlarmSystemAdapter(options);
} else {
  (() => new AlarmSystemAdapter())();
}
