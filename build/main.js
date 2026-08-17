"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils = __importStar(require("@iobroker/adapter-core"));
const axios_1 = __importDefault(require("axios"));
const node_fs_1 = require("node:fs");
const os = __importStar(require("node:os"));
const path = __importStar(require("node:path"));
const suncalc_1 = __importDefault(require("suncalc"));
class AlarmSystemAdapter extends utils.Adapter {
    constructor(options = {}) {
        super({ ...options, name: 'alarmsystem' });
        this.zoneArmed = { perimeter: false, aussenhaut: false, innenraum: false };
        this.camerasManualArmed = false;
        this.zoneExitTimers = {};
        this.dedupe = new Map();
        this.lastSeen = new Map();
        this.heartbeatMonitoredIds = new Set();
        this.heartbeatTimer = null;
        this.autoArmTimer = null;
        this.presenceLastSomeoneHome = null;
        this.lastFingerprintHit = '';
        this.lastFingerprintTs = 0;
        this.lastGarageFingerprintHit = '';
        this.lastGarageFingerprintTs = 0;
        this.activeCaseId = '';
        this.eventLog = [];
        this.countdownTimer = null;
        this.countdownZone = null;
        this.standbySafetyTimer = null;
        this.standbySwitchTimer = null;
        this.standbyNoMotionSince = null;
        this.ledSafetyTimer = null;
        this.displayCycleTimer = null;
        this.displayOpenQueue = [];
        this.displayCycleIndex = 0;
        this.alarmRepeatTimer = null;
        this.triggerResetTimer = null;
        this.pinArmed = false;
        this.pinArmedAt = 0;
        this.pinLastTriggerAt = 0;
        this.openDoorBeepResetTimer = null;
        this.triggerLogDir = null;
        this.sunsetAutoTimer = null;
        this.lastSunsetAutoArmDay = '';
        this.pendingModeFlowTimers = new Set();
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
    }
    async onReady() {
        this.cfg = this.buildConfig();
        this.triggerLogDir = path.join(utils.getAbsoluteInstanceDataDir(this), 'trigger-logs');
        await this.subscribeStates('*');
        await this.subscribeForeignInputs();
        await this.ensureWebUiCameraStates();
        await this.ensureStates();
        await this.setOutput(this.cfg.countdownStateId, false);
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
        this.startLedSafetyCheck();
        await this.refreshStatusIndicators();
        await this.refreshDisplayCycle();
        await this.syncPanicStartupState();
        this.startSunsetAutomationCheck();
        await this.logEvent('info', 'system_start', 'AlarmSystem gestartet');
    }
    async ensureWebUiCameraStates() {
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
        await this.setObjectNotExistsAsync('commands.announceAlarm', {
            type: 'state',
            common: { name: 'Announce alarm', type: 'boolean', role: 'button', read: true, write: true, def: false },
            native: {}
        });
        await this.setObjectNotExistsAsync('commands.activatePerimeterAlarm', {
            type: 'state',
            common: { name: 'Activate perimeter alarm level', type: 'boolean', role: 'button', read: true, write: true, def: false },
            native: {}
        });
        await this.setObjectNotExistsAsync('commands.activateInteriorAlarm', {
            type: 'state',
            common: { name: 'Activate interior alarm level', type: 'boolean', role: 'button', read: true, write: true, def: false },
            native: {}
        });
        await this.setObjectNotExistsAsync('commands.activateFullAlarm', {
            type: 'state',
            common: { name: 'Activate full alarm level', type: 'boolean', role: 'button', read: true, write: true, def: false },
            native: {}
        });
    }
    buildConfig() {
        const n = this.config;
        const sensors = this.parseSensorTable(n.pirSensorsTable, 'pir')
            .concat(this.parseSensorTable(n.contactSensorsTable, 'contact'))
            .concat(this.parseSensorTable(n.presenceSensorsTable, 'presence'));
        const personDetections = this.parsePersonDetectionTable(n.personDetectionTable);
        const cameras = this.parseCamerasTable(n.camerasTable);
        const zoneActions = this.parseZoneActionsTable(n.zoneActionsTable);
        const snapshotActionTargets = this.parseSnapshotActionTargetsTable(n.snapshotActionTargetsTable);
        const alarmActions = this.parseAlarmActionsTable(n.alarmActionsTable);
        const panicActions = this.parsePanicActionsTable(n.panicActionsTable);
        const modeFlowRules = this.parseModeFlowRulesTable(n.modeFlowRulesTable);
        const autoAwayMode = this.parseModeFlowAutoAwayMode(n.modeFlowAutoAwayMode);
        const autoAwayZonesFromMode = autoAwayMode === 'perimeter'
            ? ['perimeter']
            : (autoAwayMode === 'vollschutz' ? ['perimeter', 'aussenhaut', 'innenraum'] : []);
        const fallbackAutoAwayZones = this.parseZonesCsv(n.autoAwayArmZonesCsv || 'perimeter,aussenhaut,innenraum');
        const effectiveAutoAwayZones = autoAwayMode === 'legacy' ? fallbackAutoAwayZones : autoAwayZonesFromMode;
        const defaultRedOpenIds = [
            'mqtt.1.entrance_door_status',
            'mqtt.1.terrace_door_status',
            'mqtt.1.side_entrance_door_status',
            'mqtt.1.Garage.shedDoorStatus',
            'mqtt.1.Garage.door3Status'
        ];
        const defaultYellowOpenIds = ['mqtt.1.WC_children.windowStatus'];
        const defaultStatusOpenIds = [
            'mqtt.1.entrance_door_status',
            'mqtt.1.side_entrance_door_status',
            'mqtt.1.Garage.shedDoorStatus',
            'mqtt.1.terrace_door_status',
            'mqtt.1.WC_children.windowStatus',
            'mqtt.1.Garage.door3Status'
        ];
        const defaultCheckRedOpenIds = ['mqtt.1.terrace_door_status'];
        const defaultCheckYellowOpenIds = [
            'mqtt.1.entrance_door_status',
            'mqtt.1.side_entrance_door_status',
            'mqtt.1.Garage.shedDoorStatus',
            'mqtt.1.terrace_door_status'
        ];
        return {
            dedupeMs: this.toNumber(n.eventDedupeMs, 1000),
            defaultEntryDelaySec: this.toNumber(n.defaultEntryDelaySec, 20),
            defaultExitDelaySec: this.toNumber(n.defaultExitDelaySec, 10),
            snapshotDelayMs: this.toNumber(n.snapshotSendDelayMs, 0),
            snapshotBurstCount: Math.max(1, this.toNumber(n.snapshotBurstCount, 1)),
            snapshotBurstIntervalMs: Math.max(500, this.toNumber(n.snapshotBurstIntervalMs, 5000)),
            heartbeatTimeoutSec: this.toNumber(n.heartbeatTimeoutSec, 180),
            simulationMode: this.toBool(n.simulationMode, false),
            cameraNightModeEnabled: this.toBool(n.cameraNightModeEnabled, true),
            cameraNightModeArmsCameras: this.toBool(n.cameraNightModeArmsCameras, true),
            alarmActionZoneTriggerTiming: String(n.alarmActionZoneTriggerTiming || '').toLowerCase() === 'immediate' ? 'immediate' : 'after_alarm',
            countdownAbortMode: this.parseCountdownAbortMode(n.countdownAbortMode),
            alarmRepeatTelegramEnabled: this.toBool(n.alarmRepeatTelegramEnabled, true),
            alarmRepeatTelegramIntervalSec: Math.max(5, this.toNumber(n.alarmRepeatTelegramIntervalSec, 60)),
            alarmRepeatTelegramText: String(n.alarmRepeatTelegramText || 'Alarm !!!'),
            alarmRepeatTelegramIncludeTrigger: this.toBool(n.alarmRepeatTelegramIncludeTrigger, true),
            alarmRepeatTelegramTriggerPrefix: String(n.alarmRepeatTelegramTriggerPrefix || 'Trigger: '),
            alarmTriggerAutoResetMs: Math.max(0, this.toNumber(n.alarmTriggerAutoResetMs, 60000)),
            panicStartupSyncEnabled: this.toBool(n.panicStartupSyncEnabled, true),
            armStateId: n.armStateId || 'mqtt.1.AlarmCenter.AlarmSystemArmed',
            hullProtectionStateId: n.hullProtectionStateId || 'mqtt.1.AlarmCenter.HullProtection',
            perimeterStateId: n.perimeterStateId || 'mqtt.1.AlarmCenter.PerimeterProtection',
            countdownStateId: n.countdownStateId || 'mqtt.1.AlarmCenter.ActivateAlarmCountdown',
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
            speakId: n.speakId || '',
            fingerprintStateId: n.fingerprintStateId || 'mqtt.1.fingerprintDoorbell.lastLogMessage',
            knownFingerprints: String(n.fingerprintUsersCsv || 'Sebastian R1,Teresa R1,Catharina R1,Rita R1,Lukas R1,Florian R1,Monika R1,Michelle L1,Marie R1,Julia R1').split(',').map((x) => x.trim()).filter(Boolean),
            pinStateId: n.pinStateId || 'mqtt.1.AlarmCenter.PIN',
            pinSequenceWindowMs: Math.max(200, this.toNumber(n.pinSequenceWindowMs, 4000)),
            pinTriggerCooldownMs: Math.max(0, this.toNumber(n.pinTriggerCooldownMs, 1500)),
            fingerprintCooldownMs: Math.max(500, this.toNumber(n.fingerprintCooldownMs, 3000)),
            pdlcId: n.pdlcId || 'tuya.0.bf2bb23b342877f2e1maqy.1',
            garageDoorCommandId: n.garageDoorCommandId || 'hmip.0.devices.3014F711A000241F29970E70.channels.1.doorCommand',
            nukiFrontDoorId: n.nukiFrontDoorId || 'nuki-extended.0.smartlocks.haustür._ACTION.UNLATCH',
            nukiSideDoorId: n.nukiSideDoorId || 'nuki-extended.0.smartlocks.tür._ACTION.UNLATCH',
            nukiUnlatchResetMs: Math.max(500, this.toNumber(n.nukiUnlatchResetMs, 3000)),
            garageFingerprintStateId: n.garageFingerprintStateId || 'mqtt.1.fingerprintSensorGarage.matchName',
            fingerprintSnapshotCameraKey: String(n.fingerprintSnapshotCameraKey || 'driveway'),
            fingerprintScenarios: this.parseFingerprintScenariosTable(n.fingerprintScenariosTable),
            snapshotTriggerDatapoints: this.parseSnapshotTriggerDatapointsTable(n.snapshotTriggerDatapointsTable),
            doorbellRingStateId: n.doorbellRingStateId || 'mqtt.1.fingerprintDoorbell.ring',
            geofencePersons: this.parseGeofencePersonsTable(n.geofencePersonsTable),
            instarDetectionDatapointId: String(n.instarDetectionDatapointId || ''),
            autoArmPresenceIds: this.tryJson(n.presenceIdsJson, [
                '0_userdata.0.presence_geofence.Sebastian',
                '0_userdata.0.presence_geofence.Teresa',
                '0_userdata.0.presence_at_home.Sebastian',
                '0_userdata.0.presence_at_home.Teresa'
            ]),
            autoArmDelaySec: this.toNumber(n.autoArmDelaySec, 60),
            autoAwayArmZones: effectiveAutoAwayZones,
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
            bedtimePresenceHomeIds: this.tryJson(n.bedtimePresenceHomeIdsJson, [
                '0_userdata.0.presence_at_home.Sebastian',
                '0_userdata.0.presence_at_home.Teresa'
            ]),
            bedtimeHour: this.toNumber(n.bedtimeHour, 20),
            bedtimeLightThreshold: this.toNumber(n.bedtimeLightThreshold, 30),
            cctvArmedId: n.cctvArmedId || '0_userdata.0.CCTVSystem.alarmSystemArmed',
            cctvDisarmedId: n.cctvDisarmedId || '0_userdata.0.CCTVSystem.alarmSystemDisarmed',
            drivewayFlashlightTriggerId: n.drivewayFlashlightTriggerId || '0_userdata.0.CamDriveway.Human_triggered_flashlight_only_OFF',
            resetHumanDetectionIds: this.tryJson(n.resetHumanDetectionIdsJson, [
                'mqtt.2.HumanDetection.CamBackyard',
                'mqtt.2.HumanDetection.CamBalkonyNorth',
                'mqtt.2.HumanDetection.CamBalkonySouth',
                'mqtt.2.HumanDetection.CamDriveway',
                'mqtt.2.HumanDetection.CamFrontyardLeft',
                'mqtt.2.HumanDetection.CamFrontyardRight',
                'mqtt.2.HumanDetection.CamTerrace'
            ]),
            cameraAlarmOnIds: this.tryJson(n.cameraAlarmOnIdsJson, [
                '0_userdata.0.CamBackyard.Alarm_ON',
                '0_userdata.0.CamBalkonyNorth.Alarm_ON',
                '0_userdata.0.CamBalkonySouth.Alarm_ON',
                '0_userdata.0.CamDriveway.Alarm_ON',
                '0_userdata.0.CamFrontyardLeft.Alarm_ON',
                '0_userdata.0.CamFrontyardRight.Alarm_ON',
                '0_userdata.0.CamTerrace.Alarm_ON'
            ]),
            cameraAlarmOffIds: this.tryJson(n.cameraAlarmOffIdsJson, [
                '0_userdata.0.CamBackyard.Alarm_OFF',
                '0_userdata.0.CamBalkonyNorth.Alarm_OFF',
                '0_userdata.0.CamBalkonySouth.Alarm_OFF',
                '0_userdata.0.CamDriveway.Alarm_OFF',
                '0_userdata.0.CamFrontyardLeft.Alarm_OFF',
                '0_userdata.0.CamFrontyardRight.Alarm_OFF',
                '0_userdata.0.CamTerrace.Alarm_OFF'
            ]),
            reolinkSirenIds: this.tryJson(n.reolinkSirenIdsJson, [
                'reolink.0.settings.playAlarm',
                'reolink.1.settings.playAlarm',
                'reolink.2.settings.playAlarm',
                'reolink.3.settings.playAlarm'
            ]),
            standbyNoMotionValue: String(n.standbyNoMotionValue || 'no motion'),
            standbyTimeoutMs: Math.max(1000, this.toNumber(n.standbyTimeoutMs, 20000)),
            standbySafetyIntervalMs: Math.max(1000, this.toNumber(n.standbySafetyIntervalMs, 10000)),
            ledRedOpenIds: this.parseCsvWithFallback(n.ledRedOpenIdsCsv, defaultRedOpenIds),
            ledYellowOpenIds: this.parseCsvWithFallback(n.ledYellowOpenIdsCsv, defaultYellowOpenIds),
            ledOnlyInStandby: this.toBool(n.ledOnlyInStandby, true),
            ledSafetyIntervalMs: Math.max(500, this.toNumber(n.ledSafetyIntervalMs, 1000)),
            checkRedOpenIds: this.parseCsvWithFallback(n.checkRedOpenIdsCsv, defaultCheckRedOpenIds),
            checkYellowOpenIds: this.parseCsvWithFallback(n.checkYellowOpenIdsCsv, defaultCheckYellowOpenIds),
            statusOpenIds: this.parseCsvWithFallback(n.statusOpenIdsCsv, defaultStatusOpenIds),
            statusNoProtectionText: String(n.statusNoProtectionText || 'AlarmSystem inaktiv - Achtung, kein Schutz!'),
            statusAllClosedText: String(n.statusAllClosedText || 'alle Türen geschlossen'),
            displayDoorCycleEnabled: this.toBool(n.displayDoorCycleEnabled, true),
            displayDoorCycleIntervalMs: Math.max(500, this.toNumber(n.displayDoorCycleIntervalMs, 2000)),
            displayDoorTemplate: String(n.displayDoorTemplate || '{door} offen'),
            displayFallbackSourceIds: this.parseCsvWithFallback(n.displayFallbackSourceIdsCsv, ['0_userdata.0.currentDateTime', 'sainlogic.0.weather.current.outdoortemp']),
            displayFallbackSuffix: String(n.displayFallbackSuffix || " 'C"),
            sensors,
            personDetections,
            cameras,
            zoneActions,
            snapshotActionTargets,
            alarmActions,
            panicActions,
            modeFlowRules,
            modeFlowAnnounceCommandId: String(n.modeFlowAnnounceCommandId || `${this.namespace}.commands.announceAlarm`).trim(),
            modeFlowPerimeterAlarmCommandId: String(n.modeFlowPerimeterAlarmCommandId || `${this.namespace}.commands.activatePerimeterAlarm`).trim(),
            modeFlowInteriorAlarmCommandId: String(n.modeFlowInteriorAlarmCommandId || `${this.namespace}.commands.activateInteriorAlarm`).trim(),
            modeFlowFullAlarmCommandId: String(n.modeFlowFullAlarmCommandId || `${this.namespace}.commands.activateFullAlarm`).trim(),
            modeFlowTelegramPerimeterText: String(n.modeFlowTelegramPerimeterText || '').trim(),
            modeFlowTelegramInteriorText: String(n.modeFlowTelegramInteriorText || '').trim(),
            modeFlowTelegramFullText: String(n.modeFlowTelegramFullText || '').trim(),
            modeFlowAutoPerimeterAfterSunsetEnabled: this.toBool(n.modeFlowAutoPerimeterAfterSunsetEnabled, false),
            modeFlowAutoAwayMode: autoAwayMode,
            modeFlowAutoAwayDelaySec: Math.max(0, this.toNumber(n.modeFlowAutoAwayDelaySec, this.toNumber(n.autoArmDelaySec, 60))),
            zoneDelays: this.parseZoneDelays(n.zoneDelaysTable, this.toNumber(n.defaultEntryDelaySec, 20), this.toNumber(n.defaultExitDelaySec, 10)),
            telegramInstances: this.parseTelegramInstances(n.telegramInstancesTable),
            telegramTargets: this.parseTelegramTargets(n.telegramTargetsTable)
        };
    }
    parseZoneDelays(rows, defaultEntry, defaultExit) {
        const out = {
            perimeter: { entryDelaySec: defaultEntry, exitDelaySec: defaultExit },
            aussenhaut: { entryDelaySec: defaultEntry, exitDelaySec: defaultExit },
            innenraum: { entryDelaySec: defaultEntry, exitDelaySec: defaultExit }
        };
        if (!Array.isArray(rows))
            return out;
        for (const r of rows) {
            const z = this.parseZone(r?.zone);
            out[z] = {
                entryDelaySec: Math.max(0, this.toNumber(r?.entryDelaySec, out[z].entryDelaySec)),
                exitDelaySec: Math.max(0, this.toNumber(r?.exitDelaySec, out[z].exitDelaySec))
            };
        }
        return out;
    }
    parseSensorTable(rows, sensorType) {
        if (!Array.isArray(rows))
            return [];
        return rows.filter(r => r?.id).map((r) => ({
            key: String(r.key || r.id),
            id: String(r.id),
            label: String(r.label || r.key || r.id),
            sensorType,
            zone: this.parseZone(r.zone),
            activeValues: String(r.activeValuesCsv || 'open').split(',').map((x) => x.trim()).filter(Boolean).map((x) => this.parseScalar(x)),
            snapshotDatapointId: r.snapshotDatapointId ? String(r.snapshotDatapointId) : undefined,
            snapshotZoneMode: this.parseSnapshotZoneMode(r.snapshotZoneMode),
            snapshotZones: this.parseSnapshotZones(r.snapshotZonesCsv)
        }));
    }
    parsePersonDetectionTable(rows) {
        if (!Array.isArray(rows))
            return [];
        return rows.filter(r => r?.id).map((r) => ({
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
    parseSnapshotZoneMode(v) {
        const m = String(v || '').toLowerCase();
        if (m === 'any')
            return 'any';
        if (m === 'selected')
            return 'selected';
        return 'none';
    }
    parseZonesCsv(v) {
        const raw = String(v || '').split(',').map(x => x.trim()).filter(Boolean);
        const out = [];
        for (const z of raw) {
            if (z === 'perimeter' || z === 'aussenhaut' || z === 'innenraum')
                out.push(z);
        }
        return Array.from(new Set(out));
    }
    parseSnapshotZones(v) {
        return this.parseZonesCsv(v);
    }
    parseCsv(v) {
        return Array.from(new Set(String(v || '').split(',').map(x => x.trim()).filter(Boolean)));
    }
    parseCsvWithFallback(v, fallback) {
        const parsed = this.parseCsv(v);
        return parsed.length > 0 ? parsed : Array.from(new Set(fallback.map(x => String(x || '').trim()).filter(Boolean)));
    }
    parseCountdownAbortMode(v) {
        const s = String(v || '').toLowerCase();
        if (s === 'off')
            return 'off';
        if (s === 'any_disarm')
            return 'any_disarm';
        return 'zone_disarmed';
    }
    parseCameraDetectionMode(v) {
        const s = String(v || '').toLowerCase();
        if (s === 'boolean')
            return 'boolean';
        if (s === 'string')
            return 'string';
        return 'auto';
    }
    parseCamerasTable(rows) {
        if (!Array.isArray(rows))
            return [];
        return rows.filter(r => r?.snapshotUrl).map((r) => ({
            key: String(r.key || r.ip || ''),
            label: String(r.label || r.key || r.ip || ''),
            ip: String(r.ip || ''),
            streamUrl: String(r.streamUrl || ''),
            snapshotUrl: String(r.snapshotUrl || ''),
            alarmDatapoint: r.alarmDatapoint ? String(r.alarmDatapoint) : undefined,
            ledDatapoint: r.ledDatapoint ? String(r.ledDatapoint) : undefined,
            username: r.username ? String(r.username) : undefined,
            password: r.password ? String(r.password) : undefined,
            personDetectionDp: r.personDetectionDp ? String(r.personDetectionDp) : (r.id ? String(r.id) : undefined),
            personDetectionMode: this.parseCameraDetectionMode(r.personDetectionMode ?? r.mode),
            personDetectionDetectValue: String((r.personDetectionDetectValue ?? r.detectValue ?? '')).trim() || 'human detected'
        }));
    }
    parseFingerprintScenario(v) {
        const s = String(v || '').trim();
        if (s === 'entrance' || s === 'zero' || s === 'openGarage' || s === 'garageClose')
            return s;
        return 'disarmOnly';
    }
    parseFingerprintScenariosTable(rows) {
        if (!Array.isArray(rows))
            return [];
        return rows
            .filter(r => r?.name)
            .map((r) => ({
            name: String(r.name).trim(),
            scenario: this.parseFingerprintScenario(r.scenario)
        }));
    }
    parseSnapshotTriggerDatapointsTable(rows) {
        if (!Array.isArray(rows))
            return [];
        return rows
            .filter(r => r?.cameraKey && r?.triggerId)
            .map((r) => ({
            cameraKey: String(r.cameraKey).trim(),
            triggerId: String(r.triggerId).trim()
        }));
    }
    parseGeofencePersonsTable(rows) {
        if (!Array.isArray(rows))
            return [];
        return rows
            .filter(r => r?.name && r?.datapointId)
            .map((r) => ({
            name: String(r.name).trim(),
            datapointId: String(r.datapointId).trim()
        }));
    }
    parseZoneActionsTable(rows) {
        if (!Array.isArray(rows))
            return [];
        return rows
            .filter(r => r?.datapointId)
            .map((r) => {
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
    parseSnapshotActionTargetsTable(rows) {
        if (!Array.isArray(rows))
            return [];
        const out = [];
        for (const r of rows) {
            const datapointId = String(r?.datapointId || '').trim();
            if (!datapointId)
                continue;
            const key = String(r?.key || datapointId).trim();
            if (!key)
                continue;
            const onRaw = String(r?.onValue ?? '').trim();
            const offRaw = String(r?.offValue ?? '').trim();
            const durationMs = Math.max(0, this.toNumber(r?.durationMs, 0));
            out.push({
                key,
                label: String(r?.label || key || datapointId).trim(),
                datapointId,
                onValue: onRaw !== '' ? this.parseScalar(onRaw) : true,
                offValue: offRaw !== '' ? this.parseScalar(offRaw) : undefined,
                durationMs: durationMs > 0 ? durationMs : undefined
            });
        }
        return out;
    }
    parseAlarmActionsTable(rows) {
        if (!Array.isArray(rows))
            return [];
        const out = [];
        for (const r of rows) {
            const actionKind = this.parseAlarmActionKind(r?.actionKind);
            const scenario = this.parseAlarmActionScenario(r?.scenario);
            const zone = this.parseAlarmActionZone(r?.zone);
            const triggerSource = this.parseAlarmActionSourceType(r?.triggerSource);
            const armedMode = this.parseAlarmActionArmedMode(r?.armedMode);
            const timing = this.parseAlarmActionTiming(r?.timing);
            const triggerEntityId = String(r?.triggerEntityId || '').trim() || undefined;
            const datapointId = String(r?.datapointId || '').trim() || undefined;
            const snapshotTargetKey = String(r?.snapshotTargetKey || '').trim() || undefined;
            const cameraTargetKey = String(r?.cameraTargetKey || '').trim() || undefined;
            const onValueRaw = String(r?.onValue ?? '').trim();
            const offValueRaw = String(r?.offValue ?? '').trim();
            const repeatCount = Math.max(1, this.toNumber(r?.repeatCount, 1));
            const repeatIntervalMs = Math.max(0, this.toNumber(r?.repeatIntervalMs, 1000));
            const durationMs = Math.max(0, this.toNumber(r?.durationMs, 0));
            const row = {
                key: String(r?.key || datapointId || triggerEntityId || `alarm_action_${out.length + 1}`),
                label: String(r?.label || r?.key || datapointId || 'Alarm Action'),
                scenario,
                zone,
                triggerSource,
                triggerEntityId,
                armedMode,
                timing,
                actionKind,
                datapointId,
                onValue: onValueRaw !== '' ? this.parseScalar(onValueRaw) : true,
                offValue: offValueRaw !== '' ? this.parseScalar(offValueRaw) : undefined,
                durationMs: durationMs > 0 ? durationMs : undefined,
                repeatCount,
                repeatIntervalMs,
                telegramText: String(r?.telegramText || '').trim() || undefined,
                alexaText: String(r?.alexaText || '').trim() || undefined,
                snapshotTargetKey,
                cameraTargetKey
            };
            if (actionKind === 'datapoint' && !datapointId)
                continue;
            if (actionKind === 'snapshot' && !snapshotTargetKey)
                continue;
            if ((actionKind === 'camera_led' || actionKind === 'camera_instar_siren' || actionKind === 'camera_instar_floodlight') && !cameraTargetKey)
                continue;
            out.push(row);
        }
        return out;
    }
    parsePanicActionsTable(rows) {
        if (!Array.isArray(rows))
            return [];
        const out = [];
        for (const r of rows) {
            const actionKind = this.parseAlarmActionKind(r?.actionKind);
            const when = String(r?.when || '').toLowerCase() === 'off' ? 'off' : 'on';
            const datapointId = String(r?.datapointId || '').trim() || undefined;
            const snapshotTargetKey = String(r?.snapshotTargetKey || '').trim() || undefined;
            const cameraTargetKey = String(r?.cameraTargetKey || '').trim() || undefined;
            const onValueRaw = String(r?.onValue ?? '').trim();
            const offValueRaw = String(r?.offValue ?? '').trim();
            const repeatCount = Math.max(1, this.toNumber(r?.repeatCount, 1));
            const repeatIntervalMs = Math.max(0, this.toNumber(r?.repeatIntervalMs, 1000));
            const durationMs = Math.max(0, this.toNumber(r?.durationMs, 0));
            const row = {
                key: String(r?.key || datapointId || `panic_action_${out.length + 1}`),
                label: String(r?.label || r?.key || datapointId || `PANIC ${when}`),
                when,
                actionKind,
                datapointId,
                onValue: onValueRaw !== '' ? this.parseScalar(onValueRaw) : true,
                offValue: offValueRaw !== '' ? this.parseScalar(offValueRaw) : undefined,
                durationMs: durationMs > 0 ? durationMs : undefined,
                repeatCount,
                repeatIntervalMs,
                telegramText: String(r?.telegramText || '').trim() || undefined,
                alexaText: String(r?.alexaText || '').trim() || undefined,
                snapshotTargetKey,
                cameraTargetKey
            };
            if (actionKind === 'datapoint' && !datapointId)
                continue;
            if (actionKind === 'snapshot' && !snapshotTargetKey)
                continue;
            if ((actionKind === 'camera_led' || actionKind === 'camera_instar_siren' || actionKind === 'camera_instar_floodlight') && !cameraTargetKey)
                continue;
            out.push(row);
        }
        return out;
    }
    parseModeFlowRulesTable(rows) {
        if (!Array.isArray(rows))
            return [];
        const out = [];
        for (const r of rows) {
            const sourceId = String(r?.sourceId || '').trim();
            if (!sourceId)
                continue;
            const mode = this.parseMonitorMode(r?.mode);
            const sourceKind = this.parseModeFlowSourceKind(r?.sourceKind);
            const alarmLevel = this.parseModeFlowAlarmLevel(r?.alarmLevel);
            const sourceZone = String(r?.sourceZone || '').toLowerCase() === 'any' ? 'any' : this.parseZone(r?.sourceZone);
            const row = {
                key: String(r?.key || `${mode}_${sourceKind}_${sourceId}_${out.length + 1}`),
                label: String(r?.label || r?.sourceLabel || sourceId),
                enabled: this.toBool(r?.enabled, true),
                mode,
                sourceKind,
                sourceId,
                sourceLabel: String(r?.sourceLabel || sourceId),
                sourceZone,
                alarmLevel,
                announceBefore: this.toBool(r?.announceBefore, false),
                announceDelaySec: Math.max(0, this.toNumber(r?.announceDelaySec, 0)),
                actionSnapshotTriggerCamera: this.toBool(r?.actionSnapshotTriggerCamera, false),
                actionCameraAlarmTriggerCamera: this.toBool(r?.actionCameraAlarmTriggerCamera, false),
                actionCameraLedTriggerCamera: this.toBool(r?.actionCameraLedTriggerCamera, false),
                actionCameraAlarmAll: this.toBool(r?.actionCameraAlarmAll, false),
                actionCameraLedAll: this.toBool(r?.actionCameraLedAll, false),
                actionTelegram: this.toBool(r?.actionTelegram, false),
                actionTelegramText: String(r?.actionTelegramText || '').trim() || undefined,
                actionAlexaSpeak: this.toBool(r?.actionAlexaSpeak, false),
                actionAlexaText: String(r?.actionAlexaText || '').trim() || undefined
            };
            out.push(row);
        }
        return out;
    }
    parseMonitorMode(v) {
        const s = String(v || '').toLowerCase();
        if (s === 'vollschutz')
            return 'vollschutz';
        if (s === 'aussenhaut')
            return 'aussenhaut';
        if (s === 'kamera')
            return 'kamera';
        if (s === 'immer')
            return 'immer';
        return 'perimeter';
    }
    parseModeFlowSourceKind(v) {
        const s = String(v || '').toLowerCase();
        if (s === 'persondetection')
            return 'personDetection';
        if (s === 'camera')
            return 'camera';
        return 'sensor';
    }
    parseModeFlowAlarmLevel(v) {
        const s = String(v || '').toLowerCase();
        if (s === 'none')
            return 'none';
        if (s === 'interior_alarm')
            return 'interior_alarm';
        if (s === 'full_alarm')
            return 'full_alarm';
        return 'perimeter_alarm';
    }
    parseModeFlowAutoAwayMode(v) {
        const s = String(v || '').toLowerCase();
        if (s === 'off')
            return 'off';
        if (s === 'perimeter')
            return 'perimeter';
        if (s === 'vollschutz')
            return 'vollschutz';
        return 'legacy';
    }
    parseAlarmActionScenario(v) {
        const s = String(v || '').toLowerCase();
        if (s === 'panic_on')
            return 'panic_on';
        if (s === 'panic_off')
            return 'panic_off';
        return 'zone_trigger';
    }
    parseAlarmActionZone(v) {
        const z = String(v || '').toLowerCase();
        if (z === 'any')
            return 'any';
        return this.parseZone(z);
    }
    parseAlarmActionSourceType(v) {
        const s = String(v || '').toLowerCase();
        if (s === 'sensor')
            return 'sensor';
        if (s === 'persondetection')
            return 'personDetection';
        if (s === 'camera')
            return 'camera';
        return 'any';
    }
    parseAlarmActionArmedMode(v) {
        const s = String(v || '').toLowerCase();
        if (s === 'armed')
            return 'armed';
        if (s === 'unarmed')
            return 'unarmed';
        return 'any';
    }
    parseAlarmActionKind(v) {
        const s = String(v || '').toLowerCase();
        if (s === 'telegram')
            return 'telegram';
        if (s === 'alexa')
            return 'alexa';
        if (s === 'snapshot')
            return 'snapshot';
        if (s === 'camera_led')
            return 'camera_led';
        if (s === 'camera_instar_siren')
            return 'camera_instar_siren';
        if (s === 'camera_instar_floodlight')
            return 'camera_instar_floodlight';
        return 'datapoint';
    }
    parseAlarmActionTiming(v) {
        const s = String(v || '').toLowerCase();
        if (s === 'immediate')
            return 'immediate';
        if (s === 'after_alarm')
            return 'after_alarm';
        return 'global';
    }
    parseTelegramInstances(rows) {
        if (!Array.isArray(rows))
            return [];
        return rows.filter(r => r?.instance).map((r) => ({ instance: String(r.instance), token: r.token ? String(r.token) : undefined }));
    }
    parseTelegramTargets(rows) {
        if (!Array.isArray(rows))
            return [];
        const out = [];
        for (const r of rows) {
            const instance = String(r?.instance || '').trim();
            const raw = String(r?.chatId || '').trim();
            if (!instance || !raw)
                continue;
            const chatIds = this.parseCsv(raw);
            for (const chatId of chatIds)
                out.push({ instance, chatId });
        }
        return out;
    }
    parseZone(v) {
        const z = String(v || '').toLowerCase();
        if (z === 'aussenhaut')
            return 'aussenhaut';
        if (z === 'innenraum')
            return 'innenraum';
        return 'perimeter';
    }
    async subscribeForeignInputs() {
        const ids = new Set([
            this.cfg.armStateId,
            this.cfg.hullProtectionStateId,
            this.cfg.perimeterStateId,
            this.cfg.panicStateId,
            this.cfg.fingerprintStateId,
            this.cfg.garageFingerprintStateId,
            this.cfg.doorbellRingStateId,
            this.cfg.pinStateId,
            this.cfg.bedtimeLightSensorId,
            this.cfg.motionSensorId
        ]);
        for (const s of this.cfg.sensors)
            ids.add(s.id);
        for (const p of this.cfg.personDetections)
            ids.add(p.id);
        for (const c of this.cfg.cameras)
            if (c.personDetectionDp)
                ids.add(c.personDetectionDp);
        for (const t of this.cfg.snapshotTriggerDatapoints)
            ids.add(t.triggerId);
        for (const g of this.cfg.geofencePersons)
            ids.add(g.datapointId);
        if (this.cfg.instarDetectionDatapointId)
            ids.add(this.cfg.instarDetectionDatapointId);
        for (const p of this.cfg.autoArmPresenceIds)
            ids.add(p);
        for (const p of this.cfg.bedtimePresenceHomeIds)
            ids.add(p);
        for (const p of this.cfg.resetHumanDetectionIds)
            ids.add(p);
        for (const p of this.cfg.ledRedOpenIds)
            ids.add(p);
        for (const p of this.cfg.ledYellowOpenIds)
            ids.add(p);
        for (const p of this.cfg.checkRedOpenIds)
            ids.add(p);
        for (const p of this.cfg.checkYellowOpenIds)
            ids.add(p);
        for (const p of this.cfg.statusOpenIds)
            ids.add(p);
        for (const cmdId of [
            this.cfg.modeFlowAnnounceCommandId,
            this.cfg.modeFlowPerimeterAlarmCommandId,
            this.cfg.modeFlowInteriorAlarmCommandId,
            this.cfg.modeFlowFullAlarmCommandId
        ]) {
            if (cmdId && !this.isOwnStateId(cmdId))
                ids.add(cmdId);
        }
        for (const id of ids)
            await this.subscribeForeignStatesAsync(id);
    }
    async ensureStates() {
        const defaults = [
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
            ['commands.telegramTestPhotoCaption', false],
            ['commands.announceAlarm', false],
            ['commands.activatePerimeterAlarm', false],
            ['commands.activateInteriorAlarm', false],
            ['commands.activateFullAlarm', false]
        ];
        for (const [id, val] of defaults)
            await this.setStateAsync(id, val, true);
    }
    async publishConfigStates() {
        const n = this.config;
        const current = this.cloneJson(n);
        const rawProfiles = this.tryJson(n.configProfilesJson, {});
        const profiles = this.cloneJson(rawProfiles) || {};
        if (!profiles['default.json'])
            profiles['default.json'] = current;
        let activeProfile = typeof n.activeConfigProfile === 'string' && n.activeConfigProfile ? n.activeConfigProfile : 'default.json';
        if (!profiles[activeProfile])
            activeProfile = 'default.json';
        await this.setStateAsync('config.currentJson', JSON.stringify(current), true);
        await this.setStateAsync('config.profilesJson', JSON.stringify(profiles), true);
        await this.setStateAsync('config.profileNamesJson', JSON.stringify(Object.keys(profiles).sort()), true);
        await this.setStateAsync('config.activeProfile', activeProfile, true);
        await this.setStateAsync('config.activeProfileJson', JSON.stringify(this.cloneJson(profiles[activeProfile])), true);
    }
    async publishRuleView() {
        const rules = [];
        for (const z of ['perimeter', 'aussenhaut', 'innenraum']) {
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
        for (const a of this.cfg.alarmActions) {
            const when = a.scenario === 'zone_trigger' ? `Zone-Trigger (${a.zone}, ${a.triggerSource}, armed=${a.armedMode})` : (a.scenario === 'panic_on' ? 'PANIC an' : 'PANIC aus');
            const timing = a.scenario === 'zone_trigger'
                ? (a.timing === 'global' ? `global:${this.cfg.alarmActionZoneTriggerTiming}` : a.timing)
                : '-';
            let then = '';
            if (a.actionKind === 'datapoint')
                then = `Setze ${a.datapointId} auf ${String(a.onValue)}${a.durationMs ? `, reset nach ${a.durationMs}ms` : ''}`;
            if (a.actionKind === 'telegram')
                then = `Telegram: "${String(a.telegramText || '')}"`;
            if (a.actionKind === 'alexa')
                then = `Alexa Speak: "${String(a.alexaText || '')}"`;
            if (a.actionKind === 'snapshot')
                then = `Snapshot target: ${String(a.snapshotTargetKey || '-')}`;
            if (a.actionKind === 'camera_led')
                then = `Kamera-LED: ${String(a.cameraTargetKey || '-')} ${a.durationMs ? `(auto off ${a.durationMs}ms)` : ''}`;
            if (a.actionKind === 'camera_instar_siren')
                then = `Instar-Sirene: ${String(a.cameraTargetKey || '-')}${a.durationMs ? ` (${Math.round(a.durationMs / 1000)}s)` : ''}`;
            if (a.actionKind === 'camera_instar_floodlight')
                then = `Instar-Flutlicht: ${String(a.cameraTargetKey || '-')}${a.durationMs ? ` (${Math.round(a.durationMs / 1000)}s)` : ''}`;
            rules.push({ if: when, then: `${then} (timing ${timing}, repeat ${a.repeatCount}x / ${a.repeatIntervalMs}ms)` });
        }
        for (const p of this.cfg.panicActions) {
            let then = '';
            if (p.actionKind === 'datapoint')
                then = `Setze ${p.datapointId} auf ${String(p.onValue)}${p.durationMs ? `, reset nach ${p.durationMs}ms` : ''}`;
            if (p.actionKind === 'telegram')
                then = `Telegram: "${String(p.telegramText || '')}"`;
            if (p.actionKind === 'alexa')
                then = `Alexa Speak: "${String(p.alexaText || '')}"`;
            if (p.actionKind === 'snapshot')
                then = `Snapshot target: ${String(p.snapshotTargetKey || '-')}`;
            if (p.actionKind === 'camera_led')
                then = `Kamera-LED: ${String(p.cameraTargetKey || '-')}`;
            if (p.actionKind === 'camera_instar_siren')
                then = `Instar-Sirene: ${String(p.cameraTargetKey || '-')}${p.durationMs ? ` (${Math.round(p.durationMs / 1000)}s)` : ''}`;
            if (p.actionKind === 'camera_instar_floodlight')
                then = `Instar-Flutlicht: ${String(p.cameraTargetKey || '-')}${p.durationMs ? ` (${Math.round(p.durationMs / 1000)}s)` : ''}`;
            rules.push({ if: `PANIC ${p.when}`, then: `${then} (repeat ${p.repeatCount}x / ${p.repeatIntervalMs}ms)` });
        }
        for (const r of this.cfg.modeFlowRules) {
            const actions = [];
            actions.push(`Level=${r.alarmLevel}`);
            if (r.announceBefore)
                actions.push(`announce +${r.announceDelaySec}s`);
            if (r.actionSnapshotTriggerCamera)
                actions.push('snapshot(trigger-cam)');
            if (r.actionCameraAlarmTriggerCamera)
                actions.push('cam-alarm(trigger-cam)');
            if (r.actionCameraLedTriggerCamera)
                actions.push('cam-led(trigger-cam)');
            if (r.actionCameraAlarmAll)
                actions.push('cam-alarm(all)');
            if (r.actionCameraLedAll)
                actions.push('cam-led(all)');
            if (r.actionTelegram)
                actions.push(`telegram="${String(r.actionTelegramText || '')}"`);
            if (r.actionAlexaSpeak)
                actions.push(`alexa="${String(r.actionAlexaText || '')}"`);
            rules.push({
                if: `ModeFlow ${r.mode} + ${r.sourceKind}:${r.sourceLabel} (${r.sourceZone})`,
                then: actions.join(', ')
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
        if (this.cfg.alarmRepeatTelegramEnabled) {
            rules.push({
                if: `Sirene aktiv`,
                then: `Telegram Reminder alle ${this.cfg.alarmRepeatTelegramIntervalSec}s`
            });
        }
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
    async refreshInitialSeen() {
        const ids = new Set();
        this.cfg.sensors.forEach(s => ids.add(s.id));
        this.cfg.personDetections.forEach(p => ids.add(p.id));
        this.cfg.cameras.forEach(c => c.personDetectionDp && ids.add(c.personDetectionDp));
        this.cfg.resetHumanDetectionIds.forEach(id => ids.add(id));
        this.heartbeatMonitoredIds = ids;
        const now = Date.now();
        for (const id of this.heartbeatMonitoredIds)
            this.lastSeen.set(id, now);
    }
    startHeartbeatWatchdog() {
        this.heartbeatTimer && this.clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = this.setInterval(() => void this.runHeartbeatCheck(), 30000) ?? null;
    }
    async runHeartbeatCheck() {
        const now = Date.now();
        const timeoutMs = this.cfg.heartbeatTimeoutSec * 1000;
        for (const [id, ts] of this.lastSeen) {
            if (!this.heartbeatMonitoredIds.has(id))
                continue;
            if (now - ts > timeoutMs) {
                const msg = `Sabotage/Offline erkannt: ${id} seit ${Math.round((now - ts) / 1000)}s ohne Heartbeat`;
                await this.setStateAsync('diagnostics.lastSabotage', msg, true);
                await this.logEvent('warn', 'sabotage_offline', msg);
            }
        }
    }
    async onStateChange(id, state) {
        if (!state)
            return;
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
            if (local === 'commands.announceAlarm' && state.val === true) {
                await this.executeModeFlowAnnounce('manuell');
                await this.setStateAsync(local, false, true);
            }
            if (local === 'commands.activatePerimeterAlarm' && state.val === true) {
                await this.activateModeFlowAlarmLevel('perimeter_alarm', {
                    sourceType: 'any',
                    sourceId: local,
                    sourceLabel: 'Perimeter Alarm Command',
                    armed: this.isAnyZoneArmed()
                }, 'manuell');
                await this.setStateAsync(local, false, true);
            }
            if (local === 'commands.activateInteriorAlarm' && state.val === true) {
                await this.activateModeFlowAlarmLevel('interior_alarm', {
                    sourceType: 'any',
                    sourceId: local,
                    sourceLabel: 'Interior Alarm Command',
                    armed: this.isAnyZoneArmed()
                }, 'manuell');
                await this.setStateAsync(local, false, true);
            }
            if (local === 'commands.activateFullAlarm' && state.val === true) {
                await this.activateModeFlowAlarmLevel('full_alarm', {
                    sourceType: 'any',
                    sourceId: local,
                    sourceLabel: 'Full Alarm Command',
                    armed: this.isAnyZoneArmed()
                }, 'manuell');
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
        if (state.val === true && id === this.cfg.modeFlowAnnounceCommandId && !this.isOwnStateId(id)) {
            await this.executeModeFlowAnnounce('extern');
            await this.setOutput(id, false);
            return;
        }
        if (state.val === true && id === this.cfg.modeFlowPerimeterAlarmCommandId && !this.isOwnStateId(id)) {
            await this.activateModeFlowAlarmLevel('perimeter_alarm', {
                sourceType: 'any',
                sourceId: id,
                sourceLabel: 'External Perimeter Alarm',
                armed: this.isAnyZoneArmed()
            }, 'extern');
            await this.setOutput(id, false);
            return;
        }
        if (state.val === true && id === this.cfg.modeFlowInteriorAlarmCommandId && !this.isOwnStateId(id)) {
            await this.activateModeFlowAlarmLevel('interior_alarm', {
                sourceType: 'any',
                sourceId: id,
                sourceLabel: 'External Interior Alarm',
                armed: this.isAnyZoneArmed()
            }, 'extern');
            await this.setOutput(id, false);
            return;
        }
        if (state.val === true && id === this.cfg.modeFlowFullAlarmCommandId && !this.isOwnStateId(id)) {
            await this.activateModeFlowAlarmLevel('full_alarm', {
                sourceType: 'any',
                sourceId: id,
                sourceLabel: 'External Full Alarm',
                armed: this.isAnyZoneArmed()
            }, 'extern');
            await this.setOutput(id, false);
            return;
        }
        if (this.heartbeatMonitoredIds.has(id)) {
            this.lastSeen.set(id, Date.now());
        }
        if (id === this.cfg.motionSensorId) {
            await this.handleStandbyMotionInput(state.val);
        }
        await this.handleLegacyDoorBuzzers(id, state.val);
        if (id === this.cfg.armStateId) {
            if (state.val === true) {
                await this.armZone('perimeter');
                await this.armZone('aussenhaut');
                await this.armZone('innenraum');
            }
            else if (state.val === false) {
                await this.disarmAll();
            }
            await this.abortCountdownIfDisarmed();
            return;
        }
        if (id === this.cfg.perimeterStateId) {
            if (state.val === true) {
                await this.armZone('perimeter');
                await this.armZone('aussenhaut');
                await this.applyCameraOutputs();
            }
            else if (state.val === false) {
                const hullSt = await this.getForeignStateAsync(this.cfg.hullProtectionStateId);
                const allSt = await this.getForeignStateAsync(this.cfg.armStateId);
                await this.disarmZone('perimeter');
                if (!(hullSt?.val === true || allSt?.val === true)) {
                    await this.disarmZone('aussenhaut');
                }
                await this.applyCameraOutputs();
            }
            await this.abortCountdownIfDisarmed();
            return;
        }
        if (id === this.cfg.hullProtectionStateId) {
            if (state.val === true) {
                await this.armZone('aussenhaut');
            }
            else if (state.val === false) {
                const perSt = await this.getForeignStateAsync(this.cfg.perimeterStateId);
                const allSt = await this.getForeignStateAsync(this.cfg.armStateId);
                if (!(perSt?.val === true || allSt?.val === true)) {
                    await this.disarmZone('aussenhaut');
                }
            }
            await this.abortCountdownIfDisarmed();
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
        if (id === this.cfg.garageFingerprintStateId) {
            await this.handleGarageFingerprint(state.val);
            return;
        }
        if (id === this.cfg.doorbellRingStateId) {
            await this.handleDoorbellRing(state.val);
            return;
        }
        const snapshotTrigger = this.cfg.snapshotTriggerDatapoints.find(t => t.triggerId === id);
        if (snapshotTrigger) {
            await this.handleSnapshotTriggerDatapoint(snapshotTrigger, state.val);
            return;
        }
        const geofencePerson = this.cfg.geofencePersons.find(g => g.datapointId === id);
        if (geofencePerson) {
            await this.handleGeofencePersonEvent(geofencePerson, state.val);
            return;
        }
        if (this.cfg.instarDetectionDatapointId && id === this.cfg.instarDetectionDatapointId) {
            await this.handleInstarDetection(state.val);
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
            if (active && this.allowEvent(`sensor:${id}`)) {
                await this.executeAlarmActions('zone_trigger', {
                    zone: s.zone,
                    sourceType: 'sensor',
                    sourceId: s.id,
                    sourceLabel: s.label,
                    armed: this.isAnyZoneArmed(),
                    rawVal: state.val
                }, 'immediate');
                await this.executeModeFlowRulesForTrigger({
                    sourceType: 'sensor',
                    sourceId: s.id,
                    sourceLabel: s.label,
                    armed: this.isAnyZoneArmed(),
                    zone: s.zone,
                    rawVal: state.val
                });
                if (this.zoneArmed[s.zone]) {
                    await this.writeDailyTriggerLog('sensor', s.label, s.id, s.zone, state.val);
                    await this.tryTriggerConfiguredSnapshot(s.label, s.snapshotDatapointId, s.snapshotZoneMode, s.snapshotZones);
                    await this.handleZoneTrigger(s.label, s.zone, 'sensor', s.id, state.val);
                }
            }
            if (s.sensorType === 'contact') {
                await this.refreshStatusIndicators();
                await this.refreshDisplayCycle();
            }
            return;
        }
        const p = this.cfg.personDetections.find(x => x.id === id);
        if (p) {
            const active = this.matchesPerson(state.val, p);
            if (active && this.allowEvent(`person:${id}`)) {
                await this.executeAlarmActions('zone_trigger', {
                    zone: p.zone,
                    sourceType: 'personDetection',
                    sourceId: p.id,
                    sourceLabel: p.label,
                    armed: this.isAnyZoneArmed(),
                    rawVal: state.val
                }, 'immediate');
                await this.executeModeFlowRulesForTrigger({
                    sourceType: 'personDetection',
                    sourceId: p.id,
                    sourceLabel: p.label,
                    armed: this.isAnyZoneArmed(),
                    zone: p.zone,
                    rawVal: state.val
                });
                if (this.zoneArmed[p.zone]) {
                    await this.writeDailyTriggerLog('personDetection', p.label, p.id, p.zone, state.val);
                    await this.tryTriggerConfiguredSnapshot(p.label, p.snapshotDatapointId, p.snapshotZoneMode, p.snapshotZones);
                    await this.handleZoneTrigger(p.label, p.zone, 'personDetection', p.id, state.val);
                }
            }
            return;
        }
        const cam = this.cfg.cameras.find(c => c.personDetectionDp === id);
        if (cam) {
            const active = this.matchesCameraPerson(state.val, cam);
            const armed = this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum;
            const nightModeArmed = this.cfg.cameraNightModeArmsCameras && this.isNightModeActive();
            if (active && this.allowEvent(`camera:${id}`)) {
                const effectiveArmed = armed || nightModeArmed;
                await this.executeAlarmActions('zone_trigger', {
                    zone: 'perimeter',
                    sourceType: 'camera',
                    sourceId: cam.personDetectionDp || id,
                    sourceLabel: cam.label,
                    armed: effectiveArmed,
                    rawVal: state.val
                }, 'immediate');
                await this.executeModeFlowRulesForTrigger({
                    sourceType: 'camera',
                    sourceId: cam.personDetectionDp || id,
                    sourceLabel: cam.label,
                    armed: effectiveArmed,
                    zone: 'perimeter',
                    rawVal: state.val
                }, cam);
                if (effectiveArmed) {
                    await this.writeDailyTriggerLog('camera', cam.label, cam.personDetectionDp || id, 'perimeter', state.val);
                    await this.triggerCamera(cam);
                }
            }
        }
        if (this.cfg.resetHumanDetectionIds.includes(id)) {
            this.setTimeout(() => void this.setOutput(id, '-'), 5500);
        }
        if (this.isStatusRelatedInputId(id)) {
            await this.refreshStatusIndicators();
            await this.refreshDisplayCycle();
        }
    }
    async initializeHumanDetectionReset() {
        for (const id of this.cfg.resetHumanDetectionIds) {
            await this.setOutput(id, '-');
        }
    }
    startStandbySafetyCheck() {
        this.standbySafetyTimer && this.clearInterval(this.standbySafetyTimer);
        this.standbySafetyTimer = this.setInterval(() => void this.evaluateStandbyState(), this.cfg.standbySafetyIntervalMs) ?? null;
    }
    startLedSafetyCheck() {
        this.ledSafetyTimer && this.clearInterval(this.ledSafetyTimer);
        this.ledSafetyTimer = this.setInterval(() => void this.refreshStatusIndicators(), this.cfg.ledSafetyIntervalMs) ?? null;
    }
    isNoMotionValue(val) {
        return String(val ?? '').trim().toLowerCase() === String(this.cfg.standbyNoMotionValue || 'no motion').trim().toLowerCase();
    }
    async handleStandbyMotionInput(val) {
        if (this.isNoMotionValue(val)) {
            if (this.standbyNoMotionSince === null) {
                this.standbyNoMotionSince = Date.now();
                if (this.standbySwitchTimer)
                    this.clearTimeout(this.standbySwitchTimer);
                this.standbySwitchTimer = this.setTimeout(() => void this.setOutput(this.cfg.standbyId, true), this.cfg.standbyTimeoutMs) ?? null;
                const st = await this.getForeignStateAsync(this.cfg.standbyId);
                if (st?.val === true)
                    await this.setOutput(this.cfg.standbyId, false);
            }
            return;
        }
        this.standbyNoMotionSince = null;
        if (this.standbySwitchTimer)
            this.clearTimeout(this.standbySwitchTimer);
        this.standbySwitchTimer = null;
        await this.setOutput(this.cfg.standbyId, false);
    }
    async evaluateStandbyState() {
        const motion = await this.getForeignStateAsync(this.cfg.motionSensorId);
        if (!this.isNoMotionValue(motion?.val ?? null))
            return;
        if (this.standbyNoMotionSince === null)
            this.standbyNoMotionSince = Date.now();
        if (Date.now() - this.standbyNoMotionSince >= this.cfg.standbyTimeoutMs) {
            await this.setOutput(this.cfg.standbyId, true);
        }
    }
    async handleLegacyDoorBuzzers(id, val) {
        const entrance = 'mqtt.1.entrance_door_status';
        const side = 'mqtt.1.side_entrance_door_status';
        const terrace = 'mqtt.1.terrace_door_status';
        const shed = 'mqtt.1.Garage.shedDoorStatus';
        const wcWindow = 'mqtt.1.WC_children.windowStatus';
        const isOpenEvent = val === 'open';
        if (!isOpenEvent)
            return;
        // Legacy: short beep when any configured door opens
        if ([entrance, side, terrace, shed].includes(id)) {
            await this.setOutput(this.cfg.buzzerId, 'beep 2x');
            if (this.openDoorBeepResetTimer)
                this.clearTimeout(this.openDoorBeepResetTimer);
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
    async armZone(zone) {
        const exitMs = this.cfg.zoneDelays[zone].exitDelaySec * 1000;
        this.zoneExitTimers[zone] && this.clearTimeout(this.zoneExitTimers[zone]);
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
        }, exitMs) ?? null;
    }
    async disarmZone(zone) {
        this.zoneExitTimers[zone] && this.clearTimeout(this.zoneExitTimers[zone]);
        this.zoneArmed[zone] = false;
        await this.setStateAsync(`zones.${zone}.armed`, false, true);
        await this.updateModeState();
        await this.logEvent('info', 'zone_disarmed', `Zone ${zone} disarmed`);
    }
    async disarmAll() {
        this.cancelPendingModeFlowTimers();
        await this.disarmZone('perimeter');
        await this.disarmZone('aussenhaut');
        await this.disarmZone('innenraum');
        await this.abortCountdown();
        await this.setOutput(this.cfg.sirenStateId, false);
        this.stopAlarmRepeatTelegram();
        this.camerasManualArmed = false;
        await this.setStateAsync('runtime.camerasManualArmed', false, true);
        await this.applyCameraOutputs();
    }
    async applyCameraOutputs() {
        const anyZoneArmed = this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum;
        const camerasEffectiveArmed = anyZoneArmed || this.camerasManualArmed;
        await this.setOutput(this.cfg.cctvArmedId, camerasEffectiveArmed);
        await this.setOutput(this.cfg.cctvDisarmedId, !camerasEffectiveArmed);
        if (camerasEffectiveArmed && this.isDaytimeActive()) {
            await this.setOutput(this.cfg.drivewayFlashlightTriggerId, true);
        }
    }
    async updateModeState() {
        const any = this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum;
        await this.setStateAsync('runtime.mode', any ? 'armed' : 'disarmed', true);
        await this.applyCameraOutputs();
        await this.refreshStatusIndicators();
        await this.refreshDisplayCycle();
    }
    async handleZoneTrigger(label, zone, sourceType = 'sensor', sourceId = '', rawVal) {
        if (this.countdownTimer)
            return;
        const entrySec = this.cfg.zoneDelays[zone].entryDelaySec;
        const caseId = `CASE-${Date.now()}`;
        this.activeCaseId = caseId;
        this.countdownZone = zone;
        await this.setStateAsync('runtime.activeCaseId', caseId, true);
        await this.setStateAsync('runtime.lastTrigger', `${label} (${zone})`, true);
        await this.setForeignStateSafe(this.cfg.triggerStateId, `${label} (${zone})`);
        await this.scheduleTriggerAutoReset();
        await this.logEvent('alarm', 'zone_trigger', `Trigger ${label} in zone ${zone}`, caseId);
        if (this.displayCycleTimer)
            this.clearInterval(this.displayCycleTimer);
        this.displayCycleTimer = null;
        await this.setOutput(this.cfg.displayId, '  Finger auflegen!  ');
        await this.setStateAsync('runtime.mode', 'countdown', true);
        await this.setStateAsync('runtime.countdownRemainingSec', entrySec, true);
        await this.setOutput(this.cfg.countdownStateId, true);
        const tick = this.setInterval(async () => {
            const cur = (await this.getStateAsync('runtime.countdownRemainingSec'))?.val;
            const next = Math.max(0, Number(cur || 0) - 1);
            await this.setStateAsync('runtime.countdownRemainingSec', next, true);
            if (next > 0 && next % 3 === 0)
                await this.setOutput(this.cfg.buzzerId, 'beep long 2x');
            if (next === 0)
                this.clearInterval(tick);
        }, 1000);
        this.countdownTimer = this.setTimeout(async () => {
            this.countdownTimer = null;
            this.countdownZone = null;
            await this.setOutput(this.cfg.countdownStateId, false);
            await this.setStateAsync('runtime.mode', 'alarm', true);
            await this.setOutput(this.cfg.sirenStateId, true);
            this.startAlarmRepeatTelegram();
            await this.executeZoneActions(zone, caseId);
            await this.executeAlarmActions('zone_trigger', {
                zone,
                sourceType,
                sourceId,
                sourceLabel: label,
                armed: true,
                caseId,
                rawVal
            }, 'after_alarm');
            await this.sendTelegramText(`🚨 Alarm ausgelöst: ${label} (${zone}) | ${caseId}`);
            await this.logEvent('alarm', 'alarm_activated', `Alarm activated (${label}/${zone})`, caseId);
        }, entrySec * 1000) ?? null;
    }
    async executeZoneActions(zone, caseId) {
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
    actionArmedModeMatches(mode, armed) {
        if (mode === 'armed')
            return armed;
        if (mode === 'unarmed')
            return !armed;
        return true;
    }
    actionSourceMatches(row, ctx) {
        if (row.triggerSource !== 'any' && row.triggerSource !== ctx.sourceType)
            return false;
        if (row.triggerEntityId && row.triggerEntityId !== String(ctx.sourceId || ''))
            return false;
        return true;
    }
    actionZoneMatches(row, ctx) {
        if (row.zone === 'any')
            return true;
        if (!ctx.zone)
            return false;
        return row.zone === ctx.zone;
    }
    formatAlarmActionText(template, ctx) {
        return String(template || '')
            .split('{zone}').join(String(ctx.zone || ''))
            .split('{trigger}').join(String(ctx.sourceLabel || ctx.sourceId || 'Trigger'))
            .split('{sourceId}').join(String(ctx.sourceId || ''))
            .split('{sourceType}').join(String(ctx.sourceType || ''))
            .split('{caseId}').join(String(ctx.caseId || ''))
            .split('{value}').join(String(ctx.rawVal ?? ''))
            .split('{panic}').join(ctx.panicActive === true ? 'on' : (ctx.panicActive === false ? 'off' : ''));
    }
    async runDatapointAction(datapointId, onValue, offValue, durationMs, repeatCount, repeatIntervalMs) {
        const id = String(datapointId || '').trim();
        if (!id)
            return;
        const repeats = Math.max(1, Number(repeatCount || 1));
        const interval = Math.max(0, Number(repeatIntervalMs || 0));
        for (let i = 0; i < repeats; i++) {
            const delay = i * interval;
            this.setTimeout(async () => {
                await this.setOutput(id, onValue);
                if (durationMs && durationMs > 0) {
                    const off = offValue !== undefined ? offValue : false;
                    this.setTimeout(() => void this.setOutput(id, off), durationMs);
                }
            }, delay);
        }
    }
    getSnapshotActionTarget(key) {
        const k = String(key || '').trim();
        if (!k)
            return undefined;
        return this.cfg.snapshotActionTargets.find(r => String(r.key || '').trim() === k);
    }
    getCameraByTargetKey(key) {
        const k = String(key || '').trim();
        if (!k)
            return undefined;
        return this.cfg.cameras.find(c => String(c.key || '').trim() === k
            || String(c.personDetectionDp || '').trim() === k
            || String(c.label || '').trim() === k
            || String(c.ip || '').trim() === k);
    }
    async triggerCameraLed(cam, durationMs) {
        if (!cam.ledDatapoint)
            return;
        await this.setOutput(cam.ledDatapoint, true);
        this.setTimeout(() => void this.setOutput(cam.ledDatapoint, false), Math.max(100, durationMs));
    }
    async callInstarCgi(cam, queryParams) {
        if (!cam.instarBaseUrl)
            return;
        const base = this.applyCredentials(cam.instarBaseUrl, cam.username, cam.password);
        const sep = base.includes('?') ? '&' : '?';
        const url = `${base}${sep}${queryParams}`;
        try {
            await axios_1.default.get(url, { timeout: 5000 });
        }
        catch (err) {
            await this.logEvent('warn', 'instar_cgi_error', `Instar CGI fehlgeschlagen (${cam.label || cam.key || cam.ip}): ${String(err)}`);
        }
    }
    async triggerInstarSiren(cam, durationSec) {
        if (!cam.instarBaseUrl)
            return;
        await this.callInstarCgi(cam, 'cmd=setaudioaction&enable=0');
        await this.callInstarCgi(cam, 'cmd=playalarmsound');
        const duration = Math.max(1, durationSec) * 1000;
        this.setTimeout(() => void this.callInstarCgi(cam, 'cmd=stopalarmsound'), duration);
    }
    async triggerInstarFloodlight(cam, durationSec) {
        if (!cam.instarBaseUrl)
            return;
        await this.callInstarCgi(cam, `cmd=illuminate&duration=${Math.max(0, Math.round(durationSec))}`);
    }
    async executeAlarmActions(scenario, ctx, stage = null) {
        const rows = this.cfg.alarmActions.filter(r => r.scenario === scenario);
        for (const row of rows) {
            if (scenario === 'zone_trigger') {
                const timing = row.timing === 'global'
                    ? this.cfg.alarmActionZoneTriggerTiming
                    : (row.timing === 'immediate' ? 'immediate' : 'after_alarm');
                if (stage && timing !== stage)
                    continue;
            }
            if (!this.actionArmedModeMatches(row.armedMode, !!ctx.armed))
                continue;
            if (!this.actionZoneMatches(row, ctx))
                continue;
            if (!this.actionSourceMatches(row, ctx))
                continue;
            const repeats = Math.max(1, Number(row.repeatCount || 1));
            const interval = Math.max(0, Number(row.repeatIntervalMs || 0));
            if (row.actionKind === 'datapoint') {
                await this.runDatapointAction(row.datapointId, row.onValue !== undefined ? row.onValue : true, row.offValue, row.durationMs, repeats, interval);
                await this.logEvent('info', 'alarm_action_dp', `Alarm action ${row.label}: ${String(row.datapointId || '')}`, ctx.caseId);
            }
            else if (row.actionKind === 'telegram') {
                const text = this.formatAlarmActionText(row.telegramText, ctx).trim();
                if (!text)
                    continue;
                for (let i = 0; i < repeats; i++) {
                    this.setTimeout(() => void this.sendTelegramText(text), i * interval);
                }
                await this.logEvent('info', 'alarm_action_telegram', `Alarm action ${row.label}: Telegram`, ctx.caseId);
            }
            else if (row.actionKind === 'alexa') {
                const text = this.formatAlarmActionText(row.alexaText, ctx).trim();
                if (!text || !this.cfg.speakId)
                    continue;
                for (let i = 0; i < repeats; i++) {
                    this.setTimeout(() => void this.setOutput(this.cfg.speakId, text), i * interval);
                }
                await this.logEvent('info', 'alarm_action_alexa', `Alarm action ${row.label}: Alexa`, ctx.caseId);
            }
            else if (row.actionKind === 'snapshot') {
                const target = this.getSnapshotActionTarget(row.snapshotTargetKey);
                if (!target) {
                    await this.logEvent('warn', 'alarm_action_snapshot_missing', `Alarm action ${row.label}: Snapshot target fehlt (${String(row.snapshotTargetKey || '-')})`, ctx.caseId);
                    continue;
                }
                await this.runDatapointAction(target.datapointId, target.onValue !== undefined ? target.onValue : true, target.offValue, target.durationMs, repeats, interval);
                await this.logEvent('info', 'alarm_action_snapshot', `Alarm action ${row.label}: Snapshot ${target.label}`, ctx.caseId);
            }
            else if (row.actionKind === 'camera_led') {
                const cam = this.getCameraByTargetKey(row.cameraTargetKey);
                if (!cam || !cam.ledDatapoint) {
                    await this.logEvent('warn', 'alarm_action_camera_led_missing', `Alarm action ${row.label}: Kamera/LED fehlt (${String(row.cameraTargetKey || '-')})`, ctx.caseId);
                    continue;
                }
                const duration = row.durationMs && row.durationMs > 0 ? row.durationMs : 10000;
                for (let i = 0; i < repeats; i++) {
                    this.setTimeout(() => void this.triggerCameraLed(cam, duration), i * interval);
                }
                await this.logEvent('info', 'alarm_action_camera_led', `Alarm action ${row.label}: Kamera-LED ${cam.label || cam.key || cam.ip}`, ctx.caseId);
            }
            else if (row.actionKind === 'camera_instar_siren') {
                const cam = this.getCameraByTargetKey(row.cameraTargetKey);
                if (!cam || !cam.instarBaseUrl) {
                    await this.logEvent('warn', 'alarm_action_instar_siren_missing', `Alarm action ${row.label}: Instar-Kamera fehlt (${String(row.cameraTargetKey || '-')})`, ctx.caseId);
                    continue;
                }
                const durationSec = row.durationMs && row.durationMs > 0 ? Math.round(row.durationMs / 1000) : 10;
                for (let i = 0; i < repeats; i++) {
                    this.setTimeout(() => void this.triggerInstarSiren(cam, durationSec), i * interval);
                }
                await this.logEvent('info', 'alarm_action_instar_siren', `Alarm action ${row.label}: Instar-Sirene ${cam.label || cam.key || cam.ip}`, ctx.caseId);
            }
            else if (row.actionKind === 'camera_instar_floodlight') {
                const cam = this.getCameraByTargetKey(row.cameraTargetKey);
                if (!cam || !cam.instarBaseUrl) {
                    await this.logEvent('warn', 'alarm_action_instar_floodlight_missing', `Alarm action ${row.label}: Instar-Kamera fehlt (${String(row.cameraTargetKey || '-')})`, ctx.caseId);
                    continue;
                }
                const durationSec = row.durationMs && row.durationMs > 0 ? Math.round(row.durationMs / 1000) : 180;
                for (let i = 0; i < repeats; i++) {
                    this.setTimeout(() => void this.triggerInstarFloodlight(cam, durationSec), i * interval);
                }
                await this.logEvent('info', 'alarm_action_instar_floodlight', `Alarm action ${row.label}: Instar-Flutlicht ${cam.label || cam.key || cam.ip}`, ctx.caseId);
            }
        }
    }
    isMonitorModeActive(mode) {
        if (mode === 'immer')
            return true;
        if (mode === 'vollschutz')
            return this.zoneArmed.perimeter && this.zoneArmed.aussenhaut && this.zoneArmed.innenraum;
        if (mode === 'aussenhaut')
            return this.zoneArmed.aussenhaut;
        if (mode === 'kamera') {
            return this.camerasManualArmed || this.isAnyZoneArmed() || (this.cfg.cameraNightModeArmsCameras && this.isNightModeActive());
        }
        return this.zoneArmed.perimeter;
    }
    isOwnStateId(id) {
        return String(id || '').startsWith(`${this.namespace}.`);
    }
    ownLocalId(id) {
        const prefix = `${this.namespace}.`;
        return this.isOwnStateId(id) ? id.slice(prefix.length) : '';
    }
    async pulseCommandDatapoint(id, durationMs = 800) {
        const dp = String(id || '').trim();
        if (!dp)
            return;
        const local = this.ownLocalId(dp);
        if (local) {
            await this.setStateAsync(local, true, true);
            this.setTimeout(() => void this.setStateAsync(local, false, true), Math.max(100, durationMs));
            return;
        }
        await this.setOutput(dp, true);
        this.setTimeout(() => void this.setOutput(dp, false), Math.max(100, durationMs));
    }
    getModeFlowLevelCommandId(level) {
        if (level === 'none')
            return '';
        if (level === 'interior_alarm')
            return this.cfg.modeFlowInteriorAlarmCommandId;
        if (level === 'full_alarm')
            return this.cfg.modeFlowFullAlarmCommandId;
        return this.cfg.modeFlowPerimeterAlarmCommandId;
    }
    getModeFlowLevelTelegramText(level) {
        if (level === 'none')
            return '';
        if (level === 'interior_alarm')
            return String(this.cfg.modeFlowTelegramInteriorText || '').trim();
        if (level === 'full_alarm')
            return String(this.cfg.modeFlowTelegramFullText || '').trim();
        return String(this.cfg.modeFlowTelegramPerimeterText || '').trim();
    }
    formatModeFlowText(template, ctx, mode, level) {
        return this.formatAlarmActionText(template, ctx)
            .split('{mode}').join(String(mode || ''))
            .split('{level}').join(String(level || ''));
    }
    async triggerCameraSnapshotOnly(cam, labelOverride) {
        const url = this.applyCredentials(cam.snapshotUrl, cam.username, cam.password);
        const label = String(labelOverride || cam.label || cam.key || cam.ip || 'Camera');
        for (let i = 0; i < this.cfg.snapshotBurstCount; i++) {
            const delay = this.cfg.snapshotDelayMs + i * this.cfg.snapshotBurstIntervalMs;
            this.setTimeout(() => void this.sendSnapshot(url, label, i + 1), delay);
        }
    }
    async triggerAllCameraAlarmOutputs() {
        for (const id of this.cfg.cameraAlarmOnIds)
            await this.setOutput(id, true);
        for (const cam of this.cfg.cameras) {
            if (cam.alarmDatapoint)
                await this.setOutput(cam.alarmDatapoint, 1);
        }
    }
    async triggerAllCameraLeds(durationMs) {
        for (const cam of this.cfg.cameras) {
            if (!cam.ledDatapoint)
                continue;
            await this.triggerCameraLed(cam, durationMs);
        }
    }
    async executeModeFlowAnnounce(reason) {
        await this.pulseCommandDatapoint(this.cfg.modeFlowAnnounceCommandId, 1200);
        await this.logEvent('info', 'mode_flow_announce', `ModeFlow announce (${reason})`, this.activeCaseId || undefined);
    }
    async activateModeFlowAlarmLevel(level, ctx, reason, mode = 'perimeter') {
        if (level === 'none')
            return;
        const cmdId = this.getModeFlowLevelCommandId(level);
        if (cmdId)
            await this.pulseCommandDatapoint(cmdId, 1200);
        if (level === 'perimeter_alarm') {
            await this.triggerAllCameraAlarmOutputs();
        }
        else if (level === 'interior_alarm') {
            await this.setOutput(this.cfg.sirenStateId, true);
        }
        else {
            await this.triggerAllCameraAlarmOutputs();
            await this.setOutput(this.cfg.sirenStateId, true);
            for (const id of this.cfg.reolinkSirenIds)
                await this.setOutput(id, 20);
        }
        const text = this.getModeFlowLevelTelegramText(level);
        if (text) {
            await this.sendTelegramText(this.formatModeFlowText(text, ctx, mode, level));
        }
        await this.logEvent('alarm', 'mode_flow_level', `ModeFlow ${level} aktiviert (${reason})`, ctx.caseId || this.activeCaseId || undefined);
    }
    async executeModeFlowRuleActions(row, ctx, triggerCam) {
        if (row.actionSnapshotTriggerCamera) {
            if (triggerCam)
                await this.triggerCameraSnapshotOnly(triggerCam, triggerCam.label);
            else
                await this.logEvent('warn', 'mode_flow_snapshot_missing_cam', `ModeFlow ${row.label}: triggernde Kamera fehlt`, ctx.caseId);
        }
        if (row.actionCameraAlarmTriggerCamera) {
            if (triggerCam?.alarmDatapoint)
                await this.setOutput(triggerCam.alarmDatapoint, 1);
            else
                await this.logEvent('warn', 'mode_flow_cam_alarm_missing', `ModeFlow ${row.label}: Kamera-Alarm-DP fehlt`, ctx.caseId);
        }
        if (row.actionCameraLedTriggerCamera) {
            if (triggerCam?.ledDatapoint)
                await this.triggerCameraLed(triggerCam, 10000);
            else
                await this.logEvent('warn', 'mode_flow_cam_led_missing', `ModeFlow ${row.label}: Kamera-LED-DP fehlt`, ctx.caseId);
        }
        if (row.actionCameraAlarmAll)
            await this.triggerAllCameraAlarmOutputs();
        if (row.actionCameraLedAll)
            await this.triggerAllCameraLeds(10000);
        if (row.actionTelegram) {
            const msg = this.formatModeFlowText(row.actionTelegramText || '', ctx, row.mode, row.alarmLevel).trim();
            if (msg)
                await this.sendTelegramText(msg);
        }
        if (row.actionAlexaSpeak && this.cfg.speakId) {
            const speak = this.formatModeFlowText(row.actionAlexaText || '', ctx, row.mode, row.alarmLevel).trim();
            if (speak)
                await this.setOutput(this.cfg.speakId, speak);
        }
    }
    async runModeFlowRule(row, ctx, triggerCam) {
        const runLevelAndActions = async () => {
            if (row.alarmLevel !== 'none') {
                await this.activateModeFlowAlarmLevel(row.alarmLevel, ctx, `rule:${row.label}`, row.mode);
            }
            await this.executeModeFlowRuleActions(row, ctx, triggerCam);
        };
        if (row.announceBefore) {
            await this.executeModeFlowAnnounce(`rule:${row.label}`);
            const delayMs = Math.max(0, Number(row.announceDelaySec || 0) * 1000);
            const timer = this.setTimeout(() => {
                if (timer)
                    this.pendingModeFlowTimers.delete(timer);
                void runLevelAndActions();
            }, delayMs);
            if (timer)
                this.pendingModeFlowTimers.add(timer);
            return;
        }
        await runLevelAndActions();
    }
    cancelPendingModeFlowTimers() {
        for (const timer of this.pendingModeFlowTimers)
            this.clearTimeout(timer);
        this.pendingModeFlowTimers.clear();
    }
    async executeModeFlowRulesForTrigger(ctx, triggerCam) {
        const sourceType = ctx.sourceType === 'camera' ? 'camera' : (ctx.sourceType === 'personDetection' ? 'personDetection' : 'sensor');
        const srcId = String(ctx.sourceId || '').trim();
        if (!srcId)
            return;
        const rules = this.cfg.modeFlowRules.filter(r => r.enabled
            && r.sourceKind === sourceType
            && r.sourceId === srcId
            && (r.sourceZone === 'any' || (ctx.zone ? r.sourceZone === ctx.zone : false)));
        if (!rules.length)
            return;
        for (const row of rules) {
            if (!this.isMonitorModeActive(row.mode))
                continue;
            await this.runModeFlowRule(row, ctx, triggerCam);
        }
    }
    async executePanicActions(active) {
        const rows = this.cfg.panicActions.filter(r => r.when === (active ? 'on' : 'off'));
        for (const row of rows) {
            const repeats = Math.max(1, Number(row.repeatCount || 1));
            const interval = Math.max(0, Number(row.repeatIntervalMs || 0));
            if (row.actionKind === 'datapoint') {
                await this.runDatapointAction(row.datapointId, row.onValue !== undefined ? row.onValue : true, row.offValue, row.durationMs, repeats, interval);
            }
            else if (row.actionKind === 'telegram') {
                const text = this.formatAlarmActionText(row.telegramText, {
                    sourceType: 'any',
                    sourceId: this.cfg.panicStateId,
                    sourceLabel: 'PANIC',
                    armed: this.isAnyZoneArmed(),
                    panicActive: active
                }).trim();
                if (!text)
                    continue;
                for (let i = 0; i < repeats; i++) {
                    this.setTimeout(() => void this.sendTelegramText(text), i * interval);
                }
            }
            else if (row.actionKind === 'alexa') {
                const text = this.formatAlarmActionText(row.alexaText, {
                    sourceType: 'any',
                    sourceId: this.cfg.panicStateId,
                    sourceLabel: 'PANIC',
                    armed: this.isAnyZoneArmed(),
                    panicActive: active
                }).trim();
                if (!text || !this.cfg.speakId)
                    continue;
                for (let i = 0; i < repeats; i++) {
                    this.setTimeout(() => void this.setOutput(this.cfg.speakId, text), i * interval);
                }
            }
            else if (row.actionKind === 'snapshot') {
                const target = this.getSnapshotActionTarget(row.snapshotTargetKey);
                if (!target) {
                    await this.logEvent('warn', 'panic_action_snapshot_missing', `PANIC action ${row.label}: Snapshot target fehlt (${String(row.snapshotTargetKey || '-')})`, this.activeCaseId || undefined);
                    continue;
                }
                await this.runDatapointAction(target.datapointId, target.onValue !== undefined ? target.onValue : true, target.offValue, target.durationMs, repeats, interval);
            }
            else if (row.actionKind === 'camera_led') {
                const cam = this.getCameraByTargetKey(row.cameraTargetKey);
                if (!cam || !cam.ledDatapoint) {
                    await this.logEvent('warn', 'panic_action_camera_led_missing', `PANIC action ${row.label}: Kamera/LED fehlt (${String(row.cameraTargetKey || '-')})`, this.activeCaseId || undefined);
                    continue;
                }
                const duration = row.durationMs && row.durationMs > 0 ? row.durationMs : 10000;
                for (let i = 0; i < repeats; i++) {
                    this.setTimeout(() => void this.triggerCameraLed(cam, duration), i * interval);
                }
            }
            else if (row.actionKind === 'camera_instar_siren') {
                const cam = this.getCameraByTargetKey(row.cameraTargetKey);
                if (!cam || !cam.instarBaseUrl) {
                    await this.logEvent('warn', 'panic_action_instar_siren_missing', `PANIC action ${row.label}: Instar-Kamera fehlt (${String(row.cameraTargetKey || '-')})`, this.activeCaseId || undefined);
                    continue;
                }
                const durationSec = row.durationMs && row.durationMs > 0 ? Math.round(row.durationMs / 1000) : 10;
                for (let i = 0; i < repeats; i++) {
                    this.setTimeout(() => void this.triggerInstarSiren(cam, durationSec), i * interval);
                }
            }
            else if (row.actionKind === 'camera_instar_floodlight') {
                const cam = this.getCameraByTargetKey(row.cameraTargetKey);
                if (!cam || !cam.instarBaseUrl) {
                    await this.logEvent('warn', 'panic_action_instar_floodlight_missing', `PANIC action ${row.label}: Instar-Kamera fehlt (${String(row.cameraTargetKey || '-')})`, this.activeCaseId || undefined);
                    continue;
                }
                const durationSec = row.durationMs && row.durationMs > 0 ? Math.round(row.durationMs / 1000) : 180;
                for (let i = 0; i < repeats; i++) {
                    this.setTimeout(() => void this.triggerInstarFloodlight(cam, durationSec), i * interval);
                }
            }
            await this.logEvent('info', 'panic_action_custom', `PANIC custom action ${row.label}`, this.activeCaseId || undefined);
        }
    }
    async handlePanic(active) {
        if (active) {
            for (const id of this.cfg.cameraAlarmOnIds)
                await this.setOutput(id, true);
            for (const id of this.cfg.reolinkSirenIds)
                await this.setOutput(id, 20);
            await this.executeAlarmActions('panic_on', {
                sourceType: 'any',
                sourceId: this.cfg.panicStateId,
                sourceLabel: 'PANIC',
                armed: this.isAnyZoneArmed(),
                panicActive: true
            });
            await this.executePanicActions(true);
            await this.logEvent('alarm', 'panic_on', 'PANIC aktiviert');
        }
        else {
            for (const id of this.cfg.cameraAlarmOffIds)
                await this.setOutput(id, true);
            for (const id of this.cfg.reolinkSirenIds)
                await this.setOutput(id, 0);
            await this.setOutput(this.cfg.cctvDisarmedId, true);
            this.stopAlarmRepeatTelegram();
            await this.executeAlarmActions('panic_off', {
                sourceType: 'any',
                sourceId: this.cfg.panicStateId,
                sourceLabel: 'PANIC',
                armed: this.isAnyZoneArmed(),
                panicActive: false
            });
            await this.executePanicActions(false);
            await this.logEvent('warn', 'panic_off', 'PANIC deaktiviert');
        }
    }
    escapeRegExp(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    matchKnownFingerprint(text, names) {
        const sorted = [...names].sort((a, b) => b.length - a.length);
        for (const n of sorted) {
            const re = new RegExp(`\\b${this.escapeRegExp(n)}\\b`, 'i');
            if (re.test(text))
                return n;
        }
        return null;
    }
    getFingerprintScenario(name) {
        const row = this.cfg.fingerprintScenarios.find(r => r.name.toLowerCase() === name.toLowerCase());
        return row?.scenario || 'disarmOnly';
    }
    async runFingerprintScenarioActions(name) {
        const scenario = this.getFingerprintScenario(name);
        if (scenario === 'entrance') {
            await this.runDatapointAction(this.cfg.nukiFrontDoorId, true, false, this.cfg.nukiUnlatchResetMs, 1, 0);
        }
        else if (scenario === 'zero') {
            await this.runDatapointAction(this.cfg.nukiSideDoorId, true, false, this.cfg.nukiUnlatchResetMs, 1, 0);
            await this.setOutput(this.cfg.garageDoorCommandId, 0);
        }
        else if (scenario === 'openGarage') {
            await this.setOutput(this.cfg.garageDoorCommandId, 0);
        }
        else if (scenario === 'garageClose') {
            await this.setOutput(this.cfg.garageDoorCommandId, 2);
        }
    }
    async sendFingerprintSnapshot(name) {
        const cam = this.getCameraByTargetKey(this.cfg.fingerprintSnapshotCameraKey);
        if (cam)
            await this.triggerCameraSnapshotOnly(cam, `Fingerprint erkannt: ${name}`);
    }
    async handleFingerprint(raw) {
        if (typeof raw !== 'string')
            return;
        const text = raw.trim();
        if (!text)
            return;
        const n = this.matchKnownFingerprint(text, this.cfg.knownFingerprints);
        if (!n)
            return;
        const now = Date.now();
        if (this.lastFingerprintHit === n && now - this.lastFingerprintTs < this.cfg.fingerprintCooldownMs)
            return;
        this.lastFingerprintHit = n;
        this.lastFingerprintTs = now;
        await this.disarmAll();
        await this.runFingerprintScenarioActions(n);
        await this.sendTelegramText(`${n} erkannt – Alarm wird deaktiviert`);
        await this.sendFingerprintSnapshot(n);
    }
    async handleGarageFingerprint(raw) {
        if (typeof raw !== 'string')
            return;
        const text = raw.trim();
        if (!text)
            return;
        const n = this.matchKnownFingerprint(text, this.cfg.knownFingerprints);
        if (!n)
            return;
        const now = Date.now();
        if (this.lastGarageFingerprintHit === n && now - this.lastGarageFingerprintTs < this.cfg.fingerprintCooldownMs)
            return;
        this.lastGarageFingerprintHit = n;
        this.lastGarageFingerprintTs = now;
        await this.disarmAll();
        await this.runFingerprintScenarioActions(n);
        await this.sendTelegramText(`${n} erkannt (Garage) – Alarm wird deaktiviert`);
        await this.sendFingerprintSnapshot(n);
    }
    async handleDoorbellRing(raw) {
        if (!this.isActiveBooleanValue(raw))
            return;
        const cam = this.getCameraByTargetKey(this.cfg.fingerprintSnapshotCameraKey);
        if (cam)
            await this.triggerCameraSnapshotOnly(cam);
    }
    async handleSnapshotTriggerDatapoint(trigger, raw) {
        if (!this.isActiveBooleanValue(raw))
            return;
        const cam = this.getCameraByTargetKey(trigger.cameraKey);
        if (cam)
            await this.triggerCameraSnapshotOnly(cam);
        await this.setOutput(trigger.triggerId, false);
    }
    async handleGeofencePersonEvent(person, raw) {
        if (typeof raw !== 'boolean')
            return;
        const verb = raw ? 'betreten' : 'verlassen';
        await this.sendTelegramText(`${person.name} hat den Geofence ${verb}`);
    }
    formatInstarDetectionTable(json) {
        let data;
        try {
            data = JSON.parse(json);
        }
        catch {
            return 'INSTAR-Erkennung (ungültiges JSON)';
        }
        const rows = [];
        for (const key of Object.keys(data)) {
            if (key === 'predictions')
                continue;
            const val = data[key];
            if (val !== undefined && val !== null && typeof val !== 'object') {
                rows.push([key, String(val)]);
            }
        }
        const predictions = Array.isArray(data?.predictions) ? data.predictions.slice(0, 5) : [];
        let table = '```\n';
        table += 'Feld            | Wert\n';
        table += '----------------|----------\n';
        for (const [k, v] of rows) {
            table += `${k.padEnd(15)} | ${v}\n`;
        }
        for (const p of predictions) {
            const label = String(p?.class ?? '?');
            const conf = p?.confidence !== undefined ? String(p.confidence) : '?';
            table += `${('Prediction: ' + label).padEnd(15)} | ${conf}\n`;
        }
        table += '```';
        return table;
    }
    async handleInstarDetection(raw) {
        if (typeof raw !== 'string' || !raw)
            return;
        const table = this.formatInstarDetectionTable(raw);
        await this.sendTelegramText(table);
    }
    async handlePin(raw) {
        if (raw === null || raw === undefined)
            return;
        const s = String(raw).trim().replace(/[^\d*#]/g, '');
        if (!s)
            return;
        const now = Date.now();
        for (const ch of s) {
            if (this.pinArmed && now - this.pinArmedAt > this.cfg.pinSequenceWindowMs) {
                this.pinArmed = false;
            }
            if (ch === '*') {
                this.pinArmed = true;
                this.pinArmedAt = now;
                continue;
            }
            if (ch === '#') {
                this.pinArmed = false;
                continue;
            }
            if (!this.pinArmed)
                continue;
            if (now - this.pinLastTriggerAt < this.cfg.pinTriggerCooldownMs) {
                this.pinArmed = false;
                continue;
            }
            if (ch === '1') {
                this.pinLastTriggerAt = now;
                this.pinArmed = false;
                await this.setOutput(this.cfg.garageDoorCommandId, 0);
                await this.setOutput(this.cfg.displayId, '   Tor oeffnet...   ');
                this.setTimeout(() => void this.setOutput(this.cfg.clearDisplayId, true), 4000);
            }
            else if (ch === '2') {
                this.pinLastTriggerAt = now;
                this.pinArmed = false;
                await this.setOutput(this.cfg.garageDoorCommandId, 2);
                await this.setOutput(this.cfg.displayId, '  Tor schliesst...  ');
                this.setTimeout(() => void this.setOutput(this.cfg.clearDisplayId, true), 4000);
            }
            else if (ch === '4') {
                this.pinLastTriggerAt = now;
                this.pinArmed = false;
                await this.setOutput(this.cfg.pdlcId, true);
            }
            else if (ch === '5') {
                this.pinLastTriggerAt = now;
                this.pinArmed = false;
                await this.setOutput(this.cfg.pdlcId, false);
            }
        }
    }
    async initializePresenceState() {
        const vals = await Promise.all(this.cfg.autoArmPresenceIds.map(id => this.getForeignStateAsync(id)));
        const someoneHome = vals.some(v => v?.val === true);
        this.presenceLastSomeoneHome = someoneHome;
    }
    async armZones(zones) {
        for (const zone of zones)
            await this.armZone(zone);
    }
    async disarmZones(zones) {
        for (const zone of zones)
            await this.disarmZone(zone);
    }
    formatWithDelay(template, delaySec) {
        return String(template || '').split('{delay}').join(String(delaySec));
    }
    async handleGeofenceLeaveEvent() {
        if (this.cfg.geofenceLeaveArmZones.length > 0) {
            await this.armZones(this.cfg.geofenceLeaveArmZones);
        }
        const msg = String(this.cfg.geofenceLeaveTelegramText || '').trim();
        if (msg)
            await this.sendTelegramText(msg, this.cfg.geofenceLeaveChatIds);
        await this.logEvent('info', 'geofence_leave', 'Geofence: jemand hat das Zuhause verlassen');
    }
    async handleGeofenceEnterEvent() {
        if (this.cfg.geofenceEnterDisarmZones.length > 0) {
            await this.disarmZones(this.cfg.geofenceEnterDisarmZones);
        }
        if (this.cfg.geofenceEnterArmZones.length > 0) {
            await this.armZones(this.cfg.geofenceEnterArmZones);
        }
        const msg = String(this.cfg.geofenceEnterTelegramText || '').trim();
        if (msg)
            await this.sendTelegramText(msg, this.cfg.geofenceEnterChatIds);
        await this.logEvent('info', 'geofence_enter', 'Geofence: jemand ist Zuhause angekommen');
    }
    async handleAutoArmWhenNobodyHome() {
        const vals = await Promise.all(this.cfg.autoArmPresenceIds.map(id => this.getForeignStateAsync(id)));
        const someoneHome = vals.some(v => v?.val === true);
        if (this.presenceLastSomeoneHome === null) {
            this.presenceLastSomeoneHome = someoneHome;
        }
        else if (this.presenceLastSomeoneHome !== someoneHome) {
            if (!someoneHome)
                await this.handleGeofenceLeaveEvent();
            else
                await this.handleGeofenceEnterEvent();
            this.presenceLastSomeoneHome = someoneHome;
        }
        if (someoneHome) {
            if (this.autoArmTimer)
                this.clearTimeout(this.autoArmTimer);
            this.autoArmTimer = null;
            return;
        }
        if (this.cfg.modeFlowAutoAwayMode === 'off') {
            if (this.autoArmTimer)
                this.clearTimeout(this.autoArmTimer);
            this.autoArmTimer = null;
            return;
        }
        if (this.autoArmTimer || this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum)
            return;
        if (!this.cfg.autoAwayArmZones.length)
            return;
        const delaySec = Math.max(0, Number(this.cfg.modeFlowAutoAwayDelaySec || this.cfg.autoArmDelaySec || 60));
        const pendingMsg = this.formatWithDelay(this.cfg.autoAwayPendingTelegramText, delaySec).trim();
        if (pendingMsg)
            await this.sendTelegramText(pendingMsg, this.cfg.autoAwayChatIds);
        this.autoArmTimer = this.setTimeout(async () => {
            this.autoArmTimer = null;
            await this.armZones(this.cfg.autoAwayArmZones);
            const armedMsg = String(this.cfg.autoAwayArmedTelegramText || '').trim();
            if (armedMsg)
                await this.sendTelegramText(armedMsg, this.cfg.autoAwayChatIds);
        }, delaySec * 1000) ?? null;
    }
    async handleBedtimePerimeter() {
        const h = new Date().getHours();
        const inNightWindow = h >= this.cfg.bedtimeHour || h < 6;
        if (!inNightWindow)
            return;
        const light = (await this.getForeignStateAsync(this.cfg.bedtimeLightSensorId))?.val;
        const armed = this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum;
        const pres = await Promise.all(this.cfg.bedtimePresenceHomeIds.map(id => this.getForeignStateAsync(id)));
        const someoneHome = pres.some(v => v?.val === true);
        if (!armed && someoneHome && typeof light === 'number' && light < this.cfg.bedtimeLightThreshold) {
            await this.armZone('perimeter');
            await this.sendTelegramText('Schlafenszeit erkannt! Perimeterschutz wurde aktiviert!');
        }
    }
    startSunsetAutomationCheck() {
        if (this.sunsetAutoTimer)
            this.clearInterval(this.sunsetAutoTimer);
        this.sunsetAutoTimer = this.setInterval(() => void this.runSunsetAutomation(), 60000) ?? null;
        void this.runSunsetAutomation();
    }
    async runSunsetAutomation() {
        if (!this.cfg.modeFlowAutoPerimeterAfterSunsetEnabled)
            return;
        const now = new Date();
        const day = this.dayString(now);
        if (!this.isNightModeActive())
            return;
        if (this.lastSunsetAutoArmDay === day)
            return;
        if (this.zoneArmed.perimeter && this.zoneArmed.aussenhaut) {
            this.lastSunsetAutoArmDay = day;
            return;
        }
        await this.armZone('perimeter');
        await this.armZone('aussenhaut');
        this.lastSunsetAutoArmDay = day;
        await this.logEvent('info', 'mode_flow_auto_sunset', 'Perimeterschutz nach Sonnenuntergang automatisch aktiviert');
    }
    isStatusRelatedInputId(id) {
        if (this.cfg.ledRedOpenIds.includes(id) || this.cfg.ledYellowOpenIds.includes(id))
            return true;
        if (this.cfg.checkRedOpenIds.includes(id) || this.cfg.checkYellowOpenIds.includes(id))
            return true;
        if (this.cfg.statusOpenIds.includes(id))
            return true;
        return this.cfg.sensors.some(s => s.sensorType === 'contact' && s.id === id);
    }
    async isDoorLikeOpen(id) {
        const st = await this.getForeignStateAsync(id);
        const val = st?.val;
        const sensor = this.cfg.sensors.find(s => s.id === id);
        if (sensor)
            return this.matchesAny(val ?? null, sensor.activeValues);
        if (val === true || val === 1)
            return true;
        const raw = String(val ?? '').trim().toLowerCase();
        return raw === 'open' || raw === 'on' || raw === 'true' || raw === '1';
    }
    async refreshStatusIndicators() {
        const redOpen = await Promise.all(this.cfg.ledRedOpenIds.map(id => this.isDoorLikeOpen(id)));
        const yellowOpen = await Promise.all(this.cfg.ledYellowOpenIds.map(id => this.isDoorLikeOpen(id)));
        const checkRedOpen = await Promise.all(this.cfg.checkRedOpenIds.map(id => this.isDoorLikeOpen(id)));
        const checkYellowOpen = await Promise.all(this.cfg.checkYellowOpenIds.map(id => this.isDoorLikeOpen(id)));
        const statusOpen = await Promise.all(this.cfg.statusOpenIds.map(async (id) => ({
            id,
            open: await this.isDoorLikeOpen(id)
        })));
        await this.setOutput(this.cfg.checkRedId, !checkRedOpen.some(Boolean));
        await this.setOutput(this.cfg.checkYellowId, !checkYellowOpen.some(Boolean));
        const standby = await this.getForeignStateAsync(this.cfg.standbyId);
        const allowLed = !this.cfg.ledOnlyInStandby || standby?.val === true;
        await this.setOutput(this.cfg.ledRedId, allowLed && redOpen.some(Boolean));
        await this.setOutput(this.cfg.ledYellowId, allowLed && yellowOpen.some(Boolean));
        const lines = [];
        if (this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum)
            lines.push('AlarmSystem scharf');
        if (this.zoneArmed.perimeter)
            lines.push('PerimeterProtection aktiv');
        for (const row of statusOpen) {
            if (!row.open)
                continue;
            const sensor = this.cfg.sensors.find(s => s.id === row.id);
            const label = sensor?.label || row.id;
            lines.push(`${label} offen`);
        }
        if (lines.length === 0)
            lines.push(this.cfg.statusAllClosedText);
        if (!(this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum)) {
            lines[0] = this.cfg.statusNoProtectionText;
        }
        await this.setOutput(this.cfg.statusId, lines.join('\n'));
    }
    isDisplayBlockedByAlarmFlow(mode) {
        return mode === 'countdown' || mode === 'alarm';
    }
    formatDisplayDoorText(label) {
        return String(this.cfg.displayDoorTemplate || '{door} offen').split('{door}').join(label);
    }
    async renderDisplayFallback() {
        if (!this.cfg.displayFallbackSourceIds.length) {
            await this.setOutput(this.cfg.clearDisplayId, true);
            return;
        }
        const values = [];
        for (const id of this.cfg.displayFallbackSourceIds) {
            const st = await this.getForeignStateAsync(id);
            if (st && st.val !== null && st.val !== undefined && String(st.val).trim() !== '')
                values.push(String(st.val));
        }
        const text = `${values.join('        ')}${this.cfg.displayFallbackSuffix || ''}`.trim();
        if (!text) {
            await this.setOutput(this.cfg.clearDisplayId, true);
            return;
        }
        await this.setOutput(this.cfg.displayId, text);
    }
    async refreshDisplayCycle() {
        if (!this.cfg.displayDoorCycleEnabled)
            return;
        const mode = String((await this.getStateAsync('runtime.mode'))?.val || '');
        if (this.isDisplayBlockedByAlarmFlow(mode)) {
            if (this.displayCycleTimer)
                this.clearInterval(this.displayCycleTimer);
            this.displayCycleTimer = null;
            return;
        }
        const openDoorLabels = [];
        for (const s of this.cfg.sensors) {
            if (s.sensorType !== 'contact')
                continue;
            const st = await this.getForeignStateAsync(s.id);
            if (this.matchesAny(st?.val ?? null, s.activeValues))
                openDoorLabels.push(s.label || s.key || s.id);
        }
        if (openDoorLabels.length === 0) {
            if (this.displayCycleTimer)
                this.clearInterval(this.displayCycleTimer);
            this.displayCycleTimer = null;
            this.displayOpenQueue = [];
            this.displayCycleIndex = 0;
            await this.renderDisplayFallback();
            return;
        }
        const prev = JSON.stringify(this.displayOpenQueue);
        const next = JSON.stringify(openDoorLabels);
        if (prev !== next) {
            this.displayOpenQueue = openDoorLabels.slice();
            this.displayCycleIndex = 0;
        }
        const writeCycle = async () => {
            if (!this.displayOpenQueue.length)
                return;
            const label = this.displayOpenQueue[this.displayCycleIndex % this.displayOpenQueue.length];
            await this.setOutput(this.cfg.displayId, this.formatDisplayDoorText(label));
            this.displayCycleIndex = (this.displayCycleIndex + 1) % this.displayOpenQueue.length;
        };
        await writeCycle();
        if (!this.displayCycleTimer) {
            this.displayCycleTimer = this.setInterval(() => void writeCycle(), this.cfg.displayDoorCycleIntervalMs) ?? null;
        }
    }
    async abortCountdown() {
        if (this.countdownTimer)
            this.clearTimeout(this.countdownTimer);
        this.countdownTimer = null;
        this.countdownZone = null;
        await this.setOutput(this.cfg.countdownStateId, false);
        await this.setStateAsync('runtime.countdownRemainingSec', 0, true);
        await this.updateModeState();
    }
    async abortCountdownIfDisarmed() {
        if (!this.countdownTimer)
            return;
        if (this.cfg.countdownAbortMode === 'off')
            return;
        if (this.cfg.countdownAbortMode === 'any_disarm') {
            if (!this.isAnyZoneArmed()) {
                await this.abortCountdown();
                await this.setOutput(this.cfg.sirenStateId, false);
                await this.logEvent('info', 'countdown_abort', 'Countdown abgebrochen (any_disarm)');
            }
            return;
        }
        if (this.countdownZone && !this.zoneArmed[this.countdownZone]) {
            await this.abortCountdown();
            await this.setOutput(this.cfg.sirenStateId, false);
            await this.logEvent('info', 'countdown_abort', `Countdown abgebrochen (zone ${this.countdownZone} unscharf)`);
        }
    }
    async scheduleTriggerAutoReset() {
        if (this.triggerResetTimer)
            this.clearTimeout(this.triggerResetTimer);
        this.triggerResetTimer = null;
        if (this.cfg.alarmTriggerAutoResetMs <= 0)
            return;
        this.triggerResetTimer = this.setTimeout(() => void this.setOutput(this.cfg.triggerStateId, null), this.cfg.alarmTriggerAutoResetMs) ?? null;
    }
    startAlarmRepeatTelegram() {
        this.stopAlarmRepeatTelegram();
        if (!this.cfg.alarmRepeatTelegramEnabled)
            return;
        const intervalMs = Math.max(5000, this.cfg.alarmRepeatTelegramIntervalSec * 1000);
        const send = async () => {
            const text = String(this.cfg.alarmRepeatTelegramText || '').trim();
            if (text)
                await this.sendTelegramText(text);
            if (this.cfg.alarmRepeatTelegramIncludeTrigger) {
                const trigger = await this.getForeignStateAsync(this.cfg.triggerStateId);
                const val = String(trigger?.val ?? '').trim();
                if (val)
                    await this.sendTelegramText(`${this.cfg.alarmRepeatTelegramTriggerPrefix || 'Trigger: '}${val}`);
            }
        };
        void send();
        this.alarmRepeatTimer = this.setInterval(() => void send(), intervalMs) ?? null;
    }
    stopAlarmRepeatTelegram() {
        if (this.alarmRepeatTimer)
            this.clearInterval(this.alarmRepeatTimer);
        this.alarmRepeatTimer = null;
    }
    async syncPanicStartupState() {
        if (!this.cfg.panicStartupSyncEnabled)
            return;
        const panic = await this.getForeignStateAsync(this.cfg.panicStateId);
        if (panic?.val === true) {
            for (const id of this.cfg.cameraAlarmOnIds)
                await this.setOutput(id, true);
            return;
        }
        for (const id of this.cfg.cameraAlarmOffIds)
            await this.setOutput(id, true);
        await this.setOutput(this.cfg.cctvDisarmedId, true);
    }
    async ackActiveCase() {
        if (!this.activeCaseId)
            return;
        const cid = this.activeCaseId;
        this.eventLog = this.eventLog.map(e => e.caseId === cid ? { ...e, acked: true } : e);
        await this.setStateAsync('diagnostics.eventsJson', JSON.stringify(this.eventLog), true);
        await this.logEvent('info', 'case_acked', `Case acknowledged: ${cid}`, cid);
        this.activeCaseId = '';
        await this.setStateAsync('runtime.activeCaseId', '', true);
        await this.disarmAll();
    }
    async triggerCamera(cam) {
        await this.setOutput(cam.alarmDatapoint, 1);
        if (cam.ledDatapoint) {
            await this.triggerCameraLed(cam, 10000);
        }
        const url = this.applyCredentials(cam.snapshotUrl, cam.username, cam.password);
        for (let i = 0; i < this.cfg.snapshotBurstCount; i++) {
            const delay = this.cfg.snapshotDelayMs + i * this.cfg.snapshotBurstIntervalMs;
            this.setTimeout(() => void this.sendSnapshot(url, cam.label, i + 1), delay);
        }
    }
    isAnyZoneArmed() {
        return this.zoneArmed.perimeter || this.zoneArmed.aussenhaut || this.zoneArmed.innenraum;
    }
    snapshotZoneConditionMatches(mode, zones) {
        if (mode === 'none')
            return true;
        if (mode === 'any')
            return this.isAnyZoneArmed();
        if (!zones.length)
            return false;
        return zones.some(z => this.zoneArmed[z]);
    }
    async tryTriggerConfiguredSnapshot(label, datapointId, mode = 'none', zones = []) {
        const id = String(datapointId || '').trim();
        if (!id)
            return;
        if (!this.snapshotZoneConditionMatches(mode, zones))
            return;
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
    isNightModeActive() {
        if (!this.cfg.cameraNightModeEnabled)
            return false;
        const lat = typeof this.latitude === 'number' ? this.latitude : undefined;
        const lon = typeof this.longitude === 'number' ? this.longitude : undefined;
        if (lat === undefined || lon === undefined)
            return false;
        try {
            const now = new Date();
            const times = suncalc_1.default.getTimes(now, lat, lon);
            return now >= times.dusk || now <= times.sunriseEnd;
        }
        catch {
            return false;
        }
    }
    isDaytimeActive() {
        const lat = typeof this.latitude === 'number' ? this.latitude : undefined;
        const lon = typeof this.longitude === 'number' ? this.longitude : undefined;
        if (lat === undefined || lon === undefined)
            return false;
        try {
            const now = new Date();
            const times = suncalc_1.default.getTimes(now, lat, lon);
            return now >= times.sunrise && now <= times.dusk;
        }
        catch {
            return false;
        }
    }
    async sendSnapshot(url, label, idx) {
        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const res = await axios_1.default.get(url, { responseType: 'arraybuffer', timeout: 8000, validateStatus: s => s < 500 });
                if (res.status !== 200)
                    throw new Error(`HTTP ${res.status}`);
                const contentType = String(res.headers?.['content-type'] || '');
                if (!contentType.startsWith('image/'))
                    throw new Error(`Unexpected content-type: ${contentType || '(none)'}`);
                const buffer = Buffer.from(res.data);
                if (buffer.length < 1000)
                    throw new Error(`Snapshot too small: ${buffer.length} bytes`);
                const file = path.join(os.tmpdir(), `alarm_${Date.now()}_${idx}.jpg`);
                await node_fs_1.promises.writeFile(file, buffer);
                await this.sendTelegramPhoto(file, `AlarmSystem ${label}`);
                return;
            }
            catch (e) {
                if (attempt >= maxAttempts) {
                    await this.logEvent('warn', 'snapshot_error', `Snapshot failed for ${label} after ${attempt} attempts: ${String(e)}`);
                }
            }
        }
    }
    applyCredentials(url, user, pass) {
        return url.split('{username}').join(encodeURIComponent(user || '<USERNAME>')).split('{password}').join(encodeURIComponent(pass || '<PASSWORD>'));
    }
    async setOutput(id, val) {
        if (!id)
            return;
        if (this.cfg.simulationMode) {
            await this.logEvent('info', 'simulation_output', `SIM: ${id} = ${String(val)}`);
            return;
        }
        await this.setForeignStateSafe(id, val);
    }
    matchesAny(val, list) {
        return list.some(x => x === val);
    }
    matchesPerson(val, p) {
        if (p.mode === 'boolean')
            return this.isActiveBooleanValue(val);
        return typeof val === 'string' && val === (p.detectValue || 'human detected');
    }
    matchesCameraPerson(val, cam) {
        const mode = cam.personDetectionMode || 'auto';
        const detect = String(cam.personDetectionDetectValue || 'human detected');
        if (mode === 'boolean')
            return this.isActiveBooleanValue(val);
        if (mode === 'string')
            return typeof val === 'string' && val === detect;
        return this.isActiveBooleanValue(val) || (typeof val === 'string' && val === detect);
    }
    isActiveBooleanValue(val) {
        if (val === true || val === 1)
            return true;
        if (typeof val === 'string') {
            const s = val.trim().toLowerCase();
            return s === 'true' || s === '1' || s === 'on';
        }
        return false;
    }
    allowEvent(key) {
        const now = Date.now();
        const prev = this.dedupe.get(key) || 0;
        if (now - prev < this.cfg.dedupeMs)
            return false;
        this.dedupe.set(key, now);
        return true;
    }
    async logEvent(level, type, message, caseId) {
        const e = { ts: Date.now(), level, type, message, caseId, acked: false };
        this.eventLog.unshift(e);
        this.eventLog = this.eventLog.slice(0, 200);
        await this.setStateAsync('diagnostics.eventsJson', JSON.stringify(this.eventLog), true);
        if (level === 'warn')
            this.log.warn(message);
        else if (level === 'alarm')
            this.log.error(message);
        else
            this.log.info(message);
    }
    async setForeignStateSafe(id, val) {
        try {
            await this.setForeignStateAsync(id, val);
        }
        catch { }
    }
    async sendTelegramText(text, chatIdsOverride) {
        const override = Array.isArray(chatIdsOverride) ? chatIdsOverride.filter(Boolean) : [];
        for (const inst of this.cfg.telegramInstances) {
            const targets = override.length > 0
                ? override.map(chatId => ({ instance: inst.instance, chatId }))
                : this.cfg.telegramTargets.filter(t => t.instance === inst.instance);
            const payloadBase = { text };
            if (inst.token)
                payloadBase.token = inst.token;
            if (targets.length === 0)
                await this.sendToAsync(inst.instance, 'send', payloadBase);
            else
                for (const t of targets)
                    await this.sendToAsync(inst.instance, 'send', { ...payloadBase, user: t.chatId });
        }
    }
    async sendTelegramPhoto(file, caption, chatIdsOverride) {
        const override = Array.isArray(chatIdsOverride) ? chatIdsOverride.filter(Boolean) : [];
        for (const inst of this.cfg.telegramInstances) {
            const targets = override.length > 0
                ? override.map(chatId => ({ instance: inst.instance, chatId }))
                : this.cfg.telegramTargets.filter(t => t.instance === inst.instance);
            const payloadBase = { text: file, type: 'photo' };
            if (inst.token)
                payloadBase.token = inst.token;
            if (caption !== undefined)
                payloadBase.caption = caption;
            if (targets.length === 0)
                await this.sendToAsync(inst.instance, 'send', payloadBase);
            else
                for (const t of targets)
                    await this.sendToAsync(inst.instance, 'send', { ...payloadBase, user: t.chatId });
        }
    }
    async sendTelegramTestPhoto(caption) {
        const cam = this.cfg.cameras.find(c => String(c.snapshotUrl || '').trim());
        if (!cam) {
            await this.logEvent('warn', 'telegram_test_photo_missing_snapshot', 'Telegram Testbild nicht gesendet: keine Kamera mit snapshotUrl konfiguriert');
            await this.sendTelegramText('Test: Kein Snapshot konfiguriert');
            return;
        }
        const url = this.applyCredentials(cam.snapshotUrl, cam.username, cam.password);
        try {
            const res = await axios_1.default.get(url, { responseType: 'arraybuffer', timeout: 8000, validateStatus: s => s < 500 });
            if (res.status !== 200)
                throw new Error(`HTTP ${res.status}`);
            const file = path.join(os.tmpdir(), `alarm_telegram_test_${Date.now()}.jpg`);
            await node_fs_1.promises.writeFile(file, Buffer.from(res.data));
            await this.sendTelegramPhoto(file, caption);
            await this.logEvent('info', 'telegram_test_photo', `Telegram Testbild gesendet (${cam.label || cam.key || cam.ip || 'Kamera'})`);
        }
        catch (e) {
            await this.logEvent('warn', 'telegram_test_photo_error', `Telegram Testbild fehlgeschlagen: ${String(e)}`);
        }
    }
    parseScalar(v) {
        if (v === 'true')
            return true;
        if (v === 'false')
            return false;
        const n = Number(v);
        if (String(n) === v && Number.isFinite(n))
            return n;
        return v;
    }
    toNumber(v, fallback) {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    }
    toBool(v, fallback) {
        if (typeof v === 'boolean')
            return v;
        if (typeof v === 'number')
            return v !== 0;
        if (typeof v === 'string') {
            const s = v.trim().toLowerCase();
            if (['true', '1', 'yes', 'on'].includes(s))
                return true;
            if (['false', '0', 'no', 'off'].includes(s))
                return false;
        }
        return fallback;
    }
    async writeDailyTriggerLog(sourceType, label, sourceId, zone, rawVal) {
        try {
            const now = new Date();
            const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const stamp = now.toISOString();
            const line = `${stamp};type=${sourceType};zone=${zone};label=${label};id=${sourceId};value=${String(rawVal)}\n`;
            const baseDir = this.triggerLogDir || path.join(utils.getAbsoluteInstanceDataDir(this), 'trigger-logs');
            await node_fs_1.promises.mkdir(baseDir, { recursive: true });
            await node_fs_1.promises.appendFile(path.join(baseDir, `${day}.log`), line, 'utf8');
            const currentDate = (await this.getStateAsync('diagnostics.triggerLogDate'))?.val;
            if (currentDate === day) {
                await this.refreshTriggerLogState(day);
            }
        }
        catch (e) {
            this.log.warn(`Trigger logfile write failed: ${String(e)}`);
        }
    }
    dayString(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    async refreshTriggerLogState(day) {
        const clean = /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : this.dayString(new Date());
        const baseDir = this.triggerLogDir || path.join(utils.getAbsoluteInstanceDataDir(this), 'trigger-logs');
        const file = path.join(baseDir, `${clean}.log`);
        let text = '';
        try {
            text = await node_fs_1.promises.readFile(file, 'utf8');
        }
        catch {
            text = '';
        }
        await this.setStateAsync('diagnostics.triggerLogDate', clean, true);
        await this.setStateAsync('diagnostics.triggerLogText', text || `Keine Trigger-Logs für ${clean}`, true);
    }
    cloneJson(value) {
        try {
            return JSON.parse(JSON.stringify(value));
        }
        catch {
            return value;
        }
    }
    tryJson(raw, fallback) {
        try {
            if (typeof raw !== 'string' || raw.trim() === '')
                return fallback;
            return JSON.parse(raw);
        }
        catch {
            return fallback;
        }
    }
}
if (require.main !== module) {
    module.exports = (options) => new AlarmSystemAdapter(options);
}
else {
    (() => new AlarmSystemAdapter())();
}
