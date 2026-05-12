import * as utils from '@iobroker/adapter-core';
import axios from 'axios';
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

type Zone = 'perimeter' | 'aussenhaut' | 'innenraum';
type SensorType = 'pir' | 'contact' | 'presence' | 'personDetection';

type DetectionMode = 'boolean' | 'string';

interface SensorDef {
  key: string;
  id: string;
  label: string;
  sensorType: SensorType;
  zone: Zone;
  activeValues: Array<string | boolean | number>;
}

interface PersonDetectionDef {
  key: string;
  id: string;
  label: string;
  zone: Zone;
  mode: DetectionMode;
  detectValue?: string;
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

interface ActuatorDef {
  key: string;
  id: string;
  onValue?: string;
  offValue?: string;
}

interface TelegramInstanceDef {
  instance: string;
  token?: string;
}

interface TelegramTargetDef {
  instance: string;
  chatId: string;
}

interface Config {
  countdownSec: number;
  dedupeMs: number;
  snapshotDelayMs: number;
  snapshotBurstCount: number;
  snapshotBurstIntervalMs: number;
  armStateId: string;
  perimeterStateId: string;
  triggerStateId: string;
  sirenStateId: string;
  displayId: string;
  clearDisplayId: string;
  buzzerId: string;
  motionSensorId: string;
  ledRedId: string;
  ledYellowId: string;
  standbyId: string;
  sensors: SensorDef[];
  personDetections: PersonDetectionDef[];
  cameras: CameraDef[];
  actuators: ActuatorDef[];
  telegramInstances: TelegramInstanceDef[];
  telegramTargets: TelegramTargetDef[];
}

class AlarmSystemAdapter extends utils.Adapter {
  private cfg!: Config;
  private activeById = new Map<string, boolean>();
  private dedupe = new Map<string, number>();
  private lastTrigger = '';
  private zoneState: Record<Zone, boolean> = { perimeter: false, aussenhaut: false, innenraum: false };
  private countdownRemaining = 0;
  private countdownTimer: ioBroker.Timeout | null = null;
  private countdownTick: ioBroker.Interval | null = null;

  public constructor(options: Partial<utils.AdapterOptions> = {}) {
    super({ ...options, name: 'alarmsystem' });
    this.on('ready', this.onReady.bind(this));
    this.on('stateChange', this.onStateChange.bind(this));
  }

  private async onReady(): Promise<void> {
    this.cfg = this.buildConfig();

    await this.subscribeStates('*');
    await this.subscribeForeignInputs();

    await this.ensureRuntimeStates();
    await this.refreshAllInputs();
    await this.recomputeIndicators();

    this.log.info('AlarmSystem started with zone-based logic');
  }

  private buildConfig(): Config {
    const n = this.config as Record<string, any>;

    const fromTableSensors = this.parseSensorTable(n.pirSensorsTable, 'pir')
      .concat(this.parseSensorTable(n.contactSensorsTable, 'contact'))
      .concat(this.parseSensorTable(n.presenceSensorsTable, 'presence'));
    const fromTablePd = this.parsePersonDetectionTable(n.personDetectionTable);

    const sensors = fromTableSensors.length > 0 ? fromTableSensors : this.tryJson<SensorDef[]>(n.sensorsJson, []);
    const personDetections = fromTablePd.length > 0 ? fromTablePd : this.tryJson<PersonDetectionDef[]>(n.personDetectionJson, []);

    const cameras = (Array.isArray(n.camerasTable) ? n.camerasTable : this.tryJson<CameraDef[]>(n.camerasJson, [])).map((c: any) => ({
      key: String(c.key || c.ip || c.label || ''),
      label: String(c.label || c.key || c.ip || ''),
      ip: String(c.ip || ''),
      streamUrl: String(c.streamUrl || ''),
      snapshotUrl: String(c.snapshotUrl || ''),
      alarmDatapoint: c.alarmDatapoint ? String(c.alarmDatapoint) : undefined,
      ledDatapoint: c.ledDatapoint ? String(c.ledDatapoint) : undefined,
      username: c.username ? String(c.username) : undefined,
      password: c.password ? String(c.password) : undefined,
      personDetectionDp: c.personDetectionDp ? String(c.personDetectionDp) : undefined
    }));

    const actuators = (Array.isArray(n.actuatorsTable) ? n.actuatorsTable : this.tryJson<ActuatorDef[]>(n.actuatorsJson, [])).map((a: any) => ({
      key: String(a.key || a.id || ''),
      id: String(a.id || ''),
      onValue: a.onValue !== undefined && a.onValue !== '' ? String(a.onValue) : undefined,
      offValue: a.offValue !== undefined && a.offValue !== '' ? String(a.offValue) : undefined
    })).filter((a: ActuatorDef) => a.id);

    const telegramInstances = (Array.isArray(n.telegramInstancesTable) ? n.telegramInstancesTable : this.tryJson<TelegramInstanceDef[]>(n.telegramInstancesJson, [])).map((x: any) => ({
      instance: String(x.instance || '').trim(),
      token: x.token ? String(x.token) : undefined
    })).filter((x: TelegramInstanceDef) => x.instance);

    const telegramTargets = (Array.isArray(n.telegramTargetsTable) ? n.telegramTargetsTable : this.tryJson<TelegramTargetDef[]>(n.telegramTargetsJson, [])).map((x: any) => ({
      instance: String(x.instance || '').trim(),
      chatId: String(x.chatId || '').trim()
    })).filter((x: TelegramTargetDef) => x.instance && x.chatId);

    return {
      countdownSec: this.toNumber(n.defaultCountdownSec, 20),
      dedupeMs: this.toNumber(n.eventDedupeMs, 1000),
      snapshotDelayMs: this.toNumber(n.snapshotSendDelayMs, 0),
      snapshotBurstCount: Math.max(1, this.toNumber(n.snapshotBurstCount, 1)),
      snapshotBurstIntervalMs: Math.max(500, this.toNumber(n.snapshotBurstIntervalMs, 5000)),
      armStateId: n.armStateId || 'mqtt.1.AlarmCenter.AlarmSystemArmed',
      perimeterStateId: n.perimeterStateId || 'mqtt.1.AlarmCenter.PerimeterProtection',
      triggerStateId: n.triggerStateId || 'mqtt.1.AlarmCenter.AlarmTrigger',
      sirenStateId: n.sirenStateId || 'mqtt.1.AlarmCenter.ActivateSiren',
      displayId: n.displayId || 'mqtt.1.AlarmCenter.Display',
      clearDisplayId: n.clearDisplayId || 'mqtt.1.AlarmCenter.ClearDisplay',
      buzzerId: n.buzzerId || 'mqtt.1.AlarmCenter.Buzzer',
      motionSensorId: n.motionSensorId || 'mqtt.1.AlarmCenter.MotionSensor',
      ledRedId: n.ledRedId || 'mqtt.1.AlarmCenter.LEDRingRed',
      ledYellowId: n.ledYellowId || 'mqtt.1.AlarmCenter.LEDRingYellow',
      standbyId: n.standbyId || 'mqtt.1.AlarmCenter.StandBy',
      sensors,
      personDetections,
      cameras,
      actuators,
      telegramInstances,
      telegramTargets
    };
  }

  private parseSensorTable(rows: any, sensorType: SensorType): SensorDef[] {
    if (!Array.isArray(rows)) return [];
    return rows
      .filter(r => r && r.id)
      .map((r: any) => ({
        key: String(r.key || r.id),
        id: String(r.id),
        label: String(r.label || r.key || r.id),
        sensorType,
        zone: this.parseZone(r.zone),
        activeValues: String(r.activeValuesCsv || 'open').split(',').map((x: string) => x.trim()).filter(Boolean).map((x: string) => this.parseScalar(x))
      }));
  }

  private parsePersonDetectionTable(rows: any): PersonDetectionDef[] {
    if (!Array.isArray(rows)) return [];
    return rows
      .filter(r => r && r.id)
      .map((r: any) => ({
        key: String(r.key || r.id),
        id: String(r.id),
        label: String(r.label || r.key || r.id),
        zone: this.parseZone(r.zone),
        mode: (r.mode === 'string' ? 'string' : 'boolean'),
        detectValue: r.detectValue ? String(r.detectValue) : undefined
      }));
  }

  private parseZone(v: any): Zone {
    const z = String(v || '').toLowerCase();
    if (z === 'innenraum') return 'innenraum';
    if (z === 'aussenhaut') return 'aussenhaut';
    return 'perimeter';
  }

  private async subscribeForeignInputs(): Promise<void> {
    const ids = new Set<string>([
      this.cfg.armStateId,
      this.cfg.perimeterStateId,
      this.cfg.motionSensorId
    ]);

    for (const s of this.cfg.sensors) ids.add(s.id);
    for (const p of this.cfg.personDetections) ids.add(p.id);
    for (const c of this.cfg.cameras) {
      if (c.personDetectionDp) ids.add(c.personDetectionDp);
      if (c.alarmDatapoint) ids.add(c.alarmDatapoint);
      if (c.ledDatapoint) ids.add(c.ledDatapoint);
    }

    for (const id of ids) await this.subscribeForeignStatesAsync(id);
  }

  private async ensureRuntimeStates(): Promise<void> {
    await this.setStateAsync('runtime.mode', 'disarmed', true);
    await this.setStateAsync('runtime.lastTrigger', '', true);
    await this.setStateAsync('runtime.countdownRemainingSec', 0, true);
    await this.setStateAsync('zones.perimeter.armed', false, true);
    await this.setStateAsync('zones.aussenhaut.armed', false, true);
    await this.setStateAsync('zones.innenraum.armed', false, true);
  }

  private async refreshAllInputs(): Promise<void> {
    for (const s of this.cfg.sensors) {
      const st = await this.getForeignStateAsync(s.id);
      this.activeById.set(s.id, this.matchesAny(st?.val ?? null, s.activeValues));
    }
    for (const p of this.cfg.personDetections) {
      const st = await this.getForeignStateAsync(p.id);
      this.activeById.set(p.id, this.matchesPersonDetection(st?.val ?? null, p));
    }
  }

  private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
    if (!state) return;

    const localId = id.startsWith(this.namespace + '.') ? id.slice(this.namespace.length + 1) : '';

    if (localId && !state.ack) {
      if (localId === 'commands.armAll' && state.val === true) {
        await this.setZoneArmed('perimeter', true);
        await this.setZoneArmed('aussenhaut', true);
        await this.setZoneArmed('innenraum', true);
        await this.setStateAsync('commands.armAll', false, true);
        return;
      }
      if (localId === 'commands.disarmAll' && state.val === true) {
        await this.setZoneArmed('perimeter', false);
        await this.setZoneArmed('aussenhaut', false);
        await this.setZoneArmed('innenraum', false);
        await this.abortCountdown();
        await this.setForeignStateSafe(this.cfg.sirenStateId, false);
        await this.setStateAsync('commands.disarmAll', false, true);
        return;
      }
      if (localId === 'commands.armPerimeterZone' && state.val === true) {
        await this.setZoneArmed('perimeter', true);
        await this.setStateAsync('commands.armPerimeterZone', false, true);
        return;
      }
      if (localId === 'commands.armAussenhautZone' && state.val === true) {
        await this.setZoneArmed('aussenhaut', true);
        await this.setStateAsync('commands.armAussenhautZone', false, true);
        return;
      }
      if (localId === 'commands.armInnenraumZone' && state.val === true) {
        await this.setZoneArmed('innenraum', true);
        await this.setStateAsync('commands.armInnenraumZone', false, true);
        return;
      }
      if (localId === 'commands.disarmPerimeterZone' && state.val === true) {
        await this.setZoneArmed('perimeter', false);
        await this.setStateAsync('commands.disarmPerimeterZone', false, true);
        return;
      }
      if (localId === 'commands.disarmAussenhautZone' && state.val === true) {
        await this.setZoneArmed('aussenhaut', false);
        await this.setStateAsync('commands.disarmAussenhautZone', false, true);
        return;
      }
      if (localId === 'commands.disarmInnenraumZone' && state.val === true) {
        await this.setZoneArmed('innenraum', false);
        await this.setStateAsync('commands.disarmInnenraumZone', false, true);
        return;
      }
      return;
    }

    if (id === this.cfg.armStateId && state.val === true) {
      await this.setZoneArmed('perimeter', true);
      await this.setZoneArmed('aussenhaut', true);
      await this.setZoneArmed('innenraum', true);
      return;
    }
    if (id === this.cfg.perimeterStateId && state.val === true) {
      await this.setZoneArmed('perimeter', true);
      return;
    }

    const s = this.cfg.sensors.find(x => x.id === id);
    if (s) {
      const active = this.matchesAny(state.val, s.activeValues);
      this.activeById.set(s.id, active);
      await this.recomputeIndicators();
      if (active && this.isZoneArmed(s.zone) && this.allowEvent(s.id)) {
        await this.startCountdown(s.label, s.zone);
      }
      return;
    }

    const p = this.cfg.personDetections.find(x => x.id === id);
    if (p) {
      const active = this.matchesPersonDetection(state.val, p);
      this.activeById.set(p.id, active);
      if (active && this.isZoneArmed(p.zone) && this.allowEvent(p.id)) {
        await this.startCountdown(p.label, p.zone);
      }
      return;
    }

    for (const cam of this.cfg.cameras) {
      if (cam.personDetectionDp && id === cam.personDetectionDp) {
        const active = state.val === true || state.val === 'human detected';
        if (active && this.allowEvent(cam.personDetectionDp)) {
          await this.triggerCameraOutputs(cam);
        }
      }
    }
  }

  private async triggerCameraOutputs(cam: CameraDef): Promise<void> {
    if (cam.alarmDatapoint) await this.setForeignStateSafe(cam.alarmDatapoint, 1);
    if (cam.ledDatapoint) {
      await this.setForeignStateSafe(cam.ledDatapoint, true);
      this.setTimeout(() => void this.setForeignStateSafe(cam.ledDatapoint as string, false), 10000);
    }
    if (!cam.snapshotUrl) return;

    const snapshotUrl = this.applyCameraCredentials(cam.snapshotUrl, cam.username, cam.password);

    for (let i = 0; i < this.cfg.snapshotBurstCount; i++) {
      const wait = this.cfg.snapshotDelayMs + i * this.cfg.snapshotBurstIntervalMs;
      this.setTimeout(() => void this.sendSnapshot(snapshotUrl, cam.label, i + 1), wait);
    }
  }

  private async sendSnapshot(url: string, label: string, idx: number): Promise<void> {
    try {
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000, validateStatus: s => s < 500 });
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const file = path.join(os.tmpdir(), `alarmsystem_${Date.now()}_${idx}.jpg`);
      await fs.writeFile(file, Buffer.from(res.data));
      await this.sendTelegramPhoto(file, `AlarmSystem: ${label}`);
    } catch (e) {
      await this.sendTelegramText(`Snapshot Fehler (${label}): ${String(e)}`);
    }
  }

  private applyCameraCredentials(tpl: string, user?: string, pass?: string): string {
    return tpl
      .split('{username}').join(encodeURIComponent(user || '<USERNAME>'))
      .split('{password}').join(encodeURIComponent(pass || '<PASSWORD>'));
  }

  private async startCountdown(label: string, zone: Zone): Promise<void> {
    if (this.countdownTimer) return;

    this.lastTrigger = `${label} (${zone})`;
    await this.setStateAsync('runtime.lastTrigger', this.lastTrigger, true);
    await this.setForeignStateSafe(this.cfg.triggerStateId, this.lastTrigger);
    await this.setForeignStateSafe(this.cfg.displayId, '  Finger auflegen!  ');

    this.countdownRemaining = this.cfg.countdownSec;
    await this.setStateAsync('runtime.mode', 'countdown', true);
    await this.setStateAsync('runtime.countdownRemainingSec', this.countdownRemaining, true);

    this.countdownTick = this.setInterval(async () => {
      this.countdownRemaining = Math.max(0, this.countdownRemaining - 1);
      await this.setStateAsync('runtime.countdownRemainingSec', this.countdownRemaining, true);
      if (this.countdownRemaining > 0 && this.countdownRemaining % 3 === 0) {
        await this.setForeignStateSafe(this.cfg.buzzerId, 'beep long 2x');
      }
    }, 1000) ?? null;

    this.countdownTimer = this.setTimeout(async () => {
      this.countdownTimer = null;
      if (this.countdownTick) this.clearInterval(this.countdownTick);
      this.countdownTick = null;
      await this.setForeignStateSafe(this.cfg.sirenStateId, true);
      await this.setStateAsync('runtime.mode', 'alarm', true);
      await this.sendTelegramText(`🚨 Alarm: ${this.lastTrigger}`);
    }, this.cfg.countdownSec * 1000) ?? null;
  }

  private async abortCountdown(): Promise<void> {
    if (this.countdownTimer) this.clearTimeout(this.countdownTimer);
    this.countdownTimer = null;
    if (this.countdownTick) this.clearInterval(this.countdownTick);
    this.countdownTick = null;
    this.countdownRemaining = 0;
    await this.setStateAsync('runtime.countdownRemainingSec', 0, true);
    await this.setStateAsync('runtime.mode', 'disarmed', true);
  }

  private async recomputeIndicators(): Promise<void> {
    const contactsOpen = this.cfg.sensors.filter(s => s.sensorType === 'contact' && this.activeById.get(s.id));
    const pirActive = this.cfg.sensors.filter(s => s.sensorType === 'pir' && this.activeById.get(s.id));
    await this.setForeignStateSafe(this.cfg.ledRedId, contactsOpen.length > 0);
    await this.setForeignStateSafe(this.cfg.ledYellowId, pirActive.length > 0);
  }

  private async setZoneArmed(zone: Zone, armed: boolean): Promise<void> {
    this.zoneState[zone] = armed;
    await this.setStateAsync(`zones.${zone}.armed`, armed, true);
    await this.setStateAsync('runtime.mode', this.anyZoneArmed() ? 'armed' : 'disarmed', true);
  }

  private isZoneArmed(zone: Zone): boolean {
    return this.zoneState[zone] === true;
  }

  private anyZoneArmed(): boolean {
    return this.zoneState.perimeter || this.zoneState.aussenhaut || this.zoneState.innenraum;
  }

  private allowEvent(key: string): boolean {
    const now = Date.now();
    const prev = this.dedupe.get(key) || 0;
    if (now - prev < this.cfg.dedupeMs) return false;
    this.dedupe.set(key, now);
    return true;
  }

  private matchesAny(val: ioBroker.StateValue, expected: Array<string | boolean | number>): boolean {
    return expected.some(x => val === x);
  }

  private matchesPersonDetection(val: ioBroker.StateValue, def: PersonDetectionDef): boolean {
    if (def.mode === 'boolean') return val === true;
    return typeof val === 'string' && val === (def.detectValue || 'human detected');
  }

  private parseScalar(v: string): string | boolean | number {
    if (v === 'true') return true;
    if (v === 'false') return false;
    const n = Number(v);
    if (String(n) === v && Number.isFinite(n)) return n;
    return v;
  }

  private async setForeignStateSafe(id: string, val: ioBroker.StateValue): Promise<void> {
    try {
      await this.setForeignStateAsync(id, val as any);
    } catch {
      // ignore missing datapoints during migration
    }
  }

  private async sendTelegramText(text: string): Promise<void> {
    for (const inst of this.cfg.telegramInstances) {
      const targets = this.cfg.telegramTargets.filter(t => t.instance === inst.instance);
      if (targets.length === 0) {
        await this.sendToAsync(inst.instance, 'send', { text });
        continue;
      }
      for (const t of targets) {
        await this.sendToAsync(inst.instance, 'send', { user: t.chatId, text });
      }
    }
  }

  private async sendTelegramPhoto(file: string, caption: string): Promise<void> {
    for (const inst of this.cfg.telegramInstances) {
      const targets = this.cfg.telegramTargets.filter(t => t.instance === inst.instance);
      if (targets.length === 0) {
        await this.sendToAsync(inst.instance, 'send', { text: file, type: 'photo', caption });
        continue;
      }
      for (const t of targets) {
        await this.sendToAsync(inst.instance, 'send', { user: t.chatId, text: file, type: 'photo', caption });
      }
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

  private toNumber(v: unknown, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
}

if (require.main !== module) {
  module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new AlarmSystemAdapter(options);
} else {
  (() => new AlarmSystemAdapter())();
}
