import * as utils from '@iobroker/adapter-core';
import axios from 'axios';
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import SunCalc from 'suncalc';

type Zone = 'perimeter' | 'aussenhaut' | 'innenraum';
type SensorType = 'pir' | 'contact' | 'presence';
type DetectionMode = 'boolean' | 'string';
type SnapshotZoneMode = 'none' | 'any' | 'selected';

interface SensorDef {
  key: string;
  id: string;
  label: string;
  sensorType: SensorType;
  zone: Zone;
  activeValues: Array<string | boolean | number>;
  snapshotDatapointId?: string;
  snapshotZoneMode: SnapshotZoneMode;
  snapshotZones: Zone[];
}

interface PersonDetectionDef {
  key: string;
  id: string;
  label: string;
  zone: Zone;
  mode: DetectionMode;
  detectValue?: string;
  snapshotDatapointId?: string;
  snapshotZoneMode: SnapshotZoneMode;
  snapshotZones: Zone[];
}

interface CameraDef {
  key: string;
  label: string;
  ip: string;
  streamUrl: string;
  snapshotUrl: string;
  alarmDatapoint?: string;
  ledDatapoint?: string;
  username?: string;
  password?: string;
  personDetectionDp?: string;
}

interface ZoneDelayDef {
  zone: Zone;
  entryDelaySec: number;
  exitDelaySec: number;
}

interface ZoneActionDef {
  key: string;
  label: string;
  zone: Zone;
  datapointId: string;
  onValue: string | boolean | number;
  offValue?: string | boolean | number;
  pulseMs?: number;
}

interface TelegramInstanceDef {
  instance: string;
  token?: string;
}

interface TelegramTargetDef {
  instance: string;
  chatId: string;
}

interface EventEntry {
  ts: number;
  level: 'info' | 'warn' | 'alarm';
  type: string;
  message: string;
  caseId?: string;
  acked?: boolean;
}

interface Config {
  dedupeMs: number;
  defaultEntryDelaySec: number;
  defaultExitDelaySec: number;
  snapshotDelayMs: number;
  snapshotBurstCount: number;
  snapshotBurstIntervalMs: number;
  heartbeatTimeoutSec: number;
  simulationMode: boolean;
  cameraNightModeEnabled: boolean;
  cameraNightModeArmsCameras: boolean;

  armStateId: string;
  hullProtectionStateId: string;
  perimeterStateId: string;
  triggerStateId: string;
  sirenStateId: string;
  displayId: string;
  clearDisplayId: string;
  buzzerId: string;
  ledRedId: string;
  ledYellowId: string;
  standbyId: string;
  motionSensorId: string;
  statusId: string;
  checkRedId: string;
  checkYellowId: string;
  panicStateId: string;
  fingerprintStateId: string;
  knownFingerprints: string[];
  pinStateId: string;
  pdlcId: string;
  garageDoorCommandId: string;
  autoArmPresenceIds: string[];
  autoArmDelaySec: number;
  autoAwayArmZones: Zone[];
  autoAwayPendingTelegramText: string;
  autoAwayArmedTelegramText: string;
  autoAwayChatIds: string[];
  geofenceLeaveTelegramText: string;
  geofenceLeaveChatIds: string[];
  geofenceLeaveArmZones: Zone[];
  geofenceEnterTelegramText: string;
  geofenceEnterChatIds: string[];
  geofenceEnterArmZones: Zone[];
  geofenceEnterDisarmZones: Zone[];
  bedtimeLightSensorId: string;
  bedtimePresenceHomeIds: string[];
  bedtimeHour: number;
  bedtimeLightThreshold: number;
  cctvArmedId: string;
  cctvDisarmedId: string;
  drivewayFlashlightTriggerId: string;
  resetHumanDetectionIds: string[];
  cameraAlarmOnIds: string[];
  cameraAlarmOffIds: string[];
  reolinkSirenIds: string[];

  sensors: SensorDef[];
  personDetections: PersonDetectionDef[];
  cameras: CameraDef[];
  zoneActions: ZoneActionDef[];
  zoneDelays: Record<Zone, { entryDelaySec: number; exitDelaySec: number }>;
  telegramInstances: TelegramInstanceDef[];
  telegramTargets: TelegramTargetDef[];
}

class AlarmSystemAdapter extends utils.Adapter {
  private cfg!: Config;
  private zoneArmed: Record<Zone, boolean> = { perimeter: false, aussenhaut: false, innenraum: false };
  private camerasManualArmed = false;
  private zoneExitTimers: Partial<Record<Zone, ioBroker.Timeout>> = {};
  private dedupe = new Map<string, number>();
  private lastSeen = new Map<string, number>();
  private heartbeatTimer: ioBroker.Interval | null = null;
  private autoArmTimer: ioBroker.Timeout | null = null;
  private presenceLastSomeoneHome: boolean | null = null;
  private lastFingerprintHit = '';
  private lastFingerprintTs = 0;
  private pinBuffer = '';

  private activeCaseId = '';
  private eventLog: EventEntry[] = [];
  private countdownTimer: ioBroker.Timeout | null = null;
  private standbySafetyTimer: ioBroker.Interval | null = null;
  private openDoorBeepResetTimer: ioBroker.Timeout | null = null;
  private triggerLogDir: string | null = null;

  public constructor(options: Partial<utils.AdapterOptions> = {}) {
    super({ ...options, name: 'alarmsystem' });
    this.on('ready', this.onReady.bind(this));
    this.on('stateChange', this.onStateChange.bind(this));
  }

  private async onReady(): Promise<void> {
    this.cfg = this.buildConfig();
    this.triggerLogDir = path.join(utils.getAbsoluteInstanceDataDir(this), 'trigger-logs');
    await this.subscribeStates('*');
    await this.subscribeForeignInputs();
    await this.ensureWebUiCameraStates();
    await this.ensureStates();
    this.camerasManualArmed = (await this.getStateAsync('runtime.camerasManualArmed'))?.val === true;
    await this.applyCameraOutputs();
    await this.refreshTriggerLogState(this.dayString(new Date()));
    await this.publishConfigStates();
    await this.refreshInitialSeen();
    await this.initializePresenceState();
    await this.initializeHumanDetectionReset();
    await this.publishRuleView();
    this.startHeartbeatWatchdog();
    this.startStandbySafetyCheck();
    await this.logEvent('info', 'system_start', 'AlarmSystem gestartet');
  }

  private async ensureWebUiCameraStates(): Promise<void> {
    await this.setObjectNotExistsAsync('runtime.camerasManualArmed', {
      type: 'state',
      common: { name: 'Cameras manually armed', type: 'boolean', role: 'switch', read: true, write: true, def: false },
      native: {}
    });
    await this.setObjectNotExistsAsync('commands.armCameras', {
      type: 'state',
      common: { name: 'Arm cameras', type: 'boolean', role: 'button', read: true, write: true, def: false },
      native: {}
    });
    await this.setObjectNotExistsAsync('commands.disarmCameras', {
      type: 'state',
      common: { name: 'Disarm cameras', type: 'boolean', role: 'button', read: true, write: true, def: false },
      native: {}
    });
    await this.setObjectNotExistsAsync('commands.telegramTestText', {
      type: 'state',
      common: { name: 'Telegram test text', type: 'boolean', role: 'button', read: true, write: true, def: false },
      native: {}
    });
    await this.setObjectNotExistsAsync('commands.telegramTestPhoto', {
      type: 'state',
      common: { name: 'Telegram test photo', type: 'boolean', role: 'button', read: true, write: true, def: false },
      native: {}
    });
    await this.setObjectNotExistsAsync('commands.telegramTestPhotoCaption', {
      type: 'state',
      common: { name: 'Telegram test photo with caption', type: 'boolean', role: 'button', read: true, write: true, def: false },
      native: {}
    });
  }

  private buildConfig(): Config {
    const n = this.config as Record<string, any>;
    const sensors = this.parseSensorTable(n.pirSensorsTable, 'pir')
      .concat(this.parseSensorTable(n.contactSensorsTable, 'contact'))
      .concat(this.parseSensorTable(n.presenceSensorsTable, 'presence'));
    const personDetections = this.parsePersonDetectionTable(n.personDetectionTable);
    const cameras = this.parseCamerasTable(n.camerasTable);
    const zoneActions = this.parseZoneActionsTable(n.zoneActionsTable);

    return {
      dedupeMs: this.toNumber(n.eventDedupeMs, 1000),
      defaultEntryDelaySec: this.toNumber(n.defaultEntryDelaySec, 20),
      defaultExitDelaySec: this.toNumber(n.defaultExitDelaySec, 10),
      snapshotDelayMs: this.toNumber(n.snapshotSendDelayMs, 0),
      snapshotBurstCount: Math.max(1, this.toNumber(n.snapshotBurstCount, 1)),
      snapshotBurstIntervalMs: Math.max(500, this.toNumber(n.snapshotBurstIntervalMs, 5000)),
      heartbeatTimeoutSec: this.toNumber(n.heartbeatTimeoutSec, 180),
      simulationMode: n.simulationMode === true,
      cameraNightModeEnabled: n.cameraNightModeEnabled !== false,
      cameraNightModeArmsCameras: n.cameraNightModeArmsCameras !== false,

      armStateId: n.armStateId || 'mqtt.1.AlarmCenter.AlarmSystemArmed',
      hullProtectionStateId: n.hullProtectionStateId || 'mqtt.1.AlarmCenter.HullProtection',
      perimeterStateId: n.perimeterStateId || 'mqtt.1.AlarmCenter.PerimeterProtection',
      triggerStateId: n.triggerStateId || 'mqtt.1.AlarmCenter.AlarmTrigger',
      sirenStateId: n.sirenStateId || 'mqtt.1.AlarmCenter.ActivateSiren',
      displayId: n.displayId || 'mqtt.1.AlarmCenter.Display',
      clearDisplayId: n.clearDisplayId || 'mqtt.1.AlarmCenter.ClearDisplay',
      buzzerId: n.buzzerId || 'mqtt.1.AlarmCenter.Buzzer',
      ledRedId: n.ledRedId || 'mqtt.1.AlarmCenter.LEDRingRed',
      ledYellowId: n.ledYellowId || 'mqtt.1.AlarmCenter.LEDRingYellow',
      standbyId: n.standbyId || 'mqtt.1.AlarmCenter.StandBy',
      motionSensorId: n.motionSensorId || 'mqtt.1.AlarmCenter.MotionSensor',
      statusId: n.statusId || 'mqtt.1.AlarmCenter.Status',
      checkRedId: n.checkRedId || 'mqtt.1.AlarmCenter.CheckRed',
      checkYellowId: n.checkYellowId || 'mqtt.1.AlarmCenter.CheckYellow',
      panicStateId: n.panicStateId || '0_userdata.0.AlarmSystem.panic',
      fingerprintStateId: n.fingerprintStateId || 'mqtt.1.fingerprintDoorbell.lastLogMessage',
      knownFingerprints: String(n.fingerprintUsersCsv || 'Sebastian R1,Teresa R1,Catharina R1,Rita R1,Lukas R1,Florian R1,Monika R1,Michelle L1,Marie R1,Julia R1').split(',').map((x: string) => x.trim()).filter(Boolean),
      pinStateId: n.pinStateId || 'mqtt.1.AlarmCenter.PIN',
      pdlcId: n.pdlcId || 'tuya.0.bf2bb23b342877f2e1maqy.1',
      garageDoorCommandId: n.garageDoorCommandId || 'hmip.0.devices.3014F711A000241F29970E70.channels.1.doorCommand',
      autoArmPresenceIds: this.tryJson<string[]>(n.presenceIdsJson, [
        '0_userdata.0.presence_geofence.Sebastian',
        '0_userdata.0.presence_geofence.Teresa',
        '0_userdata.0.presence_at_home.Sebastian',
        '0_userdata.0.presence_at_home.Teresa'
      ]),
      autoArmDelaySec: this.toNumber(n.autoArmDelaySec, 60),
      autoAwayArmZones: this.parseZonesCsv(n.autoAwayArmZonesCsv || 'perimeter,aussenhaut,innenraum'),
      autoAwayPendingTelegramText: String(n.autoAwayPendingTelegramText || 'Niemand ist zu Hause. Alarmanlage wird in {delay}s scharfgeschaltet...'),
      autoAwayArmedTelegramText: String(n.autoAwayArmedTelegramText || 'Alarmanlage ist jetzt scharfgeschaltet!'),
      autoAwayChatIds: this.parseCsv(n.autoAwayChatIdsCsv),
      geofenceLeaveTelegramText: String(n.geofenceLeaveTelegramText || ''),
      geofenceLeaveChatIds: this.parseCsv(n.geofenceLeaveChatIdsCsv),
      geofenceLeaveArmZones: this.parseZonesCsv(n.geofenceLeaveArmZonesCsv || ''),
      geofenceEnterTelegramText: String(n.geofenceEnterTelegramText || ''),
      geofenceEnterChatIds: this.parseCsv(n.geofenceEnterChatIdsCsv),
      geofenceEnterArmZones: this.parseZonesCsv(n.geofenceEnterArmZonesCsv || ''),
      geofenceEnterDisarmZones: this.parseZonesCsv(n.geofenceEnterDisarmZonesCsv || ''),
      bedtimeLightSensorId: n.bedtimeLightSensorId || 'mqtt.1.living_light_sensor',
      bedtimePresenceHomeIds: this.tryJson<string[]>(n.bedtimePresenceHomeIdsJson, [
        '0_userdata.0.presence_at_home.Sebastian',
        '0_userdata.0.presence_at_home.Teresa'
      ]),
      bedtimeHour: this.toNumber(n.bedtimeHour, 20),
      bedtimeLightThreshold: this.toNumber(n.bedtimeLightThreshold, 30),
      cctvArmedId: n.cctvArmedId || '0_userdata.0.CCTVSystem.alarmSystemArmed',
      cctvDisarmedId: n.cctvDisarmedId || '0_userdata.0.CCTVSystem.alarmSystemDisarmed',
      drivewayFlashlightTriggerId: n.drivewayFlashlightTriggerId || '0_userdata.0.CamDriveway.Human_triggered_flashlight_only_OFF',
      resetHumanDetectionIds: this.tryJson<string[]>(n.resetHumanDetectionIdsJson, [
        'mqtt.2.HumanDetection.CamBackyard',
        'mqtt.2.HumanDetection.CamBalkonyNorth',
        'mqtt.2.HumanDetection.CamBalkonySouth',
        'mqtt.2.HumanDetection.CamDriveway',
        'mqtt.2.HumanDetection.CamFrontyardLeft',
        'mqtt.2.HumanDetection.CamFrontyardRight',
        'mqtt.2.HumanDetection.CamTerrace'
      ]),
      cameraAlarmOnIds: this.tryJson<string[]>(n.cameraAlarmOnIdsJson, [
        '0_userdata.0.CamBackyard.Alarm_ON',
        '0_userdata.0.CamBalkonyNorth.Alarm_ON',
        '0_userdata.0.CamBalkonySouth.Alarm_ON',
        '0_userdata.0.CamDriveway.Alarm_ON',
        '0_userdata.0.CamFrontyardLeft.Alarm_ON',
        '0_userdata.0.CamFrontyardRight.Alarm_ON',
        '0_userdata.0.CamTerrace.Alarm_ON'
      ]),
      cameraAlarmOffIds: this.tryJson<string[]>(n.cameraAlarmOffIdsJson, [
        '0_userdata.0.CamBackyard.Alarm_OFF',
        '0_userdata.0.CamBalkonyNorth.Alarm_OFF',
        '0_userdata.0.CamBalkonySouth.Alarm_OFF',
        '0_userdata.0.CamDriveway.Alarm_OFF',
        '0_userdata.0.CamFrontyardLeft.Alarm_OFF',
        '0_userdata.0.CamFrontyardRight.Alarm_OFF',
        '0_userdata.0.CamTerrace.Alarm_OFF'
      ]),
      reolinkSirenIds: this.tryJson<string[]>(n.reolinkSirenIdsJson, [
        'reolink.0.settings.playAlarm',
        'reolink.1.settings.playAlarm',
        'reolink.2.settings.playAlarm',
        'reolink.3.settings.playAlarm'
      ]),

      sensors,
      personDetections,
      cameras,
      zoneActions,
      zoneDelays: this.parseZoneDelays(n.zoneDelaysTable, this.toNumber(n.defaultEntryDelaySec, 20), this.toNumber(n.defaultExitDelaySec, 10)),
      telegramInstances: this.parseTelegramInstances(n.telegramInstancesTable),
      telegramTargets: this.parseTelegramTargets(n.telegramTargetsTable)
    };
  }

  private parseZoneDelays(rows: any, defaultEntry: number, defaultExit: number): Record<Zone, { entryDelaySec: number; exitDelaySec: number }> {
    const out: Record<Zone, { entryDelaySec: number; exitDelaySec: number }> = {
      perimeter: { entryDelaySec: defaultEntry, exitDelaySec: defaultExit },
      aussenhaut: { entryDelaySec: defaultEntry, exitDelaySec: defaultExit },
      innenraum: { entryDelaySec: defaultEntry, exitDelaySec: defaultExit }
    };
    if (!Array.isArray(rows)) return out;
    for (const r of rows) {
      const z = this.parseZone(r?.zone);
      out[z] = {
        entryDelaySec: Math.max(0, this.toNumber(r?.entryDelaySec, out[z].entryDelaySec)),
        exitDelaySec: Math.max(0, this.toNumber(r?.exitDelaySec, out[z].exitDelaySec))
      };
    }
    return out;
  }

  private parseSensorTable(rows: any, sensorType: SensorType): SensorDef[] {
    if (!Array.isArray(rows)) return [];
    return rows.filter(r => r?.id).map((r: any) => ({
      key: String(r.key || r.id),
      id: String(r.id),
      label: String(r.label || r.key || r.id),
      sensorType,
      zone: this.parseZone(r.zone),
      activeValues: String(r.activeValuesCsv || 'open').split(',').map((x: string) => x.trim()).filter(Boolean).map((x: string) => this.parseScalar(x)),
      snapshotDatapointId: r.snapshotDatapointId ? String(r.snapshotDatapointId) : undefined,
      snapshotZoneMode: this.parseSnapshotZoneMode(r.snapshotZoneMode),
      snapshotZones: this.parseSnapshotZones(r.snapshotZonesCsv)
    }));
  }

  private parsePersonDetectionTable(rows: any): PersonDetectionDef[] {
    if (!Array.isArray(rows)) return [];
    return rows.filter(r => r?.id).map((r: any) => ({
      key: String(r.key || r.id),
      id: String(r.id),
      label: String(r.label || r.key || r.id),
      zone: this.parseZone(r.zone),
      mode: r.mode === 'string' ? 'string' : 'boolean',
      detectValue: r.detectValue ? String(r.detectValue) : undefined,
      snapshotDatapointId: r.snapshotDatapointId ? String(r.snapshotDatapointId) : undefined,
      snapshotZoneMode: this.parseSnapshotZoneMode(r.snapshotZoneMode),
      snapshotZones: this.parseSnapshotZones(r.snapshotZonesCsv)
    }));
  }

  private parseSnapshotZoneMode(v: any): SnapshotZoneMode {
    const m = String(v || '').toLowerCase();
    if (m === 'any') return 'any';
    if (m === 'selected') return 'selected';
    return 'none';
  }

  private parseZonesCsv(v: any): Zone[] {
    const raw = String(v || '').split(',').map(x => x.trim()).filter(Boolean);
    const out: Zone[] = [];
    for (const z of raw) {
      if (z === 'perimeter' || z === 'aussenhaut' || z === 'innenraum') out.push(z);
    }
    return Array.from(new Set(out));
  }

  private parseSnapshotZones(v: any): Zone[] {
    return this.parseZonesCsv(v);
  }

  private parseCsv(v: any): string[] {
    return Array.from(new Set(String(v || '').split(',').map(x => x.trim()).filter(Boolean)));
  }

  private parseCamerasTable(rows: any): CameraDef[] {
    if (!Array.isArray(rows)) return [];
    return rows.filter(r => r?.snapshotUrl).map((r: any) => ({
      key: String(r.key || r.ip || ''),
      label: String(r.label || r.key || r.ip || ''),
      ip: String(r.ip || ''),
      streamUrl: String(r.streamUrl || ''),
      snapshotUrl: String(r.snapshotUrl || ''),
      alarmDatapoint: r.alarmDatapoint ? String(r.alarmDatapoint) : undefined,
      ledDatapoint: r.ledDatapoint ? String(r.ledDatapoint) : undefined,
      username: r.username ? String(r.username) : undefined,
      password: r.password ? String(r.password) : undefined,
      personDetectionDp: r.personDetectionDp ? String(r.personDetectionDp) : undefined
    }));
  }

  private parseZoneActionsTable(rows: any): ZoneActionDef[] {
    if (!Array.isArray(rows)) return [];
    return rows
      .filter(r => r?.datapointId)
      .map((r: any) => {
        const rawOn = r.onValue === undefined || r.onValue === null || String(r.onValue).trim() === '' ? 'true' : String(r.onValue).trim();
        const rawOff = r.offValue === undefined || r.offValue === null || String(r.offValue).trim() === '' ? '' : String(r.offValue).trim();
        const pulseMs = Math.max(0, this.toNumber(r.pulseMs, 0));
        return {
          key: String(r.key || r.datapointId),
          label: String(r.label || r.key || r.datapointId),
          zone: this.parseZone(r.zone),
          datapointId: String(r.datapointId),
          onValue: this.parseScalar(rawOn),
          offValue: rawOff ? this.parseScalar(rawOff) : undefined,
          pulseMs: pulseMs > 0 ? pulseMs : undefined
        };
      });
  }

  private parseTelegramInstances(rows: any): TelegramInstanceDef[] {
    if (!Array.isArray(rows)) return [];
    return rows.filter(r => r?.instance).map((r: any) => ({ instance: String(r.instance), token: r.token ? String(r.token) : undefined }));
  }

  private parseTelegramTargets(rows: any): TelegramTargetDef[] {
    if (!Array.isArray(rows)) return [];
    const out: TelegramTargetDef[] = [];
    for (const r of rows) {
      const instance = String(r?.instance || '').trim();
      const raw = String(r?.chatId || '').trim();
      if (!instance || !raw) continue;
      const chatIds = this.parseCsv(raw);
      for (const chatId of chatIds) out.push({ instance, chatId });
    }
    return out;
  }

  private parseZone(v: any): Zone {
    const z = String(v || '').toLowerCase();
    if (z === 'aussenhaut') return 'aussenhaut';
    if (z === 'innenraum') return 'innenraum';
    return 'perimeter';
  }

  private async subscribeForeignInputs(): Promise<void> {
    const ids = new Set<string>([
      this.cfg.armStateId,
      this.cfg.hullProtectionStateId,
      this.cfg.perimeterStateId,
      this.cfg.panicStateId,
      this.cfg.fingerprintStateId,
      this.cfg.pinStateId,
      this.cfg.bedtimeLightSensorId,
      this.cfg.motionSensorId
    ]);
    for (const s of this.cfg.sensors) ids.add(s.id);
    for (const p of this.cfg.personDetections) ids.add(p.id);
    for (const c of this.cfg.cameras) if (c.personDetectionDp) ids.add(c.personDetectionDp);
    for (const p of this.cfg.autoArmPresenceIds) ids.add(p);
    for (const p of this.cfg.bedtimePresenceHomeIds) ids.add(p);
    for (const p of this.cfg.resetHumanDetectionIds) ids.add(p);
    for (const id of ids) await this.subscribeForeignStatesAsync(id);
  }

  private async ensureStates(): Promise<void> {
    const defaults: Array<[string, ioBroker.StateValue]> = [
      ['runtime.mode', 'disarmed'],
      ['runtime.activeCaseId', ''],
      ['runtime.lastTrigger', ''],
      ['runtime.simulationMode', this.cfg.simulationMode],
      ['runtime.camerasManualArmed', false],
      ['runtime.countdownRemainingSec', 0],
      ['zones.perimeter.armed', false],
      ['zones.aussenhaut.armed', false],
      ['zones.innenraum.armed', false],
      ['diagnostics.eventsJson', '[]'],
      ['diagnostics.lastSabotage', ''],
      ['diagnostics.triggerLogDate', this.dayString(new Date())],
      ['diagnostics.triggerLogText', ''],
      ['rules.ifThenJson', '[]'],
      ['rules.ifThenText', ''],
      ['config.currentJson', '{}'],
      ['config.profilesJson', '{}'],
      ['config.profileNamesJson', '[]'],
      ['config.activeProfile', 'default.json'],
      ['config.activeProfileJson', '{}'],
      ['commands.ackActiveCase', false],
      ['commands.armCameras', false],
      ['commands.disarmCameras', false],
      ['commands.telegramTestText', false],
      ['commands.telegramTestPhoto', false],
      ['commands.telegramTestPhotoCaption', false]
    ];
    for (const [id, val] of defaults) await this.setStateAsync(id, val, true);
  }

  private async publishConfigStates(): Promise<void> {
    const n = this.config as Record<string, any>;
    const current = this.cloneJson(n);
    const rawProfiles = this.tryJson<Record<string, unknown>>(n.configProfilesJson, {});
    const profiles: Record<string, unknown> = this.cloneJson(rawProfiles) || {};

    if (!profiles['default.json']) profiles['default.json'] = current;
    let activeProfile = typeof n.activeConfigProfile === 'string' && n.activeConfigProfile ? n.activeConfigProfile : 'default.json';
    if (!profiles[activeProfile]) activeProfile = 'default.json';

    await this.setStateAsync('config.currentJson', JSON.stringify(current), true);
    await this.setStateAsync('config.profilesJson', JSON.stringify(profiles), true);
    await this.setStateAsync('config.profileNamesJson', JSON.stringify(Object.keys(profiles).sort()), true);
    await this.setStateAsync('config.activeProfile', activeProfile, true);
    await this.setStateAsync('config.activeProfileJson', JSON.stringify(this.cloneJson(profiles[activeProfile])), true);
  }

  private async publishRuleView(): Promise<void> {
    const rules: Array<{ if: string; then: string }> = [];

    for (const z of ['perimeter', 'aussenhaut', 'innenraum'] as Zone[]) {
      const zoneSensors = this.cfg.sensors.filter(x => x.zone === z);
      const zonePds = this.cfg.personDetections.filter(x => x.zone === z);
      const d = this.cfg.zoneDelays[z];

      if (zoneSensors.length > 0) {
        rules.push({
          if: `Zone ${z} aktiv UND ein Sensor in Zone ${z} triggert`,
          then: `Entry-Countdown ${d.entryDelaySec}s, danach Sirene + Telegram + Case-ID`
        });
      }

      if (zonePds.length > 0) {
        rules.push({
          if: `Zone ${z} aktiv UND Person-Detection in Zone ${z} triggert`,
          then: `Entry-Countdown ${d.entryDelaySec}s, danach Sirene + Telegram + Case-ID`
        });
      }
    }

    for (const c of this.cfg.cameras) {
      if (c.personDetectionDp) {
        rules.push({
          if: `Personenerkennung ${c.personDetectionDp} triggert`,
          then: `Snapshot(s) senden${c.alarmDatapoint ? ', Kamera-Alarm setzen' : ''}${c.ledDatapoint ? ', LED setzen' : ''} (bei scharfer Zone oder Night-Mode, falls aktiviert)`
        });
      }
    }

    for (const a of this.cfg.zoneActions) {
      rules.push({
        if: `Alarmtrigger in Zone ${a.zone} (${a.label})`,
        then: `Setze ${a.datapointId} auf ${String(a.onValue)}${a.pulseMs ? ` und nach ${a.pulseMs}ms auf ${String(a.offValue ?? false)}` : ''}`
      });
    }

    rules.push({
      if: 'commands.ackActiveCase = true',
      then: 'Aktiven Alarmfall quittieren und alle Zonen unscharf'
    });

    rules.push({
      if: `Heartbeat > ${this.cfg.heartbeatTimeoutSec}s ohne Update`,
      then: 'Sabotage/Offline Warnung in diagnostics.lastSabotage + Eventlog'
    });

    if (this.cfg.simulationMode) {
      rules.push({
        if: 'Simulation Mode aktiv',
        then: 'Keine realen Aktor-Schreibvorgänge, nur Eventlog-Einträge'
      });
    }

    const text = rules.map((r, i) => `${i + 1}. WENN ${r.if} DANN ${r.then}`).join('\n');
    await this.setStateAsync('rules.ifThenJson', JSON.stringify(rules), true);
    await this.setStateAsync('rules.ifThenText', text, true);
  }

  private async refreshInitialSeen(): Promise<void> {
    const ids = new Set<string>();
    this.cfg.sensors.forEach(s => ids.add(s.id));
    this.cfg.personDetections.forEach(p => ids.add(p.id));
    this.cfg.cameras.forEach(c => c.personDetectionDp && ids.add(c.personDetectionDp));
    this.cfg.resetHumanDetectionIds.forEach(id => ids.add(id));
    const now = Date.now();
    for (const id of ids) this.lastSeen.set(id, now);
  }

  private startHeartbeatWatchdog(): void {
    this.heartbeatTimer && this.clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = this.setInterval(() => void this.runHeartbeatCheck(), 30000) ?? null;
  }

  private async runHeartbeatCheck(): Promise<void> {
    const now = Date.now();
    const timeoutMs = this.cfg.heartbeatTimeoutSec * 1000;
    for (const [id, ts] of this.lastSeen) {
      if (now - ts > timeoutMs) {
        const msg = `Sabotage/Offline erkannt: ${id} seit ${Math.round((now - ts) / 1000)}s ohne Heartbeat`;
        await this.setStateAsync('diagnostics.lastSabotage', msg, true);
        await this.logEvent('warn', 'sabotage_offline', msg);
      }
    }
  }

  private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
    if (!state) return;

    const local = id.startsWith(this.namespace + '.') ? id.slice(this.namespace.length + 1) : '';
    if (local && !state.ack) {
      if (local === 'commands.armAll' && state.val === true) {
        await this.armZone('perimeter');
        await this.armZone('aussenhaut');
        await this.armZone('innenraum');
        await this.setStateAsync(local, false, true);
      }
      if (local === 'commands.disarmAll' && state.val === true) {
        await this.disarmAll();
        await this.setStateAsync(local, false, true);
      }
      if (local === 'commands.armPerimeterZone' && state.val === true) {
        await this.armZone('perimeter');
        await this.setStateAsync(local, false, true);
      }
      if (local === 'commands.armAussenhautZone' && state.val === true) {
        await this.armZone('aussenhaut');
        await this.setStateAsync(local, false, true);
      }
      if (local === 'commands.armInnenraumZone' && state.val === true) {
        await this.armZone('innenraum');
        await this.setStateAsync(local, false, true);
      }
      if (local === 'commands.disarmPerimeterZone' && state.val === true) {
        await this.disarmZone('perimeter');
        await this.setStateAsync(local, false, true);
      }
      if (local === 'commands.disarmAussenhautZone' && state.val === true) {
        await this.disarmZone('aussenhaut');
        await this.setStateAsync(local, false, true);
      }
      if (local === 'commands.disarmInnenraumZone' && state.val === true) {
        await this.disarmZone('innenraum');
        await this.setStateAsync(local, false, true);
      }
      if (local === 'commands.ackActiveCase' && state.val === true) {
        await this.ackActiveCase();
        await this.setStateAsync(local, false, true);
      }
      if (local === 'commands.armCameras' && state.val === true) {
        this.camerasManualArmed = true;
        await this.setStateAsync('runtime.camerasManualArmed', true, true);
        await this.applyCameraOutputs();
        await this.setStateAsync(local, false, true);
      }
      if (local === 'commands.disarmCameras' && state.val === true) {
        this.camerasManualArmed = false;
        await this.setStateAsync('runtime.camerasManualArmed', false, true);
        await this.applyCameraOutputs();
        await this.setStateAsync(local, false, true);
      }
      if (local === 'commands.telegramTestText' && state.val === true) {
        await this.sendTelegramText('Test');
        await this.logEvent('info', 'telegram_test_text', 'Telegram Testnachricht gesendet');
        await this.setStateAsync(local, false, true);
      }
      if (local === 'commands.telegramTestPhoto' && state.val === true) {
        await this.sendTelegramTestPhoto();
        await this.setStateAsync(local, false, true);
      }
      if (local === 'commands.telegramTestPhotoCaption' && state.val === true) {
        await this.sendTelegramTestPhoto('Test');
        await this.setStateAsync(local, false, true);
      }
      if (local === 'runtime.simulationMode') {
        this.cfg.simulationMode = state.val === true;
      }
      if (local === 'runtime.camerasManualArmed') {
        this.camerasManualArmed = state.val === true;
        await this.applyCameraOutputs();
      }
      if (local === 'diagnostics.triggerLogDate' && typeof state.val === 'string') {
        await this.refreshTriggerLogState(state.val);
      }
      return;
    }

    this.lastSeen.set(id, Date.now());

    await this.handleLegacyDoorBuzzers(id, state.val);

    if (id === this.cfg.armStateId) {
      if (state.val === true) {
        await this.armZone('perimeter');
        await this.armZone('aussenhaut');
        await this.armZone('innenraum');
      } else if (state.val === false) {
        await this.disarmAll();
      }
      return;
    }
    if (id === this.cfg.perimeterStateId) {
      if (state.val === true) {
        await this.armZone('perimeter');
        await this.armZone('aussenhaut');
        await this.applyCameraOutputs();
      } else if (state.val === false) {
        const hullSt = await this.getForeignStateAsync(this.cfg.hullProtectionStateId);
        const allSt = await this.getForeignStateAsync(this.cfg.armStateId);
        await this.disarmZone('perimeter');
        if (!(hullSt?.val === true || allSt?.val === true)) {
          await this.disarmZone('aussenhaut');
        }
        await this.applyCameraOutputs();
      }
      return;
    }
    if (id === this.cfg.hullProtectionStateId) {
      if (state.val === true) {
        await this.armZone('aussenhaut');
      } else if (state.val === false) {
        const perSt = await this.getForeignStateAsync(this.cfg.perimeterStateId);
        const allSt = await this.getForeignStateAsync(this.cfg.armStateId);
        if (!(perSt?.val === true || allSt?.val === true)) {
          await this.disarmZone('aussenhaut');
        }
      }
      return;
    }
    if (id === this.cfg.panicStateId) {
      await this.handlePanic(state.val === true);
      return;
    }
    if (id === this.cfg.fingerprintStateId) {
      await this.handleFingerprint(state.val);
      return;
    }
    if (id === this.cfg.pinStateId) {
      await this.handlePin(state.val);
      return;
    }
    if (id === this.cfg.bedtimeLightSensorId || this.cfg.bedtimePresenceHomeIds.includes(id)) {
      await this.handleBedtimePerimeter();
    }
    if (this.cfg.autoArmPresenceIds.includes(id)) {
      await this.handleAutoArmWhenNobodyHome();
    }

    const s = this.cfg.sensors.find(x => x.id === id);
    if (s) {
      const active = this.matchesAny(state.val, s.activeValues);
      if (active && this.zoneArmed[s.zone] && this.allowEvent(id)) {
        await this.writeDailyTriggerLog('sensor', s.label, s.id, s.zone, state.val);
        await this.tryTriggerConfiguredSnapshot(s.label, s.snapshotDatapointId, s.snapshotZoneMode, s.snapshotZones);
        await this.handleZoneTrigger(s.label, s.zone);
      }
      return;
    }

    const p = this.cfg.personDetections.find(x => x.id === id);
    if (p) {
      const active = this.matchesPerson(state.val, p);
      if (active && this.zoneArmed[p.zone] && this.allowEvent(id)) {
        await this.writeDailyTriggerLog('personDetection', p.label, p.id, p.zone, state.val);
        await this.tryTriggerConfiguredSnapshot(p.label, p.snapshotDatapointId, p.snapshotZoneMode, p.snapshotZones);
        await this.handleZoneTrigger(p.label, p.zone);
      }
      return;
    }

    const cam = this.cfg.cameras.find(c => c.personDetectionDp === id);
    if (cam) {
      const active = state.val === true || state.val === 'human detected';
      const armed = this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum;
      const nightModeArmed = this.cfg.cameraNightModeArmsCameras && this.isNightModeActive();
      if (active && this.allowEvent(id) && (armed || nightModeArmed)) {
        await this.writeDailyTriggerLog('camera', cam.label, cam.personDetectionDp || id, 'perimeter', state.val);
        await this.triggerCamera(cam);
      }
    }

    if (this.cfg.resetHumanDetectionIds.includes(id)) {
      this.setTimeout(() => void this.setOutput(id, '-'), 5500);
    }
  }

  private async initializeHumanDetectionReset(): Promise<void> {
    for (const id of this.cfg.resetHumanDetectionIds) {
      await this.setOutput(id, '-');
    }
  }

  private startStandbySafetyCheck(): void {
    this.standbySafetyTimer && this.clearInterval(this.standbySafetyTimer);
    this.standbySafetyTimer = this.setInterval(async () => {
      const ms = await this.getForeignStateAsync(this.cfg.motionSensorId);
      if (ms?.val === 'no motion') {
        await this.setOutput(this.cfg.standbyId, true);
      }
    }, 10000) ?? null;
  }

  private async handleLegacyDoorBuzzers(id: string, val: ioBroker.StateValue): Promise<void> {
    const entrance = 'mqtt.1.entrance_door_status';
    const side = 'mqtt.1.side_entrance_door_status';
    const terrace = 'mqtt.1.terrace_door_status';
    const shed = 'mqtt.1.Garage.shedDoorStatus';
    const wcWindow = 'mqtt.1.WC_children.windowStatus';

    const isOpenEvent = val === 'open';
    if (!isOpenEvent) return;

    // Legacy: short beep when any configured door opens
    if ([entrance, side, terrace, shed].includes(id)) {
      await this.setOutput(this.cfg.buzzerId, 'beep 2x');
      if (this.openDoorBeepResetTimer) this.clearTimeout(this.openDoorBeepResetTimer);
      this.openDoorBeepResetTimer = this.setTimeout(async () => {
        await this.setOutput(this.cfg.buzzerId, 'off');
      }, 1000) ?? null;
    }

    // Legacy: leaving-house warning when entrance or side opens and another perimeter opening exists
    if (id === entrance || id === side) {
      const t = await this.getForeignStateAsync(terrace);
      const s = await this.getForeignStateAsync(shed);
      const w = await this.getForeignStateAsync(wcWindow);
      if (t?.val === 'open' || s?.val === 'open' || w?.val === 'open') {
        this.setTimeout(async () => {
          await this.setOutput(this.cfg.buzzerId, 'decline');
        }, 400);
      }
    }
  }

  private async armZone(zone: Zone): Promise<void> {
    const exitMs = this.cfg.zoneDelays[zone].exitDelaySec * 1000;
    this.zoneExitTimers[zone] && this.clearTimeout(this.zoneExitTimers[zone] as ioBroker.Timeout);
    await this.logEvent('info', 'zone_arm_requested', `Zone ${zone} arming requested (exit ${this.cfg.zoneDelays[zone].exitDelaySec}s)`);

    this.zoneExitTimers[zone] = this.setTimeout(async () => {
      this.zoneArmed[zone] = true;
      await this.setStateAsync(`zones.${zone}.armed`, true, true);
      await this.updateModeState();
      if (zone === 'perimeter') {
        await this.setOutput(this.cfg.buzzerId, 'confirm');
        await this.setOutput(this.cfg.displayId, '    Schutz aktiv    ');
        this.setTimeout(() => void this.setOutput(this.cfg.clearDisplayId, true), 5000);
      }
      await this.logEvent('info', 'zone_armed', `Zone ${zone} armed`);
    }, exitMs) ?? null as any;
  }

  private async disarmZone(zone: Zone): Promise<void> {
    this.zoneExitTimers[zone] && this.clearTimeout(this.zoneExitTimers[zone] as ioBroker.Timeout);
    this.zoneArmed[zone] = false;
    await this.setStateAsync(`zones.${zone}.armed`, false, true);
    await this.updateModeState();
    await this.logEvent('info', 'zone_disarmed', `Zone ${zone} disarmed`);
  }

  private async disarmAll(): Promise<void> {
    await this.disarmZone('perimeter');
    await this.disarmZone('aussenhaut');
    await this.disarmZone('innenraum');
    await this.abortCountdown();
    await this.setOutput(this.cfg.sirenStateId, false);
    this.camerasManualArmed = false;
    await this.setStateAsync('runtime.camerasManualArmed', false, true);
    await this.applyCameraOutputs();
  }

  private async applyCameraOutputs(): Promise<void> {
    const anyZoneArmed = this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum;
    const camerasEffectiveArmed = anyZoneArmed || this.camerasManualArmed;
    await this.setOutput(this.cfg.cctvArmedId, camerasEffectiveArmed);
    await this.setOutput(this.cfg.cctvDisarmedId, !camerasEffectiveArmed);
  }

  private async updateModeState(): Promise<void> {
    const any = this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum;
    await this.setStateAsync('runtime.mode', any ? 'armed' : 'disarmed', true);
    await this.applyCameraOutputs();
    await this.updateStatusAndChecks();
  }

  private async handleZoneTrigger(label: string, zone: Zone): Promise<void> {
    const entrySec = this.cfg.zoneDelays[zone].entryDelaySec;
    const caseId = `CASE-${Date.now()}`;
    this.activeCaseId = caseId;
    await this.setStateAsync('runtime.activeCaseId', caseId, true);
    await this.setStateAsync('runtime.lastTrigger', `${label} (${zone})`, true);
    await this.setForeignStateSafe(this.cfg.triggerStateId, `${label} (${zone})`);
    await this.logEvent('alarm', 'zone_trigger', `Trigger ${label} in zone ${zone}`, caseId);

    if (this.countdownTimer) return;

    await this.setOutput(this.cfg.displayId, '  Finger auflegen!  ');
    await this.setStateAsync('runtime.mode', 'countdown', true);
    await this.setStateAsync('runtime.countdownRemainingSec', entrySec, true);

    const tick = this.setInterval(async () => {
      const cur = (await this.getStateAsync('runtime.countdownRemainingSec'))?.val as number;
      const next = Math.max(0, Number(cur || 0) - 1);
      await this.setStateAsync('runtime.countdownRemainingSec', next, true);
      if (next > 0 && next % 3 === 0) await this.setOutput(this.cfg.buzzerId, 'beep long 2x');
      if (next === 0) this.clearInterval(tick as ioBroker.Interval);
    }, 1000);

    this.countdownTimer = this.setTimeout(async () => {
      this.countdownTimer = null;
      await this.setStateAsync('runtime.mode', 'alarm', true);
      await this.setOutput(this.cfg.sirenStateId, true);
      await this.executeZoneActions(zone, caseId);
      await this.sendTelegramText(`🚨 Alarm ausgelöst: ${label} (${zone}) | ${caseId}`);
      await this.logEvent('alarm', 'alarm_activated', `Alarm activated (${label}/${zone})`, caseId);
    }, entrySec * 1000) ?? null;
  }

  private async executeZoneActions(zone: Zone, caseId: string): Promise<void> {
    const actions = this.cfg.zoneActions.filter(a => a.zone === zone);
    for (const a of actions) {
      await this.setOutput(a.datapointId, a.onValue);
      await this.logEvent('info', 'zone_action_on', `Zone action ${a.label}: ${a.datapointId}=${String(a.onValue)}`, caseId);
      if (a.pulseMs && a.pulseMs > 0) {
        const offVal = a.offValue !== undefined ? a.offValue : false;
        this.setTimeout(async () => {
          await this.setOutput(a.datapointId, offVal);
          await this.logEvent('info', 'zone_action_off', `Zone action reset ${a.label}: ${a.datapointId}=${String(offVal)}`, caseId);
        }, a.pulseMs);
      }
    }
  }

  private async handlePanic(active: boolean): Promise<void> {
    if (active) {
      for (const id of this.cfg.cameraAlarmOnIds) await this.setOutput(id, true);
      for (const id of this.cfg.reolinkSirenIds) await this.setOutput(id, 20);
      await this.logEvent('alarm', 'panic_on', 'PANIC aktiviert');
    } else {
      for (const id of this.cfg.cameraAlarmOffIds) await this.setOutput(id, true);
      for (const id of this.cfg.reolinkSirenIds) await this.setOutput(id, 0);
      await this.setOutput(this.cfg.cctvDisarmedId, true);
      await this.logEvent('warn', 'panic_off', 'PANIC deaktiviert');
    }
  }

  private async handleFingerprint(raw: ioBroker.StateValue): Promise<void> {
    if (typeof raw !== 'string') return;
    const text = raw.trim().toLowerCase();
    if (!text) return;
    for (const n of this.cfg.knownFingerprints) {
      if (text.includes(n.toLowerCase())) {
        const now = Date.now();
        if (this.lastFingerprintHit === n && now - this.lastFingerprintTs < 3000) return;
        this.lastFingerprintHit = n;
        this.lastFingerprintTs = now;
        await this.disarmAll();
        await this.sendTelegramText(`${n} erkannt – Alarm wird deaktiviert`);
        return;
      }
    }
  }

  private async handlePin(raw: ioBroker.StateValue): Promise<void> {
    if (raw === null || raw === undefined) return;
    const s = String(raw).trim().replace(/[^\d*#]/g, '');
    if (!s) return;
    for (const ch of s) {
      this.pinBuffer = (this.pinBuffer + ch).slice(-2);
      if (this.pinBuffer === '*1') {
        await this.setOutput(this.cfg.garageDoorCommandId, 0);
        await this.setOutput(this.cfg.displayId, '   Tor oeffnet...   ');
        this.setTimeout(() => void this.setOutput(this.cfg.clearDisplayId, true), 4000);
      } else if (this.pinBuffer === '*2') {
        await this.setOutput(this.cfg.garageDoorCommandId, 2);
        await this.setOutput(this.cfg.displayId, '  Tor schliesst...  ');
        this.setTimeout(() => void this.setOutput(this.cfg.clearDisplayId, true), 4000);
      } else if (this.pinBuffer === '*4') {
        await this.setOutput(this.cfg.pdlcId, true);
      } else if (this.pinBuffer === '*5') {
        await this.setOutput(this.cfg.pdlcId, false);
      }
      if (ch === '#') this.pinBuffer = '';
    }
  }

  private async initializePresenceState(): Promise<void> {
    const vals = await Promise.all(this.cfg.autoArmPresenceIds.map(id => this.getForeignStateAsync(id)));
    const someoneHome = vals.some(v => v?.val === true);
    this.presenceLastSomeoneHome = someoneHome;
  }

  private async armZones(zones: Zone[]): Promise<void> {
    for (const zone of zones) await this.armZone(zone);
  }

  private async disarmZones(zones: Zone[]): Promise<void> {
    for (const zone of zones) await this.disarmZone(zone);
  }

  private formatWithDelay(template: string, delaySec: number): string {
    return String(template || '').split('{delay}').join(String(delaySec));
  }

  private async handleGeofenceLeaveEvent(): Promise<void> {
    if (this.cfg.geofenceLeaveArmZones.length > 0) {
      await this.armZones(this.cfg.geofenceLeaveArmZones);
    }
    const msg = String(this.cfg.geofenceLeaveTelegramText || '').trim();
    if (msg) await this.sendTelegramText(msg, this.cfg.geofenceLeaveChatIds);
    await this.logEvent('info', 'geofence_leave', 'Geofence: jemand hat das Zuhause verlassen');
  }

  private async handleGeofenceEnterEvent(): Promise<void> {
    if (this.cfg.geofenceEnterDisarmZones.length > 0) {
      await this.disarmZones(this.cfg.geofenceEnterDisarmZones);
    }
    if (this.cfg.geofenceEnterArmZones.length > 0) {
      await this.armZones(this.cfg.geofenceEnterArmZones);
    }
    const msg = String(this.cfg.geofenceEnterTelegramText || '').trim();
    if (msg) await this.sendTelegramText(msg, this.cfg.geofenceEnterChatIds);
    await this.logEvent('info', 'geofence_enter', 'Geofence: jemand ist Zuhause angekommen');
  }

  private async handleAutoArmWhenNobodyHome(): Promise<void> {
    const vals = await Promise.all(this.cfg.autoArmPresenceIds.map(id => this.getForeignStateAsync(id)));
    const someoneHome = vals.some(v => v?.val === true);
    if (this.presenceLastSomeoneHome === null) {
      this.presenceLastSomeoneHome = someoneHome;
    } else if (this.presenceLastSomeoneHome !== someoneHome) {
      if (!someoneHome) await this.handleGeofenceLeaveEvent();
      else await this.handleGeofenceEnterEvent();
      this.presenceLastSomeoneHome = someoneHome;
    }
    if (someoneHome) {
      if (this.autoArmTimer) this.clearTimeout(this.autoArmTimer);
      this.autoArmTimer = null;
      return;
    }
    if (this.autoArmTimer || this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum) return;
    const pendingMsg = this.formatWithDelay(this.cfg.autoAwayPendingTelegramText, this.cfg.autoArmDelaySec).trim();
    if (pendingMsg) await this.sendTelegramText(pendingMsg, this.cfg.autoAwayChatIds);
    this.autoArmTimer = this.setTimeout(async () => {
      this.autoArmTimer = null;
      await this.armZones(this.cfg.autoAwayArmZones);
      const armedMsg = String(this.cfg.autoAwayArmedTelegramText || '').trim();
      if (armedMsg) await this.sendTelegramText(armedMsg, this.cfg.autoAwayChatIds);
    }, this.cfg.autoArmDelaySec * 1000) ?? null;
  }

  private async handleBedtimePerimeter(): Promise<void> {
    const h = new Date().getHours();
    if (h < this.cfg.bedtimeHour) return;
    const light = (await this.getForeignStateAsync(this.cfg.bedtimeLightSensorId))?.val;
    const armed = this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum;
    const pres = await Promise.all(this.cfg.bedtimePresenceHomeIds.map(id => this.getForeignStateAsync(id)));
    const someoneHome = pres.some(v => v?.val === true);
    if (!armed && someoneHome && typeof light === 'number' && light < this.cfg.bedtimeLightThreshold) {
      await this.armZone('perimeter');
      await this.sendTelegramText('Schlafenszeit erkannt! Perimeterschutz wurde aktiviert!');
    }
  }

  private async updateStatusAndChecks(): Promise<void> {
    const open = (id: string): boolean => {
      const d = this.cfg.sensors.find(s => s.id === id);
      if (!d) return false;
      return this.matchesAny((this.getForeignStateAsync(id) as any)?.val, d.activeValues);
    };
    const terrace = (await this.getForeignStateAsync('mqtt.1.terrace_door_status'))?.val === 'open';
    const entrance = (await this.getForeignStateAsync('mqtt.1.entrance_door_status'))?.val === 'open';
    const side = (await this.getForeignStateAsync('mqtt.1.side_entrance_door_status'))?.val === 'open';
    const shed = (await this.getForeignStateAsync('mqtt.1.Garage.shedDoorStatus'))?.val === 'open';
    await this.setOutput(this.cfg.checkRedId, !terrace);
    await this.setOutput(this.cfg.checkYellowId, !(terrace || entrance || side || shed));

    const lines: string[] = [];
    if (this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum) lines.push('AlarmSystem scharf');
    if (this.zoneArmed.perimeter) lines.push('PerimeterProtection aktiv');
    const doorSensors = this.cfg.sensors.filter(s => s.sensorType === 'contact');
    for (const ds of doorSensors) {
      const v = await this.getForeignStateAsync(ds.id);
      if (this.matchesAny(v?.val ?? null, ds.activeValues)) lines.push(`${ds.label} offen`);
    }
    if (lines.length === 0) lines.push('alle Tueren geschlossen');
    if (!(this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum)) {
      lines[0] = 'AlarmSystem inaktiv - Achtung, kein Schutz!';
    }
    await this.setOutput(this.cfg.statusId, lines.join('\n'));
  }

  private async abortCountdown(): Promise<void> {
    if (this.countdownTimer) this.clearTimeout(this.countdownTimer);
    this.countdownTimer = null;
    await this.setStateAsync('runtime.countdownRemainingSec', 0, true);
    await this.updateModeState();
  }

  private async ackActiveCase(): Promise<void> {
    if (!this.activeCaseId) return;
    const cid = this.activeCaseId;
    this.eventLog = this.eventLog.map(e => e.caseId === cid ? { ...e, acked: true } : e);
    await this.setStateAsync('diagnostics.eventsJson', JSON.stringify(this.eventLog), true);
    await this.logEvent('info', 'case_acked', `Case acknowledged: ${cid}`, cid);
    this.activeCaseId = '';
    await this.setStateAsync('runtime.activeCaseId', '', true);
    await this.disarmAll();
  }

  private async triggerCamera(cam: CameraDef): Promise<void> {
    await this.setOutput(cam.alarmDatapoint, 1);
    if (cam.ledDatapoint) {
      await this.setOutput(cam.ledDatapoint, true);
      this.setTimeout(() => void this.setOutput(cam.ledDatapoint, false), 10000);
    }

    const url = this.applyCredentials(cam.snapshotUrl, cam.username, cam.password);
    for (let i = 0; i < this.cfg.snapshotBurstCount; i++) {
      const delay = this.cfg.snapshotDelayMs + i * this.cfg.snapshotBurstIntervalMs;
      this.setTimeout(() => void this.sendSnapshot(url, cam.label, i + 1), delay);
    }
  }

  private isAnyZoneArmed(): boolean {
    return this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum;
  }

  private snapshotZoneConditionMatches(mode: SnapshotZoneMode, zones: Zone[]): boolean {
    if (mode === 'none') return true;
    if (mode === 'any') return this.isAnyZoneArmed();
    if (!zones.length) return false;
    return zones.some(z => this.zoneArmed[z]);
  }

  private async tryTriggerConfiguredSnapshot(label: string, datapointId?: string, mode: SnapshotZoneMode = 'none', zones: Zone[] = []): Promise<void> {
    const id = String(datapointId || '').trim();
    if (!id) return;
    if (!this.snapshotZoneConditionMatches(mode, zones)) return;
    const st = await this.getForeignStateAsync(id);
    const url = typeof st?.val === 'string' ? st.val.trim() : '';
    if (!url) {
      await this.logEvent('warn', 'snapshot_dp_empty', `Snapshot datapoint leer: ${id} (${label})`);
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      await this.logEvent('warn', 'snapshot_dp_invalid', `Snapshot datapoint ist keine URL: ${id} (${label})`);
      return;
    }
    for (let i = 0; i < this.cfg.snapshotBurstCount; i++) {
      const delay = this.cfg.snapshotDelayMs + i * this.cfg.snapshotBurstIntervalMs;
      this.setTimeout(() => void this.sendSnapshot(url, label, i + 1), delay);
    }
  }

  private isNightModeActive(): boolean {
    if (!this.cfg.cameraNightModeEnabled) return false;
    const lat = typeof this.latitude === 'number' ? this.latitude : undefined;
    const lon = typeof this.longitude === 'number' ? this.longitude : undefined;
    if (lat === undefined || lon === undefined) return false;

    try {
      const now = new Date();
      const times = SunCalc.getTimes(now, lat, lon);
      return now >= times.dusk || now <= times.sunriseEnd;
    } catch {
      return false;
    }
  }

  private async sendSnapshot(url: string, label: string, idx: number): Promise<void> {
    try {
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000, validateStatus: s => s < 500 });
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const file = path.join(os.tmpdir(), `alarm_${Date.now()}_${idx}.jpg`);
      await fs.writeFile(file, Buffer.from(res.data));
      await this.sendTelegramPhoto(file, `AlarmSystem ${label}`);
    } catch (e) {
      await this.logEvent('warn', 'snapshot_error', `Snapshot failed for ${label}: ${String(e)}`);
    }
  }

  private applyCredentials(url: string, user?: string, pass?: string): string {
    return url.split('{username}').join(encodeURIComponent(user || '<USERNAME>')).split('{password}').join(encodeURIComponent(pass || '<PASSWORD>'));
  }

  private async setOutput(id: string | undefined, val: ioBroker.StateValue): Promise<void> {
    if (!id) return;
    if (this.cfg.simulationMode) {
      await this.logEvent('info', 'simulation_output', `SIM: ${id} = ${String(val)}`);
      return;
    }
    await this.setForeignStateSafe(id, val);
  }

  private matchesAny(val: ioBroker.StateValue, list: Array<string | boolean | number>): boolean {
    return list.some(x => x === val);
  }

  private matchesPerson(val: ioBroker.StateValue, p: PersonDetectionDef): boolean {
    if (p.mode === 'boolean') return val === true;
    return typeof val === 'string' && val === (p.detectValue || 'human detected');
  }

  private allowEvent(key: string): boolean {
    const now = Date.now();
    const prev = this.dedupe.get(key) || 0;
    if (now - prev < this.cfg.dedupeMs) return false;
    this.dedupe.set(key, now);
    return true;
  }

  private async logEvent(level: 'info' | 'warn' | 'alarm', type: string, message: string, caseId?: string): Promise<void> {
    const e: EventEntry = { ts: Date.now(), level, type, message, caseId, acked: false };
    this.eventLog.unshift(e);
    this.eventLog = this.eventLog.slice(0, 200);
    await this.setStateAsync('diagnostics.eventsJson', JSON.stringify(this.eventLog), true);
    if (level === 'warn') this.log.warn(message);
    else if (level === 'alarm') this.log.error(message);
    else this.log.info(message);
  }

  private async setForeignStateSafe(id: string, val: ioBroker.StateValue): Promise<void> {
    try { await this.setForeignStateAsync(id, val as any); } catch {}
  }

  private async sendTelegramText(text: string, chatIdsOverride?: string[]): Promise<void> {
    const override = Array.isArray(chatIdsOverride) ? chatIdsOverride.filter(Boolean) : [];
    for (const inst of this.cfg.telegramInstances) {
      const targets = override.length > 0
        ? override.map(chatId => ({ instance: inst.instance, chatId }))
        : this.cfg.telegramTargets.filter(t => t.instance === inst.instance);
      const payloadBase: Record<string, unknown> = { text };
      if (inst.token) payloadBase.token = inst.token;
      if (targets.length === 0) await this.sendToAsync(inst.instance, 'send', payloadBase);
      else for (const t of targets) await this.sendToAsync(inst.instance, 'send', { ...payloadBase, user: t.chatId });
    }
  }

  private async sendTelegramPhoto(file: string, caption?: string): Promise<void> {
    for (const inst of this.cfg.telegramInstances) {
      const targets = this.cfg.telegramTargets.filter(t => t.instance === inst.instance);
      const payloadBase: Record<string, unknown> = { text: file, type: 'photo' };
      if (caption !== undefined) payloadBase.caption = caption;
      if (targets.length === 0) await this.sendToAsync(inst.instance, 'send', payloadBase);
      else for (const t of targets) await this.sendToAsync(inst.instance, 'send', { ...payloadBase, user: t.chatId });
    }
  }

  private async sendTelegramTestPhoto(caption?: string): Promise<void> {
    const cam = this.cfg.cameras.find(c => String(c.snapshotUrl || '').trim());
    if (!cam) {
      await this.logEvent('warn', 'telegram_test_photo_missing_snapshot', 'Telegram Testbild nicht gesendet: keine Kamera mit snapshotUrl konfiguriert');
      await this.sendTelegramText('Test: Kein Snapshot konfiguriert');
      return;
    }
    const url = this.applyCredentials(cam.snapshotUrl, cam.username, cam.password);
    try {
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000, validateStatus: s => s < 500 });
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const file = path.join(os.tmpdir(), `alarm_telegram_test_${Date.now()}.jpg`);
      await fs.writeFile(file, Buffer.from(res.data));
      await this.sendTelegramPhoto(file, caption);
      await this.logEvent('info', 'telegram_test_photo', `Telegram Testbild gesendet (${cam.label || cam.key || cam.ip || 'Kamera'})`);
    } catch (e) {
      await this.logEvent('warn', 'telegram_test_photo_error', `Telegram Testbild fehlgeschlagen: ${String(e)}`);
    }
  }

  private parseScalar(v: string): string | boolean | number {
    if (v === 'true') return true;
    if (v === 'false') return false;
    const n = Number(v);
    if (String(n) === v && Number.isFinite(n)) return n;
    return v;
  }

  private toNumber(v: unknown, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  private async writeDailyTriggerLog(sourceType: 'sensor' | 'personDetection' | 'camera', label: string, sourceId: string, zone: Zone, rawVal: ioBroker.StateValue): Promise<void> {
    try {
      const now = new Date();
      const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const stamp = now.toISOString();
      const line = `${stamp};type=${sourceType};zone=${zone};label=${label};id=${sourceId};value=${String(rawVal)}\n`;
      const baseDir = this.triggerLogDir || path.join(utils.getAbsoluteInstanceDataDir(this), 'trigger-logs');
      await fs.mkdir(baseDir, { recursive: true });
      await fs.appendFile(path.join(baseDir, `${day}.log`), line, 'utf8');
      const currentDate = (await this.getStateAsync('diagnostics.triggerLogDate'))?.val;
      if (currentDate === day) {
        await this.refreshTriggerLogState(day);
      }
    } catch (e) {
      this.log.warn(`Trigger logfile write failed: ${String(e)}`);
    }
  }

  private dayString(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private async refreshTriggerLogState(day: string): Promise<void> {
    const clean = /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : this.dayString(new Date());
    const baseDir = this.triggerLogDir || path.join(utils.getAbsoluteInstanceDataDir(this), 'trigger-logs');
    const file = path.join(baseDir, `${clean}.log`);
    let text = '';
    try {
      text = await fs.readFile(file, 'utf8');
    } catch {
      text = '';
    }
    await this.setStateAsync('diagnostics.triggerLogDate', clean, true);
    await this.setStateAsync('diagnostics.triggerLogText', text || `Keine Trigger-Logs für ${clean}`, true);
  }

  private cloneJson<T>(value: T): T {
    try {
      return JSON.parse(JSON.stringify(value)) as T;
    } catch {
      return value;
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
}

if (require.main !== module) {
  module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new AlarmSystemAdapter(options);
} else {
  (() => new AlarmSystemAdapter())();
}
