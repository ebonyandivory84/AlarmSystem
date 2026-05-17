(() => {
  const qs = new URLSearchParams(window.location.search);
  const rawInstance = qs.get('instance') || 'alarmsystem.0';

  const $ = id => document.getElementById(id);
  const ui = {
    status: $('statusBox'),
    instance: $('instanceLabel'),
    profile: $('profileSelect'),
    palettePirList: $('palettePirList'),
    paletteContactList: $('paletteContactList'),
    paletteCameraList: $('paletteCameraList'),
    global: $('globalFields'),
    dp: $('dpFields'),
    mini: $('miniCanvas'),
    full: $('fullCanvas'),
    canvasModal: $('canvasModal'),
    objectModal: $('objectBrowserModal'),
    objectSearch: $('objectSearch'),
    objectResults: $('objectResults'),
    objectTree: $('objectTree'),
    stateIds: $('stateIds'),
    addResult: $('addResult'),
    hover: $('miniHoverInfo'),
    logDate: $('triggerLogDate'),
    logView: $('triggerLogView'),
    entityModal: $('entitySettingsModal'),
    entityLabel: $('selectedEntityLabel'),
    liveMode: $('liveMode'),
    livePerimeter: $('livePerimeter'),
    liveAussenhaut: $('liveAussenhaut'),
    liveInnenraum: $('liveInnenraum'),
    liveCameras: $('liveCameras'),
    overviewPage: $('overviewPage'),
    designerPage: $('designerPage'),
    settingsPage: $('settingsPage'),
    layoutModeBtn: $('layoutModeBtn'),
    pageOverviewBtn: $('pageOverviewBtn'),
    pageDesignerBtn: $('pageDesignerBtn'),
    pageSettingsBtn: $('pageSettingsBtn'),
    floorEgBtn: $('floorEgBtn'),
    floorOgBtn: $('floorOgBtn'),
    toggleHullBtn: $('toggleHullBtn'),
    editImageBtn: $('editImageBtn'),
    editZonesBtn: $('editZonesBtn'),
    editZoneSelect: $('editZoneSelect'),
    closeZoneBtn: $('closeZoneBtn'),
    clearZoneBtn: $('clearZoneBtn'),
    copyZonesFloorBtn: $('copyZonesFloorBtn'),
    resetImageRectBtn: $('resetImageRectBtn'),
    panicBtn: $('panicToggleBtn'),
    shield: $('statusShield'),
    overviewEventLog: $('overviewEventLog'),
    overviewShowSensorsBtn: $('overviewShowSensorsBtn'),
    absenceCard: $('absenceCard'),
    absenceList: $('absenceList'),
    presenceCard: $('presenceCard'),
    presenceList: $('presenceList'),
    zoneActionsList: $('zoneActionsList'),
    zoneActionResult: $('zoneActionResult'),
    alarmActionConflictHint: $('alarmActionConflictHint'),
    alarmActionConflictDetails: $('alarmActionConflictDetails'),
    alarmActionGlobalTiming: $('alarmActionGlobalTiming'),
    alarmCountdownAbortMode: $('alarmCountdownAbortMode'),
    alarmRepeatTelegramEnabled: $('alarmRepeatTelegramEnabled'),
    alarmRepeatTelegramIntervalSec: $('alarmRepeatTelegramIntervalSec'),
    alarmRepeatTelegramText: $('alarmRepeatTelegramText'),
    alarmActionsList: $('alarmActionsList'),
    alarmActionResult: $('alarmActionResult'),
    quickAlarmScenario: $('quickAlarmScenario'),
    quickAlarmZone: $('quickAlarmZone'),
    quickAlarmTriggerType: $('quickAlarmTriggerType'),
    quickAlarmTriggerEntity: $('quickAlarmTriggerEntity'),
    quickAlarmArmedMode: $('quickAlarmArmedMode'),
    quickAlarmTiming: $('quickAlarmTiming'),
    quickAlarmKindDatapoint: $('quickAlarmKindDatapoint'),
    quickAlarmKindTelegram: $('quickAlarmKindTelegram'),
    quickAlarmKindAlexa: $('quickAlarmKindAlexa'),
    quickAlarmKindSnapshot: $('quickAlarmKindSnapshot'),
    quickAlarmKindCameraLed: $('quickAlarmKindCameraLed'),
    quickAlarmDatapointId: $('quickAlarmDatapointId'),
    quickAlarmOnValue: $('quickAlarmOnValue'),
    quickAlarmOffValue: $('quickAlarmOffValue'),
    quickAlarmDurationMs: $('quickAlarmDurationMs'),
    quickAlarmTelegramText: $('quickAlarmTelegramText'),
    quickAlarmAlexaText: $('quickAlarmAlexaText'),
    quickAlarmSnapshotTarget: $('quickAlarmSnapshotTarget'),
    quickAlarmCameraTarget: $('quickAlarmCameraTarget'),
    quickAlarmRepeatCount: $('quickAlarmRepeatCount'),
    quickAlarmRepeatIntervalMs: $('quickAlarmRepeatIntervalMs'),
    quickAlarmLabel: $('quickAlarmLabel'),
    quickAlarmDpWrap: $('quickAlarmDpWrap'),
    quickAlarmOnWrap: $('quickAlarmOnWrap'),
    quickAlarmOffWrap: $('quickAlarmOffWrap'),
    quickAlarmDurationWrap: $('quickAlarmDurationWrap'),
    quickAlarmTelegramWrap: $('quickAlarmTelegramWrap'),
    quickAlarmAlexaWrap: $('quickAlarmAlexaWrap'),
    quickAlarmSnapshotWrap: $('quickAlarmSnapshotWrap'),
    quickAlarmCameraLedWrap: $('quickAlarmCameraLedWrap'),
    quickAlarmRepeatCountWrap: $('quickAlarmRepeatCountWrap'),
    quickAlarmRepeatIntervalWrap: $('quickAlarmRepeatIntervalWrap'),
    quickAlarmZoneWrap: $('quickAlarmZoneWrap'),
    quickAlarmTriggerTypeWrap: $('quickAlarmTriggerTypeWrap'),
    quickAlarmTriggerEntityWrap: $('quickAlarmTriggerEntityWrap'),
    quickAlarmArmedModeWrap: $('quickAlarmArmedModeWrap'),
    quickAlarmTimingWrap: $('quickAlarmTimingWrap'),
    addQuickAlarmActionBtn: $('addQuickAlarmActionBtn'),
    quickAlarmActionResult: $('quickAlarmActionResult'),
    quickAlarmActionsList: $('quickAlarmActionsList'),
    browseQuickAlarmDatapointBtn: $('browseQuickAlarmDatapointBtn'),
    modeFlowModeSelect: $('modeFlowModeSelect'),
    modeFlowRuleLabel: $('modeFlowRuleLabel'),
    modeFlowSourceSearch: $('modeFlowSourceSearch'),
    modeFlowSourceList: $('modeFlowSourceList'),
    modeFlowAlarmLevel: $('modeFlowAlarmLevel'),
    modeFlowAnnounceBefore: $('modeFlowAnnounceBefore'),
    modeFlowAnnounceDelaySec: $('modeFlowAnnounceDelaySec'),
    modeFlowActionSnapshotTriggerCamera: $('modeFlowActionSnapshotTriggerCamera'),
    modeFlowActionCameraAlarmTriggerCamera: $('modeFlowActionCameraAlarmTriggerCamera'),
    modeFlowActionCameraLedTriggerCamera: $('modeFlowActionCameraLedTriggerCamera'),
    modeFlowActionCameraAlarmAll: $('modeFlowActionCameraAlarmAll'),
    modeFlowActionCameraLedAll: $('modeFlowActionCameraLedAll'),
    modeFlowActionAlexaSpeak: $('modeFlowActionAlexaSpeak'),
    modeFlowActionAlexaText: $('modeFlowActionAlexaText'),
    addModeFlowRuleBtn: $('addModeFlowRuleBtn'),
    modeFlowRuleResult: $('modeFlowRuleResult'),
    modeFlowRulesList: $('modeFlowRulesList'),
    modeFlowAnnounceCommandId: $('modeFlowAnnounceCommandId'),
    modeFlowPerimeterCommandId: $('modeFlowPerimeterCommandId'),
    modeFlowInteriorCommandId: $('modeFlowInteriorCommandId'),
    modeFlowFullCommandId: $('modeFlowFullCommandId'),
    modeFlowTelegramPerimeterText: $('modeFlowTelegramPerimeterText'),
    modeFlowTelegramInteriorText: $('modeFlowTelegramInteriorText'),
    modeFlowTelegramFullText: $('modeFlowTelegramFullText'),
    modeFlowAutoPerimeterAfterSunsetEnabled: $('modeFlowAutoPerimeterAfterSunsetEnabled'),
    modeFlowAutoAwayMode: $('modeFlowAutoAwayMode'),
    modeFlowAutoAwayDelaySec: $('modeFlowAutoAwayDelaySec'),
    snapshotActionKey: $('snapshotActionKey'),
    snapshotActionLabel: $('snapshotActionLabel'),
    snapshotActionDatapointId: $('snapshotActionDatapointId'),
    snapshotActionOnValue: $('snapshotActionOnValue'),
    snapshotActionOffValue: $('snapshotActionOffValue'),
    snapshotActionDurationMs: $('snapshotActionDurationMs'),
    addSnapshotActionBtn: $('addSnapshotActionBtn'),
    snapshotActionResult: $('snapshotActionResult'),
    snapshotActionsList: $('snapshotActionsList'),
    browseSnapshotActionDatapointBtn: $('browseSnapshotActionDatapointBtn'),
    alarmActionScenario: $('alarmActionScenario'),
    alarmActionZone: $('alarmActionZone'),
    alarmActionTriggerType: $('alarmActionTriggerType'),
    alarmActionTriggerEntity: $('alarmActionTriggerEntity'),
    alarmActionArmedMode: $('alarmActionArmedMode'),
    alarmActionKindDatapoint: $('alarmActionKindDatapoint'),
    alarmActionKindTelegram: $('alarmActionKindTelegram'),
    alarmActionKindAlexa: $('alarmActionKindAlexa'),
    alarmActionKindSnapshot: $('alarmActionKindSnapshot'),
    alarmActionKindCameraLed: $('alarmActionKindCameraLed'),
    alarmActionTiming: $('alarmActionTiming'),
    alarmActionDatapointId: $('alarmActionDatapointId'),
    alarmActionOnValue: $('alarmActionOnValue'),
    alarmActionOffValue: $('alarmActionOffValue'),
    alarmActionDurationMs: $('alarmActionDurationMs'),
    alarmActionRepeatCount: $('alarmActionRepeatCount'),
    alarmActionRepeatIntervalMs: $('alarmActionRepeatIntervalMs'),
    alarmActionTelegramText: $('alarmActionTelegramText'),
    alarmActionAlexaText: $('alarmActionAlexaText'),
    alarmActionSnapshotTarget: $('alarmActionSnapshotTarget'),
    alarmActionCameraTarget: $('alarmActionCameraTarget'),
    alarmActionDpWrap: $('alarmActionDpWrap'),
    alarmActionOnWrap: $('alarmActionOnWrap'),
    alarmActionOffWrap: $('alarmActionOffWrap'),
    alarmActionDurationWrap: $('alarmActionDurationWrap'),
    alarmActionRepeatCountWrap: $('alarmActionRepeatCountWrap'),
    alarmActionRepeatIntervalWrap: $('alarmActionRepeatIntervalWrap'),
    alarmActionTelegramWrap: $('alarmActionTelegramWrap'),
    alarmActionAlexaWrap: $('alarmActionAlexaWrap'),
    alarmActionSnapshotWrap: $('alarmActionSnapshotWrap'),
    alarmActionCameraLedWrap: $('alarmActionCameraLedWrap'),
    alarmActionTimingWrap: $('alarmActionTimingWrap'),
    browseAlarmActionDatapointBtn: $('browseAlarmActionDatapointBtn'),
    addAlarmActionBtn: $('addAlarmActionBtn'),
    panicActionsList: $('panicActionsList'),
    panicActionResult: $('panicActionResult'),
    panicActionWhen: $('panicActionWhen'),
    panicActionKindDatapoint: $('panicActionKindDatapoint'),
    panicActionKindTelegram: $('panicActionKindTelegram'),
    panicActionKindAlexa: $('panicActionKindAlexa'),
    panicActionKindSnapshot: $('panicActionKindSnapshot'),
    panicActionDatapointId: $('panicActionDatapointId'),
    panicActionOnValue: $('panicActionOnValue'),
    panicActionOffValue: $('panicActionOffValue'),
    panicActionDurationMs: $('panicActionDurationMs'),
    panicActionRepeatCount: $('panicActionRepeatCount'),
    panicActionRepeatIntervalMs: $('panicActionRepeatIntervalMs'),
    panicActionTelegramText: $('panicActionTelegramText'),
    panicActionAlexaText: $('panicActionAlexaText'),
    panicActionSnapshotTarget: $('panicActionSnapshotTarget'),
    panicActionDpWrap: $('panicActionDpWrap'),
    panicActionOnWrap: $('panicActionOnWrap'),
    panicActionOffWrap: $('panicActionOffWrap'),
    panicActionDurationWrap: $('panicActionDurationWrap'),
    panicActionRepeatCountWrap: $('panicActionRepeatCountWrap'),
    panicActionRepeatIntervalWrap: $('panicActionRepeatIntervalWrap'),
    panicActionTelegramWrap: $('panicActionTelegramWrap'),
    panicActionAlexaWrap: $('panicActionAlexaWrap'),
    panicActionSnapshotWrap: $('panicActionSnapshotWrap'),
    browsePanicActionDatapointBtn: $('browsePanicActionDatapointBtn'),
    addPanicActionBtn: $('addPanicActionBtn'),
    telegramInstancesList: $('telegramInstancesList'),
    telegramTargetsList: $('telegramTargetsList'),
    telegramConfigInfo: $('telegramConfigInfo'),
    telegramAddInstanceBtn: $('telegramAddInstanceBtn'),
    telegramAddTargetBtn: $('telegramAddTargetBtn'),
    telegramTestTextBtn: $('telegramTestTextBtn'),
    telegramTestPhotoBtn: $('telegramTestPhotoBtn'),
    telegramTestPhotoCaptionBtn: $('telegramTestPhotoCaptionBtn'),
    autoAwayDelaySec: $('autoAwayDelaySec'),
    autoAwayArmZonesCsv: $('autoAwayArmZonesCsv'),
    autoAwayChatIdsCsv: $('autoAwayChatIdsCsv'),
    autoAwayPendingTelegramText: $('autoAwayPendingTelegramText'),
    autoAwayArmedTelegramText: $('autoAwayArmedTelegramText'),
    geofenceLeaveArmZonesCsv: $('geofenceLeaveArmZonesCsv'),
    geofenceLeaveChatIdsCsv: $('geofenceLeaveChatIdsCsv'),
    geofenceLeaveTelegramText: $('geofenceLeaveTelegramText'),
    geofenceEnterArmZonesCsv: $('geofenceEnterArmZonesCsv'),
    geofenceEnterDisarmZonesCsv: $('geofenceEnterDisarmZonesCsv'),
    geofenceEnterChatIdsCsv: $('geofenceEnterChatIdsCsv'),
    geofenceEnterTelegramText: $('geofenceEnterTelegramText'),
    canvasEntitySearch: $('canvasEntitySearch'),
    canvasEntitiesList: $('canvasEntitiesList'),
    floorplanEgInput: $('floorplanEgInput'),
    floorplanOgInput: $('floorplanOgInput'),
    floorplanEgUpload: $('floorplanEgUpload'),
    floorplanOgUpload: $('floorplanOgUpload'),
    uploadFloorplansBtn: $('uploadFloorplansBtn'),
    healthOverviewText: $('healthOverviewText'),
    healthDetailsPanel: $('healthDetailsPanel'),
    healthCard: $('healthCard'),
    avatarPersonSelect: $('avatarPersonSelect'),
    avatarUploadInput: $('avatarUploadInput'),
    avatarPreviewCircle: $('avatarPreviewCircle'),
    avatarPreviewImage: $('avatarPreviewImage'),
    avatarZoomOutBtn: $('avatarZoomOutBtn'),
    avatarZoomInBtn: $('avatarZoomInBtn'),
    avatarResetBtn: $('avatarResetBtn'),
    avatarApplyBtn: $('avatarApplyBtn'),
    ruleHealthMode: $('ruleHealthMode'),
    ruleHealthHeartbeatId: $('ruleHealthHeartbeatId'),
    ruleHealthHeartbeatMaxSec: $('ruleHealthHeartbeatMaxSec'),
    ruleHealthOnlineId: $('ruleHealthOnlineId'),
    ruleLed: $('ruleLed'),
    ruleSnapshotDatapointId: $('ruleSnapshotDatapointId'),
    ruleSnapshotZoneMode: $('ruleSnapshotZoneMode'),
    ruleSnapshotZones: $('ruleSnapshotZones'),
    browseRuleHeartbeatIdBtn: $('browseRuleHeartbeatIdBtn'),
    browseRuleOnlineIdBtn: $('browseRuleOnlineIdBtn'),
    browseRuleSnapshotDatapointBtn: $('browseRuleSnapshotDatapointBtn'),
    pinModal: $('pinModal'),
    pinDots: $('pinDots'),
    pinHint: $('pinHint'),
    designerFloor: $('designerFloor'),
    designerTool: $('designerTool'),
    designerItemType: $('designerItemType'),
    designerGrid: $('designerGrid'),
    designerSnapBtn: $('designerSnapBtn'),
    designerZoomOutBtn: $('designerZoomOutBtn'),
    designerZoomInBtn: $('designerZoomInBtn'),
    designerZoomInfo: $('designerZoomInfo'),
    designerMoveUpBtn: $('designerMoveUpBtn'),
    designerMoveDownBtn: $('designerMoveDownBtn'),
    designerMoveLeftBtn: $('designerMoveLeftBtn'),
    designerMoveRightBtn: $('designerMoveRightBtn'),
    designerRotateBtn: $('designerRotateBtn'),
    designerBgBtn: $('designerBgBtn'),
    designerUseOnlyBtn: $('designerUseOnlyBtn'),
    designerPublishBtn: $('designerPublishBtn'),
    designerUndoBtn: $('designerUndoBtn'),
    designerFinishWallBtn: $('designerFinishWallBtn'),
    designerNewBeamChainBtn: $('designerNewBeamChainBtn'),
    designerBindSelectedBtn: $('designerBindSelectedBtn'),
    designerClearBindBtn: $('designerClearBindBtn'),
    designerShowSensorsBtn: $('designerShowSensorsBtn'),
    designerEntitySelect: $('designerEntitySelect'),
    designerPickEntityBtn: $('designerPickEntityBtn'),
    designerSelectedEntityInfo: $('designerSelectedEntityInfo'),
    designerSelectedItemInfo: $('designerSelectedItemInfo'),
    designerCopyFloorBtn: $('designerCopyFloorBtn'),
    designerClearBtn: $('designerClearBtn'),
    designerSvg: $('designerSvg')
  };

  const state = {
    socket: null,
    instanceId: 'alarmsystem.0',
    objectId: 'system.adapter.alarmsystem.0',
    instanceObj: null,
    config: null,
    profiles: {},
    activeProfile: 'default.json',
    stateIds: [],
    objectTreeRoot: null,
    objectTreeExpanded: new Set(),
    objectTreeSelectedId: '',
    selectedEntity: null,
    objectTarget: null,
    live: { perimeterArmed: false, aussenArmed: false, innenArmed: false, fullArmed: false, innerFillArmed: false },
    liveAlerts: { contact: {}, pir: {}, camera: {} },
    overviewShowSensors: true,
    avatarProfiles: {},
    avatarDesigner: { person: 'sebastian', dragging: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 },
    health: { ok: true, reasons: [], checks: [] },
    healthDetailsOpen: false,
    entityModalBaseline: '',
    presenceByPerson: { sebastian: false, teresa: false },
    pinInput: '',
    pinTargetAction: null,
    stateIdsLoaded: false,
    stateIdsLoading: null,
    currentFloor: 'EG',
    editImage: false,
    editZones: false,
    floorLayouts: { EG: null, OG: null },
    dragResize: null,
    dragZonePoint: null,
    suppressZoneClickOnce: false,
    toastTimer: null,
    canvasHistory: [],
    floorRatios: { EG: 0.907, OG: 0.906 },
    modeFlowSourceItems: [],
    modeFlowSelectedSources: new Set()
    ,designer: {
      EG: null,
      OG: null,
      snap: true,
      grid: 12,
      floorView: {
        EG: { showBg: true, useInOverviewOnly: false },
        OG: { showBg: true, useInOverviewOnly: false }
      },
      dragItemId: null,
      pendingBeamConnect: null,
      dragWallId: null,
      dragWallPoint: null,
      dragWallStart: null,
      dragWallOrig: null,
      drawingWall: null,
      drawingWallCursor: null,
      wallFinishCooldownUntil: 0,
      drawingPerimeter: null,
      selectedItemId: null,
      dragResizeItemId: null,
      dragResizeStart: null,
      dragResizeOrig: null,
      dragRotateItemId: null,
      dragRotateCenter: null,
      dragRotateStartAngle: null,
      dragRotateOrigRotation: null,
      dragAnchorItemId: null,
      showSensorsPreview: false
    },
    designerHistory: []
  };
  const DISARM_PIN = '1492';

  const globalSpec = [['defaultEntryDelaySec','number'],['defaultExitDelaySec','number'],['eventDedupeMs','number'],['heartbeatTimeoutSec','number'],['snapshotSendDelayMs','number'],['snapshotBurstCount','number'],['snapshotBurstIntervalMs','number'],['bedtimeHour','number'],['bedtimeLightThreshold','number'],['simulationMode','boolean'],['cameraNightModeEnabled','boolean'],['cameraNightModeArmsCameras','boolean'],['alarmActionZoneTriggerTiming','select']];
  const globalHelp = {
    defaultEntryDelaySec: 'Eingangsverzoegerung in Sekunden: Zeit zwischen Trigger und Alarmstart beim Betreten.',
    defaultExitDelaySec: 'Ausgangsverzoegerung in Sekunden: Zeitfenster zum Verlassen nach dem Scharfschalten.',
    eventDedupeMs: 'Entprellzeit in Millisekunden: gleiche Events in diesem Zeitraum werden zusammengefasst.',
    heartbeatTimeoutSec: 'Timeout in Sekunden fuer Heartbeat/Ueberwachung: danach gilt eine Quelle als inaktiv.',
    snapshotSendDelayMs: 'Verzoegerung in Millisekunden bis Snapshot-Versand nach Trigger.',
    snapshotBurstCount: 'Anzahl der Snapshots pro Ereignis (Burst).',
    snapshotBurstIntervalMs: 'Abstand in Millisekunden zwischen Snapshots innerhalb eines Bursts.',
    autoArmDelaySec: 'Wartezeit in Sekunden bis zur automatischen Scharfschaltung (z. B. nach Abwesenheit).',
    bedtimeHour: 'Stunde (0-23) fuer Nachtlogik/Schlafenszeit-Regeln.',
    bedtimeLightThreshold: 'Helligkeitsschwelle fuer Abend/Nacht-Automation (je nach Datenquelle).',
    simulationMode: 'Testmodus: Logik laeuft simuliert, ohne reale Alarmaktionen auszufuehren (falls im Adapter so genutzt).',
    cameraNightModeEnabled: 'Aktiviert die Kamera-Nachtmodus-Logik im Adapter.',
    cameraNightModeArmsCameras: 'Wenn aktiv, werden Kameras im Nachtmodus automatisch scharf geschaltet.',
    alarmActionZoneTriggerTiming: 'Standard für Alarm Actions bei Zone-Triggern: sofort beim Trigger oder erst nach Alarmaktivierung (Countdown fertig).'
  };
  const dpSpec = [
    { key: 'armStateId', type: 'state' },
    { key: 'hullProtectionStateId', type: 'state' },
    { key: 'perimeterStateId', type: 'state' },
    { key: 'countdownStateId', type: 'state' },
    { key: 'triggerStateId', type: 'state' },
    { key: 'sirenStateId', type: 'state' },
    { key: 'displayId', type: 'state' },
    { key: 'clearDisplayId', type: 'state' },
    { key: 'buzzerId', type: 'state' },
    { key: 'ledRedId', type: 'state' },
    { key: 'ledYellowId', type: 'state' },
    { key: 'standbyId', type: 'state' },
    { key: 'motionSensorId', type: 'state' },
    { key: 'panicStateId', type: 'state' },
    { key: 'fingerprintStateId', type: 'state' },
    { key: 'pinStateId', type: 'state' },
    { key: 'statusId', type: 'state' },
    { key: 'checkRedId', type: 'state' },
    { key: 'checkYellowId', type: 'state' },
    { key: 'drivewayFlashlightTriggerId', type: 'state' },
    { key: 'standbyNoMotionValue', type: 'text' },
    { key: 'standbyTimeoutMs', type: 'number' },
    { key: 'standbySafetyIntervalMs', type: 'number' },
    { key: 'ledRedOpenIdsCsv', type: 'text' },
    { key: 'ledYellowOpenIdsCsv', type: 'text' },
    { key: 'ledOnlyInStandby', type: 'boolean' },
    { key: 'ledSafetyIntervalMs', type: 'number' },
    { key: 'checkRedOpenIdsCsv', type: 'text' },
    { key: 'checkYellowOpenIdsCsv', type: 'text' },
    { key: 'statusOpenIdsCsv', type: 'text' },
    { key: 'statusNoProtectionText', type: 'text' },
    { key: 'statusAllClosedText', type: 'text' },
    { key: 'displayDoorCycleEnabled', type: 'boolean' },
    { key: 'displayDoorCycleIntervalMs', type: 'number' },
    { key: 'displayDoorTemplate', type: 'text' },
    { key: 'displayFallbackSourceIdsCsv', type: 'text' },
    { key: 'displayFallbackSuffix', type: 'text' },
    { key: 'alarmTriggerAutoResetMs', type: 'number' },
    { key: 'fingerprintCooldownMs', type: 'number' },
    { key: 'pinSequenceWindowMs', type: 'number' },
    { key: 'pinTriggerCooldownMs', type: 'number' },
    { key: 'panicStartupSyncEnabled', type: 'boolean' }
  ];
  const dpHelp = {
    countdownStateId: 'Legacy-Kompatibilität: wird während Entry-Countdown auf true gesetzt und danach wieder auf false.',
    standbyNoMotionValue: 'Wert, der am Motion-Datapoint als "keine Bewegung" interpretiert wird (Legacy: "no motion").',
    standbyTimeoutMs: 'Nach dieser Zeit ohne Bewegung wird StandBy=true gesetzt (Legacy: 20000 ms).',
    standbySafetyIntervalMs: 'Sicherheits-Intervall für StandBy-Prüfung (Legacy: 10000 ms).',
    ledRedOpenIdsCsv: 'CSV der Tür-Datapoints für rote LED (mind. ein open => rot).',
    ledYellowOpenIdsCsv: 'CSV der Fenster-/Zusatz-Datapoints für gelbe LED (mind. ein open => gelb).',
    ledOnlyInStandby: 'Wenn true, werden LED-Ringe nur im StandBy-Modus gesetzt.',
    ledSafetyIntervalMs: 'Intervall für LED/Status-Refresh.',
    checkRedOpenIdsCsv: 'CSV der IDs für CheckRed-Logik (open => CheckRed=false).',
    checkYellowOpenIdsCsv: 'CSV der IDs für CheckYellow-Logik (open => CheckYellow=false).',
    statusOpenIdsCsv: 'CSV der IDs, die als "offen" im Status-Text aufgelistet werden.',
    statusNoProtectionText: 'Status-Text bei unscharfem System.',
    statusAllClosedText: 'Status-Text wenn alle überwachten Öffnungen geschlossen sind.',
    displayDoorCycleEnabled: 'Rotiert offene Türen auf dem Display wie im Legacy-Skript.',
    displayDoorCycleIntervalMs: 'Anzeigeintervall der offenen Türen (Legacy: 2000 ms).',
    displayDoorTemplate: 'Template für Türanzeige, Platzhalter: {door} (Legacy: "{door} offen").',
    displayFallbackSourceIdsCsv: 'CSV von Datenpunkten für Fallback-Anzeige (Datum/Uhrzeit/Temperatur).',
    displayFallbackSuffix: 'Suffix für Fallback-Anzeige (Legacy: " \'C").',
    alarmTriggerAutoResetMs: 'Setzt AlarmTrigger nach X ms automatisch zurück (Legacy: 60000 ms).',
    fingerprintCooldownMs: 'Entprellzeit für Fingerprint-Matches.',
    pinSequenceWindowMs: 'Zeitfenster zwischen * und PIN-Aktionsziffer (Legacy: 4000 ms).',
    pinTriggerCooldownMs: 'Cooldown zwischen zwei PIN-Aktionen (Legacy: 1500 ms).',
    panicStartupSyncEnabled: 'Beim Start PANIC-Zustand in die Kamera-ON/OFF-Flags spiegeln.'
  };

  const setStatus = (m,e=false) => {
    if (!ui.status) return;
    ui.status.textContent = m;
    ui.status.classList.toggle('err', e);
  };
  const showToast = (msg, isErr = false) => {
    if (!msg) return;
    let toast = $('uiToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'uiToast';
      toast.className = 'ui-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = String(msg);
    toast.classList.remove('ok', 'err', 'show');
    toast.classList.add(isErr ? 'err' : 'ok');
    void toast.offsetWidth;
    toast.classList.add('show');
    if (state.toastTimer) window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 2300);
  };
  const isTruthyOnline = v => {
    if (v === true || v === 1) return true;
    const s = String(v ?? '').trim().toLowerCase();
    return ['true', '1', 'on', 'online', 'ok', 'connected', 'available'].includes(s);
  };
  const clone = v => JSON.parse(JSON.stringify(v));
  const asArmed = v => v === true || v === 1 || ['true','1','on','armed','aktiv'].includes(String(v ?? '').toLowerCase());
  function inferPresencePerson(meta) {
    const s = `${String(meta?.label || '')} ${String(meta?.key || '')} ${String(meta?.id || '')}`.toLowerCase();
    if (s.includes('sebastian')) return 'sebastian';
    if (s.includes('teresa')) return 'teresa';
    return null;
  }
  function presenceShortLabel(person) {
    if (person === 'sebastian') return 'S';
    if (person === 'teresa') return 'T';
    return 'P';
  }
  function defaultPresenceAvatarPath(person) {
    if (person === 'sebastian') return './assets/sebastian.jpg';
    if (person === 'teresa') return './assets/teresa.jpg';
    return '';
  }
  function knownPresencePersons() {
    const persons = new Set(['sebastian', 'teresa']);
    for (const row of (state.config?.presenceSensorsTable || [])) {
      const p = inferPresencePerson(row);
      if (p) persons.add(p);
    }
    for (const k of Object.keys(state.avatarProfiles || {})) {
      if (k) persons.add(String(k));
    }
    return Array.from(persons);
  }
  function normalizeAvatarProfile(raw, fallbackImage) {
    const p = raw && typeof raw === 'object' ? raw : {};
    const zoom = Math.max(0.5, Math.min(4, Number(p.zoom || 1)));
    const panX = Math.max(-100, Math.min(100, Number(p.panX || 0)));
    const panY = Math.max(-100, Math.min(100, Number(p.panY || 0)));
    const image = String(p.image || fallbackImage || '');
    return { image, zoom, panX, panY };
  }
  function ensureAvatarProfilesConfig() {
    if (!state.config || typeof state.config !== 'object') return;
    let parsed = {};
    try { parsed = JSON.parse(String(state.config.avatarProfilesJson || '{}')); } catch {}
    if (!parsed || typeof parsed !== 'object') parsed = {};
    const out = {};
    for (const person of knownPresencePersons()) {
      out[person] = normalizeAvatarProfile(parsed[person], defaultPresenceAvatarPath(person));
    }
    state.avatarProfiles = out;
  }
  function avatarProfile(person) {
    ensureAvatarProfilesConfig();
    const p = String(person || '').trim().toLowerCase();
    if (!state.avatarProfiles[p]) {
      state.avatarProfiles[p] = normalizeAvatarProfile({}, defaultPresenceAvatarPath(p));
    }
    return state.avatarProfiles[p];
  }
  function avatarCssStyle(person) {
    const p = avatarProfile(person);
    const url = String(p.image || '').replace(/'/g, "\\'");
    return `background-image:url('${url}');background-size:${(p.zoom * 100).toFixed(2)}%;background-position:${(50 + p.panX).toFixed(2)}% ${(50 + p.panY).toFixed(2)}%`;
  }
  function persistAvatarProfilesToConfig() {
    if (!state.config || typeof state.config !== 'object') return;
    state.config.avatarProfilesJson = JSON.stringify(state.avatarProfiles || {});
  }
  function isPresenceHome(row, val) {
    const raw = String(val ?? '').trim().toLowerCase();
    const csv = String(row?.activeValuesCsv || '').trim().toLowerCase();
    if (csv) {
      const allowed = csv.split(',').map(x => x.trim()).filter(Boolean);
      if (allowed.length > 0) return allowed.includes(raw);
    }
    return asArmed(val);
  }
  const readStateVal = s => (s && typeof s === 'object' && Object.prototype.hasOwnProperty.call(s, 'val')) ? s.val : s;
  const defaultLayout = () => ({
    imageRect: { x: 8, y: 6, w: 84, h: 88 },
    zones: {
      innenraum: [],
      aussenhaut: [],
      perimeter: []
    }
  });
  const defaultDesignerFloor = () => ({ items: [], walls: [], outerWallIds: [], perimeter: null, nextId: 1, lastBeamItemId: null });
  const defaultDesignerView = () => ({ showBg: true, useInOverviewOnly: false, workspaceScale: 1, bgOffsetX: 0, bgOffsetY: 0 });

  const normalizeInstanceId = v => {
    let out = String(v || '').trim();
    if (out.startsWith('system.adapter.')) out = out.slice('system.adapter.'.length);
    if (!out.includes('.')) out += '.0';
    return out;
  };

  const objectIdCandidates = raw => [...new Set([`system.adapter.${normalizeInstanceId(raw)}`, `system.adapter.${raw}`])];

  function connectSocket() {
    const s = window.socket || window.io?.connect?.(window.location.origin, { path: '/socket.io' });
    if (!s) throw new Error('Kein Admin-Socket gefunden');
    state.socket = s;
  }

  function getObject(id) {
    return new Promise((res, rej) => {
      const cb = (a,b) => {
        const o = b || a;
        if (o && typeof o === 'object' && !o.error) res(o);
        else rej(new Error(`Objekt ${id} nicht gefunden`));
      };
      if (typeof state.socket.getObject === 'function') state.socket.getObject(id, cb);
      else state.socket.emit('getObject', id, cb);
    });
  }

  function setObject(id, obj) {
    return new Promise((res, rej) => {
      const cb = r => r && r.error ? rej(new Error(r.error)) : res();
      if (typeof state.socket.setObject === 'function') state.socket.setObject(id, obj, cb);
      else state.socket.emit('setObject', id, obj, cb);
    });
  }

  function setState(id, val) {
    return new Promise((res, rej) => {
      if (!id) return rej(new Error('missing state id'));
      const cb = r => r && r.error ? rej(new Error(r.error)) : res();
      try {
        if (typeof state.socket.setState === 'function') {
          state.socket.setState(id, val, false, cb);
          return;
        }
      } catch {}
      try {
        state.socket.emit('setState', id, { val, ack: false }, cb);
      } catch (e) {
        rej(e);
      }
    });
  }

  function getState(id) {
    return new Promise(res => {
      if (!id) return res(null);
      const cb = (a,b) => res(b || a || null);
      try {
        if (typeof state.socket.getState === 'function') state.socket.getState(id, cb);
        else state.socket.emit('getState', id, cb);
      } catch {
        res(null);
      }
    });
  }

  async function loadStateIds() {
    return new Promise(resolve => {
      const done = ids => {
        state.stateIds = Array.isArray(ids) ? ids : [];
        ui.stateIds.innerHTML = state.stateIds.slice(0, 5000).map(id => `<option value="${id}"></option>`).join('');
        rebuildObjectTree();
        resolve();
      };
      const parse = raw => {
        const data = (raw && raw.rows) ? raw : (Array.isArray(raw) ? { rows: raw } : null);
        const ids = Object.keys((data && data.rows) ? data.rows.reduce((a,r)=>{ if(r && r.id) a[r.id]=1; return a; }, {}) : {});
        done(ids.sort());
      };
      if (typeof state.socket.getObjectView === 'function') state.socket.getObjectView('system', 'state', { startkey:'', endkey:'\u9999' }, (a,b) => parse(b || a));
      else state.socket.emit('getObjectView', 'system', 'state', { startkey:'', endkey:'\u9999' }, (a,b) => parse(b || a));
    });
  }

  async function ensureStateIdsLoaded() {
    if (state.stateIdsLoaded) return;
    if (state.stateIdsLoading) return state.stateIdsLoading;
    state.stateIdsLoading = loadStateIds()
      .then(() => { state.stateIdsLoaded = true; })
      .finally(() => { state.stateIdsLoading = null; });
    return state.stateIdsLoading;
  }

  function htmlEsc(v) {
    return String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildObjectTreeFromIds(ids) {
    const root = { name: '', path: '', leafId: null, children: [], map: Object.create(null) };
    for (const id of (ids || [])) {
      const full = String(id || '').trim();
      if (!full) continue;
      const parts = full.split('.').filter(Boolean);
      if (parts.length === 0) continue;
      let cur = root;
      let path = '';
      for (const p of parts) {
        path = path ? `${path}.${p}` : p;
        let node = cur.map[p];
        if (!node) {
          node = { name: p, path, leafId: null, children: [], map: Object.create(null) };
          cur.map[p] = node;
          cur.children.push(node);
        }
        cur = node;
      }
      cur.leafId = full;
    }
    const sortTree = node => {
      node.children.sort((a, b) => a.name.localeCompare(b.name, 'de', { numeric: true, sensitivity: 'base' }));
      node.children.forEach(sortTree);
    };
    sortTree(root);
    return root;
  }

  function rebuildObjectTree() {
    state.objectTreeRoot = buildObjectTreeFromIds(state.stateIds);
    if (!(state.objectTreeExpanded instanceof Set)) state.objectTreeExpanded = new Set();
    state.objectTreeExpanded.clear();
    const roots = (state.objectTreeRoot?.children || []).slice(0, 8);
    roots.forEach(n => state.objectTreeExpanded.add(n.path));
  }

  function expandTreePathForId(id) {
    const full = String(id || '').trim();
    if (!full) return;
    const parts = full.split('.').filter(Boolean);
    let path = '';
    for (const p of parts) {
      path = path ? `${path}.${p}` : p;
      state.objectTreeExpanded.add(path);
    }
  }

  function ensureProfiles() {
    let p = {};
    try { p = JSON.parse(state.instanceObj.native.configProfilesJson || '{}'); } catch {}
    if (!p || typeof p !== 'object') p = {};
    if (!p['default.json']) p['default.json'] = clone(state.instanceObj.native);
    state.profiles = p;
    const ac = String(state.instanceObj.native.activeConfigProfile || 'default.json');
    state.activeProfile = p[ac] ? ac : 'default.json';
  }

  function rebuildProfileSelect() {
    const names = Object.keys(state.profiles).sort();
    ui.profile.innerHTML = names.map(n => `<option value="${n}">${n}</option>`).join('');
    ui.profile.value = state.activeProfile;
  }

  function ensureTables() {
    ['pirSensorsTable','contactSensorsTable','presenceSensorsTable','personDetectionTable','camerasTable'].forEach(k => {
      if (!Array.isArray(state.config[k])) state.config[k] = [];
      for (const row of state.config[k]) {
        ensureEntityHealthFields(row);
        ensureEntitySnapshotFields(row);
      }
    });
    if (!Array.isArray(state.config.zoneActionsTable)) state.config.zoneActionsTable = [];
    if (!Array.isArray(state.config.snapshotActionTargetsTable)) state.config.snapshotActionTargetsTable = [];
    if (!Array.isArray(state.config.alarmActionsTable)) state.config.alarmActionsTable = [];
    if (!Array.isArray(state.config.panicActionsTable)) state.config.panicActionsTable = [];
    if (!Array.isArray(state.config.modeFlowRulesTable)) state.config.modeFlowRulesTable = [];
    if (!['immediate', 'after_alarm'].includes(String(state.config.alarmActionZoneTriggerTiming || ''))) {
      state.config.alarmActionZoneTriggerTiming = 'after_alarm';
    }
    if (!['zone_disarmed', 'any_disarm', 'off'].includes(String(state.config.countdownAbortMode || ''))) {
      state.config.countdownAbortMode = 'zone_disarmed';
    }
    if (typeof state.config.alarmRepeatTelegramEnabled !== 'boolean') state.config.alarmRepeatTelegramEnabled = false;
    if (!Number.isFinite(Number(state.config.alarmRepeatTelegramIntervalSec))) state.config.alarmRepeatTelegramIntervalSec = 60;
    if (typeof state.config.alarmRepeatTelegramText !== 'string') state.config.alarmRepeatTelegramText = 'Alarm !!!';
    if (typeof state.config.modeFlowAnnounceCommandId !== 'string' || !state.config.modeFlowAnnounceCommandId.trim()) state.config.modeFlowAnnounceCommandId = `${state.instanceId}.commands.announceAlarm`;
    if (typeof state.config.modeFlowPerimeterAlarmCommandId !== 'string' || !state.config.modeFlowPerimeterAlarmCommandId.trim()) state.config.modeFlowPerimeterAlarmCommandId = `${state.instanceId}.commands.activatePerimeterAlarm`;
    if (typeof state.config.modeFlowInteriorAlarmCommandId !== 'string' || !state.config.modeFlowInteriorAlarmCommandId.trim()) state.config.modeFlowInteriorAlarmCommandId = `${state.instanceId}.commands.activateInteriorAlarm`;
    if (typeof state.config.modeFlowFullAlarmCommandId !== 'string' || !state.config.modeFlowFullAlarmCommandId.trim()) state.config.modeFlowFullAlarmCommandId = `${state.instanceId}.commands.activateFullAlarm`;
    if (typeof state.config.modeFlowTelegramPerimeterText !== 'string') state.config.modeFlowTelegramPerimeterText = '';
    if (typeof state.config.modeFlowTelegramInteriorText !== 'string') state.config.modeFlowTelegramInteriorText = '';
    if (typeof state.config.modeFlowTelegramFullText !== 'string') state.config.modeFlowTelegramFullText = '';
    if (typeof state.config.modeFlowAutoPerimeterAfterSunsetEnabled !== 'boolean') state.config.modeFlowAutoPerimeterAfterSunsetEnabled = false;
    if (!['legacy', 'off', 'perimeter', 'vollschutz'].includes(String(state.config.modeFlowAutoAwayMode || ''))) state.config.modeFlowAutoAwayMode = 'legacy';
    if (!Number.isFinite(Number(state.config.modeFlowAutoAwayDelaySec))) state.config.modeFlowAutoAwayDelaySec = Number(state.config.autoArmDelaySec || 60);
    if (!Array.isArray(state.config.telegramInstancesTable)) {
      let parsed = [];
      try {
        const legacy = JSON.parse(String(state.config.telegramInstancesJson || '[]'));
        if (Array.isArray(legacy)) parsed = legacy;
      } catch {}
      state.config.telegramInstancesTable = parsed;
    }
    if (!Array.isArray(state.config.telegramTargetsTable)) {
      let parsed = [];
      try {
        const legacy = JSON.parse(String(state.config.telegramTargetsJson || '[]'));
        if (Array.isArray(legacy)) parsed = legacy;
      } catch {}
      state.config.telegramTargetsTable = parsed;
    }
  }

  function getHullProtectionId() {
    return String(state.config?.hullProtectionStateId || 'mqtt.1.AlarmCenter.HullProtection');
  }

  function ensureEntityHealthFields(row) {
    if (!row || typeof row !== 'object') return;
    if (typeof row.healthCheckMode !== 'string') row.healthCheckMode = 'none';
    if (typeof row.healthHeartbeatId !== 'string') row.healthHeartbeatId = '';
    if (!Number.isFinite(Number(row.healthHeartbeatMaxSec))) row.healthHeartbeatMaxSec = 2;
    if (typeof row.healthOnlineId !== 'string') row.healthOnlineId = '';
  }

  function ensureEntitySnapshotFields(row) {
    if (!row || typeof row !== 'object') return;
    if (typeof row.snapshotDatapointId !== 'string') row.snapshotDatapointId = '';
    const mode = String(row.snapshotZoneMode || 'none');
    row.snapshotZoneMode = ['none', 'any', 'selected'].includes(mode) ? mode : 'none';
    if (typeof row.snapshotZonesCsv !== 'string') row.snapshotZonesCsv = '';
  }

  function getEntities() {
    ensureTables();
    const xKey = state.currentFloor === 'OG' ? 'posXOg' : 'posXEg';
    const yKey = state.currentFloor === 'OG' ? 'posYOg' : 'posYEg';
    const rows = [];
    const add = (arr, kind, getId) => (arr || []).forEach((r, idx) => {
      const id = getId(r);
      if (!r || !id) return;
      const px = Number.isFinite(Number(r[xKey])) ? Number(r[xKey]) : (Number.isFinite(Number(r.posX)) ? Number(r.posX) : null);
      const py = Number.isFinite(Number(r[yKey])) ? Number(r[yKey]) : (Number.isFinite(Number(r.posY)) ? Number(r.posY) : null);
      const person = kind === 'presenceSensorsTable' ? inferPresencePerson(r) : null;
      rows.push({
        kind,
        idx,
        id: String(id),
        entityKey: String(r.key || id),
        label: String(r.label || r.key || id),
        zone: String(r.zone || 'pool'),
        floor: String(r.floor || 'EG') === 'OG' ? 'OG' : 'EG',
        posX: px,
        posY: py,
        hasPos: Number.isFinite(Number(px)) && Number.isFinite(Number(py)),
        person: person || '',
        shortLabel: person ? presenceShortLabel(person) : '',
        avatarStyle: person ? avatarCssStyle(person) : ''
      });
    });
    add(state.config.pirSensorsTable, 'pirSensorsTable', r => r?.id);
    add(state.config.contactSensorsTable, 'contactSensorsTable', r => r?.id);
    const presenceByPerson = {};
    (state.config.presenceSensorsTable || []).forEach(r => {
      const id = r?.id;
      if (!r || !id) return;
      const person = inferPresencePerson(r);
      if (!person || presenceByPerson[person]) return;
      const home = !!state.presenceByPerson[person];
      void home;
      presenceByPerson[person] = true;
    });
    add(state.config.personDetectionTable, 'personDetectionTable', r => r?.id);
    add(state.config.camerasTable, 'camerasTable', r => r?.personDetectionDp || r?.snapshotUrl || r?.ip);
    return rows;
  }

  function getAllCanvasEntities() {
    ensureTables();
    const out = [];
    const add = (arr, kind, getId) => (arr || []).forEach((r, idx) => {
      const id = getId(r);
      if (!r || !id) return;
      const floor = String(r.floor || 'EG') === 'OG' ? 'OG' : 'EG';
      out.push({
        kind,
        idx,
        floor,
        zone: String(r.zone || 'pool'),
        healthCheckMode: String(r.healthCheckMode || 'none'),
        key: String(r.key || ''),
        entityKey: String(r.key || id),
        label: String(r.label || r.key || id),
        id: String(id),
        posXEg: Number(r.posXEg),
        posYEg: Number(r.posYEg),
        posXOg: Number(r.posXOg),
        posYOg: Number(r.posYOg)
      });
    });
    add(state.config.pirSensorsTable, 'pirSensorsTable', r => r?.id);
    add(state.config.contactSensorsTable, 'contactSensorsTable', r => r?.id);
    add(state.config.presenceSensorsTable, 'presenceSensorsTable', r => r?.id);
    add(state.config.personDetectionTable, 'personDetectionTable', r => r?.id);
    add(state.config.camerasTable, 'camerasTable', r => r?.personDetectionDp || r?.snapshotUrl || r?.ip);
    return out;
  }

  function kindLabel(kind) {
    if (kind === 'pirSensorsTable') return 'PIR';
    if (kind === 'contactSensorsTable') return 'Tür/Kontakt';
    if (kind === 'presenceSensorsTable') return 'Presence';
    if (kind === 'personDetectionTable') return 'PersonDetect';
    if (kind === 'camerasTable') return 'Kamera';
    return kind;
  }

  function setEntity(kind, idx, patch) {
    if (!Array.isArray(state.config[kind]) || !state.config[kind][idx]) return;
    const row = state.config[kind][idx];
    const floor = String((patch.floor || row.floor || state.currentFloor || 'EG'));
    const floorNorm = floor === 'OG' ? 'OG' : 'EG';
    if (Object.prototype.hasOwnProperty.call(patch, 'posX')) row[floorNorm === 'OG' ? 'posXOg' : 'posXEg'] = patch.posX;
    if (Object.prototype.hasOwnProperty.call(patch, 'posY')) row[floorNorm === 'OG' ? 'posYOg' : 'posYEg'] = patch.posY;
    const basePatch = { ...patch };
    delete basePatch.posX;
    delete basePatch.posY;
    Object.assign(row, basePatch);
    row.floor = floorNorm;
    if (typeof patch.zone === 'string') row.manualZone = true;
  }

  function zoneClass(zone) {
    if (zone === 'innenraum') return 'zone-color-innenraum';
    if (zone === 'aussenhaut') return 'zone-color-aussenhaut';
    return 'zone-color-perimeter';
  }
  function entityIcon(entity) {
    const kind = entity.kind;
    if (kind === 'pirSensorsTable') {
      return '<span class="sensor-dot dot-pir" aria-hidden="true"></span>';
    }
    if (kind === 'contactSensorsTable') {
      return '<span class="sensor-dot dot-contact" aria-hidden="true"></span>';
    }
    if (kind === 'camerasTable' || kind === 'personDetectionTable') {
      return '<span class="sensor-dot dot-cam" aria-hidden="true"></span>';
    }
    if (kind === 'presenceSensorsTable') {
      const t = String(entity.shortLabel || 'P');
      return `<span class="presence-letter">${t}</span>`;
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/></svg>';
  }
  function detectZoneByCanvasPos(xPct, yPct) {
    const l = state.floorLayouts[state.currentFloor] || defaultLayout();
    const pIn = l.zones?.innenraum || [];
    const pOut = l.zones?.aussenhaut || [];
    const pPer = l.zones?.perimeter || [];
    if (pIn.length >= 3 && pointInPolygon([xPct, yPct], pIn)) return 'innenraum';
    if (pOut.length >= 3 && pointInPolygon([xPct, yPct], pOut)) return 'aussenhaut';
    if (pPer.length >= 3 && pointInPolygon([xPct, yPct], pPer)) return 'perimeter';
    const inBuilding = xPct >= 16 && xPct <= 84 && yPct >= 10 && yPct <= 90;
    const inInnen = xPct >= 22 && xPct <= 78 && yPct >= 14 && yPct <= 86;
    if (inInnen) return 'innenraum';
    if (inBuilding) return 'aussenhaut';
    return 'perimeter';
  }

  function pointInPolygon(p, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = Number(poly[i][0]); const yi = Number(poly[i][1]);
      const xj = Number(poly[j][0]); const yj = Number(poly[j][1]);
      const intersect = ((yi > p[1]) !== (yj > p[1])) && (p[0] < ((xj - xi) * (p[1] - yi)) / ((yj - yi) || 0.000001) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function ensureEntityPositions() {
    const missing = getEntities().filter(e => e.zone !== 'pool' && e.kind !== 'presenceSensorsTable' && !e.hasPos);
    const n = missing.length;
    if (!n) return;
    const startY = 8;
    const endY = 92;
    const step = n > 1 ? ((endY - startY) / (n - 1)) : 0;
    for (let i = 0; i < n; i++) {
      const x = 6;
      const y = startY + (i * step);
      setEntity(missing[i].kind, missing[i].idx, { posX: Number(x.toFixed(2)), posY: Number(y.toFixed(2)) });
    }
  }

  function renderDesignerOverviewOverlay(canvas, useFrame = false, withBg = false) {
    const model = getDesignerFloorModel(true);
    if (!model || !hasDesignerGeometry(true)) return;
    normalizeDesignerItems(model);
    const wallCutMap = doorCutsByWall(model);
    const perimeterAlarm = !!state.live.perimeterArmed;
    const outerAlarm = !!state.live.aussenArmed;
    const innerAlarm = !!state.live.innerFillArmed;
    const ws = getDesignerWorkspace(true);
    const view = getDesignerFloorView(true);
    const wrap = document.createElement('div');
    wrap.className = 'designer-overview-overlay';
    if (useFrame) wrap.classList.add('use-frame');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${ws.w} ${ws.h}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    if (withBg) {
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      bg.setAttribute('class', 'designer-bg');
      bg.setAttribute('href', designerBgForFloor(true));
      bg.setAttribute('x', String(ws.bgX + Number(view.bgOffsetX || 0)));
      bg.setAttribute('y', String(ws.bgY + Number(view.bgOffsetY || 0)));
      bg.setAttribute('width', String(ws.bgW));
      bg.setAttribute('height', String(ws.bgH));
      bg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.appendChild(bg);
    }
    let html = '';
    if (innerAlarm) {
      const shell = outerShellPolygon(model);
      if (Array.isArray(shell) && shell.length >= 3) {
        const rawId = `designer-inner-hatch-${canvas.id || 'canvas'}-${String(state.currentFloor || 'EG')}`;
        const hatchId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
        html += `<defs><pattern id="${hatchId}" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(45)"><line class="designer-inner-hatch-line" x1="0" y1="0" x2="0" y2="12"></line></pattern></defs>`;
        html += `<polygon class="designer-inner-alarm" fill="url(#${hatchId})" points="${wallPointsAttr(shell)}"></polygon>`;
      }
    }
    if (model.perimeter && Number(model.perimeter.w || 0) > 0 && Number(model.perimeter.h || 0) > 0) {
      const perCls = perimeterAlarm ? 'designer-perimeter designer-alarm-line' : 'designer-perimeter';
      html += `<rect class="${perCls}" x="${Number(model.perimeter.x)}" y="${Number(model.perimeter.y)}" width="${Number(model.perimeter.w)}" height="${Number(model.perimeter.h)}"></rect>`;
    }
    for (const wall of (model.walls || [])) {
      const isOuter = Array.isArray(model.outerWallIds) && model.outerWallIds.includes(wall.id);
      const cls = isOuter
        ? `designer-wall outer${outerAlarm ? ' designer-alarm' : ''}`
        : 'designer-wall';
      html += wallRenderHtml(wall.points, wall.id, cls, false, wallCutMap);
    }
    for (const item of (model.items || [])) {
      const t = String(item.type || '');
      const bType = String(item.alarmBindingType || '');
      const bKey = String(item.alarmBindingKey || '');
      const bId = String(item.alarmBindingId || '');
      const active = !!(bType && ((bKey && state.liveAlerts?.[bType]?.[bKey]) || (bId && state.liveAlerts?.[bType]?.[bId])));
      if ((t === 'pirZone' || t === 'cameraZone') && !active) continue;
      html += svgForDesignerItem({ ...item, alarmActive: active }, { handles: false, selected: false, overview: true });
    }
    svg.innerHTML += html;
    wrap.appendChild(svg);
    canvas.appendChild(wrap);
  }

  function itemAlarmTypeForEntityKind(kind) {
    if (kind === 'contactSensorsTable') return 'contact';
    if (kind === 'pirSensorsTable') return 'pir';
    if (kind === 'camerasTable' || kind === 'personDetectionTable') return 'camera';
    return '';
  }

  async function refreshAlertStates(flags = {}) {
    const fullArmed = !!flags.fullArmed;
    const aussenArmed = !!flags.aussenArmed;
    const perimeterArmed = !!flags.perimeterArmed;
    const camerasArmed = !!flags.camerasArmed;
    const showSensors = !!flags.showSensors;
    const next = { contact: {}, pir: {}, camera: {} };
    const readRows = async (rows, type, mode = 'activeValues') => {
      for (const row of (rows || [])) {
        const key = String(row?.key || row?.id || row?.personDetectionDp || row?.snapshotUrl || row?.ip || '');
        const id = String((type === 'camera' ? row?.personDetectionDp : row?.id) || '');
        if (!key || !id) continue;
        const st = await getState(id);
        const rawVal = st?.val;
        const raw = String(st?.val ?? '').trim().toLowerCase();
        let on = false;
        if (mode === 'detectValue') on = raw === String(row?.detectValue || 'human detected').trim().toLowerCase();
        else if (String(row?.activeValuesCsv || '').trim()) {
          const vals = String(row.activeValuesCsv).toLowerCase().split(',').map(x => x.trim()).filter(Boolean);
          on = vals.includes(raw) || asArmed(rawVal);
        } else on = asArmed(st?.val);
        if (!showSensors) {
          if (type === 'pir' && !fullArmed) on = false;
          if (type === 'contact' && !(fullArmed || aussenArmed)) on = false;
          if (type === 'camera' && !camerasArmed) on = false;
        }
        if (on) {
          next[type][key] = true;
          if (row?.id) next[type][String(row.id)] = true;
          if (row?.personDetectionDp) next[type][String(row.personDetectionDp)] = true;
        }
      }
    };
    await readRows(state.config.contactSensorsTable, 'contact', 'activeValues');
    await readRows(state.config.pirSensorsTable, 'pir', 'activeValues');
    await readRows(state.config.camerasTable, 'camera', 'activeValues');
    await readRows(state.config.personDetectionTable, 'camera', 'detectValue');
    state.liveAlerts = next;
  }

  function addZones(canvas) {
    canvas.innerHTML = '';
    const published = isDesignerPublished();
    canvas.classList.toggle('designer-locked', !published);
    if (!published) {
      canvas.classList.remove('designer-only');
      return;
    }
    const designerView = getDesignerFloorView(true);
    const hasDesign = hasDesignerGeometry(true);
    const showBackground = !designerView.useInOverviewOnly;
    canvas.classList.toggle('designer-only', !showBackground);
    const ws = getDesignerWorkspace(true);
    if (showBackground) {
      const box = canvas.getBoundingClientRect();
      const canvasRatio = box.width > 0 && box.height > 0 ? (box.width / box.height) : (ws.w / ws.h);
      const designRatio = ws.w / ws.h;
      let frameW = 100;
      let frameH = 100;
      if (canvasRatio > designRatio) {
        frameW = (designRatio / canvasRatio) * 100;
      } else {
        frameH = (canvasRatio / designRatio) * 100;
      }
      const frameX = (100 - frameW) / 2;
      const frameY = (100 - frameH) / 2;
      canvas.style.setProperty('--img-x', `${frameX}%`);
      canvas.style.setProperty('--img-y', `${frameY}%`);
      canvas.style.setProperty('--img-w', `${frameW}%`);
      canvas.style.setProperty('--img-h', `${frameH}%`);
      canvas.style.setProperty('--frame-x', `${frameX}%`);
      canvas.style.setProperty('--frame-y', `${frameY}%`);
      canvas.style.setProperty('--frame-w', `${frameW}%`);
      canvas.style.setProperty('--frame-h', `${frameH}%`);
    }
    if (hasDesign) renderDesignerOverviewOverlay(canvas, showBackground, showBackground);
  }

  function renderImageEditorOverlay(canvas) {
    const handles = document.createElement('div');
    handles.className = 'image-resize-handles';
    ['nw','ne','sw','se','move'].forEach(corner => {
      const h = document.createElement('button');
      h.type = 'button';
      h.className = `resize-handle ${corner}`;
      h.dataset.corner = corner;
      handles.appendChild(h);
    });
    canvas.appendChild(handles);
  }

  function renderStaticZoneOverlay(canvas, layout) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'zone-static-overlay');
    svg.setAttribute('viewBox', '0 0 100 100');
    for (const z of ['perimeter', 'aussenhaut', 'innenraum']) {
      const pts = layout.zones?.[z] || [];
      if (!Array.isArray(pts) || pts.length < 2) continue;
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      poly.dataset.zone = z;
      poly.setAttribute('class', `zone-outline ${z}`);
      poly.setAttribute('points', pts.map(p => `${p[0]},${p[1]}`).join(' '));
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke-width', '0.45');
      poly.setAttribute('stroke-linecap', 'round');
      poly.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(poly);
    }
    canvas.appendChild(svg);
  }

  function calcImageFrameInCanvas(canvas, rect, imageRatio) {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height || !imageRatio) return { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
    const rectPx = {
      x: (rect.x / 100) * box.width,
      y: (rect.y / 100) * box.height,
      w: (rect.w / 100) * box.width,
      h: (rect.h / 100) * box.height
    };
    let framePx = { ...rectPx };
    const rectRatioPx = rectPx.w / rectPx.h;
    if (rectRatioPx > imageRatio) {
      framePx.w = rectPx.h * imageRatio;
      framePx.x = rectPx.x + (rectPx.w - framePx.w) / 2;
    } else if (rectRatioPx < imageRatio) {
      framePx.h = rectPx.w / imageRatio;
      framePx.y = rectPx.y + (rectPx.h - framePx.h) / 2;
    }
    return {
      x: (framePx.x / box.width) * 100,
      y: (framePx.y / box.height) * 100,
      w: (framePx.w / box.width) * 100,
      h: (framePx.h / box.height) * 100
    };
  }

  function renderZoneEditorOverlay(canvas, layout) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'zone-editor-overlay');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.dataset.editor = '1';
    const zmap = { innenraum: '#ff8f8f', aussenhaut: '#ff4242', perimeter: '#7cf2a5' };
    for (const z of ['perimeter', 'aussenhaut', 'innenraum']) {
      const pts = (layout.zones?.[z] || []);
      if (pts.length < 1) continue;
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      poly.dataset.zonePoly = z;
      poly.setAttribute('points', pts.map(p => `${p[0]},${p[1]}`).join(' '));
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', zmap[z]);
      poly.setAttribute('stroke-width', '0.3');
      poly.setAttribute('stroke-linecap', 'round');
      poly.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(poly);
      pts.forEach((p, idx) => {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', String(p[0]));
        c.setAttribute('cy', String(p[1]));
        c.setAttribute('r', '0.6');
        c.setAttribute('fill', zmap[z]);
        c.setAttribute('stroke', '#0d1112');
        c.setAttribute('stroke-width', '0.18');
        c.setAttribute('style', 'pointer-events:all;cursor:grab');
        c.dataset.zonePoint = `${z}:${idx}`;
        svg.appendChild(c);
      });
    }
    canvas.appendChild(svg);

  }

  function applyZoneArmedVisuals(canvas){
    if (!canvas) return;
    const per = canvas.querySelector('.zone.perimeter');
    const aus = canvas.querySelector('.zone.aussenhaut');
    const inn = canvas.querySelector('.zone.innenraum');
    const perOutline = canvas.querySelector('.zone-static-overlay .zone-outline.perimeter');
    const ausOutline = canvas.querySelector('.zone-static-overlay .zone-outline.aussenhaut');
    const innOutline = canvas.querySelector('.zone-static-overlay .zone-outline.innenraum');
    if (per) per.classList.toggle('armed-zone', !!state.live.perimeterArmed);
    if (aus) aus.classList.toggle('armed-zone', !!state.live.aussenArmed);
    if (inn) inn.classList.toggle('armed-zone', !!state.live.innenArmed);
    if (perOutline) perOutline.classList.toggle('armed-zone', !!state.live.perimeterArmed);
    if (ausOutline) ausOutline.classList.toggle('armed-zone', !!state.live.aussenArmed);
    if (innOutline) innOutline.classList.toggle('armed-zone', !!state.live.innenArmed);
  }

  function getRulesMap(){ try { return JSON.parse(state.config.rulesJson || '{}'); } catch { return {}; } }
  function setRulesMap(m){ state.config.rulesJson = JSON.stringify(m); }
  function ruleId(e){ return `${e.kind}:${e.entityKey}`; }
  function defaultRule(){ return { enabled:true, onlyArmed:true, onlyNight:false, sirene:false, snapshot:true, telegram:true, led:false }; }
  function readRuleForm(){ return { enabled: $('ruleEnabled').value==='true', onlyArmed: $('ruleOnlyArmed').value==='true', onlyNight: $('ruleOnlyNight').value==='true', sirene: $('ruleSirene').value==='true', snapshot: $('ruleSnapshot').value==='true', telegram: $('ruleTelegram').value==='true', led: $('ruleLed')?.value === 'true' }; }
  function writeRuleForm(rule){ const r={...defaultRule(), ...(rule||{})}; $('ruleEnabled').value=String(r.enabled); $('ruleOnlyArmed').value=String(r.onlyArmed); $('ruleOnlyNight').value=String(r.onlyNight); $('ruleSirene').value=String(r.sirene); $('ruleSnapshot').value=String(r.snapshot); $('ruleTelegram').value=String(r.telegram); if ($('ruleLed')) $('ruleLed').value = String(!!r.led); }
  function readHealthForm() {
    return {
      healthCheckMode: String(ui.ruleHealthMode?.value || 'none'),
      healthHeartbeatId: String(ui.ruleHealthHeartbeatId?.value || '').trim(),
      healthHeartbeatMaxSec: Math.max(1, Number(ui.ruleHealthHeartbeatMaxSec?.value || 2)),
      healthOnlineId: String(ui.ruleHealthOnlineId?.value || '').trim()
    };
  }
  function writeHealthForm(row) {
    const r = row || {};
    ensureEntityHealthFields(r);
    if (ui.ruleHealthMode) ui.ruleHealthMode.value = ['none', 'heartbeat', 'online'].includes(String(r.healthCheckMode || 'none')) ? String(r.healthCheckMode) : 'none';
    if (ui.ruleHealthHeartbeatId) ui.ruleHealthHeartbeatId.value = String(r.healthHeartbeatId || '');
    if (ui.ruleHealthHeartbeatMaxSec) ui.ruleHealthHeartbeatMaxSec.value = String(Math.max(1, Number(r.healthHeartbeatMaxSec || 2)));
    if (ui.ruleHealthOnlineId) ui.ruleHealthOnlineId.value = String(r.healthOnlineId || '');
  }
  function readSnapshotForm() {
    const zones = Array.from(ui.ruleSnapshotZones?.selectedOptions || [])
      .map(o => String(o.value || ''))
      .filter(v => ['perimeter', 'aussenhaut', 'innenraum'].includes(v));
    return {
      snapshotDatapointId: String(ui.ruleSnapshotDatapointId?.value || '').trim(),
      snapshotZoneMode: ['none', 'any', 'selected'].includes(String(ui.ruleSnapshotZoneMode?.value || 'none'))
        ? String(ui.ruleSnapshotZoneMode?.value || 'none')
        : 'none',
      snapshotZonesCsv: zones.join(',')
    };
  }
  function writeSnapshotForm(row) {
    const r = row || {};
    ensureEntitySnapshotFields(r);
    if (ui.ruleSnapshotDatapointId) ui.ruleSnapshotDatapointId.value = String(r.snapshotDatapointId || '');
    if (ui.ruleSnapshotZoneMode) ui.ruleSnapshotZoneMode.value = ['none', 'any', 'selected'].includes(String(r.snapshotZoneMode || 'none')) ? String(r.snapshotZoneMode) : 'none';
    const selected = new Set(String(r.snapshotZonesCsv || '').split(',').map(x => x.trim()).filter(Boolean));
    if (ui.ruleSnapshotZones) {
      Array.from(ui.ruleSnapshotZones.options).forEach(opt => {
        opt.selected = selected.has(String(opt.value || ''));
      });
    }
    updateSnapshotZoneUiState();
  }
  function updateSnapshotZoneUiState() {
    if (!ui.ruleSnapshotZones) return;
    ui.ruleSnapshotZones.disabled = String(ui.ruleSnapshotZoneMode?.value || 'none') !== 'selected';
  }
  function readZoneSel(){ return $('ruleZone').value; }
  function writeZoneSel(z){ $('ruleZone').value = z || 'perimeter'; }
  function readFloorSel(){ return $('ruleFloor').value === 'OG' ? 'OG' : 'EG'; }
  function writeFloorSel(f){ $('ruleFloor').value = f === 'OG' ? 'OG' : 'EG'; }

  function normalizeCsvSorted(v) {
    return String(v || '')
      .split(',')
      .map(x => x.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'de'))
      .join(',');
  }

  function readEntityModalDraft() {
    if (!state.selectedEntity) return null;
    const ref = entityRef(state.selectedEntity.kind, state.selectedEntity.idx);
    const snap = readSnapshotForm();
    return {
      ref,
      zone: readZoneSel(),
      floor: readFloorSel(),
      rule: readRuleForm(),
      health: readHealthForm(),
      snapshot: {
        snapshotDatapointId: String(snap.snapshotDatapointId || '').trim(),
        snapshotZoneMode: String(snap.snapshotZoneMode || 'none'),
        snapshotZonesCsv: normalizeCsvSorted(snap.snapshotZonesCsv || '')
      }
    };
  }

  function serializeEntityModalDraft(draft) {
    return JSON.stringify(draft || null);
  }

  function captureEntityModalBaseline() {
    state.entityModalBaseline = serializeEntityModalDraft(readEntityModalDraft());
  }

  function entityModalHasUnsavedChanges() {
    if (!ui.entityModal || ui.entityModal.classList.contains('hidden')) return false;
    if (!state.selectedEntity) return false;
    return serializeEntityModalDraft(readEntityModalDraft()) !== String(state.entityModalBaseline || '');
  }

  function closeEntityModalNow() {
    if (!ui.entityModal) return;
    ui.entityModal.classList.add('hidden');
    state.entityModalBaseline = '';
  }

  function saveSelectedEntitySettings(showFeedback = true) {
    if (!state.selectedEntity) {
      setStatus('Bitte erst ein Element anklicken', true);
      return false;
    }
    const z = readZoneSel();
    const f = readFloorSel();
    const h = readHealthForm();
    const snap = readSnapshotForm();
    setEntity(state.selectedEntity.kind, state.selectedEntity.idx, { zone: z, floor: f, ...h, ...snap });
    const m = getRulesMap();
    m[ruleId(state.selectedEntity)] = readRuleForm();
    setRulesMap(m);
    renderAllCanvases();
    captureEntityModalBaseline();
    if (showFeedback) {
      setStatus('Elementeinstellungen gespeichert');
      showToast('Element-Einstellungen gespeichert');
    }
    void saveToInstance().catch(e => setStatus(String(e), true));
    return true;
  }

  function confirmEntitySettingsBeforeContinue() {
    if (!entityModalHasUnsavedChanges()) return true;
    const saveNow = window.confirm('Element-Einstellungen wurden geändert.\nÄnderungen übernehmen?');
    if (saveNow) return saveSelectedEntitySettings(true);
    const discard = window.confirm('Änderungen verwerfen und fortfahren?');
    return !!discard;
  }

  function entityRef(kind, idx) {
    return `${String(kind || '')}:${Number(idx)}`;
  }

  function isBindableEntityKind(kind) {
    return ['contactSensorsTable', 'pirSensorsTable', 'camerasTable', 'personDetectionTable'].includes(String(kind || ''));
  }

  function formatDesignerItemType(type) {
    const t = canonicalDesignerItemType(type);
    if (t === 'door') return 'Tür';
    if (t === 'window') return 'Fenster';
    if (t === 'garagedoor') return 'Garagentor';
    if (t === 'cameraZone') return 'Kamerafläche';
    if (t === 'pirZone') return 'PIR-Fläche';
    if (t === 'pavingDriveway') return 'Pflastersteine (Einfahrt)';
    if (t === 'pavingTerrace') return 'Pflastersteine (Terrasse)';
    return t || '-';
  }

  function refreshDesignerBindingPanel() {
    if (ui.designerEntitySelect) {
      const bindRows = getAllCanvasEntities()
        .filter(r => isBindableEntityKind(r.kind))
        .sort((a, b) => String(a.label || '').localeCompare(String(b.label || ''), 'de'));
      ui.designerEntitySelect.innerHTML = bindRows.length
        ? bindRows.map(r => `<option value="${entityRef(r.kind, r.idx)}">${r.label} (${kindLabel(r.kind)}) [${r.floor}]</option>`).join('')
        : '<option value="">Keine Sensoren/Kameras vorhanden</option>';
      if (state.selectedEntity && isBindableEntityKind(state.selectedEntity.kind)) {
        const val = entityRef(state.selectedEntity.kind, state.selectedEntity.idx);
        if (bindRows.some(r => entityRef(r.kind, r.idx) === val)) ui.designerEntitySelect.value = val;
      }
    }
    if (ui.designerSelectedEntityInfo) {
      const e = state.selectedEntity;
      ui.designerSelectedEntityInfo.textContent = (e && isBindableEntityKind(e.kind))
        ? `Sensor: ${e.label} (${kindLabel(e.kind)})`
        : 'Sensor: -';
    }
    if (ui.designerSelectedItemInfo) {
      const model = getDesignerFloorModel();
      const it = findDesignerItemById(model, Number(state.designer.selectedItemId));
      if (!it) {
        ui.designerSelectedItemInfo.textContent = 'Objekt: -';
      } else {
      const bindText = (it.alarmBindingType && it.alarmBindingKey)
          ? ` | bind=${it.alarmBindingType}:${it.alarmBindingKey}${it.alarmBindingId ? ` (${it.alarmBindingId})` : ''}`
          : '';
        ui.designerSelectedItemInfo.textContent = `Objekt: #${it.id} ${formatDesignerItemType(it.type)}${bindText}`;
      }
    }
  }

  function pickDesignerEntityFromSelect() {
    const raw = String(ui.designerEntitySelect?.value || '');
    const [kind, idxRaw] = raw.split(':');
    const idx = Number(idxRaw);
    if (!kind || !Number.isInteger(idx)) {
      setStatus('Bitte zuerst einen Sensor aus der Liste wählen', true);
      return;
    }
    const rows = getAllCanvasEntities();
    const r = rows.find(x => String(x.kind) === kind && Number(x.idx) === idx);
    if (!r) {
      setStatus('Sensor in Liste nicht mehr vorhanden', true);
      refreshDesignerBindingPanel();
      return;
    }
    const x = r.floor === 'OG' ? r.posXOg : r.posXEg;
    const y = r.floor === 'OG' ? r.posYOg : r.posYEg;
    selectEntity({
      kind: r.kind,
      idx: r.idx,
      id: String(r.id || ''),
      entityId: String(r.id || ''),
      entityKey: String(r.key || r.id),
      label: String(r.label || r.key || r.id),
      zone: String(r.zone || 'pool'),
      floor: String(r.floor || 'EG') === 'OG' ? 'OG' : 'EG',
      posX: Number.isFinite(Number(x)) ? Number(x) : null,
      posY: Number.isFinite(Number(y)) ? Number(y) : null,
      hasPos: Number.isFinite(Number(x)) && Number.isFinite(Number(y))
    }, { openModal: false });
    setStatus(`Sensor ausgewählt: ${r.label}`);
  }

  function selectEntity(e, opts = {}) {
    const openModal = opts.openModal !== false;
    const skipConfirm = opts.skipConfirm === true;
    if (!skipConfirm && ui.entityModal && !ui.entityModal.classList.contains('hidden') && state.selectedEntity) {
      const prevRef = entityRef(state.selectedEntity.kind, state.selectedEntity.idx);
      const nextRef = entityRef(e.kind, e.idx);
      if (prevRef !== nextRef && !confirmEntitySettingsBeforeContinue()) return;
    }
    state.selectedEntity = e;
    ui.entityLabel.textContent = `Ausgewählt: ${e.label} (${e.zone})`;
    writeZoneSel(e.zone);
    writeFloorSel(e.floor || 'EG');
    writeRuleForm(getRulesMap()[ruleId(e)]);
    writeHealthForm(state.config?.[e.kind]?.[e.idx] || null);
    writeSnapshotForm(state.config?.[e.kind]?.[e.idx] || null);
    refreshDesignerBindingPanel();
    if (openModal) {
      ui.entityModal.classList.remove('hidden');
      captureEntityModalBaseline();
    }
  }

  function drawEntity(canvas, e, detailed) {
    if (!detailed && e.kind !== 'presenceSensorsTable') return;
    const el = document.createElement('div');
    el.className = (detailed ? 'chip ' : 'mini-node ') + zoneClass(e.zone);
    if (!detailed && e.kind === 'presenceSensorsTable') el.classList.add('presence-node');
    if (!detailed && ['pirSensorsTable','contactSensorsTable','camerasTable','personDetectionTable'].includes(e.kind)) el.classList.add('sensor-dot-node');
    el.title = e.label;
    el.draggable = true;
    if (detailed) el.textContent = e.label;
    else if (e.kind === 'presenceSensorsTable') {
      const style = String(e.avatarStyle || '');
      const fallback = String(e.shortLabel || 'P');
      el.innerHTML = style
        ? `<span class="presence-avatar" style="${style}"></span>`
        : `<span class="presence-letter">${fallback}</span>`;
    } else {
      el.innerHTML = entityIcon(e);
    }
    el.style.left = `${Math.max(2, Math.min(98, Number(e.posX || 50)))}%`;
    el.style.top = `${Math.max(2, Math.min(98, Number(e.posY || 50)))}%`;
    el.addEventListener('dragstart', ev => ev.dataTransfer.setData('text/plain', JSON.stringify({ kind:e.kind, idx:e.idx })));
    el.addEventListener('click', ev => { ev.stopPropagation(); selectEntity(e); });
    if (!detailed && ui.hover) {
      el.addEventListener('mouseenter', () => { ui.hover.textContent = `Hover: ${e.label} (${e.zone})`; });
      el.addEventListener('mouseleave', () => { ui.hover.textContent = 'Hover: -'; });
    }
    canvas.appendChild(el);
  }

  function renderCanvas(target, detailed) {
    target.classList.toggle('floor-og', state.currentFloor === 'OG');
    target.classList.toggle('floor-eg', state.currentFloor !== 'OG');
    target.classList.toggle('rotated-right', !detailed);
    addZones(target);
    if (!isDesignerPublished()) return;
    getEntities().filter(e => e.zone !== 'pool' && (String(e.floor || 'EG') === state.currentFloor)).forEach(e => drawEntity(target, e, detailed));
    applyZoneArmedVisuals(target);
  }

  function renderPaletteColumns() {
    if (!ui.palettePirList || !ui.paletteContactList || !ui.paletteCameraList) return;
    ui.palettePirList.innerHTML = '';
    ui.paletteContactList.innerHTML = '';
    ui.paletteCameraList.innerHTML = '';
    const all = getEntities()
      .filter(e => ['pirSensorsTable', 'contactSensorsTable', 'camerasTable', 'personDetectionTable'].includes(e.kind))
      .sort((a, b) => String(a.label || '').localeCompare(String(b.label || ''), 'de'));
    const mk = (e, typeLabel) => {
      const assigned = String(e.zone || 'pool') !== 'pool';
      const item = document.createElement('div');
      item.className = `sensor-item ${assigned ? 'assigned' : 'unassigned'}`;
      item.innerHTML = `<span>${e.label}<br><span class="muted">${typeLabel} | ${assigned ? 'zugeordnet' : 'nicht zugeordnet'}</span></span>`;
      item.addEventListener('click', () => selectEntity(e));
      return item;
    };
    for (const e of all) {
      if (e.kind === 'pirSensorsTable') ui.palettePirList.appendChild(mk(e, 'PIR'));
      else if (e.kind === 'contactSensorsTable') ui.paletteContactList.appendChild(mk(e, 'Kontakt'));
      else ui.paletteCameraList.appendChild(mk(e, e.kind === 'camerasTable' ? 'Cam' : 'PersonDetect'));
    }
  }

  function renderPresenceCards() {
    if (!ui.absenceCard || !ui.absenceList || !ui.presenceCard || !ui.presenceList) return;
    const away = [];
    const home = [];
    if (state.presenceByPerson.sebastian) home.push({ person: 'sebastian' }); else away.push({ person: 'sebastian' });
    if (state.presenceByPerson.teresa) home.push({ person: 'teresa' }); else away.push({ person: 'teresa' });
    ui.absenceCard.classList.remove('hidden');
    ui.presenceCard.classList.remove('hidden');
    ui.absenceList.innerHTML = away.length
      ? away.map(a => `<div class="legend-row"><span class="presence-avatar tiny" style="${avatarCssStyle(a.person)}"></span></div>`).join('')
      : '';
    ui.presenceList.innerHTML = home.length
      ? home.map(a => `<div class="legend-row"><span class="presence-avatar tiny" style="${avatarCssStyle(a.person)}"></span></div>`).join('')
      : '';
  }

  function renderCanvasEntitiesList() {
    if (!ui.canvasEntitiesList) return;
    const q = String(ui.canvasEntitySearch?.value || '').trim().toLowerCase();
    const rulesMap = getRulesMap();
    const rows = getAllCanvasEntities()
      .filter(e => {
        if (!q) return true;
        return `${e.label} ${e.key} ${e.id} ${e.zone} ${e.floor} ${kindLabel(e.kind)}`.toLowerCase().includes(q);
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'de'));
    if (rows.length === 0) {
      ui.canvasEntitiesList.innerHTML = '<div class="muted">Keine Elemente gefunden.</div>';
      return;
    }
    ui.canvasEntitiesList.innerHTML = rows.map(e => {
      const zoneTag = e.zone === 'innenraum' ? 'I' : (e.zone === 'aussenhaut' ? 'A' : (e.zone === 'perimeter' ? 'P' : '-'));
      const floorTag = e.floor === 'OG' ? 'OG' : 'EG';
      const rule = { ...defaultRule(), ...(rulesMap[ruleId(e)] || {}) };
      const healthEnabled = String(e.healthCheckMode || 'none') !== 'none';
      const chips = [
        `<span class="cfg-chip cfg-chip-zone" title="Zone">${zoneTag}</span>`,
        `<span class="cfg-chip cfg-chip-floor" title="Etage">${floorTag}</span>`,
        rule.snapshot ? '<span class="cfg-chip cfg-on" title="Snapshot aktiv">📷</span>' : '',
        rule.telegram ? '<span class="cfg-chip cfg-on" title="Telegram aktiv">💬</span>' : '',
        rule.led ? '<span class="cfg-chip cfg-on" title="Kamera LED aktiv">💡</span>' : '',
        healthEnabled ? '<span class="cfg-chip cfg-on" title="Health-Check aktiv">❤</span>' : ''
      ].filter(Boolean).join('');
      const pos = e.floor === 'OG'
        ? `${Number.isFinite(e.posXOg) ? e.posXOg.toFixed(1) : '-'} / ${Number.isFinite(e.posYOg) ? e.posYOg.toFixed(1) : '-'}`
        : `${Number.isFinite(e.posXEg) ? e.posXEg.toFixed(1) : '-'} / ${Number.isFinite(e.posYEg) ? e.posYEg.toFixed(1) : '-'}`;
      return `<div class="sensor-item cfg-list-row">
        <div class="cfg-main">
          <div><strong>${e.label}</strong> <span class="muted">(${kindLabel(e.kind)})</span></div>
          <div class="cfg-chip-row">${chips}</div>
          <span class="muted">key=${e.key || '-'} | id=${e.id} | zone=${e.zone} | floor=${e.floor} | pos=${pos}</span>
        </div>
        <span class="row cfg-actions" style="margin-top:0">
          <button class="btn" data-entity-edit="${e.kind}:${e.idx}">Bearbeiten</button>
          <button class="btn danger" data-entity-del="${e.kind}:${e.idx}">Löschen</button>
        </span>
      </div>`;
    }).join('');
  }

  function bindCanvasDrops(canvas) {
    if (canvas.dataset.boundDnD === '1') return;
    canvas.dataset.boundDnD = '1';
    canvas.addEventListener('dragover', e => e.preventDefault());
    canvas.addEventListener('drop', e => {
      e.preventDefault();
      try {
        const p = JSON.parse(e.dataTransfer.getData('text/plain'));
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const zone = detectZoneByCanvasPos(x, y);
        snapshotCanvasState();
        setEntity(p.kind, p.idx, { zone, posX: Math.max(2, Math.min(98, x)), posY: Math.max(2, Math.min(98, y)) });
        renderAllCanvases();
      } catch {
        setStatus('Ungültiger Drag&Drop-Inhalt', true);
      }
    });
  }

  function bindEditorInteractions(canvas) {
    if (canvas.dataset.boundEditor === '1') return;
    canvas.dataset.boundEditor = '1';
    canvas.addEventListener('click', e => {
      if (!state.editZones) return;
      if (state.suppressZoneClickOnce) {
        state.suppressZoneClickOnce = false;
        return;
      }
      const t = e.target;
      if (t.closest('.resize-handle') || t.closest('.image-resize-handles') || t.closest('[data-zone-point]')) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      const zone = ui.editZoneSelect.value;
      const l = getCurrentLayout();
      snapshotCanvasState();
      if (!Array.isArray(l.zones[zone])) l.zones[zone] = [];
      l.zones[zone].push([Number(x.toFixed(2)), Number(y.toFixed(2))]);
      writeFloorLayoutsToConfig();
      renderAllCanvases();
    });

    canvas.addEventListener('pointerdown', e => {
      const zonePoint = e.target.closest('[data-zone-point]');
      if (zonePoint && state.editZones) {
        const [zone, idxRaw] = String(zonePoint.dataset.zonePoint || '').split(':');
        const idx = Number(idxRaw);
        const l = getCurrentLayout();
        if (!zone || !Number.isInteger(idx) || !Array.isArray(l.zones?.[zone]) || !l.zones[zone][idx]) return;
        e.preventDefault();
        snapshotCanvasState();
        state.dragZonePoint = { zone, idx };
        state.suppressZoneClickOnce = true;
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      const h = e.target.closest('.resize-handle');
      const onFrame = e.target.closest('.image-resize-handles');
      if ((!h && !onFrame) || !state.editImage) return;
      e.preventDefault();
      const corner = h ? h.dataset.corner : 'move';
      const l = getCurrentLayout();
      snapshotCanvasState();
      state.dragResize = { corner, startX: e.clientX, startY: e.clientY, start: { ...l.imageRect } };
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      if (state.dragZonePoint) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        const l = getCurrentLayout();
        const z = state.dragZonePoint.zone;
        const i = state.dragZonePoint.idx;
        if (!Array.isArray(l.zones?.[z]) || !l.zones[z][i]) return;
        l.zones[z][i] = [Number(x.toFixed(2)), Number(y.toFixed(2))];
        refreshAllEditorZonePreviews(l, z);
        return;
      }
      if (!state.dragResize) return;
      const rect = canvas.getBoundingClientRect();
      const dx = ((e.clientX - state.dragResize.startX) / rect.width) * 100;
      const dy = ((e.clientY - state.dragResize.startY) / rect.height) * 100;
      const l = getCurrentLayout();
      const s = state.dragResize.start;
      const ratio = getFloorRatio(state.currentFloor);
      let w = s.w;
      let h = s.w / ratio;
      let x = s.x;
      let y = s.y;
      if (state.dragResize.corner === 'move') {
        x = s.x + dx;
        y = s.y + dy;
      } else {
        if (state.dragResize.corner === 'se' || state.dragResize.corner === 'ne') w = Math.max(20, s.w + dx);
        else w = Math.max(20, s.w - dx);
        h = w / ratio;
        if (state.dragResize.corner === 'nw' || state.dragResize.corner === 'sw') x = s.x + (s.w - w);
        if (state.dragResize.corner === 'nw' || state.dragResize.corner === 'ne') y = s.y + (s.h - h);
      }
      l.imageRect = {
        x,
        y,
        w: Math.max(20, Math.min(300, w)),
        h: Math.max(20 / ratio, Math.min(300 / ratio, h))
      };
      writeFloorLayoutsToConfig();
      renderAllCanvases();
    });
    canvas.addEventListener('pointerup', () => {
      if (state.dragZonePoint) {
        state.dragZonePoint = null;
        writeFloorLayoutsToConfig();
        renderAllCanvases();
      }
      state.dragResize = null;
    });
    canvas.addEventListener('pointercancel', () => {
      state.dragZonePoint = null;
      state.dragResize = null;
    });
  }

  function refreshEditorZonePreview(canvas, layout, zone) {
    if (!canvas) return;
    const pts = layout.zones?.[zone] || [];
    const poly = canvas.querySelector(`.zone-editor-overlay [data-zone-poly="${zone}"]`);
    if (poly) poly.setAttribute('points', pts.map(p => `${p[0]},${p[1]}`).join(' '));
    const circles = canvas.querySelectorAll('.zone-editor-overlay [data-zone-point]');
    circles.forEach(node => {
      const [z, idxRaw] = String(node.dataset.zonePoint || '').split(':');
      if (z !== zone) return;
      const idx = Number(idxRaw);
      const p = pts[idx];
      if (!p) return;
      node.setAttribute('cx', String(p[0]));
      node.setAttribute('cy', String(p[1]));
    });
    const zoneEl = canvas.querySelector(`.zone[data-zone="${zone}"]`);
    if (zoneEl) zoneEl.style.clipPath = `polygon(${pts.map(pt => `${pt[0]}% ${pt[1]}%`).join(',')})`;
  }

  function refreshAllEditorZonePreviews(layout, zone) {
    refreshEditorZonePreview(ui.mini, layout, zone);
    refreshEditorZonePreview(ui.full, layout, zone);
  }

  function bindPoolDrop() {
    const poolZone = $('poolZone');
    if (!poolZone) return;
    poolZone.addEventListener('dragover', e => e.preventDefault());
    poolZone.addEventListener('drop', e => {
      e.preventDefault();
      try {
        const p = JSON.parse(e.dataTransfer.getData('text/plain'));
        setEntity(p.kind, p.idx, { zone: 'pool' });
        renderAllCanvases();
      } catch {
        setStatus('Ungültiger Drag&Drop-Inhalt', true);
      }
    });
  }

  function renderAllCanvases() {
    ensureEntityPositions();
    renderCanvas(ui.mini, false);
    if (ui.full) renderCanvas(ui.full, true);
    renderPaletteColumns();
    renderPresenceCards();
    renderCanvasEntitiesList();
    bindCanvasDrops(ui.mini);
    if (ui.full) bindCanvasDrops(ui.full);
    bindEditorInteractions(ui.mini);
    if (ui.full) bindEditorInteractions(ui.full);
    refreshDesignerBindingPanel();
    renderAlarmActionsCard();
  }

  function tidyCanvasLayout() {
    ensureTables();
    snapshotCanvasState();
    const groups = ['pirSensorsTable','contactSensorsTable','presenceSensorsTable','personDetectionTable','camerasTable'];
    for (const g of groups) {
      for (const row of state.config[g]) {
        if (!row) continue;
        if (String(row.zone || 'pool') === 'pool') continue;
        delete row.posX;
        delete row.posY;
      }
    }
    renderAllCanvases();
    setStatus('Canvas aufgeräumt: Elemente pro Zone neu verteilt');
  }

  function renderFields() {
    ui.global.innerHTML = '';
    ui.dp.innerHTML = '';

    for (const [k,t] of globalSpec) {
      const w = document.createElement('label');
      w.textContent = k;
      w.title = globalHelp[k] || k;
      const i = document.createElement(t === 'boolean' || t === 'select' ? 'select' : 'input');
      i.dataset.key = k;
      if (t === 'number') {
        i.type = 'number';
        i.value = String(Number(state.config[k] ?? 0));
      } else if (t === 'boolean') {
        i.innerHTML = '<option value="true">true</option><option value="false">false</option>';
        i.value = state.config[k] === true ? 'true' : 'false';
      } else if (k === 'alarmActionZoneTriggerTiming') {
        i.innerHTML = '<option value="after_alarm">after_alarm</option><option value="immediate">immediate</option>';
        i.value = String(state.config[k] || 'after_alarm') === 'immediate' ? 'immediate' : 'after_alarm';
      }
      w.appendChild(i);
      ui.global.appendChild(w);
    }

    for (const spec of dpSpec) {
      const k = spec.key;
      const w = document.createElement('label');
      w.textContent = k;
      w.title = dpHelp[k] || k;
      if (spec.type === 'state') {
        const wrap = document.createElement('span');
        wrap.className = 'input-wrap';
        const i = document.createElement('input');
        i.type = 'text';
        i.className = 'state-input';
        i.setAttribute('list', 'stateIds');
        i.dataset.key = k;
        i.value = String(state.config[k] || '');
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'icon-btn';
        b.textContent = '🔎';
        b.addEventListener('click', () => openObjectBrowser(i));
        wrap.appendChild(i);
        wrap.appendChild(b);
        w.appendChild(wrap);
      } else if (spec.type === 'boolean') {
        const i = document.createElement('select');
        i.dataset.key = k;
        i.innerHTML = '<option value="true">true</option><option value="false">false</option>';
        const raw = state.config[k];
        i.value = (raw === true || String(raw).toLowerCase() === 'true') ? 'true' : 'false';
        w.appendChild(i);
      } else {
        const i = document.createElement('input');
        i.dataset.key = k;
        i.type = spec.type === 'number' ? 'number' : 'text';
        i.value = String(state.config[k] ?? '');
        w.appendChild(i);
      }
      ui.dp.appendChild(w);
    }
  }

  function renderGeofenceSettings() {
    if (ui.autoAwayDelaySec) ui.autoAwayDelaySec.value = String(Math.max(0, Number(state.config.autoArmDelaySec ?? 60)));
    if (ui.autoAwayArmZonesCsv) ui.autoAwayArmZonesCsv.value = String(state.config.autoAwayArmZonesCsv || 'perimeter,aussenhaut,innenraum');
    if (ui.autoAwayChatIdsCsv) ui.autoAwayChatIdsCsv.value = String(state.config.autoAwayChatIdsCsv || '');
    if (ui.autoAwayPendingTelegramText) ui.autoAwayPendingTelegramText.value = String(state.config.autoAwayPendingTelegramText || 'Niemand ist zu Hause. Alarmanlage wird in {delay}s scharfgeschaltet...');
    if (ui.autoAwayArmedTelegramText) ui.autoAwayArmedTelegramText.value = String(state.config.autoAwayArmedTelegramText || 'Alarmanlage ist jetzt scharfgeschaltet!');
    if (ui.geofenceLeaveArmZonesCsv) ui.geofenceLeaveArmZonesCsv.value = String(state.config.geofenceLeaveArmZonesCsv || '');
    if (ui.geofenceLeaveChatIdsCsv) ui.geofenceLeaveChatIdsCsv.value = String(state.config.geofenceLeaveChatIdsCsv || '');
    if (ui.geofenceLeaveTelegramText) ui.geofenceLeaveTelegramText.value = String(state.config.geofenceLeaveTelegramText || '');
    if (ui.geofenceEnterArmZonesCsv) ui.geofenceEnterArmZonesCsv.value = String(state.config.geofenceEnterArmZonesCsv || '');
    if (ui.geofenceEnterDisarmZonesCsv) ui.geofenceEnterDisarmZonesCsv.value = String(state.config.geofenceEnterDisarmZonesCsv || '');
    if (ui.geofenceEnterChatIdsCsv) ui.geofenceEnterChatIdsCsv.value = String(state.config.geofenceEnterChatIdsCsv || '');
    if (ui.geofenceEnterTelegramText) ui.geofenceEnterTelegramText.value = String(state.config.geofenceEnterTelegramText || '');
  }

  function applyFloorplanImages() {
    const eg = String(state.config.floorplanEgImage || './assets/EG.jpg').trim();
    const og = String(state.config.floorplanOgImage || './assets/OG.jpg').trim();
    document.documentElement.style.setProperty('--floor-eg-image', `url('${eg.replace(/'/g, "\\'")}')`);
    document.documentElement.style.setProperty('--floor-og-image', `url('${og.replace(/'/g, "\\'")}')`);
    if (ui.floorplanEgInput) ui.floorplanEgInput.value = eg;
    if (ui.floorplanOgInput) ui.floorplanOgInput.value = og;
    void loadFloorImageRatio('EG', eg);
    void loadFloorImageRatio('OG', og);
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('Keine Datei gewählt'));
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result || ''));
      fr.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
      fr.readAsDataURL(file);
    });
  }

  async function uploadFloorplanImages() {
    const egFile = ui.floorplanEgUpload?.files?.[0] || null;
    const ogFile = ui.floorplanOgUpload?.files?.[0] || null;
    if (!egFile && !ogFile) {
      setStatus('Bitte EG oder OG Bilddatei auswählen', true);
      return;
    }
    if (egFile) {
      const egData = await fileToDataUrl(egFile);
      state.config.floorplanEgImage = egData;
      if (ui.floorplanEgInput) ui.floorplanEgInput.value = egData;
    }
    if (ogFile) {
      const ogData = await fileToDataUrl(ogFile);
      state.config.floorplanOgImage = ogData;
      if (ui.floorplanOgInput) ui.floorplanOgInput.value = ogData;
    }
    applyFloorplanImages();
    renderAllCanvases();
    setStatus('Grundriss-Bild(er) geladen. Mit "In Instanz speichern" dauerhaft sichern.');
  }

  function getFloorRatio(floor) {
    const f = floor === 'OG' ? 'OG' : 'EG';
    const r = Number(state.floorRatios[f] || 0.907);
    return Number.isFinite(r) && r > 0 ? r : 0.907;
  }

  function fitRectToRatio(rect, ratio) {
    const out = { ...rect };
    out.h = out.w / ratio;
    if (out.h > 100) {
      out.h = 100;
      out.w = out.h * ratio;
    }
    if (out.w > 100) {
      out.w = 100;
      out.h = out.w / ratio;
    }
    out.x = Math.max(0, Math.min(100 - out.w, out.x));
    out.y = Math.max(0, Math.min(100 - out.h, out.y));
    return out;
  }

  function loadFloorImageRatio(floor, src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          state.floorRatios[floor] = img.naturalWidth / img.naturalHeight;
          const l = state.floorLayouts[floor] || defaultLayout();
          l.imageRect = fitRectToRatio(l.imageRect || { x: 8, y: 6, w: 84, h: 88 }, getFloorRatio(floor));
          state.floorLayouts[floor] = l;
          writeFloorLayoutsToConfig();
          renderAllCanvases();
        }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = src;
    });
  }

  function ensureFloorLayouts() {
    let parsed = null;
    try { parsed = JSON.parse(String(state.config.floorLayoutsJson || '{}')); } catch {}
    const base = parsed && typeof parsed === 'object' ? parsed : {};
    const eg = base.EG && typeof base.EG === 'object' ? base.EG : defaultLayout();
    const og = base.OG && typeof base.OG === 'object' ? base.OG : defaultLayout();
    state.floorLayouts = { EG: eg, OG: og };
  }

  function ensureDesignerData() {
    let parsed = null;
    try { parsed = JSON.parse(String(state.config.floorplanDesignerJson || '{}')); } catch {}
    const base = parsed && typeof parsed === 'object' ? parsed : {};
    state.designer.EG = base.EG && typeof base.EG === 'object' ? base.EG : defaultDesignerFloor();
    state.designer.OG = base.OG && typeof base.OG === 'object' ? base.OG : defaultDesignerFloor();
    state.designer.snap = base.settings?.snap !== false;
    state.designer.grid = Number.isFinite(Number(base.settings?.grid)) ? Math.max(4, Number(base.settings.grid)) : 12;
    state.designer.floorView = {
      EG: { ...defaultDesignerView(), ...(base.settings?.floorView?.EG || {}) },
      OG: { ...defaultDesignerView(), ...(base.settings?.floorView?.OG || {}) }
    };
    state.designer.showSensorsPreview = base.settings?.showSensorsPreview === true;
    state.designer.floorView.EG.workspaceScale = normalizedWorkspaceScale(state.designer.floorView.EG.workspaceScale);
    state.designer.floorView.OG.workspaceScale = normalizedWorkspaceScale(state.designer.floorView.OG.workspaceScale);
    if (typeof state.config.floorplanDesignerPublished !== 'boolean') {
      state.config.floorplanDesignerPublished = false;
    }
    if (!Number.isFinite(Number(state.designer.grid)) || Number(state.designer.grid) < 4) state.designer.grid = 12;
  }

  function saveDesignerData() {
    state.config.floorplanDesignerJson = JSON.stringify({
      version: 2,
      EG: state.designer.EG,
      OG: state.designer.OG,
      settings: {
        snap: !!state.designer.snap,
        grid: Math.max(4, Number(state.designer.grid || 12)),
        floorView: {
          EG: { ...defaultDesignerView(), ...(state.designer.floorView?.EG || {}) },
          OG: { ...defaultDesignerView(), ...(state.designer.floorView?.OG || {}) }
        },
        showSensorsPreview: !!state.designer.showSensorsPreview
      }
    });
  }

  function getDesignerFloorKey(preferCurrentFloor = false) {
    if (!preferCurrentFloor && ui.designerFloor?.value === 'OG') return 'OG';
    if (!preferCurrentFloor && ui.designerFloor?.value === 'EG') return 'EG';
    return state.currentFloor === 'OG' ? 'OG' : 'EG';
  }

  function getDesignerFloorModel(preferCurrentFloor = false) {
    const f = getDesignerFloorKey(preferCurrentFloor);
    if (!state.designer[f]) state.designer[f] = defaultDesignerFloor();
    return state.designer[f];
  }

  function getDesignerFloorView(preferCurrentFloor = false) {
    const f = getDesignerFloorKey(preferCurrentFloor);
    if (!state.designer.floorView || typeof state.designer.floorView !== 'object') {
      state.designer.floorView = { EG: defaultDesignerView(), OG: defaultDesignerView() };
    }
    if (!state.designer.floorView[f] || typeof state.designer.floorView[f] !== 'object') {
      state.designer.floorView[f] = defaultDesignerView();
    }
    state.designer.floorView[f].workspaceScale = normalizedWorkspaceScale(state.designer.floorView[f].workspaceScale);
    state.designer.floorView[f].bgOffsetX = Number.isFinite(Number(state.designer.floorView[f].bgOffsetX)) ? Number(state.designer.floorView[f].bgOffsetX) : 0;
    state.designer.floorView[f].bgOffsetY = Number.isFinite(Number(state.designer.floorView[f].bgOffsetY)) ? Number(state.designer.floorView[f].bgOffsetY) : 0;
    return state.designer.floorView[f];
  }

  function normalizedWorkspaceScale(raw) {
    const v = Number(raw);
    if (!Number.isFinite(v)) return 1;
    return Math.max(1, Math.min(6, Math.round(v * 4) / 4));
  }

  function workspaceFromScale(scaleRaw) {
    const scale = normalizedWorkspaceScale(scaleRaw);
    const w = Math.round(1000 * scale);
    const h = Math.round(700 * scale);
    return {
      scale,
      w,
      h,
      bgX: Math.round((w - 1000) / 2),
      bgY: Math.round((h - 700) / 2),
      bgW: 1000,
      bgH: 700
    };
  }

  function getDesignerWorkspace(preferCurrentFloor = false) {
    const view = getDesignerFloorView(preferCurrentFloor);
    return workspaceFromScale(view.workspaceScale);
  }

  function shiftDesignerModel(model, dx, dy) {
    if (!model || (!dx && !dy)) return;
    for (const it of (model.items || [])) {
      it.x = Number(it.x || 0) + dx;
      it.y = Number(it.y || 0) + dy;
    }
    for (const w of (model.walls || [])) {
      w.points = (w.points || []).map(p => ({ x: Number(p.x || 0) + dx, y: Number(p.y || 0) + dy }));
    }
    if (model.perimeter) {
      model.perimeter.x = Number(model.perimeter.x || 0) + dx;
      model.perimeter.y = Number(model.perimeter.y || 0) + dy;
    }
  }

  function rotatePointCW90(p, cx, cy) {
    const dx = Number(p.x || 0) - cx;
    const dy = Number(p.y || 0) - cy;
    // SVG coordinates have y-axis pointing downwards.
    // Clockwise screen rotation by 90deg is: (x, y) -> (-y, x)
    return { x: cx - dy, y: cy + dx };
  }

  function rotateDesignerModelClockwise90(model) {
    if (!model) return;
    const ws = getDesignerWorkspace();
    const cx = ws.w / 2;
    const cy = ws.h / 2;

    for (const it of (model.items || [])) {
      const rp = rotatePointCW90({ x: Number(it.x || 0), y: Number(it.y || 0) }, cx, cy);
      it.x = rp.x;
      it.y = rp.y;
      it.r = normalizeAngleDeg(Number(it.r || 0) + 90);
    }

    for (const w of (model.walls || [])) {
      w.points = (w.points || []).map(pt => rotatePointCW90(pt, cx, cy));
    }

    if (model.perimeter && Number(model.perimeter.w || 0) > 0 && Number(model.perimeter.h || 0) > 0) {
      const rx = Number(model.perimeter.x || 0);
      const ry = Number(model.perimeter.y || 0);
      const rw = Number(model.perimeter.w || 0);
      const rh = Number(model.perimeter.h || 0);
      const corners = [
        rotatePointCW90({ x: rx, y: ry }, cx, cy),
        rotatePointCW90({ x: rx + rw, y: ry }, cx, cy),
        rotatePointCW90({ x: rx + rw, y: ry + rh }, cx, cy),
        rotatePointCW90({ x: rx, y: ry + rh }, cx, cy)
      ];
      const xs = corners.map(c => Number(c.x));
      const ys = corners.map(c => Number(c.y));
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      model.perimeter.x = minX;
      model.perimeter.y = minY;
      model.perimeter.w = Math.max(0, maxX - minX);
      model.perimeter.h = Math.max(0, maxY - minY);
    }

    // Keep architect doors aligned to nearby walls after global rotation.
    for (const it of (model.items || [])) {
      if (String(it?.type || '') === 'door') snapDoorToWall(it, model);
    }
  }

  function moveDesignerPlan(dx, dy) {
    const model = getDesignerFloorModel();
    const view = getDesignerFloorView();
    snapshotDesignerState();
    shiftDesignerModel(model, dx, dy);
    view.bgOffsetX = Number(view.bgOffsetX || 0) + dx;
    view.bgOffsetY = Number(view.bgOffsetY || 0) + dy;
    saveDesignerData();
    renderDesigner();
    renderAllCanvases();
  }

  function designerBgForFloor(preferCurrentFloor = false) {
    const floor = getDesignerFloorKey(preferCurrentFloor);
    return (floor === 'OG')
      ? String(state.config.floorplanOgImage || './assets/OG.jpg')
      : String(state.config.floorplanEgImage || './assets/EG.jpg');
  }

  function hasDesignerGeometry(preferCurrentFloor = false) {
    const m = getDesignerFloorModel(preferCurrentFloor);
    if (!m) return false;
    if (m.perimeter && Number(m.perimeter.w || 0) > 0 && Number(m.perimeter.h || 0) > 0) return true;
    if (Array.isArray(m.walls) && m.walls.length > 0) return true;
    if (Array.isArray(m.items) && m.items.length > 0) return true;
    return false;
  }

  function isDesignerPublished() {
    return !!state.config?.floorplanDesignerPublished;
  }

  function snapshotDesignerState() {
    const snap = JSON.stringify({
      EG: clone(state.designer.EG || defaultDesignerFloor()),
      OG: clone(state.designer.OG || defaultDesignerFloor()),
      published: isDesignerPublished(),
      settings: {
        snap: !!state.designer.snap,
        grid: Math.max(4, Number(state.designer.grid || 12)),
        floorView: {
          EG: { ...defaultDesignerView(), ...(state.designer.floorView?.EG || {}) },
          OG: { ...defaultDesignerView(), ...(state.designer.floorView?.OG || {}) }
        },
        showSensorsPreview: !!state.designer.showSensorsPreview
      }
    });
    if (state.designerHistory[state.designerHistory.length - 1] === snap) return;
    state.designerHistory.push(snap);
    if (state.designerHistory.length > 120) state.designerHistory.shift();
  }

  function undoDesignerStep() {
    const snap = state.designerHistory.pop();
    if (!snap) {
      setStatus('Keine Designer-Änderung zum Rückgängigmachen');
      return;
    }
    try {
      const s = JSON.parse(snap);
      state.designer.EG = s.EG && typeof s.EG === 'object' ? s.EG : defaultDesignerFloor();
      state.designer.OG = s.OG && typeof s.OG === 'object' ? s.OG : defaultDesignerFloor();
      state.designer.snap = s.settings?.snap !== false;
      state.designer.grid = Number.isFinite(Number(s.settings?.grid)) ? Math.max(4, Number(s.settings.grid)) : 12;
      state.designer.floorView = {
        EG: { ...defaultDesignerView(), ...(s.settings?.floorView?.EG || {}) },
        OG: { ...defaultDesignerView(), ...(s.settings?.floorView?.OG || {}) }
      };
      state.designer.showSensorsPreview = s.settings?.showSensorsPreview === true;
      state.config.floorplanDesignerPublished = !!s.published;
      state.designer.dragItemId = null;
      state.designer.pendingBeamConnect = null;
      state.designer.dragWallId = null;
      state.designer.dragWallPoint = null;
      state.designer.dragWallStart = null;
      state.designer.dragWallOrig = null;
      state.designer.drawingWall = null;
      state.designer.drawingWallCursor = null;
      state.designer.selectedItemId = null;
      state.designer.dragResizeItemId = null;
      state.designer.dragResizeStart = null;
      state.designer.dragResizeOrig = null;
      state.designer.dragAnchorItemId = null;
      state.designer.dragRotateItemId = null;
      state.designer.dragRotateCenter = null;
      state.designer.dragRotateStartAngle = null;
      state.designer.dragRotateOrigRotation = null;
      state.designer.drawingPerimeter = null;
      saveDesignerData();
      renderDesigner();
      renderAllCanvases();
      setStatus('Designer: letzter Schritt rückgängig');
    } catch {
      setStatus('Designer-Rückgängig fehlgeschlagen', true);
    }
  }

  function snapDesigner(v) {
    const g = Math.max(4, Number(state.designer.grid || 12));
    if (!state.designer.snap) return v;
    return Math.round(v / g) * g;
  }

  function normalizeAngleDeg(v) {
    let a = Number(v) || 0;
    while (a <= -180) a += 360;
    while (a > 180) a -= 360;
    return a;
  }

  function snapRightAngleDeg(v) {
    return normalizeAngleDeg(Math.round((Number(v) || 0) / 90) * 90);
  }

  function svgPoint(evt) {
    const ws = getDesignerWorkspace();
    const pt = ui.designerSvg.createSVGPoint();
    pt.x = Number(evt.clientX);
    pt.y = Number(evt.clientY);
    const ctm = ui.designerSvg.getScreenCTM();
    const p = ctm ? pt.matrixTransform(ctm.inverse()) : { x: 0, y: 0 };
    const clamp = (v, max) => Math.max(0, Math.min(max, Number(v)));
    const snapInBounds = (v, max) => {
      const c = clamp(v, max);
      if (!state.designer.snap) return c;
      const g = Math.max(4, Number(state.designer.grid || 12));
      const edgeBand = g / 2;
      if (c <= edgeBand) return 0;
      if (c >= (max - edgeBand)) return max;
      return Math.round(c / g) * g;
    };
    return { x: snapInBounds(p.x, ws.w), y: snapInBounds(p.y, ws.h) };
  }

  function findDesignerWallById(model, wallId) {
    return (model.walls || []).find(w => Number(w.id) === Number(wallId));
  }

  function findDesignerItemById(model, itemId) {
    return (model.items || []).find(it => Number(it.id) === Number(itemId));
  }

  function bindSelectedEntityToSelectedDesignerItem() {
    const model = getDesignerFloorModel();
    const item = findDesignerItemById(model, Number(state.designer.selectedItemId));
    const entity = state.selectedEntity;
    if (!item) {
      setStatus('Bitte im Designer zuerst ein Objekt auswählen', true);
      return;
    }
    if (!entity) {
      setStatus('Bitte zuerst ein Sensor-Element auswählen (Canvas Elemente)', true);
      return;
    }
    const bindType = itemAlarmTypeForEntityKind(entity.kind);
    if (!bindType) {
      setStatus('Dieses Element kann nicht an Grundriss-Objekte gebunden werden', true);
      return;
    }
    const itemType = String(item.type || '');
    if (bindType === 'pir' && itemType !== 'pirZone') {
      setStatus('PIR-Sensoren können nur an PIR-Flächen zugeordnet werden', true);
      return;
    }
    if (bindType === 'camera' && itemType !== 'cameraZone') {
      setStatus('Kamera/PersonDetection kann nur an Kameraflächen zugeordnet werden', true);
      return;
    }
    if (bindType === 'contact' && !['door', 'window', 'garagedoor', 'garage'].includes(itemType)) {
      setStatus('Tür-/Fensterkontakt nur an Tür, Fenster, Garagentor oder Garage zuordnen', true);
      return;
    }
    snapshotDesignerState();
    item.alarmBindingType = bindType;
    item.alarmBindingKey = String(entity.entityKey || entity.label || '').trim();
    item.alarmBindingId = String(entity.id || entity.entityId || '').trim();
    saveDesignerData();
    renderDesigner();
    renderAllCanvases();
    refreshDesignerBindingPanel();
    setStatus(`Zugeordnet: ${entity.label} -> Objekt ${item.id}`);
  }

  function clearBindingOnSelectedDesignerItem() {
    const model = getDesignerFloorModel();
    const item = findDesignerItemById(model, Number(state.designer.selectedItemId));
    if (!item) {
      setStatus('Bitte im Designer zuerst ein Objekt auswählen', true);
      return;
    }
    snapshotDesignerState();
    delete item.alarmBindingType;
    delete item.alarmBindingKey;
    delete item.alarmBindingId;
    saveDesignerData();
    renderDesigner();
    renderAllCanvases();
    refreshDesignerBindingPanel();
    setStatus(`Zuweisung entfernt (Objekt ${item.id})`);
  }

  function isSamePoint(a, b) {
    return Math.abs(Number(a?.x) - Number(b?.x)) < 0.5 && Math.abs(Number(a?.y) - Number(b?.y)) < 0.5;
  }

  function normalizeWallPoints(points) {
    return (points || [])
      .map(p => ({ x: Number(p?.x), y: Number(p?.y) }))
      .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
  }

  function wallPointsAttr(points) {
    return points.map(p => `${p.x},${p.y}`).join(' ');
  }

  function polygonArea(points) {
    const pts = Array.isArray(points) ? points : [];
    if (pts.length < 3) return 0;
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % pts.length];
      a += (Number(p.x) * Number(q.y)) - (Number(q.x) * Number(p.y));
    }
    return a / 2;
  }

  function approxPointKey(p) {
    const x = Math.round(Number(p.x) * 10) / 10;
    const y = Math.round(Number(p.y) * 10) / 10;
    return `${x},${y}`;
  }

  function outerShellPolygon(model) {
    if (!model) return null;
    const outerSet = new Set((model.outerWallIds || []).map(x => Number(x)).filter(Number.isFinite));
    if (!outerSet.size) return null;
    const outerWalls = (model.walls || []).filter(w => outerSet.has(Number(w.id)));
    if (!outerWalls.length) return null;

    // Prefer a directly drawn contour wall if present.
    let bestPoly = null;
    let bestArea = 0;
    for (const wall of outerWalls) {
      const ptsRaw = normalizeWallPoints(wall.points);
      if (ptsRaw.length < 3) continue;
      const closed = isSamePoint(ptsRaw[0], ptsRaw[ptsRaw.length - 1]);
      const pts = closed ? ptsRaw.slice(0, -1) : ptsRaw.slice();
      if (pts.length < 3) continue;
      const a = Math.abs(polygonArea(pts));
      if (a > bestArea) {
        bestArea = a;
        bestPoly = pts;
      }
    }
    if (bestPoly && bestArea > 1) return bestPoly;

    // Fallback: build loop from marked outer segments (typical when outer shell uses many 2-point walls).
    const nodeMap = new Map();
    const adj = new Map();
    const edgeSet = new Set();
    const addNode = (p) => {
      const key = approxPointKey(p);
      if (!nodeMap.has(key)) nodeMap.set(key, { x: Number(p.x), y: Number(p.y) });
      if (!adj.has(key)) adj.set(key, new Set());
      return key;
    };
    const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
    const addEdge = (a, b) => {
      if (a === b) return;
      adj.get(a).add(b);
      adj.get(b).add(a);
      edgeSet.add(edgeKey(a, b));
    };

    for (const wall of outerWalls) {
      const pts = normalizeWallPoints(wall.points);
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1];
        const p1 = pts[i];
        if (isSamePoint(p0, p1)) continue;
        const k0 = addNode(p0);
        const k1 = addNode(p1);
        addEdge(k0, k1);
      }
    }

    if (!edgeSet.size || nodeMap.size < 3) return null;

    let loopBest = null;
    let loopAreaBest = 0;
    while (edgeSet.size) {
      const first = edgeSet.values().next().value;
      const parts = String(first || '').split('|');
      if (parts.length !== 2) break;
      const start = parts[0];
      let prev = start;
      let curr = parts[1];
      const path = [start, curr];
      edgeSet.delete(first);
      let guard = 0;
      while (guard++ < 4000) {
        if (curr === start) break;
        const neigh = Array.from(adj.get(curr) || []);
        if (!neigh.length) break;
        const candidates = neigh.filter(n => n !== prev && edgeSet.has(edgeKey(curr, n)));
        let next = candidates.length ? candidates[0] : null;
        if (!next) {
          const toStart = neigh.find(n => n === start && edgeSet.has(edgeKey(curr, n)));
          if (toStart) next = toStart;
        }
        if (!next) {
          const anyUnused = neigh.find(n => edgeSet.has(edgeKey(curr, n)));
          if (anyUnused) next = anyUnused;
        }
        if (!next) break;
        const ek = edgeKey(curr, next);
        if (!edgeSet.has(ek)) break;
        edgeSet.delete(ek);
        prev = curr;
        curr = next;
        path.push(curr);
        if (curr === start) break;
      }
      if (path.length >= 4 && path[path.length - 1] === start) {
        const poly = path.slice(0, -1).map(k => nodeMap.get(k)).filter(Boolean);
        if (poly.length >= 3) {
          const a = Math.abs(polygonArea(poly));
          if (a > loopAreaBest) {
            loopAreaBest = a;
            loopBest = poly;
          }
        }
      }
    }
    if (loopBest && loopAreaBest > 1) return loopBest;

    // Last fallback: convex hull over outer-wall nodes, so full-protection hatch still appears.
    const pts = Array.from(nodeMap.values());
    if (pts.length < 3) return null;
    const sorted = pts
      .map(p => ({ x: Number(p.x), y: Number(p.y) }))
      .sort((a, b) => (a.x - b.x) || (a.y - b.y));
    const cross = (o, a, b) => ((a.x - o.x) * (b.y - o.y)) - ((a.y - o.y) * (b.x - o.x));
    const lower = [];
    for (const p of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
      lower.push(p);
    }
    const upper = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
      upper.push(p);
    }
    lower.pop();
    upper.pop();
    const hull = lower.concat(upper);
    return hull.length >= 3 ? hull : null;
  }

  function projectPointToSegment(px, py, a, b) {
    const ax = Number(a.x);
    const ay = Number(a.y);
    const bx = Number(b.x);
    const by = Number(b.y);
    const vx = bx - ax;
    const vy = by - ay;
    const len2 = (vx * vx) + (vy * vy);
    if (len2 <= 1e-9) {
      const d = Math.hypot(Number(px) - ax, Number(py) - ay);
      return { t: 0, x: ax, y: ay, d, len: 0 };
    }
    let t = (((Number(px) - ax) * vx) + ((Number(py) - ay) * vy)) / len2;
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const x = ax + (t * vx);
    const y = ay + (t * vy);
    const d = Math.hypot(Number(px) - x, Number(py) - y);
    return { t, x, y, d, len: Math.sqrt(len2) };
  }

  function nearestWallSegment(model, p, maxDistance = Infinity) {
    const walls = Array.isArray(model?.walls) ? model.walls : [];
    let best = null;
    let bestDist = Number(maxDistance);
    for (const wall of walls) {
      const pts = normalizeWallPoints(wall.points);
      if (pts.length < 2) continue;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const pr = projectPointToSegment(Number(p.x), Number(p.y), a, b);
        if (!Number.isFinite(pr.d) || pr.d > bestDist) continue;
        bestDist = pr.d;
        best = {
          wallId: Number(wall.id),
          segIdx: i - 1,
          a,
          b,
          t: pr.t,
          x: pr.x,
          y: pr.y,
          d: pr.d,
          len: pr.len,
          angleDeg: (Math.atan2(Number(b.y) - Number(a.y), Number(b.x) - Number(a.x)) * 180) / Math.PI
        };
      }
    }
    return best;
  }

  function snapDoorToWall(item, model, maxDistance = null) {
    if (!item || String(item.type || '') !== 'door') return false;
    const threshold = Number.isFinite(Number(maxDistance))
      ? Number(maxDistance)
      : Math.max(18, Number(state.designer.grid || 12) * 2);
    const near = nearestWallSegment(model, { x: Number(item.x), y: Number(item.y) }, threshold);
    if (!near) return false;
    item.x = Number(near.x.toFixed(2));
    item.y = Number(near.y.toFixed(2));
    return true;
  }

  function mergeIntervals(intervals, minVal, maxVal) {
    const list = (intervals || [])
      .map(it => ({ s: Number(it.s), e: Number(it.e) }))
      .filter(it => Number.isFinite(it.s) && Number.isFinite(it.e) && it.e > it.s)
      .map(it => ({ s: Math.max(Number(minVal), it.s), e: Math.min(Number(maxVal), it.e) }))
      .filter(it => it.e > it.s)
      .sort((a, b) => a.s - b.s);
    if (!list.length) return [];
    const out = [list[0]];
    for (let i = 1; i < list.length; i++) {
      const cur = list[i];
      const prev = out[out.length - 1];
      if (cur.s <= prev.e + 0.001) prev.e = Math.max(prev.e, cur.e);
      else out.push(cur);
    }
    return out;
  }

  function doorCutsByWall(model) {
    const cuts = {};
    if (!model || !Array.isArray(model.items)) return cuts;
    const attachDist = Math.max(14, Number(state.designer.grid || 12) * 1.5);
    for (const it of model.items) {
      if (!it || String(it.type || '') !== 'door') continue;
      const near = nearestWallSegment(model, { x: Number(it.x), y: Number(it.y) }, attachDist);
      if (!near || !Number.isFinite(near.len) || near.len <= 1e-6) continue;
      const side = Math.max(12, Math.min(Number(it.w || 48), Number(it.h || 48)));
      const half = side / 2;
      const centerD = near.t * near.len;
      const s = Math.max(0, centerD - half);
      const e = Math.min(near.len, centerD + half);
      if (e - s < 2) continue;
      const wallKey = String(near.wallId);
      const segKey = String(near.segIdx);
      if (!cuts[wallKey]) cuts[wallKey] = {};
      if (!cuts[wallKey][segKey]) cuts[wallKey][segKey] = [];
      cuts[wallKey][segKey].push({ s, e });
    }
    return cuts;
  }

  function segmentNormal(a, b) {
    const dx = Number(b.x) - Number(a.x);
    const dy = Number(b.y) - Number(a.y);
    const len = Math.hypot(dx, dy);
    if (!len) return { x: 0, y: 0 };
    return { x: -dy / len, y: dx / len };
  }

  function wallRenderHtml(points, wallId, cls, interactive = false, cutMap = null) {
    const pts = normalizeWallPoints(points);
    if (pts.length < 2) return '';
    const off = 6;
    let out = '';
    for (let i = 1; i < pts.length; i++) {
      const a0 = pts[i - 1];
      const a1 = pts[i];
      if (isSamePoint(a0, a1)) continue;
      const dx = Number(a1.x) - Number(a0.x);
      const dy = Number(a1.y) - Number(a0.y);
      const segLen = Math.hypot(dx, dy);
      if (segLen <= 1e-6) continue;
      const n = segmentNormal(a0, a1);
      const l1 = {
        x1: a0.x + (n.x * off), y1: a0.y + (n.y * off),
        x2: a1.x + (n.x * off), y2: a1.y + (n.y * off)
      };
      const l2 = {
        x1: a0.x - (n.x * off), y1: a0.y - (n.y * off),
        x2: a1.x - (n.x * off), y2: a1.y - (n.y * off)
      };
      const wallCuts = cutMap?.[String(wallId)]?.[String(i - 1)] || [];
      const merged = mergeIntervals(wallCuts, 0, segLen);
      const drawPiece = (fromD, toD) => {
        if ((toD - fromD) < 0.5) return;
        const u0 = fromD / segLen;
        const u1 = toD / segLen;
        const ax1 = l1.x1 + ((l1.x2 - l1.x1) * u0);
        const ay1 = l1.y1 + ((l1.y2 - l1.y1) * u0);
        const bx1 = l1.x1 + ((l1.x2 - l1.x1) * u1);
        const by1 = l1.y1 + ((l1.y2 - l1.y1) * u1);
        const ax2 = l2.x1 + ((l2.x2 - l2.x1) * u0);
        const ay2 = l2.y1 + ((l2.y2 - l2.y1) * u0);
        const bx2 = l2.x1 + ((l2.x2 - l2.x1) * u1);
        const by2 = l2.y1 + ((l2.y2 - l2.y1) * u1);
        out += `<line class="${cls} wall-edge"${interactive ? ` data-wall-id="${wallId}"` : ''} x1="${ax1}" y1="${ay1}" x2="${bx1}" y2="${by1}"></line>`;
        out += `<line class="${cls} wall-edge"${interactive ? ` data-wall-id="${wallId}"` : ''} x1="${ax2}" y1="${ay2}" x2="${bx2}" y2="${by2}"></line>`;
      };
      if (!merged.length) {
        drawPiece(0, segLen);
      } else {
        let last = 0;
        for (const cut of merged) {
          drawPiece(last, cut.s);
          last = Math.max(last, cut.e);
        }
        drawPiece(last, segLen);
      }
    }
    if (interactive) out += `<polyline class="designer-wall-hit" data-wall-id="${wallId}" points="${wallPointsAttr(pts)}"></polyline>`;
    return out;
  }

  function pointSegmentDistance(px, py, ax, ay, bx, by) {
    const vx = bx - ax;
    const vy = by - ay;
    const wx = px - ax;
    const wy = py - ay;
    const c1 = (vx * wx) + (vy * wy);
    if (c1 <= 0) return Math.hypot(px - ax, py - ay);
    const c2 = (vx * vx) + (vy * vy);
    if (c2 <= c1) return Math.hypot(px - bx, py - by);
    const t = c1 / c2;
    const ix = ax + (t * vx);
    const iy = ay + (t * vy);
    return Math.hypot(px - ix, py - iy);
  }

  function nearestWallIdAtPoint(model, p, maxDistance = 22) {
    const walls = Array.isArray(model?.walls) ? model.walls : [];
    let bestId = null;
    let best = Number(maxDistance);
    for (const w of walls) {
      const pts = normalizeWallPoints(w.points);
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const d = pointSegmentDistance(Number(p.x), Number(p.y), Number(a.x), Number(a.y), Number(b.x), Number(b.y));
        if (d < best) {
          best = d;
          bestId = Number(w.id);
        }
      }
    }
    return Number.isInteger(bestId) ? bestId : null;
  }

  function defaultDesignerItemSpec(typeRaw) {
    const type = canonicalDesignerItemType(typeRaw);
    if (type === 'door') return { w: 48, h: 48, r: 0 };
    if (type === 'window') return { w: 62, h: 24, r: 0 };
    if (type === 'garagedoor') return { w: 150, h: 34, r: 0 };
    if (type === 'garage') return { w: 150, h: 70, r: 0 };
    if (type === 'pavingDriveway') return { w: 220, h: 120, r: 0 };
    if (type === 'pavingTerrace') return { w: 180, h: 110, r: 0 };
    if (type === 'cameraZone') return { w: 180, h: 110, r: 0 };
    if (type === 'pirZone') return { w: 140, h: 90, r: 0 };
    if (type === 'stairs') return { w: 160, h: 56, r: 0 };
    if (type === 'wc') return { w: 42, h: 34, r: 0 };
    if (type === 'washbasin') return { w: 54, h: 36, r: 0 };
    if (type === 'bathtub') return { w: 130, h: 54, r: 0 };
    if (type === 'shower') return { w: 72, h: 72, r: 0 };
    if (type === 'sink') return { w: 88, h: 42, r: 0 };
    if (type === 'kitchen') return { w: 160, h: 60, r: 0 };
    if (type === 'stove') return { w: 70, h: 50, r: 0 };
    if (type === 'cabinet') return { w: 80, h: 40, r: 0 };
    if (type === 'sofa') return { w: 110, h: 56, r: 0 };
    if (type === 'tableRound') return { w: 96, h: 96, r: 0 };
    if (type === 'tableRect' || type === 'table') return { w: 130, h: 78, r: 0 };
    if (type === 'chair') return { w: 28, h: 28, r: 0 };
    if (type === 'beam') return { w: 22, h: 22, r: 0 };
    return { w: 72, h: 46, r: 0 };
  }

  function itemSupportsResize(typeRaw) {
    const type = canonicalDesignerItemType(typeRaw);
    return type !== 'beam';
  }

  function canonicalDesignerItemType(typeRaw) {
    const t = String(typeRaw || '');
    if (t === 'pavingStoneDriveway') return 'pavingDriveway';
    if (t === 'flasterTerrace') return 'pavingTerrace';
    return t;
  }

  function cameraAnchorToLocal(item, w, h) {
    const hw = w / 2;
    const hh = h / 2;
    const ca = item?.coverageAnchor || { edge: 'top', t: 0.5 };
    const edge = String(ca.edge || 'top');
    const t = Math.max(0, Math.min(1, Number(ca.t || 0.5)));
    if (edge === 'bottom') return { x: -hw + (w * t), y: hh, edge, t };
    if (edge === 'left') return { x: -hw, y: -hh + (h * t), edge, t };
    if (edge === 'right') return { x: hw, y: -hh + (h * t), edge, t };
    return { x: -hw + (w * t), y: -hh, edge: 'top', t };
  }

  function cameraAnchorFromLocal(w, h, lx, ly) {
    const hw = w / 2;
    const hh = h / 2;
    const x = Math.max(-hw, Math.min(hw, Number(lx || 0)));
    const y = Math.max(-hh, Math.min(hh, Number(ly || 0)));
    const dTop = Math.abs(y + hh);
    const dBottom = Math.abs(y - hh);
    const dLeft = Math.abs(x + hw);
    const dRight = Math.abs(x - hw);
    const min = Math.min(dTop, dBottom, dLeft, dRight);
    if (min === dLeft) return { edge: 'left', t: Math.max(0, Math.min(1, (y + hh) / h)) };
    if (min === dRight) return { edge: 'right', t: Math.max(0, Math.min(1, (y + hh) / h)) };
    if (min === dBottom) return { edge: 'bottom', t: Math.max(0, Math.min(1, (x + hw) / w)) };
    return { edge: 'top', t: Math.max(0, Math.min(1, (x + hw) / w)) };
  }

  function toItemLocalPoint(item, p) {
    const cx = Number(item?.x || 0);
    const cy = Number(item?.y || 0);
    const dx = Number(p?.x || 0) - cx;
    const dy = Number(p?.y || 0) - cy;
    const rad = -((Number(item?.r || 0) * Math.PI) / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const lx = (dx * cos) - (dy * sin);
    const ly = (dx * sin) + (dy * cos);
    return { x: lx, y: ly };
  }

  function normalizeDesignerItems(model) {
    if (!model || !Array.isArray(model.items)) return;
    for (const it of model.items) {
      if (!it) continue;
      it.type = canonicalDesignerItemType(it.type);
      if (String(it.type || '') === 'table') it.type = 'tableRect';
      const d = defaultDesignerItemSpec(it.type);
      if (!Number.isFinite(Number(it.w)) || Number(it.w) < 8) it.w = d.w;
      if (!Number.isFinite(Number(it.h)) || Number(it.h) < 8) it.h = d.h;
      if (!Number.isFinite(Number(it.r))) it.r = d.r;
      if (!Number.isFinite(Number(it.x))) it.x = 0;
      if (!Number.isFinite(Number(it.y))) it.y = 0;
      it.mirrorX = !!it.mirrorX;
      if (String(it.type || '') === 'door') {
        const side = Math.max(12, snapDesigner(Math.max(Number(it.w || d.w), Number(it.h || d.h))));
        it.w = side;
        it.h = side;
        it.r = snapRightAngleDeg(it.r);
      }
      if (String(it.type || '') === 'cameraZone' || String(it.type || '') === 'pirZone') {
        if (!it.coverageAnchor || typeof it.coverageAnchor !== 'object') it.coverageAnchor = { edge: 'top', t: 0.5 };
      }
    }
  }

  function svgForDesignerItem(it, opts = {}) {
    const type = canonicalDesignerItemType(it.type || 'item');
    const w = Math.max(8, Number(it.w || defaultDesignerItemSpec(type).w));
    const h = Math.max(8, Number(it.h || defaultDesignerItemSpec(type).h));
    const hw = w / 2;
    const hh = h / 2;
    const isSelected = !!opts.selected;
    const handles = !!opts.handles;
    const overview = !!opts.overview;
    const mirrorX = !!it.mirrorX;
    let inner = '';
    if (type === 'door') {
      const side = Math.max(12, Math.min(w, h));
      const hs = side / 2;
      const hx = -hs;
      const hy = hs;
      inner += `<line x1="${hx}" y1="${hy}" x2="${hx + side}" y2="${hy}" class="arch-stroke"></line>`;
      inner += `<path d="M ${hx + side} ${hy} A ${side} ${side} 0 0 0 ${hx} ${hy - side}" class="arch-soft"></path>`;
      if (it.alarmActive) {
        inner += `<line x1="${hx}" y1="${hy}" x2="${hx + side}" y2="${hy}" class="alarm-door-edge"></line>`;
        inner += `<line x1="${hx}" y1="${hy}" x2="${hx}" y2="${hy - side}" class="alarm-door-edge"></line>`;
        inner += `<path d="M ${hx + side} ${hy} A ${side} ${side} 0 0 0 ${hx} ${hy - side}" class="alarm-door-arc"></path>`;
      }
    } else if (type === 'window') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="3"></rect>`;
      inner += `<line x1="0" y1="${-hh}" x2="0" y2="${hh}" class="arch-stroke"></line>`;
    } else if (type === 'garagedoor') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2"></rect>`;
      for (let x = -hw + 12; x < hw; x += 12) inner += `<line x1="${x}" y1="${-hh}" x2="${x}" y2="${hh}" class="arch-stroke"></line>`;
    } else if (type === 'pavingDriveway' || type === 'pavingTerrace') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2"></rect>`;
      for (let y = -hh + 10; y < hh; y += 10) inner += `<line x1="${-hw}" y1="${y}" x2="${hw}" y2="${y}" class="arch-soft"></line>`;
      for (let x = -hw + 14; x < hw; x += 14) inner += `<line x1="${x}" y1="${-hh}" x2="${x}" y2="${hh}" class="arch-soft"></line>`;
    } else if (type === 'cameraZone') {
      const a = cameraAnchorToLocal(it, w, h);
      const ax = Number(a.x);
      const ay = Number(a.y);
      const edge = String(a.edge || 'top');
      const t = Number(a.t || 0.5);
      const edgeTol = 0.0001;
      const isCorner = t <= edgeTol || t >= (1 - edgeTol);
      let dx = 0;
      let dy = 1;
      if (isCorner) {
        // Only corners use diagonal propagation (towards opposite corner).
        dx = -ax;
        dy = -ay;
      } else if (edge === 'top') {
        dx = 0; dy = 1;
      } else if (edge === 'bottom') {
        dx = 0; dy = -1;
      } else if (edge === 'left') {
        dx = 1; dy = 0;
      } else if (edge === 'right') {
        dx = -1; dy = 0;
      }
      const dirLen = Math.hypot(dx, dy) || 1;
      const dirAng = Math.atan2(dy / dirLen, dx / dirLen);
      const spread = Math.PI * 0.34;
      const maxR = Math.hypot(w, h) * 0.85;
      const rings = 7;
      const clipId = `cam-clip-${Number(it.id) || 0}`;
      let arcs = '';
      for (let i = 1; i <= rings; i++) {
        const r = (maxR * i) / (rings + 1);
        const a0 = dirAng - spread;
        const a1 = dirAng + spread;
        const x0 = ax + (Math.cos(a0) * r);
        const y0 = ay + (Math.sin(a0) * r);
        const x1 = ax + (Math.cos(a1) * r);
        const y1 = ay + (Math.sin(a1) * r);
        arcs += `<path class="coverage-arc" d="M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}"></path>`;
      }
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="4"></rect>`;
      inner += `<defs><clipPath id="${clipId}"><rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="4"></rect></clipPath></defs>`;
      inner += `<g clip-path="url(#${clipId})">${arcs}</g>`;
      inner += `<circle class="coverage-anchor" cx="${ax}" cy="${ay}" r="4"></circle>`;
    } else if (type === 'pirZone') {
      if (it.alarmActive && overview) {
        const gradId = `pir-vig-${Number(it.id) || 0}`;
        inner += `<defs><radialGradient id="${gradId}" cx="50%" cy="50%" r="72%"><stop offset="0%" stop-color="rgba(255,0,0,0.82)"></stop><stop offset="48%" stop-color="rgba(255,0,0,0.56)"></stop><stop offset="78%" stop-color="rgba(255,0,0,0.20)"></stop><stop offset="100%" stop-color="rgba(255,0,0,0.0)"></stop></radialGradient></defs>`;
        inner += `<rect class="pir-vignette-fill" x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="${Math.max(8, Math.min(w, h) * 0.22)}" fill="url(#${gradId})"></rect>`;
      } else {
        inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="4"></rect>`;
      }
    } else if (type === 'cabinet') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2"></rect>`;
      inner += `<line x1="${-hw}" y1="${-hh}" x2="${hw}" y2="${hh}" class="arch-stroke"></line>`;
      inner += `<line x1="${hw}" y1="${-hh}" x2="${-hw}" y2="${hh}" class="arch-stroke"></line>`;
    } else if (type === 'kitchen') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2"></rect>`;
      inner += `<rect x="${-hw + 6}" y="${-hh + 6}" width="${Math.max(8, w - 12)}" height="${Math.max(8, h - 12)}" rx="2" class="arch-soft-fill"></rect>`;
    } else if (type === 'stove') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="3"></rect>`;
      const ox = w * 0.22; const oy = h * 0.22; const rr = Math.max(3, Math.min(w, h) * 0.12);
      inner += `<circle cx="${-ox}" cy="${-oy}" r="${rr}" class="arch-stroke"></circle>`;
      inner += `<circle cx="${ox}" cy="${-oy}" r="${rr}" class="arch-stroke"></circle>`;
      inner += `<circle cx="${-ox}" cy="${oy}" r="${rr}" class="arch-stroke"></circle>`;
      inner += `<circle cx="${ox}" cy="${oy}" r="${rr}" class="arch-stroke"></circle>`;
    } else if (type === 'sofa') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="8"></rect>`;
      inner += `<rect x="${-hw + 8}" y="${-hh + 8}" width="${Math.max(8, w - 16)}" height="${Math.max(8, h - 16)}" rx="6" class="arch-soft-fill"></rect>`;
    } else if (type === 'stairs') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2"></rect>`;
      const steps = Math.max(3, Math.round(w / 18));
      for (let i = 1; i < steps; i++) {
        const x = -hw + (i * w) / steps;
        inner += `<line x1="${x}" y1="${-hh}" x2="${x}" y2="${hh}" class="arch-stroke"></line>`;
      }
    } else if (type === 'tableRect') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="6"></rect>`;
      const c = Math.max(1, Math.floor(w / 44));
      for (let i = 0; i < c; i++) {
        const x = -hw + ((i + 0.5) * w) / c;
        inner += `<rect x="${x - 8}" y="${-hh - 14}" width="16" height="10" rx="2" class="arch-soft-fill"></rect>`;
        inner += `<rect x="${x - 8}" y="${hh + 4}" width="16" height="10" rx="2" class="arch-soft-fill"></rect>`;
      }
      const side = Math.max(1, Math.floor(h / 44));
      for (let i = 0; i < side; i++) {
        const y = -hh + ((i + 0.5) * h) / side;
        inner += `<rect x="${-hw - 14}" y="${y - 5}" width="10" height="16" rx="2" class="arch-soft-fill"></rect>`;
        inner += `<rect x="${hw + 4}" y="${y - 5}" width="10" height="16" rx="2" class="arch-soft-fill"></rect>`;
      }
    } else if (type === 'tableRound') {
      const rr = Math.min(hw, hh) - 2;
      inner += `<circle cx="0" cy="0" r="${rr}"></circle>`;
      const chairs = Math.max(4, Math.round((2 * Math.PI * rr) / 36));
      for (let i = 0; i < chairs; i++) {
        const a = (i / chairs) * Math.PI * 2;
        const cx = Math.cos(a) * (rr + 14);
        const cy = Math.sin(a) * (rr + 14);
        inner += `<rect x="${cx - 6}" y="${cy - 4}" width="12" height="8" rx="2" transform="rotate(${(a * 180) / Math.PI} ${cx} ${cy})" class="arch-soft-fill"></rect>`;
      }
    } else if (type === 'wc') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="8"></rect>`;
      inner += `<ellipse cx="0" cy="2" rx="${Math.max(5, hw - 8)}" ry="${Math.max(4, hh - 10)}" class="arch-soft-fill"></ellipse>`;
    } else if (type === 'washbasin') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="10"></rect>`;
      inner += `<ellipse cx="0" cy="4" rx="${Math.max(6, hw - 10)}" ry="${Math.max(4, hh - 10)}" class="arch-soft-fill"></ellipse>`;
      inner += `<line x1="-6" y1="${-hh - 6}" x2="6" y2="${-hh - 6}" class="arch-stroke"></line>`;
      inner += `<line x1="0" y1="${-hh - 6}" x2="0" y2="${-hh + 2}" class="arch-stroke"></line>`;
    } else if (type === 'bathtub') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="${Math.max(10, Math.min(hw, hh) * 0.6)}"></rect>`;
      inner += `<rect x="${-hw + 8}" y="${-hh + 8}" width="${Math.max(8, w - 16)}" height="${Math.max(8, h - 16)}" rx="${Math.max(8, Math.min(hw, hh) * 0.45)}" class="arch-soft-fill"></rect>`;
      inner += `<circle cx="${hw - 14}" cy="0" r="3" class="arch-stroke"></circle>`;
    } else if (type === 'shower') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="4"></rect>`;
      inner += `<line x1="${-hw}" y1="${-hh}" x2="${hw}" y2="${hh}" class="arch-soft"></line>`;
      inner += `<line x1="${hw}" y1="${-hh}" x2="${-hw}" y2="${hh}" class="arch-soft"></line>`;
      inner += `<circle cx="0" cy="0" r="${Math.max(4, Math.min(hw, hh) * 0.16)}" class="arch-stroke"></circle>`;
    } else if (type === 'sink') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="6"></rect>`;
      const basinW = Math.max(10, (w - 18) / 2);
      const basinH = Math.max(8, h - 16);
      inner += `<rect x="${-hw + 6}" y="${-hh + 8}" width="${basinW}" height="${basinH}" rx="4" class="arch-soft-fill"></rect>`;
      inner += `<rect x="${hw - 6 - basinW}" y="${-hh + 8}" width="${basinW}" height="${basinH}" rx="4" class="arch-soft-fill"></rect>`;
      inner += `<line x1="-6" y1="${-hh + 4}" x2="6" y2="${-hh + 4}" class="arch-stroke"></line>`;
      inner += `<line x1="0" y1="${-hh + 4}" x2="0" y2="${-hh + 10}" class="arch-stroke"></line>`;
    } else if (type === 'garage') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2"></rect>`;
      for (let y = -hh + 10; y < hh; y += 10) inner += `<line x1="${-hw}" y1="${y}" x2="${hw}" y2="${y}" class="arch-stroke"></line>`;
    } else if (type === 'beam') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2.2"></rect>`;
    } else if (type === 'chair') {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2"></rect>`;
    } else {
      inner += `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="4"></rect>`;
      inner += `<text x="0" y="4" text-anchor="middle">${type.slice(0, 3).toUpperCase()}</text>`;
    }
    let controls = '';
    if (handles) {
      const rx = hw + 14;
      const ry = -hh - 14;
      controls += `<g class="designer-item-rotate" data-item-rotate="${it.id}" transform="translate(${rx},${ry})"><circle class="designer-item-rotate-hit" cx="0" cy="0" r="16"></circle><circle cx="0" cy="0" r="8"></circle><path d="M -3 1 A 4 4 0 1 1 3 -1"></path></g>`;
      if (type === 'door') {
        controls += `<g class="designer-item-mirror" data-item-mirror="${it.id}" transform="translate(${-hw - 14},${-hh - 14})"><circle cx="0" cy="0" r="8"></circle><path d="M -4 0 H 4 M -2 -2 L -4 0 L -2 2 M 2 -2 L 4 0 L 2 2"></path></g>`;
      }
      controls += `<g class="designer-item-move" data-item-move="${it.id}" transform="translate(${-hw - 14},${hh + 14})"><circle cx="0" cy="0" r="8"></circle><path d="M -3 0 H 3 M 0 -3 V 3"></path></g>`;
      if (itemSupportsResize(type)) {
        controls += `<rect class="designer-item-resize" data-item-resize="${it.id}" x="${hw - 5}" y="${hh - 5}" width="10" height="10" rx="2"></rect>`;
      }
      if (type === 'cameraZone') {
        const a = cameraAnchorToLocal(it, w, h);
        controls += `<circle class="coverage-anchor-handle" data-item-anchor="${it.id}" cx="${a.x}" cy="${a.y}" r="6"></circle>`;
      }
    }
    const pirVignette = type === 'pirZone' && it.alarmActive && overview;
    const cls = `designer-item${type === 'beam' ? ' beam' : ''}${type === 'cameraZone' ? ' camera-zone' : ''}${type === 'pirZone' ? ' pir-zone' : ''}${type === 'pavingDriveway' || type === 'pavingTerrace' ? ' paving-zone' : ''}${pirVignette ? ' pir-vignette' : ''}${it.sensorPreview ? ' sensor-preview' : ''}${isSelected ? ' selected' : ''}${it.alarmActive ? ' alarm-item' : ''}`;
    const hitPad = type === 'door' ? 14 : 8;
    const hitW = w + (hitPad * 2);
    const hitH = h + (hitPad * 2);
    const hitRect = `<rect class="designer-item-hit" x="${-hitW / 2}" y="${-hitH / 2}" width="${hitW}" height="${hitH}" rx="${Math.max(4, Math.min(14, Math.min(hitW, hitH) * 0.18))}"></rect>`;
    const body = mirrorX ? `<g class="designer-item-body" transform="scale(-1,1)">${inner}</g>` : `<g class="designer-item-body">${inner}</g>`;
    return `<g class="${cls}" data-item-id="${it.id}" transform="translate(${Number(it.x) || 0},${Number(it.y) || 0}) rotate(${Number(it.r || 0)})">${hitRect}${body}${controls}</g>`;
  }

  function linkWallBetweenBeams(model, fromBeam, toBeam) {
    if (!fromBeam || !toBeam) return;
    if (isSamePoint(fromBeam, toBeam)) return;
    const exists = (model.walls || []).some(w => {
      const pts = Array.isArray(w.points) ? w.points : [];
      if (pts.length !== 2) return false;
      return (isSamePoint(pts[0], fromBeam) && isSamePoint(pts[1], toBeam))
        || (isSamePoint(pts[0], toBeam) && isSamePoint(pts[1], fromBeam));
    });
    if (exists) return;
    const wallId = model.nextId || 1;
    model.nextId = wallId + 1;
    model.walls.push({
      id: wallId,
      autoBeamLink: true,
      beamAId: Number(fromBeam.id),
      beamBId: Number(toBeam.id),
      points: [{ x: fromBeam.x, y: fromBeam.y }, { x: toBeam.x, y: toBeam.y }]
    });
  }

  function syncAutoBeamWalls(model) {
    if (!model || !Array.isArray(model.walls)) return;
    model.walls = model.walls.filter(w => {
      if (!w || !w.autoBeamLink) return true;
      const a = findDesignerItemById(model, Number(w.beamAId));
      const b = findDesignerItemById(model, Number(w.beamBId));
      if (!a || !b || String(a.type || '') !== 'beam' || String(b.type || '') !== 'beam') return false;
      w.points = [
        { x: Number(a.x), y: Number(a.y) },
        { x: Number(b.x), y: Number(b.y) }
      ];
      return true;
    });
  }

  function finalizeDrawingWall(model, closeLoop = false) {
    const pts = state.designer.drawingWall || [];
    if (!Array.isArray(pts) || pts.length < 2) {
      state.designer.drawingWall = null;
      state.designer.drawingWallCursor = null;
      renderDesigner();
      return false;
    }
    const out = pts.map(p => ({ x: Number(p.x), y: Number(p.y) }));
    if (closeLoop && out.length >= 3 && !isSamePoint(out[0], out[out.length - 1])) {
      out.push({ x: out[0].x, y: out[0].y });
    }
    snapshotDesignerState();
    const id = model.nextId || 1;
    model.nextId = id + 1;
    model.walls.push({ id, points: out });
    state.designer.drawingWall = null;
    state.designer.drawingWallCursor = null;
    saveDesignerData();
    renderDesigner();
    renderAllCanvases();
    return true;
  }

  function renderDesigner() {
    const svg = ui.designerSvg;
    if (!svg) return;
    const m = getDesignerFloorModel();
    syncAutoBeamWalls(m);
    normalizeDesignerItems(m);
    const wallCutMap = doorCutsByWall(m);
    const view = getDesignerFloorView();
    const ws = getDesignerWorkspace();
    const activeTool = String(ui.designerTool?.value || 'select');
    svg.classList.toggle('erase-mode', activeTool === 'erase');
    svg.setAttribute('viewBox', `0 0 ${ws.w} ${ws.h}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    if (ui.designerGrid) ui.designerGrid.value = String(Math.max(4, Number(state.designer.grid || 12)));
    if (ui.designerSnapBtn) ui.designerSnapBtn.textContent = `Snap: ${state.designer.snap ? 'an' : 'aus'}`;
    if (ui.designerZoomInfo) ui.designerZoomInfo.textContent = `Workspace x${ws.scale.toFixed(2)}`;
    if (ui.designerBgBtn) ui.designerBgBtn.textContent = `Hintergrund: ${view.showBg ? 'an' : 'aus'}`;
    if (ui.designerUseOnlyBtn) ui.designerUseOnlyBtn.textContent = `In Übersicht: ${view.useInOverviewOnly ? 'nur Plan' : 'JPEG'}`;
    if (ui.designerPublishBtn) {
      ui.designerPublishBtn.textContent = `Übersicht: ${isDesignerPublished() ? 'freigegeben' : 'gesperrt'}`;
      ui.designerPublishBtn.classList.toggle('primary', isDesignerPublished());
      ui.designerPublishBtn.classList.toggle('ghost', !isDesignerPublished());
    }
    if (ui.designerShowSensorsBtn) {
      ui.designerShowSensorsBtn.textContent = `Sensoren anzeigen: ${state.designer.showSensorsPreview ? 'an' : 'aus'}`;
      ui.designerShowSensorsBtn.classList.toggle('primary', !!state.designer.showSensorsPreview);
      ui.designerShowSensorsBtn.classList.toggle('ghost', !state.designer.showSensorsPreview);
    }
    const grid = Math.max(4, Number(state.designer.grid || 12));
    svg.style.setProperty('--designer-grid-size', `${grid}px`);
    let html = '';
    if (view.showBg) {
      const href = designerBgForFloor().replace(/"/g, '&quot;');
      const bgX = ws.bgX + Number(view.bgOffsetX || 0);
      const bgY = ws.bgY + Number(view.bgOffsetY || 0);
      html += `<image class="designer-bg" href="${href}" x="${bgX}" y="${bgY}" width="${ws.bgW}" height="${ws.bgH}" preserveAspectRatio="xMidYMid meet"></image>`;
    }
    html += '<g class="designer-grid">';
    for (let x = 0; x <= ws.w; x += grid) html += `<line x1="${x}" y1="0" x2="${x}" y2="${ws.h}"></line>`;
    for (let y = 0; y <= ws.h; y += grid) html += `<line x1="0" y1="${y}" x2="${ws.w}" y2="${y}"></line>`;
    html += '</g>';
    if (m.perimeter) {
      html += `<rect class="designer-perimeter" x="${m.perimeter.x}" y="${m.perimeter.y}" width="${m.perimeter.w}" height="${m.perimeter.h}"></rect>`;
    }
    const showWallHandles = ['select', 'wall'].includes(activeTool);
    for (const w of (m.walls || [])) {
      const cls = m.outerWallIds?.includes(w.id) ? 'designer-wall outer' : 'designer-wall';
      html += wallRenderHtml(w.points, w.id, cls, true, wallCutMap);
      const pts = normalizeWallPoints(w.points);
      if (pts.length < 2) continue;
      if (showWallHandles) {
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          html += `<circle class="designer-wall-point" data-wall-point="${w.id}:${i}" cx="${p.x}" cy="${p.y}" r="5"></circle>`;
        }
      }
    }
    const showItemHandles = activeTool === 'select' || activeTool === 'place';
    for (const it of (m.items || [])) {
      const type = canonicalDesignerItemType(it.type);
      const bType = String(it.alarmBindingType || '');
      const bKey = String(it.alarmBindingKey || '');
      const bId = String(it.alarmBindingId || '');
      const active = !!(bType && ((bKey && state.liveAlerts?.[bType]?.[bKey]) || (bId && state.liveAlerts?.[bType]?.[bId])));
      const hasBinding = !!bType;
      const isSurface = type === 'cameraZone' || type === 'pirZone';
      const isContactVisual = ['door', 'window', 'garagedoor', 'garage'].includes(type);
      const sensorPreview = state.designer.showSensorsPreview && !active && (
        isSurface
        || (hasBinding && bType === 'contact' && isContactVisual)
      );
      if (isSurface && !state.designer.showSensorsPreview) continue;
      html += svgForDesignerItem(
        { ...it, alarmActive: active, sensorPreview },
        { handles: showItemHandles && Number(state.designer.selectedItemId) === Number(it.id), selected: Number(state.designer.selectedItemId) === Number(it.id) }
      );
    }
    if (state.designer.drawingWall && state.designer.drawingWall.length > 0) {
      const pts = state.designer.drawingWall.slice();
      if (state.designer.drawingWallCursor) pts.push(state.designer.drawingWallCursor);
      html += `<polyline class="designer-wall drawing" points="${pts.map(p => `${p.x},${p.y}`).join(' ')}"></polyline>`;
      const first = state.designer.drawingWall[0];
      if (first) html += `<circle class="designer-wall-close-point" cx="${first.x}" cy="${first.y}" r="7"></circle>`;
    }
    if (state.designer.drawingPerimeter) {
      const r = state.designer.drawingPerimeter;
      html += `<rect class="designer-perimeter" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"></rect>`;
    }
    svg.innerHTML = html;
    refreshDesignerBindingPanel();
  }

  function bindDesignerInteractions() {
    const svg = ui.designerSvg;
    if (!svg || svg.dataset.boundDesigner === '1') return;
    svg.dataset.boundDesigner = '1';
    svg.addEventListener('pointerdown', e => {
      const tool = String(ui.designerTool?.value || 'select');
      const m = getDesignerFloorModel();
      const p = svgPoint(e);
      const wallPointEl = e.target.closest('[data-wall-point]');
      const wallEl = e.target.closest('[data-wall-id]');
      const itemEl = e.target.closest('[data-item-id]');
      const rotateEl = e.target.closest('[data-item-rotate]');
      const mirrorEl = e.target.closest('[data-item-mirror]');
      const moveEl = e.target.closest('[data-item-move]');
      const resizeEl = e.target.closest('[data-item-resize]');
      const anchorEl = e.target.closest('[data-item-anchor]');
      const itemType = String(ui.designerItemType?.value || 'door');
      if (tool === 'place' && itemType === 'beam' && itemEl) {
        const targetId = Number(itemEl.getAttribute('data-item-id'));
        const targetBeam = findDesignerItemById(m, targetId);
        const lastBeam = findDesignerItemById(m, Number(m.lastBeamItemId));
        if (Number.isInteger(targetId) && targetBeam && String(targetBeam.type || '') === 'beam' && lastBeam && Number(lastBeam.id) !== targetId) {
          snapshotDesignerState();
          state.designer.pendingBeamConnect = {
            targetId,
            startClientX: Number(e.clientX),
            startClientY: Number(e.clientY)
          };
          svg.setPointerCapture(e.pointerId);
          return;
        }
      }
      if (tool === 'erase') {
        if (itemEl) {
          const itemId = Number(itemEl.getAttribute('data-item-id'));
          if (Number.isInteger(itemId)) {
            snapshotDesignerState();
            m.items = (m.items || []).filter(it => Number(it.id) !== itemId);
            if (Number(state.designer.selectedItemId) === itemId) state.designer.selectedItemId = null;
            syncAutoBeamWalls(m);
            if (Number(m.lastBeamItemId) === itemId) {
              const beams = (m.items || []).filter(it => String(it.type || '') === 'beam');
              m.lastBeamItemId = beams.length ? Number(beams[beams.length - 1].id) : null;
            }
            saveDesignerData();
            renderDesigner();
            renderAllCanvases();
          }
          return;
        }
        const wallIdRaw = wallPointEl
          ? String(wallPointEl.getAttribute('data-wall-point') || '').split(':')[0]
          : (wallEl ? String(wallEl.getAttribute('data-wall-id') || '') : '');
        const wallId = Number(wallIdRaw);
        if (Number.isInteger(wallId)) {
          snapshotDesignerState();
          m.walls = (m.walls || []).filter(w => Number(w.id) !== wallId);
          m.outerWallIds = (m.outerWallIds || []).filter(id => Number(id) !== wallId);
          saveDesignerData();
          renderDesigner();
          renderAllCanvases();
        }
        return;
      }
      const isWallDrawingActive = tool === 'wall' && Array.isArray(state.designer.drawingWall) && state.designer.drawingWall.length > 0;
      const canMoveExisting = tool !== 'outer' && tool !== 'perimeter' && !isWallDrawingActive;
      if (canMoveExisting && rotateEl) {
        const itemId = Number(rotateEl.getAttribute('data-item-rotate'));
        const it = findDesignerItemById(m, itemId);
        if (it) {
          snapshotDesignerState();
          state.designer.selectedItemId = itemId;
          const cx = Number(it.x) || 0;
          const cy = Number(it.y) || 0;
          state.designer.dragRotateItemId = itemId;
          state.designer.dragRotateCenter = { x: cx, y: cy };
          state.designer.dragRotateStartAngle = Math.atan2(Number(p.y) - cy, Number(p.x) - cx);
          state.designer.dragRotateOrigRotation = Number(it.r || 0);
          svg.setPointerCapture(e.pointerId);
          renderDesigner();
        }
        return;
      }
      if (canMoveExisting && mirrorEl) {
        const itemId = Number(mirrorEl.getAttribute('data-item-mirror'));
        const it = findDesignerItemById(m, itemId);
        if (it && String(it.type || '') === 'door') {
          snapshotDesignerState();
          it.mirrorX = !it.mirrorX;
          state.designer.selectedItemId = itemId;
          saveDesignerData();
          renderDesigner();
          renderAllCanvases();
        }
        return;
      }
      if (canMoveExisting && moveEl) {
        const itemId = Number(moveEl.getAttribute('data-item-move'));
        const it = findDesignerItemById(m, itemId);
        if (it) {
          snapshotDesignerState();
          state.designer.dragItemId = itemId;
          state.designer.selectedItemId = itemId;
          svg.setPointerCapture(e.pointerId);
          renderDesigner();
        }
        return;
      }
      if (canMoveExisting && resizeEl) {
        const itemId = Number(resizeEl.getAttribute('data-item-resize'));
        const it = findDesignerItemById(m, itemId);
        if (it && itemSupportsResize(it.type)) {
          snapshotDesignerState();
          const baseW = Number(it.w || defaultDesignerItemSpec(it.type).w);
          const baseH = Number(it.h || defaultDesignerItemSpec(it.type).h);
          const cx = Number(it.x || 0);
          const cy = Number(it.y || 0);
          const rDeg = Number(it.r || 0);
          const rRad = (rDeg * Math.PI) / 180;
          const cos = Math.cos(rRad);
          const sin = Math.sin(rRad);
          const fx = cx + ((-baseW / 2) * cos) - ((-baseH / 2) * sin);
          const fy = cy + ((-baseW / 2) * sin) + ((-baseH / 2) * cos);
          state.designer.selectedItemId = itemId;
          state.designer.dragResizeItemId = itemId;
          state.designer.dragResizeStart = { x: p.x, y: p.y };
          state.designer.dragResizeOrig = {
            w: baseW,
            h: baseH,
            x: cx,
            y: cy,
            r: rDeg,
            fixedX: fx,
            fixedY: fy
          };
          svg.setPointerCapture(e.pointerId);
          renderDesigner();
        }
        return;
      }
      if (canMoveExisting && anchorEl) {
        const itemId = Number(anchorEl.getAttribute('data-item-anchor'));
        const it = findDesignerItemById(m, itemId);
        if (it && canonicalDesignerItemType(it.type) === 'cameraZone') {
          snapshotDesignerState();
          state.designer.selectedItemId = itemId;
          state.designer.dragAnchorItemId = itemId;
          svg.setPointerCapture(e.pointerId);
          renderDesigner();
        }
        return;
      }
      if (canMoveExisting && wallPointEl) {
        const [wallIdRaw, pointIdxRaw] = String(wallPointEl.getAttribute('data-wall-point') || '').split(':');
        const wallId = Number(wallIdRaw);
        const pointIdx = Number(pointIdxRaw);
        if (!Number.isInteger(wallId) || !Number.isInteger(pointIdx)) return;
        const wall = findDesignerWallById(m, wallId);
        if (!wall || !Array.isArray(wall.points) || !wall.points[pointIdx]) return;
        snapshotDesignerState();
        state.designer.dragWallPoint = { wallId, pointIdx };
        svg.setPointerCapture(e.pointerId);
        return;
      }
      if (canMoveExisting && wallEl) {
        const wallId = Number(wallEl.getAttribute('data-wall-id'));
        const wall = findDesignerWallById(m, wallId);
        if (Number.isInteger(wallId) && wall && Array.isArray(wall.points)) {
          snapshotDesignerState();
          state.designer.dragWallId = wallId;
          state.designer.dragWallStart = { x: p.x, y: p.y };
          state.designer.dragWallOrig = wall.points.map(pt => ({ x: Number(pt.x), y: Number(pt.y) }));
          svg.setPointerCapture(e.pointerId);
          return;
        }
      }
      if (canMoveExisting && itemEl) {
        snapshotDesignerState();
        state.designer.dragItemId = Number(itemEl.getAttribute('data-item-id'));
        state.designer.selectedItemId = state.designer.dragItemId;
        svg.setPointerCapture(e.pointerId);
        renderDesigner();
        return;
      }
      if (tool === 'select' && !itemEl && !wallEl && !wallPointEl) {
        if (state.designer.selectedItemId !== null) {
          state.designer.selectedItemId = null;
          renderDesigner();
        }
        return;
      }
      if (tool === 'place') {
        snapshotDesignerState();
        const id = m.nextId || 1;
        m.nextId = id + 1;
        const newItem = { id, type: itemType, x: p.x, y: p.y, r: 0 };
        const forceNewBeamChain = !!(e.altKey || e.metaKey || e.ctrlKey);
        const lastBeam = (itemType === 'beam')
          ? (!forceNewBeamChain
            ? (m.items || []).find(it => Number(it.id) === Number(m.lastBeamItemId) && String(it.type || '') === 'beam')
            : null)
          : null;
        m.items.push(newItem);
        if (itemType === 'beam') {
          linkWallBetweenBeams(m, lastBeam, newItem);
          m.lastBeamItemId = id;
        } else if (itemType === 'door') {
          snapDoorToWall(newItem, m);
        }
        state.designer.selectedItemId = id;
        saveDesignerData();
        renderDesigner();
        renderAllCanvases();
        return;
      }
      if (tool === 'wall') {
        if (Date.now() < Number(state.designer.wallFinishCooldownUntil || 0)) return;
        if (e.detail >= 2 && Array.isArray(state.designer.drawingWall) && state.designer.drawingWall.length > 0) return;
        if (!state.designer.drawingWall) state.designer.drawingWall = [];
        if (state.designer.drawingWall.length >= 2) {
          const first = state.designer.drawingWall[0];
          const closeDist = Math.max(8, Math.min(22, Number(state.designer.grid || 12) * 1.25));
          const d = Math.hypot(Number(p.x) - Number(first.x), Number(p.y) - Number(first.y));
          if (d <= closeDist) {
            const done = finalizeDrawingWall(m, true);
            if (done) state.designer.wallFinishCooldownUntil = Date.now() + 260;
            return;
          }
        }
        state.designer.drawingWall.push({ x: p.x, y: p.y });
        state.designer.drawingWallCursor = { x: p.x, y: p.y };
        renderDesigner();
        return;
      }
      if (tool === 'perimeter') {
        snapshotDesignerState();
        state.designer.drawingPerimeter = { x: p.x, y: p.y, w: 0, h: 0, sx: p.x, sy: p.y };
        renderDesigner();
        return;
      }
      if (tool === 'outer') {
        let id = wallEl ? Number(wallEl.getAttribute('data-wall-id')) : null;
        if (!Number.isInteger(id)) {
          id = nearestWallIdAtPoint(m, p, Math.max(16, Number(state.designer.grid || 12) * 1.6));
        }
        if (!Number.isInteger(id)) {
          setStatus('Keine Wand in Reichweite zum Markieren gefunden');
          return;
        }
        snapshotDesignerState();
        m.outerWallIds = Array.isArray(m.outerWallIds) ? m.outerWallIds : [];
        const wasOuter = m.outerWallIds.includes(id);
        if (wasOuter) m.outerWallIds = m.outerWallIds.filter(x => x !== id);
        else m.outerWallIds.push(id);
        saveDesignerData();
        renderDesigner();
        renderAllCanvases();
        setStatus(`Außenhaut ${wasOuter ? 'entfernt' : 'markiert'} (Wand ${id})`);
        return;
      }
    });
    svg.addEventListener('pointermove', e => {
      const tool = String(ui.designerTool?.value || 'select');
      const m = getDesignerFloorModel();
      const p = svgPoint(e);
      if (state.designer.pendingBeamConnect) {
        const dx = Number(e.clientX) - Number(state.designer.pendingBeamConnect.startClientX || 0);
        const dy = Number(e.clientY) - Number(state.designer.pendingBeamConnect.startClientY || 0);
        if (Math.hypot(dx, dy) > 6) {
          state.designer.dragItemId = Number(state.designer.pendingBeamConnect.targetId);
          state.designer.pendingBeamConnect = null;
        } else {
          return;
        }
      }
      if (state.designer.dragAnchorItemId) {
        const it = findDesignerItemById(m, state.designer.dragAnchorItemId);
        if (!it || canonicalDesignerItemType(it.type) !== 'cameraZone') return;
        const w = Math.max(8, Number(it.w || defaultDesignerItemSpec(it.type).w));
        const h = Math.max(8, Number(it.h || defaultDesignerItemSpec(it.type).h));
        const lp = toItemLocalPoint(it, p);
        it.coverageAnchor = cameraAnchorFromLocal(w, h, lp.x, lp.y);
        renderDesigner();
        return;
      }
      if (state.designer.dragResizeItemId && state.designer.dragResizeStart && state.designer.dragResizeOrig) {
        const it = findDesignerItemById(m, state.designer.dragResizeItemId);
        if (!it) return;
        const orig = state.designer.dragResizeOrig || {};
        const rDeg = Number(orig.r || it.r || 0);
        const rRad = (rDeg * Math.PI) / 180;
        const cos = Math.cos(rRad);
        const sin = Math.sin(rRad);
        const ux = { x: cos, y: sin };
        const uy = { x: -sin, y: cos };
        const fx = Number(orig.fixedX || 0);
        const fy = Number(orig.fixedY || 0);
        const vx = Number(p.x) - fx;
        const vy = Number(p.y) - fy;
        let nextW = snapDesigner(Math.max(12, (vx * ux.x) + (vy * ux.y)));
        let nextH = snapDesigner(Math.max(12, (vx * uy.x) + (vy * uy.y)));
        if (String(it.type || '') === 'tableRound') {
          const s = Math.max(nextW, nextH);
          nextW = s;
          nextH = s;
        } else if (String(it.type || '') === 'door') {
          const s = Math.max(nextW, nextH);
          nextW = s;
          nextH = s;
        }
        it.w = nextW;
        it.h = nextH;
        it.x = fx + ((nextW / 2) * ux.x) + ((nextH / 2) * uy.x);
        it.y = fy + ((nextW / 2) * ux.y) + ((nextH / 2) * uy.y);
        renderDesigner();
        return;
      }
      if (
        state.designer.dragRotateItemId
        && state.designer.dragRotateCenter
        && Number.isFinite(Number(state.designer.dragRotateStartAngle))
        && Number.isFinite(Number(state.designer.dragRotateOrigRotation))
      ) {
        const it = findDesignerItemById(m, state.designer.dragRotateItemId);
        if (!it) return;
        const cx = Number(state.designer.dragRotateCenter.x || 0);
        const cy = Number(state.designer.dragRotateCenter.y || 0);
        const now = Math.atan2(Number(p.y) - cy, Number(p.x) - cx);
        const start = Number(state.designer.dragRotateStartAngle);
        let delta = ((now - start) * 180) / Math.PI;
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;
        const raw = Number(state.designer.dragRotateOrigRotation) + delta;
        it.r = snapRightAngleDeg(raw);
        renderDesigner();
        return;
      }
      if (state.designer.dragWallPoint) {
        const info = state.designer.dragWallPoint;
        const wall = findDesignerWallById(m, info.wallId);
        if (wall && Array.isArray(wall.points) && wall.points[info.pointIdx]) {
          let nx = p.x;
          let ny = p.y;
          if (tool === 'wall' && wall.points.length === 2) {
            const otherIdx = info.pointIdx === 0 ? 1 : 0;
            const anchor = wall.points[otherIdx];
            if (anchor) {
              if (Math.abs(nx - Number(anchor.x)) >= Math.abs(ny - Number(anchor.y))) ny = Number(anchor.y);
              else nx = Number(anchor.x);
            }
          }
          wall.points[info.pointIdx] = { x: nx, y: ny };
          renderDesigner();
        }
        return;
      }
      if (state.designer.dragWallId && state.designer.dragWallStart && Array.isArray(state.designer.dragWallOrig)) {
        const wall = findDesignerWallById(m, state.designer.dragWallId);
        const ws = getDesignerWorkspace();
        if (wall && Array.isArray(wall.points)) {
          const dx = p.x - Number(state.designer.dragWallStart.x || 0);
          const dy = p.y - Number(state.designer.dragWallStart.y || 0);
          wall.points = state.designer.dragWallOrig.map(orig => ({
            x: snapDesigner(Math.max(0, Math.min(ws.w, Number(orig.x) + dx))),
            y: snapDesigner(Math.max(0, Math.min(ws.h, Number(orig.y) + dy)))
          }));
          renderDesigner();
        }
        return;
      }
      if (state.designer.dragItemId) {
        const it = m.items.find(x => x.id === state.designer.dragItemId);
        if (!it) return;
        it.x = p.x; it.y = p.y;
        if (String(it.type || '') === 'beam') syncAutoBeamWalls(m);
        if (String(it.type || '') === 'door') snapDoorToWall(it, m);
        renderDesigner();
        return;
      }
      if (tool === 'perimeter' && state.designer.drawingPerimeter) {
        const r = state.designer.drawingPerimeter;
        r.x = Math.min(r.sx, p.x);
        r.y = Math.min(r.sy, p.y);
        r.w = Math.abs(p.x - r.sx);
        r.h = Math.abs(p.y - r.sy);
        renderDesigner();
        return;
      }
      if (tool === 'wall' && state.designer.drawingWall && state.designer.drawingWall.length > 0) {
        state.designer.drawingWallCursor = { x: p.x, y: p.y };
        renderDesigner();
      }
    });
    svg.addEventListener('pointerup', () => {
      const m = getDesignerFloorModel();
      if (state.designer.pendingBeamConnect) {
        const targetId = Number(state.designer.pendingBeamConnect.targetId);
        const targetBeam = findDesignerItemById(m, targetId);
        const lastBeam = findDesignerItemById(m, Number(m.lastBeamItemId));
        state.designer.pendingBeamConnect = null;
        if (targetBeam && lastBeam && String(targetBeam.type || '') === 'beam' && String(lastBeam.type || '') === 'beam' && Number(targetBeam.id) !== Number(lastBeam.id)) {
          linkWallBetweenBeams(m, lastBeam, targetBeam);
          m.lastBeamItemId = Number(targetBeam.id);
          saveDesignerData();
          renderDesigner();
          renderAllCanvases();
        }
        return;
      }
      let changed = false;
      if (state.designer.dragResizeItemId) {
        state.designer.dragResizeItemId = null;
        state.designer.dragResizeStart = null;
        state.designer.dragResizeOrig = null;
        changed = true;
      }
      if (state.designer.dragAnchorItemId) {
        state.designer.dragAnchorItemId = null;
        changed = true;
      }
      if (state.designer.dragRotateItemId) {
        state.designer.dragRotateItemId = null;
        state.designer.dragRotateCenter = null;
        state.designer.dragRotateStartAngle = null;
        state.designer.dragRotateOrigRotation = null;
        changed = true;
      }
      if (state.designer.dragItemId) {
        state.designer.dragItemId = null;
        changed = true;
      }
      if (state.designer.dragWallPoint) {
        state.designer.dragWallPoint = null;
        changed = true;
      }
      if (state.designer.dragWallId) {
        state.designer.dragWallId = null;
        state.designer.dragWallStart = null;
        state.designer.dragWallOrig = null;
        changed = true;
      }
      if (state.designer.drawingPerimeter) {
        const r = state.designer.drawingPerimeter;
        m.perimeter = { x: r.x, y: r.y, w: r.w, h: r.h };
        state.designer.drawingPerimeter = null;
        setStatus('Perimeter-Rechteck gesetzt und übernommen');
        changed = true;
      }
      if (changed) {
        saveDesignerData();
        renderDesigner();
        renderAllCanvases();
      }
    });
    svg.addEventListener('dblclick', () => {
      if (String(ui.designerTool?.value || '') !== 'wall') return;
      const m = getDesignerFloorModel();
      const done = finalizeDrawingWall(m, false);
      if (done) state.designer.wallFinishCooldownUntil = Date.now() + 260;
    });
    svg.addEventListener('contextmenu', e => {
      if (String(ui.designerTool?.value || '') !== 'wall') return;
      if (!Array.isArray(state.designer.drawingWall) || state.designer.drawingWall.length < 2) return;
      e.preventDefault();
      const m = getDesignerFloorModel();
      const done = finalizeDrawingWall(m, false);
      if (done) state.designer.wallFinishCooldownUntil = Date.now() + 260;
    });
    svg.addEventListener('pointercancel', () => {
      state.designer.pendingBeamConnect = null;
      state.designer.wallFinishCooldownUntil = 0;
      state.designer.dragResizeItemId = null;
      state.designer.dragResizeStart = null;
      state.designer.dragResizeOrig = null;
      state.designer.dragAnchorItemId = null;
      state.designer.dragRotateItemId = null;
      state.designer.dragRotateCenter = null;
      state.designer.dragRotateStartAngle = null;
      state.designer.dragRotateOrigRotation = null;
      state.designer.dragItemId = null;
      state.designer.dragWallId = null;
      state.designer.dragWallPoint = null;
      state.designer.dragWallStart = null;
      state.designer.dragWallOrig = null;
    });
  }

  function snapshotCanvasState() {
    state.canvasHistory.push(JSON.stringify({
      floorLayouts: state.floorLayouts,
      pir: state.config.pirSensorsTable,
      contact: state.config.contactSensorsTable,
      presence: state.config.presenceSensorsTable,
      person: state.config.personDetectionTable,
      cams: state.config.camerasTable
    }));
    if (state.canvasHistory.length > 60) state.canvasHistory.shift();
  }

  function undoCanvasStep() {
    const snap = state.canvasHistory.pop();
    if (!snap) return;
    try {
      const s = JSON.parse(snap);
      state.floorLayouts = s.floorLayouts || state.floorLayouts;
      state.config.pirSensorsTable = s.pir || state.config.pirSensorsTable;
      state.config.contactSensorsTable = s.contact || state.config.contactSensorsTable;
      state.config.presenceSensorsTable = s.presence || state.config.presenceSensorsTable;
      state.config.personDetectionTable = s.person || state.config.personDetectionTable;
      state.config.camerasTable = s.cams || state.config.camerasTable;
      writeFloorLayoutsToConfig();
      renderAllCanvases();
      setStatus('Letzter Schritt rückgängig');
    } catch {}
  }

  function writeFloorLayoutsToConfig() {
    state.config.floorLayoutsJson = JSON.stringify(state.floorLayouts);
  }

  function getCurrentLayout() {
    if (!state.floorLayouts[state.currentFloor]) state.floorLayouts[state.currentFloor] = defaultLayout();
    return state.floorLayouts[state.currentFloor];
  }

  function copyZonesToOtherFloor() {
    const from = state.currentFloor === 'OG' ? 'OG' : 'EG';
    const to = from === 'EG' ? 'OG' : 'EG';
    if (!state.floorLayouts[from]) state.floorLayouts[from] = defaultLayout();
    if (!state.floorLayouts[to]) state.floorLayouts[to] = defaultLayout();
    snapshotCanvasState();
    const fromZones = state.floorLayouts[from].zones || {};
    state.floorLayouts[to].zones = clone({
      perimeter: Array.isArray(fromZones.perimeter) ? fromZones.perimeter : [],
      aussenhaut: Array.isArray(fromZones.aussenhaut) ? fromZones.aussenhaut : [],
      innenraum: Array.isArray(fromZones.innenraum) ? fromZones.innenraum : []
    });
    writeFloorLayoutsToConfig();
    renderAllCanvases();
    setStatus(`Zonen von ${from} nach ${to} übernommen`);
  }

  function readFormIntoConfig() {
    ui.global.querySelectorAll('[data-key]').forEach(el => {
      const k = el.dataset.key;
      const spec = globalSpec.find(x => x[0] === k);
      if (!spec) return;
      if (spec[1] === 'number') state.config[k] = Number(el.value || 0);
      else if (spec[1] === 'boolean') state.config[k] = (el.value === 'true');
      else if (k === 'alarmActionZoneTriggerTiming') state.config[k] = (String(el.value || 'after_alarm') === 'immediate' ? 'immediate' : 'after_alarm');
    });
    ui.dp.querySelectorAll('[data-key]').forEach(el => {
      const key = String(el.dataset.key || '');
      if (!key) return;
      const spec = dpSpec.find(x => x.key === key);
      const raw = String(el.value ?? '').trim();
      if (!spec) {
        state.config[key] = raw;
        return;
      }
      if (spec.type === 'number') {
        const n = Number(raw);
        state.config[key] = Number.isFinite(n) ? n : 0;
        return;
      }
      if (spec.type === 'boolean') {
        state.config[key] = raw === 'true';
        return;
      }
      state.config[key] = raw;
    });
    if (ui.alarmActionGlobalTiming) state.config.alarmActionZoneTriggerTiming = String(ui.alarmActionGlobalTiming.value || 'after_alarm');
    state.config.floorplanEgImage = String(ui.floorplanEgInput?.value || './assets/EG.jpg').trim();
    state.config.floorplanOgImage = String(ui.floorplanOgInput?.value || state.config.floorplanEgImage || './assets/OG.jpg').trim();
    state.config.autoArmDelaySec = Math.max(0, Number(ui.autoAwayDelaySec?.value || state.config.autoArmDelaySec || 60));
    state.config.autoAwayArmZonesCsv = String(ui.autoAwayArmZonesCsv?.value || 'perimeter,aussenhaut,innenraum').trim();
    state.config.autoAwayChatIdsCsv = String(ui.autoAwayChatIdsCsv?.value || '').trim();
    state.config.autoAwayPendingTelegramText = String(ui.autoAwayPendingTelegramText?.value || '').trim();
    state.config.autoAwayArmedTelegramText = String(ui.autoAwayArmedTelegramText?.value || '').trim();
    state.config.geofenceLeaveArmZonesCsv = String(ui.geofenceLeaveArmZonesCsv?.value || '').trim();
    state.config.geofenceLeaveChatIdsCsv = String(ui.geofenceLeaveChatIdsCsv?.value || '').trim();
    state.config.geofenceLeaveTelegramText = String(ui.geofenceLeaveTelegramText?.value || '').trim();
    state.config.geofenceEnterArmZonesCsv = String(ui.geofenceEnterArmZonesCsv?.value || '').trim();
    state.config.geofenceEnterDisarmZonesCsv = String(ui.geofenceEnterDisarmZonesCsv?.value || '').trim();
    state.config.geofenceEnterChatIdsCsv = String(ui.geofenceEnterChatIdsCsv?.value || '').trim();
    state.config.geofenceEnterTelegramText = String(ui.geofenceEnterTelegramText?.value || '').trim();
    state.config.countdownAbortMode = ['zone_disarmed', 'any_disarm', 'off'].includes(String(ui.alarmCountdownAbortMode?.value || ''))
      ? String(ui.alarmCountdownAbortMode.value)
      : 'zone_disarmed';
    state.config.alarmRepeatTelegramEnabled = String(ui.alarmRepeatTelegramEnabled?.value || 'false') === 'true';
    state.config.alarmRepeatTelegramIntervalSec = Math.max(5, Number(ui.alarmRepeatTelegramIntervalSec?.value || state.config.alarmRepeatTelegramIntervalSec || 60));
    state.config.alarmRepeatTelegramText = String(ui.alarmRepeatTelegramText?.value || 'Alarm !!!').trim();
    state.config.modeFlowAnnounceCommandId = String(ui.modeFlowAnnounceCommandId?.value || `${state.instanceId}.commands.announceAlarm`).trim();
    state.config.modeFlowPerimeterAlarmCommandId = String(ui.modeFlowPerimeterCommandId?.value || `${state.instanceId}.commands.activatePerimeterAlarm`).trim();
    state.config.modeFlowInteriorAlarmCommandId = String(ui.modeFlowInteriorCommandId?.value || `${state.instanceId}.commands.activateInteriorAlarm`).trim();
    state.config.modeFlowFullAlarmCommandId = String(ui.modeFlowFullCommandId?.value || `${state.instanceId}.commands.activateFullAlarm`).trim();
    state.config.modeFlowTelegramPerimeterText = String(ui.modeFlowTelegramPerimeterText?.value || '').trim();
    state.config.modeFlowTelegramInteriorText = String(ui.modeFlowTelegramInteriorText?.value || '').trim();
    state.config.modeFlowTelegramFullText = String(ui.modeFlowTelegramFullText?.value || '').trim();
    state.config.modeFlowAutoPerimeterAfterSunsetEnabled = String(ui.modeFlowAutoPerimeterAfterSunsetEnabled?.value || 'false') === 'true';
    state.config.modeFlowAutoAwayMode = ['legacy', 'off', 'perimeter', 'vollschutz'].includes(String(ui.modeFlowAutoAwayMode?.value || ''))
      ? String(ui.modeFlowAutoAwayMode.value)
      : 'legacy';
    state.config.modeFlowAutoAwayDelaySec = Math.max(0, Number(ui.modeFlowAutoAwayDelaySec?.value || state.config.autoArmDelaySec || 60));
    if (state.config.modeFlowAutoAwayMode === 'perimeter') state.config.autoAwayArmZonesCsv = 'perimeter';
    else if (state.config.modeFlowAutoAwayMode === 'vollschutz') state.config.autoAwayArmZonesCsv = 'perimeter,aussenhaut,innenraum';
    else if (state.config.modeFlowAutoAwayMode === 'off') state.config.autoAwayArmZonesCsv = '';
    state.config.autoArmDelaySec = Math.max(0, Number(state.config.modeFlowAutoAwayDelaySec || state.config.autoArmDelaySec || 60));
    ensureTables();
    state.config.telegramInstancesTable = (state.config.telegramInstancesTable || [])
      .map(normalizeTelegramInstanceRow)
      .filter(r => r.instance);
    state.config.telegramTargetsTable = (state.config.telegramTargetsTable || [])
      .map(normalizeTelegramTargetRow)
      .filter(r => r.instance && r.chatId);
    state.config.snapshotActionTargetsTable = (state.config.snapshotActionTargetsTable || [])
      .map(normalizeSnapshotActionTargetRow)
      .filter(r => r.datapointId);
    state.config.alarmActionsTable = (state.config.alarmActionsTable || [])
      .map(normalizeAlarmActionRow)
      .filter(r => r.actionKind && r.scenario);
    state.config.panicActionsTable = (state.config.panicActionsTable || [])
      .map(normalizePanicActionRow)
      .filter(r => r.actionKind && r.when);
    state.config.modeFlowRulesTable = (state.config.modeFlowRulesTable || [])
      .map(normalizeModeFlowRuleRow)
      .filter(r => r.sourceId);
  }

  function renderZoneActions() {
    ensureTables();
    if (!ui.zoneActionsList) return;
    const rows = state.config.zoneActionsTable || [];
    if (!rows.length) {
      ui.zoneActionsList.innerHTML = '<div class="muted">Keine Zonen-Aktoren konfiguriert.</div>';
      return;
    }
    ui.zoneActionsList.innerHTML = rows.map((r, idx) => {
      const zone = String(r.zone || 'perimeter');
      const label = String(r.label || r.key || r.datapointId || `action_${idx + 1}`);
      const dp = String(r.datapointId || '');
      const onValue = r.onValue === undefined || r.onValue === null ? 'true' : String(r.onValue);
      const offValue = r.offValue === undefined || r.offValue === null || String(r.offValue) === '' ? '-' : String(r.offValue);
      const pulse = Number(r.pulseMs || 0) > 0 ? `${Number(r.pulseMs)}ms` : '-';
      return `<div class="sensor-item"><span>${label} [${zone}]<br><span class="muted">${dp} | on=${onValue} | off=${offValue} | pulse=${pulse}</span></span><button class="btn danger" data-del-zone-action="${idx}">Löschen</button></div>`;
    }).join('');
  }

  function normalizeSnapshotActionTargetRow(row) {
    const durationMs = Math.max(0, Number(row?.durationMs || 0));
    const keyRaw = String(row?.key || '').trim();
    const dp = String(row?.datapointId || '').trim();
    const fallback = dp || `snapshot_${Date.now()}`;
    return {
      key: keyRaw || fallback,
      label: String(row?.label || keyRaw || dp || 'Snapshot Aktion').trim(),
      datapointId: dp,
      onValue: String(row?.onValue ?? 'true').trim() || 'true',
      offValue: String(row?.offValue ?? '').trim(),
      durationMs: Number.isFinite(durationMs) ? durationMs : 0
    };
  }

  function normalizeAlarmActionRow(row) {
    const scenario = ['zone_trigger', 'panic_on', 'panic_off'].includes(String(row?.scenario || ''))
      ? String(row.scenario)
      : 'zone_trigger';
    const actionKind = ['datapoint', 'telegram', 'alexa', 'snapshot', 'camera_led'].includes(String(row?.actionKind || ''))
      ? String(row.actionKind)
      : 'datapoint';
    const triggerSource = ['any', 'sensor', 'personDetection', 'camera'].includes(String(row?.triggerSource || ''))
      ? String(row.triggerSource)
      : 'any';
    const zone = ['any', 'perimeter', 'aussenhaut', 'innenraum'].includes(String(row?.zone || ''))
      ? String(row.zone)
      : 'any';
    const armedMode = ['any', 'armed', 'unarmed'].includes(String(row?.armedMode || ''))
      ? String(row.armedMode)
      : 'any';
    const timing = ['global', 'immediate', 'after_alarm'].includes(String(row?.timing || ''))
      ? String(row.timing)
      : 'global';
    const repeatCount = Math.max(1, Number(row?.repeatCount || 1));
    const repeatIntervalMs = Math.max(0, Number(row?.repeatIntervalMs || 1000));
    const durationMs = Math.max(0, Number(row?.durationMs || 0));
    return {
      key: String(row?.key || row?.datapointId || row?.triggerEntityId || `action_${Date.now()}`),
      label: String(row?.label || row?.key || row?.datapointId || 'Alarm Action').trim(),
      scenario,
      zone,
      triggerSource,
      triggerEntityId: String(row?.triggerEntityId || '').trim(),
      armedMode,
      timing,
      actionKind,
      datapointId: String(row?.datapointId || '').trim(),
      onValue: String(row?.onValue ?? (actionKind === 'datapoint' ? 'true' : '')).trim(),
      offValue: String(row?.offValue ?? '').trim(),
      durationMs: Number.isFinite(durationMs) ? durationMs : 0,
      repeatCount: Number.isFinite(repeatCount) ? repeatCount : 1,
      repeatIntervalMs: Number.isFinite(repeatIntervalMs) ? repeatIntervalMs : 1000,
      telegramText: String(row?.telegramText || '').trim(),
      alexaText: String(row?.alexaText || '').trim(),
      snapshotTargetKey: String(row?.snapshotTargetKey || '').trim(),
      cameraTargetKey: String(row?.cameraTargetKey || '').trim()
    };
  }

  function normalizePanicActionRow(row) {
    const when = ['on', 'off'].includes(String(row?.when || '')) ? String(row.when) : 'on';
    const actionKind = ['datapoint', 'telegram', 'alexa', 'snapshot', 'camera_led'].includes(String(row?.actionKind || ''))
      ? String(row.actionKind)
      : 'datapoint';
    const repeatCount = Math.max(1, Number(row?.repeatCount || 1));
    const repeatIntervalMs = Math.max(0, Number(row?.repeatIntervalMs || 1000));
    const durationMs = Math.max(0, Number(row?.durationMs || 0));
    return {
      key: String(row?.key || row?.datapointId || `panic_${Date.now()}`),
      label: String(row?.label || row?.key || row?.datapointId || `PANIC ${when}`).trim(),
      when,
      actionKind,
      datapointId: String(row?.datapointId || '').trim(),
      onValue: String(row?.onValue ?? (actionKind === 'datapoint' ? 'true' : '')).trim(),
      offValue: String(row?.offValue ?? '').trim(),
      durationMs: Number.isFinite(durationMs) ? durationMs : 0,
      repeatCount: Number.isFinite(repeatCount) ? repeatCount : 1,
      repeatIntervalMs: Number.isFinite(repeatIntervalMs) ? repeatIntervalMs : 1000,
      telegramText: String(row?.telegramText || '').trim(),
      alexaText: String(row?.alexaText || '').trim(),
      snapshotTargetKey: String(row?.snapshotTargetKey || '').trim(),
      cameraTargetKey: String(row?.cameraTargetKey || '').trim()
    };
  }

  function normalizeModeFlowRuleRow(row) {
    const mode = ['vollschutz', 'aussenhaut', 'perimeter', 'kamera'].includes(String(row?.mode || ''))
      ? String(row.mode)
      : 'perimeter';
    const sourceKind = ['sensor', 'personDetection', 'camera'].includes(String(row?.sourceKind || ''))
      ? String(row.sourceKind)
      : 'sensor';
    const sourceZone = ['any', 'perimeter', 'aussenhaut', 'innenraum'].includes(String(row?.sourceZone || ''))
      ? String(row.sourceZone)
      : 'any';
    const alarmLevel = ['perimeter_alarm', 'interior_alarm', 'full_alarm'].includes(String(row?.alarmLevel || ''))
      ? String(row.alarmLevel)
      : 'perimeter_alarm';
    const announceDelaySec = Math.max(0, Number(row?.announceDelaySec || 0));
    return {
      key: String(row?.key || `${mode}_${sourceKind}_${String(row?.sourceId || '').trim()}_${Date.now()}`),
      label: String(row?.label || row?.sourceLabel || row?.sourceId || 'ModeFlow Rule').trim(),
      enabled: row?.enabled !== false,
      mode,
      sourceKind,
      sourceId: String(row?.sourceId || '').trim(),
      sourceLabel: String(row?.sourceLabel || row?.sourceId || '').trim(),
      sourceZone,
      alarmLevel,
      announceBefore: row?.announceBefore === true || String(row?.announceBefore || '').toLowerCase() === 'true',
      announceDelaySec: Number.isFinite(announceDelaySec) ? announceDelaySec : 0,
      actionSnapshotTriggerCamera: row?.actionSnapshotTriggerCamera === true || String(row?.actionSnapshotTriggerCamera || '').toLowerCase() === 'true',
      actionCameraAlarmTriggerCamera: row?.actionCameraAlarmTriggerCamera === true || String(row?.actionCameraAlarmTriggerCamera || '').toLowerCase() === 'true',
      actionCameraLedTriggerCamera: row?.actionCameraLedTriggerCamera === true || String(row?.actionCameraLedTriggerCamera || '').toLowerCase() === 'true',
      actionCameraAlarmAll: row?.actionCameraAlarmAll === true || String(row?.actionCameraAlarmAll || '').toLowerCase() === 'true',
      actionCameraLedAll: row?.actionCameraLedAll === true || String(row?.actionCameraLedAll || '').toLowerCase() === 'true',
      actionAlexaSpeak: row?.actionAlexaSpeak === true || String(row?.actionAlexaSpeak || '').toLowerCase() === 'true',
      actionAlexaText: String(row?.actionAlexaText || '').trim()
    };
  }

  function modeFlowModeLabel(mode) {
    if (mode === 'vollschutz') return 'Vollschutz';
    if (mode === 'aussenhaut') return 'Außenhaut';
    if (mode === 'kamera') return 'Kamera';
    return 'Perimeter';
  }

  function modeFlowSourceKindLabel(kind) {
    if (kind === 'personDetection') return 'PersonDetection';
    if (kind === 'camera') return 'Camera';
    return 'Sensor';
  }

  function modeFlowLevelLabel(level) {
    if (level === 'interior_alarm') return 'InteriorAlarm';
    if (level === 'full_alarm') return 'FullAlarm';
    return 'PerimeterAlarm';
  }

  function alarmTriggerTypeLabel(v) {
    if (v === 'sensor') return 'Sensor';
    if (v === 'personDetection') return 'PersonDetection';
    if (v === 'camera') return 'Camera';
    return 'any';
  }

  function alarmScenarioLabel(v) {
    if (v === 'panic_on') return 'PANIC an';
    if (v === 'panic_off') return 'PANIC aus';
    return 'Zone Trigger';
  }

  function alarmActionKindLabel(v) {
    if (v === 'telegram') return 'Telegram';
    if (v === 'alexa') return 'Alexa';
    if (v === 'snapshot') return 'Snapshot';
    if (v === 'camera_led') return 'Kamera-LED';
    return 'Datapoint';
  }

  function getSelectedAlarmKinds() {
    const kinds = [];
    if (ui.alarmActionKindDatapoint?.checked) kinds.push('datapoint');
    if (ui.alarmActionKindTelegram?.checked) kinds.push('telegram');
    if (ui.alarmActionKindAlexa?.checked) kinds.push('alexa');
    if (ui.alarmActionKindSnapshot?.checked) kinds.push('snapshot');
    if (ui.alarmActionKindCameraLed?.checked) kinds.push('camera_led');
    return kinds;
  }

  function getSelectedQuickAlarmKinds() {
    const kinds = [];
    if (ui.quickAlarmKindDatapoint?.checked) kinds.push('datapoint');
    if (ui.quickAlarmKindTelegram?.checked) kinds.push('telegram');
    if (ui.quickAlarmKindAlexa?.checked) kinds.push('alexa');
    if (ui.quickAlarmKindSnapshot?.checked) kinds.push('snapshot');
    if (ui.quickAlarmKindCameraLed?.checked) kinds.push('camera_led');
    return kinds;
  }

  function getSelectedPanicKinds() {
    const kinds = [];
    if (ui.panicActionKindDatapoint?.checked) kinds.push('datapoint');
    if (ui.panicActionKindTelegram?.checked) kinds.push('telegram');
    if (ui.panicActionKindAlexa?.checked) kinds.push('alexa');
    if (ui.panicActionKindSnapshot?.checked) kinds.push('snapshot');
    return kinds;
  }

  function getSnapshotActionTargets() {
    ensureTables();
    return (state.config.snapshotActionTargetsTable || [])
      .map(normalizeSnapshotActionTargetRow)
      .filter(r => r.datapointId);
  }

  function snapshotTargetLabelByKey(key) {
    const k = String(key || '').trim();
    if (!k) return '';
    const row = getSnapshotActionTargets().find(r => String(r.key || '').trim() === k);
    return row ? String(row.label || row.key || row.datapointId || k) : k;
  }

  function refreshSnapshotActionTargetOptions(selectEl) {
    const sel = selectEl || null;
    if (!sel) return;
    const current = String(sel.value || '').trim();
    const rows = getSnapshotActionTargets();
    const options = ['<option value="">bitte wählen</option>'].concat(rows.map(r => {
      const txt = `${r.label} (${r.key})`;
      return `<option value="${htmlEsc(r.key)}">${htmlEsc(txt)}</option>`;
    }));
    sel.innerHTML = options.join('');
    if (current && rows.some(r => r.key === current)) sel.value = current;
  }

  function getCameraLedTargets() {
    ensureTables();
    return (state.config.camerasTable || [])
      .filter(r => String(r?.ledDatapoint || '').trim())
      .map(r => {
        const key = String(r?.key || r?.personDetectionDp || r?.ip || '').trim();
        const label = String(r?.label || key || r?.ip || '').trim();
        const ledDp = String(r?.ledDatapoint || '').trim();
        return { key, label, ledDatapoint: ledDp };
      })
      .filter(r => r.key && r.ledDatapoint);
  }

  function refreshCameraLedTargetOptions(selectEl) {
    const sel = selectEl || null;
    if (!sel) return;
    const current = String(sel.value || '').trim();
    const rows = getCameraLedTargets();
    sel.innerHTML = ['<option value="">bitte wählen</option>'].concat(rows.map(r =>
      `<option value="${htmlEsc(r.key)}">${htmlEsc(`${r.label} (${r.ledDatapoint})`)}</option>`
    )).join('');
    if (current && rows.some(r => r.key === current)) sel.value = current;
  }

  function getAlarmTriggerEntities() {
    ensureTables();
    const out = [];
    const push = (kind, zone, id, label) => {
      const zid = String(zone || 'perimeter');
      const rid = String(id || '').trim();
      if (!rid) return;
      out.push({
        kind,
        zone: ['perimeter', 'aussenhaut', 'innenraum'].includes(zid) ? zid : 'perimeter',
        id: rid,
        label: String(label || rid).trim()
      });
    };
    (state.config.pirSensorsTable || []).forEach(r => push('sensor', r.zone, r.id, r.label || r.key || r.id));
    (state.config.contactSensorsTable || []).forEach(r => push('sensor', r.zone, r.id, r.label || r.key || r.id));
    (state.config.personDetectionTable || []).forEach(r => push('personDetection', r.zone, r.id, r.label || r.key || r.id));
    (state.config.camerasTable || []).forEach(r => push('camera', r.zone, r.personDetectionDp, r.label || r.key || r.personDetectionDp));
    return out.sort((a, b) => a.label.localeCompare(b.label, 'de'));
  }

  function refreshAlarmActionTriggerEntityOptions() {
    refreshTriggerEntityOptions(ui.alarmActionTriggerEntity, ui.alarmActionTriggerType?.value || 'any');
  }

  function refreshQuickAlarmTriggerEntityOptions() {
    refreshTriggerEntityOptions(ui.quickAlarmTriggerEntity, ui.quickAlarmTriggerType?.value || 'any');
  }

  function refreshTriggerEntityOptions(selectEl, triggerTypeRaw) {
    const sel = selectEl || null;
    if (!sel) return;
    const triggerType = String(triggerTypeRaw || 'any');
    const current = String(sel.value || '').trim();
    const rows = getAlarmTriggerEntities().filter(r => triggerType === 'any' || r.kind === triggerType);
    const opts = ['<option value="">any</option>'].concat(rows.map(r => {
      const txt = `${r.label} [${alarmTriggerTypeLabel(r.kind)} | ${r.zone}]`;
      return `<option value="${htmlEsc(r.id)}">${htmlEsc(txt)}</option>`;
    }));
    sel.innerHTML = opts.join('');
    if (current && rows.some(r => r.id === current)) sel.value = current;
  }

  function setWrapVisible(el, visible) {
    if (!el) return;
    el.classList.toggle('hidden', !visible);
  }

  function updateAlarmActionUiState() {
    const scenario = String(ui.alarmActionScenario?.value || 'zone_trigger');
    const kinds = new Set(getSelectedAlarmKinds());
    const isPanicScenario = scenario === 'panic_on' || scenario === 'panic_off';
    const isDatapoint = kinds.has('datapoint');
    const isTelegram = kinds.has('telegram');
    const isAlexa = kinds.has('alexa');
    const isSnapshot = kinds.has('snapshot');
    const isCameraLed = kinds.has('camera_led');

    setWrapVisible(ui.alarmActionDpWrap, isDatapoint);
    setWrapVisible(ui.alarmActionOnWrap, isDatapoint);
    setWrapVisible(ui.alarmActionOffWrap, isDatapoint);
    setWrapVisible(ui.alarmActionDurationWrap, isDatapoint);
    setWrapVisible(ui.alarmActionRepeatCountWrap, true);
    setWrapVisible(ui.alarmActionRepeatIntervalWrap, true);
    setWrapVisible(ui.alarmActionTelegramWrap, isTelegram);
    setWrapVisible(ui.alarmActionAlexaWrap, isAlexa);
    setWrapVisible(ui.alarmActionSnapshotWrap, isSnapshot);
    setWrapVisible(ui.alarmActionCameraLedWrap, isCameraLed);
    setWrapVisible(ui.alarmActionTimingWrap, !isPanicScenario);

    if (ui.alarmActionZone?.closest('label')) setWrapVisible(ui.alarmActionZone.closest('label'), !isPanicScenario);
    if (ui.alarmActionTriggerType?.closest('label')) setWrapVisible(ui.alarmActionTriggerType.closest('label'), !isPanicScenario);
    if (ui.alarmActionTriggerEntity?.closest('label')) setWrapVisible(ui.alarmActionTriggerEntity.closest('label'), !isPanicScenario);
    if (ui.alarmActionArmedMode?.closest('label')) setWrapVisible(ui.alarmActionArmedMode.closest('label'), !isPanicScenario);
  }

  function updateQuickAlarmActionUiState() {
    const scenario = String(ui.quickAlarmScenario?.value || 'zone_trigger');
    const kinds = new Set(getSelectedQuickAlarmKinds());
    const isPanicScenario = scenario === 'panic_on' || scenario === 'panic_off';
    const isDatapoint = kinds.has('datapoint');
    const isTelegram = kinds.has('telegram');
    const isAlexa = kinds.has('alexa');
    const isSnapshot = kinds.has('snapshot');
    const isCameraLed = kinds.has('camera_led');

    setWrapVisible(ui.quickAlarmDpWrap, isDatapoint);
    setWrapVisible(ui.quickAlarmOnWrap, isDatapoint);
    setWrapVisible(ui.quickAlarmOffWrap, isDatapoint);
    setWrapVisible(ui.quickAlarmDurationWrap, isDatapoint);
    setWrapVisible(ui.quickAlarmRepeatCountWrap, true);
    setWrapVisible(ui.quickAlarmRepeatIntervalWrap, true);
    setWrapVisible(ui.quickAlarmTelegramWrap, isTelegram);
    setWrapVisible(ui.quickAlarmAlexaWrap, isAlexa);
    setWrapVisible(ui.quickAlarmSnapshotWrap, isSnapshot);
    setWrapVisible(ui.quickAlarmCameraLedWrap, isCameraLed);
    setWrapVisible(ui.quickAlarmTimingWrap, !isPanicScenario);
    setWrapVisible(ui.quickAlarmZoneWrap, !isPanicScenario);
    setWrapVisible(ui.quickAlarmTriggerTypeWrap, !isPanicScenario);
    setWrapVisible(ui.quickAlarmTriggerEntityWrap, !isPanicScenario);
    setWrapVisible(ui.quickAlarmArmedModeWrap, !isPanicScenario);
  }

  function updatePanicActionUiState() {
    const kinds = new Set(getSelectedPanicKinds());
    const isDatapoint = kinds.has('datapoint');
    const isTelegram = kinds.has('telegram');
    const isAlexa = kinds.has('alexa');
    const isSnapshot = kinds.has('snapshot');
    setWrapVisible(ui.panicActionDpWrap, isDatapoint);
    setWrapVisible(ui.panicActionOnWrap, isDatapoint);
    setWrapVisible(ui.panicActionOffWrap, isDatapoint);
    setWrapVisible(ui.panicActionDurationWrap, isDatapoint);
    setWrapVisible(ui.panicActionRepeatCountWrap, true);
    setWrapVisible(ui.panicActionRepeatIntervalWrap, true);
    setWrapVisible(ui.panicActionTelegramWrap, isTelegram);
    setWrapVisible(ui.panicActionAlexaWrap, isAlexa);
    setWrapVisible(ui.panicActionSnapshotWrap, isSnapshot);
  }

  function getAlarmActionTargetEntities(row) {
    const all = getAllCanvasEntities().filter(e => ['pirSensorsTable', 'contactSensorsTable', 'personDetectionTable', 'camerasTable'].includes(String(e.kind || '')));
    const zone = String(row.zone || 'any');
    const triggerSource = String(row.triggerSource || 'any');
    const triggerId = String(row.triggerEntityId || '').trim();
    return all.filter(e => {
      const ez = String(e.zone || 'perimeter');
      if (zone !== 'any' && ez !== zone) return false;
      if (triggerSource === 'sensor' && !['pirSensorsTable', 'contactSensorsTable'].includes(e.kind)) return false;
      if (triggerSource === 'personDetection' && e.kind !== 'personDetectionTable') return false;
      if (triggerSource === 'camera' && e.kind !== 'camerasTable') return false;
      if (!triggerId) return true;
      return String(e.id || '').trim() === triggerId;
    });
  }

  function getAlarmActionConflictMessages(row) {
    const out = [];
    if (String(row.scenario || '') !== 'zone_trigger') return out;
    const targets = getAlarmActionTargetEntities(row);
    if (!targets.length) return out;
    const m = getRulesMap();
    if (String(row.actionKind || '') === 'telegram') {
      const hits = targets.filter(e => {
        const r = { ...defaultRule(), ...(m[ruleId(e)] || {}) };
        return r.enabled === true && r.telegram === true;
      });
      if (hits.length) out.push(`Telegram-Redundanz: ${hits.length} Element(e) haben bereits Telegram-Regel aktiv.`);
    }
    const dpId = String(row.datapointId || '').trim();
    const sirenId = String(state.config?.sirenStateId || '').trim();
    if (String(row.actionKind || '') === 'datapoint' && dpId && sirenId && dpId === sirenId) {
      const hits = targets.filter(e => {
        const r = { ...defaultRule(), ...(m[ruleId(e)] || {}) };
        return r.enabled === true && r.sirene === true;
      });
      if (hits.length) out.push(`Sirenen-Redundanz: ${hits.length} Element(e) haben bereits "Sirene auslösen".`);
    }
    if (String(row.actionKind || '') === 'snapshot') {
      const hits = targets.filter(e => {
        const r = { ...defaultRule(), ...(m[ruleId(e)] || {}) };
        return r.enabled === true && r.snapshot === true;
      });
      if (hits.length) out.push(`Snapshot-Redundanz: ${hits.length} Element(e) haben bereits Snapshot-Regel aktiv.`);
    }
    if (String(row.actionKind || '') === 'camera_led') {
      const targetKey = String(row.cameraTargetKey || '').trim();
      if (targetKey) {
        const camHits = getAllCanvasEntities().filter(e => {
          if (e.kind !== 'camerasTable') return false;
          const byRef = String(e.entityKey || '').trim() === targetKey
            || String(e.id || '').trim() === targetKey
            || String(e.label || '').trim() === targetKey;
          if (!byRef) return false;
          const r = { ...defaultRule(), ...(m[ruleId(e)] || {}) };
          return r.enabled === true && r.led === true;
        });
        if (camHits.length) out.push(`Kamera-LED-Redundanz: ${camHits.length} Kamera-Element(e) haben bereits LED-Regel aktiv.`);
      }
    }
    return out;
  }

  function renderAlarmActionConflictHint() {
    if (!ui.alarmActionConflictHint) return;
    const all = getAllCanvasEntities().filter(e => ['pirSensorsTable', 'contactSensorsTable', 'personDetectionTable', 'camerasTable'].includes(String(e.kind || '')));
    const m = getRulesMap();
    const withTelegram = [];
    const withSirene = [];
    const withSnapshot = [];
    const withLed = [];
    const details = [];
    for (const e of all) {
      const r = { ...defaultRule(), ...(m[ruleId(e)] || {}) };
      if (r.enabled && r.telegram) withTelegram.push(e.label);
      if (r.enabled && r.sirene) withSirene.push(e.label);
      if (r.enabled && r.snapshot) withSnapshot.push(e.label);
      if (r.enabled && r.led) withLed.push(e.label);
      if (r.enabled && (r.telegram || r.sirene || r.snapshot || r.led)) {
        const tags = [];
        if (r.telegram) tags.push('<span class="conflict-rule-tag on">Telegram</span>');
        if (r.sirene) tags.push('<span class="conflict-rule-tag on">Sirene</span>');
        if (r.snapshot) tags.push('<span class="conflict-rule-tag on">Snapshot</span>');
        if (r.led) tags.push('<span class="conflict-rule-tag on">LED</span>');
        tags.push(`<span class="conflict-rule-tag meta">onlyArmed=${r.onlyArmed ? 'ja' : 'nein'}</span>`);
        tags.push(`<span class="conflict-rule-tag meta">onlyNight=${r.onlyNight ? 'ja' : 'nein'}</span>`);
        tags.push(`<span class="conflict-rule-tag meta">enabled=${r.enabled ? 'ja' : 'nein'}</span>`);
        const row = state.config?.[e.kind]?.[e.idx] || {};
        const snapshotDp = String(row.snapshotDatapointId || '').trim();
        if (snapshotDp) tags.push(`<span class="conflict-rule-tag meta">Snapshot-DP gesetzt</span>`);
        details.push(
          `<div class="conflict-details-item">`
          + `<div><strong>${htmlEsc(e.label)}</strong> <span class="muted">(${htmlEsc(kindLabel(e.kind))} | ${htmlEsc(e.zone)} | ${htmlEsc(e.floor)})</span></div>`
          + `<div class="muted">id=${htmlEsc(e.id)}</div>`
          + `<div class="conflict-rule-tags">${tags.join('')}</div>`
          + `</div>`
        );
      }
    }
    if (!withTelegram.length && !withSirene.length && !withSnapshot.length && !withLed.length) {
      ui.alarmActionConflictHint.classList.remove('err');
      ui.alarmActionConflictHint.textContent = 'Keine parallelen Element-Regeln erkannt. Für Zeilen-spezifische Konflikte auf die Warnhinweise in der Liste achten.';
      if (ui.alarmActionConflictDetails) {
        ui.alarmActionConflictDetails.classList.add('hidden');
        ui.alarmActionConflictDetails.classList.remove('err');
        ui.alarmActionConflictDetails.innerHTML = '';
      }
      return;
    }
    const lines = [];
    if (withTelegram.length) lines.push(`Telegram: ${withTelegram.length}`);
    if (withSnapshot.length) lines.push(`Snapshot: ${withSnapshot.length}`);
    if (withSirene.length) lines.push(`Sirene: ${withSirene.length}`);
    if (withLed.length) lines.push(`LED: ${withLed.length}`);
    ui.alarmActionConflictHint.classList.add('err');
    ui.alarmActionConflictHint.textContent = `Parallele Element-Regeln erkannt (${lines.join(' | ')}). Diese können zusätzlich zu Alarm Actions laufen.`;
    if (ui.alarmActionConflictDetails) {
      ui.alarmActionConflictDetails.classList.remove('hidden');
      ui.alarmActionConflictDetails.classList.add('err');
      ui.alarmActionConflictDetails.innerHTML = `<p class="conflict-summary">Vollständige Liste vorhandener Element-Regeln:</p><details><summary>Details aufklappen (${details.length})</summary><div class="conflict-details-list">${details.join('')}</div></details>`;
    }
  }

  function renderSnapshotActionTargetsCard() {
    ensureTables();
    const rows = (state.config.snapshotActionTargetsTable || []).map(normalizeSnapshotActionTargetRow);
    state.config.snapshotActionTargetsTable = rows;
    if (ui.snapshotActionsList) {
      if (!rows.length) {
        ui.snapshotActionsList.innerHTML = '<div class="muted">Keine zentralen Snapshot-Aktionen konfiguriert.</div>';
      } else {
        ui.snapshotActionsList.innerHTML = rows.map((r, idx) => {
          const off = r.offValue ? r.offValue : '-';
          const timer = Number(r.durationMs || 0) > 0 ? `${Number(r.durationMs)}ms` : '-';
          return `<div class="sensor-item"><span>${htmlEsc(r.label)}<br><span class="muted">key=${htmlEsc(r.key)} | ${htmlEsc(r.datapointId)} | on=${htmlEsc(r.onValue || 'true')} | off=${htmlEsc(off)} | timer=${htmlEsc(timer)}</span></span><button class="btn danger" data-del-snapshot-action-target="${idx}">Löschen</button></div>`;
        }).join('');
      }
    }
    refreshSnapshotActionTargetOptions(ui.alarmActionSnapshotTarget);
    refreshSnapshotActionTargetOptions(ui.quickAlarmSnapshotTarget);
    refreshSnapshotActionTargetOptions(ui.panicActionSnapshotTarget);
  }

  function renderAlarmActionsCard() {
    ensureTables();
    const gTiming = String(state.config?.alarmActionZoneTriggerTiming || 'after_alarm');
    if (ui.alarmActionGlobalTiming) {
      ui.alarmActionGlobalTiming.value = gTiming === 'immediate' ? 'immediate' : 'after_alarm';
    }
    if (ui.global) {
      const gf = ui.global.querySelector('[data-key="alarmActionZoneTriggerTiming"]');
      if (gf && 'value' in gf) gf.value = gTiming === 'immediate' ? 'immediate' : 'after_alarm';
    }
    renderSnapshotActionTargetsCard();
    refreshCameraLedTargetOptions(ui.alarmActionCameraTarget);
    refreshAlarmActionTriggerEntityOptions();
    updateAlarmActionUiState();
    updatePanicActionUiState();
    renderAlarmActionConflictHint();

    if (ui.alarmCountdownAbortMode) {
      const mode = ['zone_disarmed', 'any_disarm', 'off'].includes(String(state.config?.countdownAbortMode || ''))
        ? String(state.config.countdownAbortMode)
        : 'zone_disarmed';
      ui.alarmCountdownAbortMode.value = mode;
    }
    if (ui.alarmRepeatTelegramEnabled) {
      ui.alarmRepeatTelegramEnabled.value = String(state.config?.alarmRepeatTelegramEnabled === true);
    }
    if (ui.alarmRepeatTelegramIntervalSec) {
      ui.alarmRepeatTelegramIntervalSec.value = String(Math.max(5, Number(state.config?.alarmRepeatTelegramIntervalSec || 60)));
    }
    if (ui.alarmRepeatTelegramText) {
      ui.alarmRepeatTelegramText.value = String(state.config?.alarmRepeatTelegramText || 'Alarm !!!');
    }

    if (ui.alarmActionsList) {
      const rows = (state.config.alarmActionsTable || []).map(normalizeAlarmActionRow);
      if (!rows.length) {
        ui.alarmActionsList.innerHTML = '<div class="muted">Keine Alarm Actions konfiguriert.</div>';
      } else {
        ui.alarmActionsList.innerHTML = rows.map((r, idx) => {
          const msg = [];
          msg.push(`${alarmScenarioLabel(r.scenario)} | ${alarmActionKindLabel(r.actionKind)}`);
          if (r.scenario === 'zone_trigger') {
            const effTiming = r.timing === 'global'
              ? `global:${String(state.config?.alarmActionZoneTriggerTiming || 'after_alarm')}`
              : r.timing;
            msg.push(`zone=${r.zone} | trigger=${alarmTriggerTypeLabel(r.triggerSource)} | armed=${r.armedMode} | timing=${effTiming}`);
          }
          if (r.triggerEntityId) msg.push(`entity=${r.triggerEntityId}`);
          if (r.actionKind === 'datapoint') msg.push(`${r.datapointId} | on=${r.onValue || 'true'} | off=${r.offValue || '-'} | timer=${Number(r.durationMs || 0)}ms`);
          if (r.actionKind === 'telegram') msg.push(`msg="${r.telegramText || ''}"`);
          if (r.actionKind === 'alexa') msg.push(`speak="${r.alexaText || ''}"`);
          if (r.actionKind === 'snapshot') msg.push(`snapshot=${snapshotTargetLabelByKey(r.snapshotTargetKey) || r.snapshotTargetKey || '-'}`);
          if (r.actionKind === 'camera_led') msg.push(`camLED=${r.cameraTargetKey || '-'}`);
          msg.push(`repeat=${Number(r.repeatCount || 1)}x / ${Number(r.repeatIntervalMs || 1000)}ms`);
          const warns = getAlarmActionConflictMessages(r);
          const warnHtml = warns.length ? `<br><span class="muted" style="color:#ffb3b3">${warns.map(htmlEsc).join(' | ')}</span>` : '';
          return `<div class="sensor-item"><span>${htmlEsc(r.label)}<br><span class="muted">${htmlEsc(msg.join(' | '))}</span>${warnHtml}</span><button class="btn danger" data-del-alarm-action="${idx}">Löschen</button></div>`;
        }).join('');
      }
    }

    if (ui.panicActionsList) {
      const rows = (state.config.panicActionsTable || []).map(normalizePanicActionRow);
      if (!rows.length) {
        ui.panicActionsList.innerHTML = '<div class="muted">Keine PANIC Actions konfiguriert.</div>';
      } else {
        ui.panicActionsList.innerHTML = rows.map((r, idx) => {
          const msg = [];
          msg.push(`PANIC ${r.when === 'on' ? 'an' : 'aus'} | ${alarmActionKindLabel(r.actionKind)}`);
          if (r.actionKind === 'datapoint') msg.push(`${r.datapointId} | on=${r.onValue || 'true'} | off=${r.offValue || '-'} | timer=${Number(r.durationMs || 0)}ms`);
          if (r.actionKind === 'telegram') msg.push(`msg="${r.telegramText || ''}"`);
          if (r.actionKind === 'alexa') msg.push(`speak="${r.alexaText || ''}"`);
          if (r.actionKind === 'snapshot') msg.push(`snapshot=${snapshotTargetLabelByKey(r.snapshotTargetKey) || r.snapshotTargetKey || '-'}`);
          if (r.actionKind === 'camera_led') msg.push(`camLED=${r.cameraTargetKey || '-'}`);
          msg.push(`repeat=${Number(r.repeatCount || 1)}x / ${Number(r.repeatIntervalMs || 1000)}ms`);
          return `<div class="sensor-item"><span>${htmlEsc(r.label)}<br><span class="muted">${htmlEsc(msg.join(' | '))}</span></span><button class="btn danger" data-del-panic-action="${idx}">Löschen</button></div>`;
        }).join('');
      }
    }

    renderQuickAlarmActionsCard();
    renderModeFlowCard();
  }

  function renderQuickAlarmActionsCard() {
    ensureTables();
    refreshSnapshotActionTargetOptions(ui.quickAlarmSnapshotTarget);
    refreshCameraLedTargetOptions(ui.quickAlarmCameraTarget);
    refreshQuickAlarmTriggerEntityOptions();
    updateQuickAlarmActionUiState();

    if (!ui.quickAlarmActionsList) return;
    const rows = (state.config.alarmActionsTable || []).map(normalizeAlarmActionRow);
    if (!rows.length) {
      ui.quickAlarmActionsList.innerHTML = '<div class="muted">Keine Alarm Actions konfiguriert.</div>';
      return;
    }
    ui.quickAlarmActionsList.innerHTML = rows.map((r, idx) => {
      const header = `${alarmScenarioLabel(r.scenario)} | ${alarmActionKindLabel(r.actionKind)}`;
      const info = [];
      if (r.scenario === 'zone_trigger') {
        info.push(`zone=${r.zone}`);
        info.push(`trigger=${alarmTriggerTypeLabel(r.triggerSource)}`);
        if (r.triggerEntityId) info.push(`entity=${r.triggerEntityId}`);
        info.push(`armed=${r.armedMode}`);
      }
      if (r.actionKind === 'datapoint') info.push(`${r.datapointId} → ${r.onValue || 'true'}`);
      if (r.actionKind === 'telegram') info.push(`msg="${r.telegramText || ''}"`);
      if (r.actionKind === 'alexa') info.push(`speak="${r.alexaText || ''}"`);
      if (r.actionKind === 'snapshot') info.push(`snapshot=${snapshotTargetLabelByKey(r.snapshotTargetKey) || r.snapshotTargetKey || '-'}`);
      if (r.actionKind === 'camera_led') info.push(`camLED=${r.cameraTargetKey || '-'}`);
      info.push(`repeat=${Number(r.repeatCount || 1)}x/${Number(r.repeatIntervalMs || 1000)}ms`);
      const createdByAssistant = String(r.key || '').startsWith('quick_alarm_');
      const tag = createdByAssistant ? '<span class="status-chip disarmed">Assistent</span>' : '';
      return `<div class="sensor-item"><span>${htmlEsc(r.label)} ${tag}<br><span class="muted">${htmlEsc(header)} | ${htmlEsc(info.join(' | '))}</span></span><button class="btn danger" data-del-quick-alarm-action="${idx}">Löschen</button></div>`;
    }).join('');
  }

  function getModeFlowSourceItems() {
    ensureTables();
    const rows = [];
    const push = (kind, sourceId, label, zone) => {
      const id = String(sourceId || '').trim();
      if (!id) return;
      const z = ['perimeter', 'aussenhaut', 'innenraum'].includes(String(zone || '')) ? String(zone) : 'perimeter';
      rows.push({
        token: `${kind}:${id}`,
        kind,
        sourceId: id,
        label: String(label || id).trim(),
        zone: z
      });
    };
    (state.config.pirSensorsTable || []).forEach(r => push('sensor', r.id, r.label || r.key || r.id, r.zone));
    (state.config.contactSensorsTable || []).forEach(r => push('sensor', r.id, r.label || r.key || r.id, r.zone));
    (state.config.personDetectionTable || []).forEach(r => push('personDetection', r.id, r.label || r.key || r.id, r.zone));
    (state.config.camerasTable || []).forEach(r => push('camera', r.personDetectionDp, r.label || r.key || r.personDetectionDp, r.zone));
    const zoneOrder = { perimeter: 0, aussenhaut: 1, innenraum: 2 };
    rows.sort((a, b) => {
      const za = zoneOrder[a.zone] ?? 9;
      const zb = zoneOrder[b.zone] ?? 9;
      if (za !== zb) return za - zb;
      const ka = modeFlowSourceKindLabel(a.kind);
      const kb = modeFlowSourceKindLabel(b.kind);
      if (ka !== kb) return ka.localeCompare(kb, 'de');
      return String(a.label || '').localeCompare(String(b.label || ''), 'de');
    });
    return rows;
  }

  function renderModeFlowSourceList() {
    if (!ui.modeFlowSourceList) return;
    const q = String(ui.modeFlowSourceSearch?.value || '').trim().toLowerCase();
    const rows = state.modeFlowSourceItems || [];
    const filtered = q.length < 2
      ? rows
      : rows.filter(r => `${r.label} ${r.sourceId} ${r.zone} ${r.kind}`.toLowerCase().includes(q));
    if (!filtered.length) {
      ui.modeFlowSourceList.innerHTML = '<div class="muted">Keine passenden Trigger-Elemente.</div>';
      return;
    }
    ui.modeFlowSourceList.innerHTML = filtered.map(r => {
      const checked = state.modeFlowSelectedSources.has(r.token) ? 'checked' : '';
      return `<label class="mode-flow-source-item"><input type="checkbox" data-mode-flow-source="${htmlEsc(r.token)}" ${checked} /><span>${htmlEsc(r.label)}<span class="meta">${htmlEsc(`${modeFlowSourceKindLabel(r.kind)} | ${r.zone} | ${r.sourceId}`)}</span></span></label>`;
    }).join('');
  }

  function modeFlowActionSummary(row) {
    const tags = [];
    if (row.announceBefore) tags.push(`announce ${Number(row.announceDelaySec || 0)}s`);
    tags.push(modeFlowLevelLabel(row.alarmLevel));
    if (row.actionSnapshotTriggerCamera) tags.push('Snapshot(trigger-cam)');
    if (row.actionCameraAlarmTriggerCamera) tags.push('CamAlarm(trigger-cam)');
    if (row.actionCameraLedTriggerCamera) tags.push('CamLED(trigger-cam)');
    if (row.actionCameraAlarmAll) tags.push('CamAlarm(all)');
    if (row.actionCameraLedAll) tags.push('CamLED(all)');
    if (row.actionAlexaSpeak) tags.push(`Alexa="${row.actionAlexaText || ''}"`);
    return tags.join(' | ');
  }

  function renderModeFlowCard() {
    ensureTables();
    state.modeFlowSourceItems = getModeFlowSourceItems();
    const validTokens = new Set(state.modeFlowSourceItems.map(x => x.token));
    state.modeFlowSelectedSources = new Set(Array.from(state.modeFlowSelectedSources || []).filter(x => validTokens.has(x)));

    if (ui.modeFlowAnnounceCommandId) ui.modeFlowAnnounceCommandId.value = String(state.config.modeFlowAnnounceCommandId || `${state.instanceId}.commands.announceAlarm`);
    if (ui.modeFlowPerimeterCommandId) ui.modeFlowPerimeterCommandId.value = String(state.config.modeFlowPerimeterAlarmCommandId || `${state.instanceId}.commands.activatePerimeterAlarm`);
    if (ui.modeFlowInteriorCommandId) ui.modeFlowInteriorCommandId.value = String(state.config.modeFlowInteriorAlarmCommandId || `${state.instanceId}.commands.activateInteriorAlarm`);
    if (ui.modeFlowFullCommandId) ui.modeFlowFullCommandId.value = String(state.config.modeFlowFullAlarmCommandId || `${state.instanceId}.commands.activateFullAlarm`);
    if (ui.modeFlowTelegramPerimeterText) ui.modeFlowTelegramPerimeterText.value = String(state.config.modeFlowTelegramPerimeterText || '');
    if (ui.modeFlowTelegramInteriorText) ui.modeFlowTelegramInteriorText.value = String(state.config.modeFlowTelegramInteriorText || '');
    if (ui.modeFlowTelegramFullText) ui.modeFlowTelegramFullText.value = String(state.config.modeFlowTelegramFullText || '');
    if (ui.modeFlowAutoPerimeterAfterSunsetEnabled) ui.modeFlowAutoPerimeterAfterSunsetEnabled.value = String(state.config.modeFlowAutoPerimeterAfterSunsetEnabled === true);
    if (ui.modeFlowAutoAwayMode) ui.modeFlowAutoAwayMode.value = ['legacy', 'off', 'perimeter', 'vollschutz'].includes(String(state.config.modeFlowAutoAwayMode || '')) ? String(state.config.modeFlowAutoAwayMode) : 'legacy';
    if (ui.modeFlowAutoAwayDelaySec) ui.modeFlowAutoAwayDelaySec.value = String(Math.max(0, Number(state.config.modeFlowAutoAwayDelaySec || state.config.autoArmDelaySec || 60)));

    renderModeFlowSourceList();
    if (!ui.modeFlowRulesList) return;
    const rows = (state.config.modeFlowRulesTable || []).map(normalizeModeFlowRuleRow).filter(r => r.sourceId);
    state.config.modeFlowRulesTable = rows;
    if (!rows.length) {
      ui.modeFlowRulesList.innerHTML = '<div class="muted">Keine Modus-Flow-Regeln konfiguriert.</div>';
      return;
    }
    ui.modeFlowRulesList.innerHTML = rows.map((r, idx) => {
      return `<div class="sensor-item"><span>${htmlEsc(r.label)}<br><span class="muted">${htmlEsc(`${modeFlowModeLabel(r.mode)} | ${modeFlowSourceKindLabel(r.sourceKind)} | ${r.sourceLabel} | ${r.sourceZone} | ${modeFlowActionSummary(r)}`)}</span></span><button class="btn danger" data-del-mode-flow-rule="${idx}">Löschen</button></div>`;
    }).join('');
  }

  function addModeFlowRulesFromSelection() {
    ensureTables();
    const selected = Array.from(state.modeFlowSelectedSources || []);
    if (!selected.length) {
      setStatus('ModeFlow: Bitte mindestens ein Trigger-Element auswählen', true);
      if (ui.modeFlowRuleResult) ui.modeFlowRuleResult.textContent = 'Keine Trigger ausgewählt';
      return;
    }
    const byToken = new Map((state.modeFlowSourceItems || []).map(x => [x.token, x]));
    const mode = String(ui.modeFlowModeSelect?.value || 'perimeter');
    const alarmLevel = String(ui.modeFlowAlarmLevel?.value || 'perimeter_alarm');
    const announceBefore = String(ui.modeFlowAnnounceBefore?.value || 'false') === 'true';
    const announceDelaySec = Math.max(0, Number(ui.modeFlowAnnounceDelaySec?.value || 0));
    const baseLabel = String(ui.modeFlowRuleLabel?.value || '').trim();
    const actions = {
      actionSnapshotTriggerCamera: !!ui.modeFlowActionSnapshotTriggerCamera?.checked,
      actionCameraAlarmTriggerCamera: !!ui.modeFlowActionCameraAlarmTriggerCamera?.checked,
      actionCameraLedTriggerCamera: !!ui.modeFlowActionCameraLedTriggerCamera?.checked,
      actionCameraAlarmAll: !!ui.modeFlowActionCameraAlarmAll?.checked,
      actionCameraLedAll: !!ui.modeFlowActionCameraLedAll?.checked,
      actionAlexaSpeak: !!ui.modeFlowActionAlexaSpeak?.checked,
      actionAlexaText: String(ui.modeFlowActionAlexaText?.value || '').trim()
    };
    let added = 0;
    for (const token of selected) {
      const src = byToken.get(token);
      if (!src) continue;
      const label = baseLabel || `${modeFlowModeLabel(mode)} -> ${src.label}`;
      const row = normalizeModeFlowRuleRow({
        key: `modeflow_${Date.now()}_${src.kind}_${added + 1}`,
        label,
        enabled: true,
        mode,
        sourceKind: src.kind,
        sourceId: src.sourceId,
        sourceLabel: src.label,
        sourceZone: src.zone,
        alarmLevel,
        announceBefore,
        announceDelaySec,
        ...actions
      });
      state.config.modeFlowRulesTable.push(row);
      added += 1;
    }
    renderModeFlowCard();
    if (ui.modeFlowRuleResult) ui.modeFlowRuleResult.textContent = `Hinzugefügt: ${added} Regel(n)`;
  }

  function normalizeTelegramInstanceRow(row) {
    return {
      instance: String(row?.instance || '').trim(),
      token: String(row?.token || '').trim()
    };
  }

  function normalizeTelegramTargetRow(row) {
    return {
      instance: String(row?.instance || '').trim(),
      chatId: String(row?.chatId || '').trim()
    };
  }

  function renderTelegramConfigCard() {
    ensureTables();
    if (!ui.telegramInstancesList || !ui.telegramTargetsList) return;
    const instances = (state.config.telegramInstancesTable || []).map(normalizeTelegramInstanceRow);
    const targets = (state.config.telegramTargetsTable || []).map(normalizeTelegramTargetRow);
    if (instances.length === 0) {
      ui.telegramInstancesList.innerHTML = '<div class="muted">Keine Telegram-Instanz eingetragen.</div>';
    } else {
      ui.telegramInstancesList.innerHTML = instances.map((r, idx) => `
        <div class="sensor-item telegram-row">
          <label>Instance<input type="text" data-telegram-instance-field="instance" data-telegram-instance-idx="${idx}" value="${r.instance}" placeholder="telegram.0" /></label>
          <label>Token (optional)<input type="text" data-telegram-instance-field="token" data-telegram-instance-idx="${idx}" value="${r.token}" placeholder="nur falls benötigt" /></label>
          <button class="btn danger" data-del-telegram-instance="${idx}">Löschen</button>
        </div>
      `).join('');
    }
    if (targets.length === 0) {
      ui.telegramTargetsList.innerHTML = '<div class="muted">Keine Chat-IDs eingetragen.</div>';
    } else {
      ui.telegramTargetsList.innerHTML = targets.map((r, idx) => `
        <div class="sensor-item telegram-row">
          <label>Instance<input type="text" data-telegram-target-field="instance" data-telegram-target-idx="${idx}" value="${r.instance}" placeholder="telegram.0" /></label>
          <label>Chat ID<input type="text" data-telegram-target-field="chatId" data-telegram-target-idx="${idx}" value="${r.chatId}" placeholder="123456789 oder -100..." /></label>
          <button class="btn danger" data-del-telegram-target="${idx}">Löschen</button>
        </div>
      `).join('');
    }
    if (ui.telegramConfigInfo) {
      ui.telegramConfigInfo.textContent = `${instances.length} Instanz(en), ${targets.length} Target(s) konfiguriert. Änderungen gelten nach „In Instanz speichern“.`;
    }
  }

  async function triggerTelegramTest(kind) {
    const cmdByKind = {
      text: 'commands.telegramTestText',
      photo: 'commands.telegramTestPhoto',
      photoCaption: 'commands.telegramTestPhotoCaption'
    };
    const key = cmdByKind[kind];
    if (!key) return;
    const id = `${state.instanceId}.${key}`;
    await setState(id, true);
    const labelByKind = {
      text: 'Test Nachricht',
      photo: 'Test Bild ohne Caption',
      photoCaption: 'Test Bild mit Caption'
    };
    const label = labelByKind[kind] || 'Telegram Test';
    setStatus(`Telegram: ${label} ausgelöst`);
    showToast(`Telegram: ${label}`);
  }

  function addZoneAction() {
    ensureTables();
    const zone = String(($('zoneActionZone').value || 'perimeter')).trim();
    const key = String(($('zoneActionKey').value || '').trim());
    const label = String(($('zoneActionLabel').value || '').trim());
    const datapointId = String(($('zoneActionId').value || '').trim());
    const onValueRaw = String(($('zoneActionOnValue').value || '').trim() || 'true');
    const offValueRaw = String(($('zoneActionOffValue').value || '').trim());
    const pulseMsRaw = Number($('zoneActionPulseMs').value || 0);
    if (!datapointId) {
      setStatus('Aktor-Datapoint ID fehlt', true);
      if (ui.zoneActionResult) ui.zoneActionResult.textContent = 'Datapoint ID fehlt';
      return;
    }
    const row = {
      key: key || datapointId,
      label: label || key || datapointId,
      zone: ['perimeter', 'aussenhaut', 'innenraum'].includes(zone) ? zone : 'perimeter',
      datapointId,
      onValue: onValueRaw,
      offValue: offValueRaw || '',
      pulseMs: Number.isFinite(pulseMsRaw) && pulseMsRaw > 0 ? Math.round(pulseMsRaw) : 0
    };
    state.config.zoneActionsTable.push(row);
    renderZoneActions();
    if (ui.zoneActionResult) ui.zoneActionResult.textContent = `Hinzugefügt: ${row.label}`;
  }

  function addSnapshotActionTarget() {
    ensureTables();
    const datapointId = String(ui.snapshotActionDatapointId?.value || '').trim();
    if (!datapointId) {
      setStatus('Snapshot Aktion: Datapoint ID fehlt', true);
      if (ui.snapshotActionResult) ui.snapshotActionResult.textContent = 'Datapoint ID fehlt';
      return;
    }
    const keyRaw = String(ui.snapshotActionKey?.value || '').trim();
    const key = keyRaw || datapointId;
    const exists = (state.config.snapshotActionTargetsTable || [])
      .map(normalizeSnapshotActionTargetRow)
      .some(r => String(r.key || '').trim() === key);
    if (exists) {
      setStatus(`Snapshot Aktion: Key bereits vorhanden (${key})`, true);
      if (ui.snapshotActionResult) ui.snapshotActionResult.textContent = `Key bereits vorhanden: ${key}`;
      return;
    }
    const row = normalizeSnapshotActionTargetRow({
      key,
      label: String(ui.snapshotActionLabel?.value || '').trim() || key,
      datapointId,
      onValue: String(ui.snapshotActionOnValue?.value || '').trim() || 'true',
      offValue: String(ui.snapshotActionOffValue?.value || '').trim(),
      durationMs: Math.max(0, Number(ui.snapshotActionDurationMs?.value || 0))
    });
    state.config.snapshotActionTargetsTable.push(row);
    renderSnapshotActionTargetsCard();
    if (ui.snapshotActionResult) ui.snapshotActionResult.textContent = `Hinzugefügt: ${row.label}`;
  }

  function addAlarmAction() {
    ensureTables();
    const scenario = String(ui.alarmActionScenario?.value || 'zone_trigger');
    const triggerSource = String(ui.alarmActionTriggerType?.value || 'any');
    const actionKinds = getSelectedAlarmKinds();
    const datapointId = String(ui.alarmActionDatapointId?.value || '').trim();
    const snapshotTargetKey = String(ui.alarmActionSnapshotTarget?.value || '').trim();
    const cameraTargetKey = String(ui.alarmActionCameraTarget?.value || '').trim();
    if (!actionKinds.length) {
      setStatus('Alarm Action: Bitte mindestens eine Aktion auswählen', true);
      if (ui.alarmActionResult) ui.alarmActionResult.textContent = 'Mindestens eine Aktion auswählen';
      return;
    }
    if (actionKinds.includes('datapoint') && !datapointId) {
      setStatus('Alarm Action: Datapoint ID fehlt', true);
      if (ui.alarmActionResult) ui.alarmActionResult.textContent = 'Datapoint ID fehlt';
      return;
    }
    if (actionKinds.includes('snapshot') && !snapshotTargetKey) {
      setStatus('Alarm Action: Snapshot Aktion auswählen', true);
      if (ui.alarmActionResult) ui.alarmActionResult.textContent = 'Snapshot Aktion fehlt';
      return;
    }
    if (actionKinds.includes('camera_led') && !cameraTargetKey) {
      setStatus('Alarm Action: Kamera LED Ziel auswählen', true);
      if (ui.alarmActionResult) ui.alarmActionResult.textContent = 'Kamera LED Ziel fehlt';
      return;
    }
    const base = {
      scenario,
      zone: String(ui.alarmActionZone?.value || 'any'),
      triggerSource,
      triggerEntityId: String(ui.alarmActionTriggerEntity?.value || '').trim(),
      armedMode: String(ui.alarmActionArmedMode?.value || 'any'),
      timing: String(ui.alarmActionTiming?.value || 'global'),
      onValue: String(ui.alarmActionOnValue?.value || '').trim() || 'true',
      offValue: String(ui.alarmActionOffValue?.value || '').trim(),
      durationMs: Math.max(0, Number(ui.alarmActionDurationMs?.value || 0)),
      repeatCount: Math.max(1, Number(ui.alarmActionRepeatCount?.value || 1)),
      repeatIntervalMs: Math.max(0, Number(ui.alarmActionRepeatIntervalMs?.value || 1000)),
      telegramText: String(ui.alarmActionTelegramText?.value || '').trim(),
      alexaText: String(ui.alarmActionAlexaText?.value || '').trim(),
      snapshotTargetKey,
      cameraTargetKey
    };
    actionKinds.forEach((kind, idx) => {
      const row = normalizeAlarmActionRow({
        key: `alarm_${Date.now()}_${kind}_${idx + 1}`,
        label: `${alarmScenarioLabel(scenario)} ${alarmActionKindLabel(kind)}`,
        ...base,
        actionKind: kind,
        datapointId: kind === 'datapoint' ? datapointId : '',
        telegramText: kind === 'telegram' ? base.telegramText : '',
        alexaText: kind === 'alexa' ? base.alexaText : '',
        snapshotTargetKey: kind === 'snapshot' ? base.snapshotTargetKey : '',
        cameraTargetKey: kind === 'camera_led' ? base.cameraTargetKey : ''
      });
      state.config.alarmActionsTable.push(row);
    });
    renderAlarmActionsCard();
    if (ui.alarmActionResult) ui.alarmActionResult.textContent = `Hinzugefügt: ${actionKinds.length} Aktion(en)`;
  }

  function addQuickAlarmAction() {
    ensureTables();
    const scenario = String(ui.quickAlarmScenario?.value || 'zone_trigger');
    const actionKinds = getSelectedQuickAlarmKinds();
    const triggerSource = String(ui.quickAlarmTriggerType?.value || 'any');
    const datapointId = String(ui.quickAlarmDatapointId?.value || '').trim();
    const snapshotTargetKey = String(ui.quickAlarmSnapshotTarget?.value || '').trim();
    const cameraTargetKey = String(ui.quickAlarmCameraTarget?.value || '').trim();
    const customLabel = String(ui.quickAlarmLabel?.value || '').trim();

    if (!actionKinds.length) {
      setStatus('Assistent: Bitte mindestens eine Aktion auswählen', true);
      if (ui.quickAlarmActionResult) ui.quickAlarmActionResult.textContent = 'Mindestens eine Aktion auswählen';
      return;
    }
    if (actionKinds.includes('datapoint') && !datapointId) {
      setStatus('Assistent: Datapoint ID fehlt', true);
      if (ui.quickAlarmActionResult) ui.quickAlarmActionResult.textContent = 'Datapoint ID fehlt';
      return;
    }
    if (actionKinds.includes('snapshot') && !snapshotTargetKey) {
      setStatus('Assistent: Snapshot Aktion auswählen', true);
      if (ui.quickAlarmActionResult) ui.quickAlarmActionResult.textContent = 'Snapshot Aktion fehlt';
      return;
    }
    if (actionKinds.includes('camera_led') && !cameraTargetKey) {
      setStatus('Assistent: Kamera LED Ziel auswählen', true);
      if (ui.quickAlarmActionResult) ui.quickAlarmActionResult.textContent = 'Kamera LED Ziel fehlt';
      return;
    }

    const base = {
      scenario,
      zone: String(ui.quickAlarmZone?.value || 'any'),
      triggerSource,
      triggerEntityId: String(ui.quickAlarmTriggerEntity?.value || '').trim(),
      armedMode: String(ui.quickAlarmArmedMode?.value || 'any'),
      timing: String(ui.quickAlarmTiming?.value || 'global'),
      onValue: String(ui.quickAlarmOnValue?.value || '').trim() || 'true',
      offValue: String(ui.quickAlarmOffValue?.value || '').trim(),
      durationMs: Math.max(0, Number(ui.quickAlarmDurationMs?.value || 0)),
      repeatCount: Math.max(1, Number(ui.quickAlarmRepeatCount?.value || 1)),
      repeatIntervalMs: Math.max(0, Number(ui.quickAlarmRepeatIntervalMs?.value || 1000)),
      telegramText: String(ui.quickAlarmTelegramText?.value || '').trim(),
      alexaText: String(ui.quickAlarmAlexaText?.value || '').trim(),
      snapshotTargetKey,
      cameraTargetKey
    };
    actionKinds.forEach((kind, idx) => {
      const label = customLabel || `${alarmScenarioLabel(scenario)} ${alarmActionKindLabel(kind)} (Assistent)`;
      const row = normalizeAlarmActionRow({
        key: `quick_alarm_${Date.now()}_${kind}_${idx + 1}`,
        label,
        ...base,
        actionKind: kind,
        datapointId: kind === 'datapoint' ? datapointId : '',
        telegramText: kind === 'telegram' ? base.telegramText : '',
        alexaText: kind === 'alexa' ? base.alexaText : '',
        snapshotTargetKey: kind === 'snapshot' ? base.snapshotTargetKey : '',
        cameraTargetKey: kind === 'camera_led' ? base.cameraTargetKey : ''
      });
      state.config.alarmActionsTable.push(row);
    });
    renderAlarmActionsCard();
    if (ui.quickAlarmActionResult) ui.quickAlarmActionResult.textContent = `Hinzugefügt: ${actionKinds.length} Aktion(en)`;
  }

  function addPanicAction() {
    ensureTables();
    const actionKinds = getSelectedPanicKinds();
    const datapointId = String(ui.panicActionDatapointId?.value || '').trim();
    const snapshotTargetKey = String(ui.panicActionSnapshotTarget?.value || '').trim();
    if (!actionKinds.length) {
      setStatus('PANIC Action: Bitte mindestens eine Aktion auswählen', true);
      if (ui.panicActionResult) ui.panicActionResult.textContent = 'Mindestens eine Aktion auswählen';
      return;
    }
    if (actionKinds.includes('datapoint') && !datapointId) {
      setStatus('PANIC Action: Datapoint ID fehlt', true);
      if (ui.panicActionResult) ui.panicActionResult.textContent = 'Datapoint ID fehlt';
      return;
    }
    if (actionKinds.includes('snapshot') && !snapshotTargetKey) {
      setStatus('PANIC Action: Snapshot Aktion auswählen', true);
      if (ui.panicActionResult) ui.panicActionResult.textContent = 'Snapshot Aktion fehlt';
      return;
    }
    const when = String(ui.panicActionWhen?.value || 'on');
    const base = {
      when,
      onValue: String(ui.panicActionOnValue?.value || '').trim() || 'true',
      offValue: String(ui.panicActionOffValue?.value || '').trim(),
      durationMs: Math.max(0, Number(ui.panicActionDurationMs?.value || 0)),
      repeatCount: Math.max(1, Number(ui.panicActionRepeatCount?.value || 1)),
      repeatIntervalMs: Math.max(0, Number(ui.panicActionRepeatIntervalMs?.value || 1000)),
      telegramText: String(ui.panicActionTelegramText?.value || '').trim(),
      alexaText: String(ui.panicActionAlexaText?.value || '').trim(),
      snapshotTargetKey
    };
    actionKinds.forEach((kind, idx) => {
      const row = normalizePanicActionRow({
        key: `panic_${Date.now()}_${kind}_${idx + 1}`,
        label: `PANIC ${when === 'off' ? 'aus' : 'an'} ${alarmActionKindLabel(kind)}`,
        ...base,
        actionKind: kind,
        datapointId: kind === 'datapoint' ? datapointId : '',
        telegramText: kind === 'telegram' ? base.telegramText : '',
        alexaText: kind === 'alexa' ? base.alexaText : '',
        snapshotTargetKey: kind === 'snapshot' ? base.snapshotTargetKey : ''
      });
      state.config.panicActionsTable.push(row);
    });
    renderAlarmActionsCard();
    if (ui.panicActionResult) ui.panicActionResult.textContent = `Hinzugefügt: ${actionKinds.length} Aktion(en)`;
  }

  function addNewEntity() {
    ensureTables();
    const kind = $('newType').value;
    const key = ($('newKey').value || '').trim();
    const label = ($('newLabel').value || '').trim();
    const id = ($('newId').value || '').trim();
    const active = ($('newActive').value || '').trim();
    const mode = $('newMode').value;
    const detect = ($('newDetect').value || '').trim();
    if (!id) { setStatus('Datapoint ID ist Pflicht', true); ui.addResult.textContent = 'Datapoint ID fehlt'; return; }
    const base = { key: key || id, label: label || key || id, id, zone: 'pool', floor: state.currentFloor };
    if (kind === 'personDetectionTable') state.config[kind].push({ ...base, mode, detectValue: mode === 'string' ? (detect || 'human detected') : '' });
    else state.config[kind].push({ ...base, activeValuesCsv: active || 'true' });
    ensureEntityHealthFields(state.config[kind][state.config[kind].length - 1]);
    ensureEntitySnapshotFields(state.config[kind][state.config[kind].length - 1]);
    renderAllCanvases();
    ui.addResult.textContent = `Hinzugefügt: ${base.label}`;
  }

  function openObjectBrowser(targetInput) {
    state.objectTarget = targetInput;
    ui.objectModal.classList.remove('hidden');
    ui.objectModal.style.zIndex = '70';
    const initial = String(targetInput.value || '').trim();
    state.objectTreeSelectedId = initial;
    ui.objectSearch.value = initial;
    ui.objectResults.innerHTML = '<div class="muted">Lade Objekte…</div>';
    if (ui.objectTree) ui.objectTree.innerHTML = '<div class="muted">Lade Objektbaum…</div>';
    void ensureStateIdsLoaded().then(() => {
      if (initial) expandTreePathForId(initial);
      renderObjectResults();
      renderObjectTree();
    });
    ui.objectSearch.focus();
  }

  function closeObjectBrowser() {
    ui.objectModal.classList.add('hidden');
    ui.objectModal.style.zIndex = '';
    state.objectTarget = null;
  }

  function applyObjectBrowserSelection(id) {
    const chosen = String(id || '').trim();
    if (!chosen || !state.objectTarget) return;
    state.objectTreeSelectedId = chosen;
    state.objectTarget.value = chosen;
    closeObjectBrowser();
  }

  function renderObjectResults() {
    const q = String(ui.objectSearch.value || '').toLowerCase().trim();
    if (q.length < 2) { ui.objectResults.innerHTML = '<div class="muted">Bitte mindestens 2 Zeichen eingeben.</div>'; return; }
    const list = state.stateIds.filter(id => id.toLowerCase().includes(q)).slice(0, 300);
    ui.objectResults.innerHTML = list.map(id => `<div class="object-item" data-id="${htmlEsc(id)}">${htmlEsc(id)}</div>`).join('') || '<div class="muted">Keine Treffer</div>';
  }

  function renderObjectTree() {
    if (!ui.objectTree) return;
    const root = state.objectTreeRoot;
    if (!root || !Array.isArray(root.children) || root.children.length === 0) {
      ui.objectTree.innerHTML = '<div class="muted">Keine Objekte verfügbar.</div>';
      return;
    }
    const rows = [];
    const walk = (nodes, depth) => {
      for (const node of (nodes || [])) {
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        const expanded = hasChildren && state.objectTreeExpanded.has(node.path);
        const isLeaf = !!node.leafId;
        const selected = isLeaf && String(node.leafId) === String(state.objectTreeSelectedId || '');
        const toggleHtml = hasChildren
          ? `<button class="object-tree-toggle" type="button" data-tree-toggle="${htmlEsc(node.path)}">${expanded ? '▾' : '▸'}</button>`
          : `<span class="object-tree-toggle" aria-hidden="true">•</span>`;
        rows.push(
          `<div class="object-tree-item${isLeaf ? ' leaf' : ''}${selected ? ' selected' : ''}" data-tree-path="${htmlEsc(node.path)}" data-tree-leaf="${htmlEsc(node.leafId || '')}" style="--depth:${depth}">`
          + toggleHtml
          + `<button class="object-tree-label" type="button" data-tree-node="${htmlEsc(node.path)}">${htmlEsc(node.name)}</button>`
          + `</div>`
        );
        if (hasChildren && expanded) walk(node.children, depth + 1);
      }
    };
    walk(root.children, 0);
    ui.objectTree.innerHTML = rows.join('');
  }

  function toggleObjectTreePath(path) {
    const p = String(path || '').trim();
    if (!p) return;
    if (state.objectTreeExpanded.has(p)) state.objectTreeExpanded.delete(p);
    else state.objectTreeExpanded.add(p);
    renderObjectTree();
  }

  async function manualControl(which) {
    const pulse = async id => {
      if (!id) return;
      await setState(id, true);
      setTimeout(() => { void setState(id, false); }, 400);
    };
    if (which === 'armAlarm') await setState(state.config.armStateId, true);
    if (which === 'disarmAlarm') await setState(state.config.armStateId, false);
    if (which === 'armHull') await setState(getHullProtectionId(), true);
    if (which === 'disarmHull') await setState(getHullProtectionId(), false);
    if (which === 'armPerimeter') await setState(state.config.perimeterStateId, true);
    if (which === 'disarmPerimeter') await setState(state.config.perimeterStateId, false);
    if (which === 'armCameras') {
      const ids = JSON.parse(state.config.cameraAlarmOnIdsJson || '[]');
      for (const id of ids) await pulse(id);
      await setState(`${state.instanceId}.commands.armCameras`, true);
    }
    if (which === 'disarmCameras') {
      const ids = JSON.parse(state.config.cameraAlarmOffIdsJson || '[]');
      for (const id of ids) await pulse(id);
      await setState(`${state.instanceId}.commands.disarmCameras`, true);
    }
    setStatus('Manuelle Aktion ausgeführt');
  }

  function renderPinDots() {
    if (!ui.pinDots) return;
    const dots = Array.from(ui.pinDots.querySelectorAll('.pin-dot'));
    dots.forEach((d, i) => d.classList.toggle('filled', i < state.pinInput.length));
  }

  function closePinModal() {
    state.pinInput = '';
    state.pinTargetAction = null;
    renderPinDots();
    if (ui.pinHint) ui.pinHint.textContent = 'PIN: 4-stellig';
    ui.pinModal.classList.add('hidden');
  }

  function openPinModal(action) {
    state.pinTargetAction = action;
    state.pinInput = '';
    renderPinDots();
    if (ui.pinHint) ui.pinHint.textContent = 'PIN: 4-stellig';
    ui.pinModal.classList.remove('hidden');
  }

  async function onPinDigit(d) {
    if (!/^\d$/.test(String(d))) return;
    if (state.pinInput.length >= 4) return;
    state.pinInput += String(d);
    renderPinDots();
    if (state.pinInput.length < 4) return;
    if (state.pinInput !== DISARM_PIN) {
      if (ui.pinHint) ui.pinHint.textContent = 'Falsche PIN';
      state.pinInput = '';
      renderPinDots();
      return;
    }
    const action = state.pinTargetAction;
    closePinModal();
    if (!action) return;
    await manualControl(action);
  }

  async function loadTriggerLogForDate(day) {
    if (!day) return;
    const base = `${state.instanceId}.diagnostics`;
    await setState(`${base}.triggerLogDate`, day);
    await new Promise(r => setTimeout(r, 200));
    const st = await getState(`${base}.triggerLogText`);
    ui.logView.textContent = st?.val ? String(st.val) : `Keine Trigger-Logs für ${day}`;
  }

  function paintChip(el, armed) {
    if (!el) return;
    el.classList.remove('armed','armed-perimeter','disarmed');
    el.classList.add(armed ? 'armed' : 'disarmed');
  }

  function setControlPair(onBtn, offBtn, isOn) {
    if (!onBtn || !offBtn) return;
    onBtn.classList.remove('state-on', 'state-off');
    offBtn.classList.remove('state-on', 'state-off');
    if (isOn) onBtn.classList.add('state-on');
    else offBtn.classList.add('state-off');
  }

  function setToggleButton(btn, label, isOn) {
    if (!btn) return;
    btn.textContent = `${label} ${isOn ? 'on' : 'off'}`;
    btn.classList.toggle('toggle-on', !!isOn);
    btn.classList.toggle('toggle-off', !isOn);
  }

  function floorNorm(v) {
    return String(v || 'EG').toUpperCase() === 'OG' ? 'OG' : 'EG';
  }

  function doorSensorIsOpen(row, val) {
    const raw = String(val ?? '').trim().toLowerCase();
    const csv = String(row?.activeValuesCsv || '').trim().toLowerCase();
    if (csv) {
      const vals = csv.split(',').map(x => x.trim()).filter(Boolean);
      if (vals.length > 0) return vals.includes(raw);
    }
    return asArmed(val);
  }

  async function refreshFloorDoorStatus() {
    const rows = Array.isArray(state.config?.contactSensorsTable) ? state.config.contactSensorsTable : [];
    const openByFloor = { EG: false, OG: false };
    for (const row of rows) {
      const id = String(row?.id || '').trim();
      if (!id) continue;
      const st = await getState(id);
      if (!doorSensorIsOpen(row, st?.val)) continue;
      const floor = floorNorm(row?.floor);
      openByFloor[floor] = true;
    }
    return openByFloor;
  }

  function applyFloorButtonState(btn, isSelected, hasOpenDoor) {
    if (!btn) return;
    btn.classList.remove('primary', 'ghost');
    btn.classList.add('floor-btn');
    btn.classList.toggle('floor-btn-selected', !!isSelected);
    btn.classList.toggle('floor-btn-safe', !hasOpenDoor);
    btn.classList.toggle('floor-btn-open', !!hasOpenDoor);
  }

  async function updateFloorButtons() {
    const openByFloor = await refreshFloorDoorStatus();
    applyFloorButtonState(ui.floorEgBtn, state.currentFloor === 'EG', !!openByFloor.EG);
    applyFloorButtonState(ui.floorOgBtn, state.currentFloor === 'OG', !!openByFloor.OG);
  }

  function updateOverviewShowSensorsButton() {
    const btn = ui.overviewShowSensorsBtn;
    if (!btn) return;
    const on = !!state.overviewShowSensors;
    btn.textContent = `Show sensors: ${on ? 'on' : 'off'}`;
    btn.classList.toggle('primary', on);
    btn.classList.toggle('ghost', !on);
  }

  const OVERVIEW_LAYOUTS = [
    { key: 'focus', className: 'overview-layout-focus', label: 'Layout: Fokus' },
    { key: 'sidebar', className: 'overview-layout-sidebar', label: 'Layout: Sidebar' },
    { key: 'floating', className: 'overview-layout-floating', label: 'Layout: Floating' }
  ];
  const OVERVIEW_LAYOUT_STORAGE_KEY = 'alarmsystem.overviewLayoutMode';

  function normalizeOverviewLayoutKey(raw) {
    const key = String(raw || '').trim().toLowerCase();
    if (OVERVIEW_LAYOUTS.some(x => x.key === key)) return key;
    return 'focus';
  }

  function currentOverviewLayoutKey() {
    const cur = document.body.getAttribute('data-overview-layout');
    return normalizeOverviewLayoutKey(cur);
  }

  function applyOverviewLayout(key, persist = true) {
    const resolved = normalizeOverviewLayoutKey(key);
    document.body.setAttribute('data-overview-layout', resolved);
    document.body.classList.remove(...OVERVIEW_LAYOUTS.map(x => x.className));
    const def = OVERVIEW_LAYOUTS.find(x => x.key === resolved) || OVERVIEW_LAYOUTS[0];
    document.body.classList.add(def.className);
    if (ui.layoutModeBtn) ui.layoutModeBtn.textContent = def.label;
    if (persist) {
      try { localStorage.setItem(OVERVIEW_LAYOUT_STORAGE_KEY, resolved); } catch {}
    }
  }

  function cycleOverviewLayout() {
    const cur = currentOverviewLayoutKey();
    const idx = Math.max(0, OVERVIEW_LAYOUTS.findIndex(x => x.key === cur));
    const next = OVERVIEW_LAYOUTS[(idx + 1) % OVERVIEW_LAYOUTS.length];
    applyOverviewLayout(next.key, true);
  }

  function restoreOverviewLayout() {
    let saved = 'focus';
    try { saved = String(localStorage.getItem(OVERVIEW_LAYOUT_STORAGE_KEY) || 'focus'); } catch {}
    applyOverviewLayout(saved, false);
  }

  function clampAvatarProfile(p) {
    return normalizeAvatarProfile(p, String(p?.image || ''));
  }

  function renderAvatarPreview() {
    if (!ui.avatarPreviewImage) return;
    const person = String(state.avatarDesigner.person || 'sebastian');
    const p = avatarProfile(person);
    ui.avatarPreviewImage.style.backgroundImage = `url("${String(p.image || '').replace(/"/g, '\\"')}")`;
    ui.avatarPreviewImage.style.backgroundSize = `${(p.zoom * 100).toFixed(2)}%`;
    ui.avatarPreviewImage.style.backgroundPosition = `${(50 + p.panX).toFixed(2)}% ${(50 + p.panY).toFixed(2)}%`;
  }

  function renderAvatarDesigner() {
    if (!ui.avatarPersonSelect) return;
    ensureAvatarProfilesConfig();
    const persons = knownPresencePersons();
    const current = String(state.avatarDesigner.person || persons[0] || 'sebastian');
    ui.avatarPersonSelect.innerHTML = persons
      .map(p => `<option value="${p}">${p.charAt(0).toUpperCase()}${p.slice(1)}</option>`)
      .join('');
    state.avatarDesigner.person = persons.includes(current) ? current : (persons[0] || 'sebastian');
    ui.avatarPersonSelect.value = state.avatarDesigner.person;
    renderAvatarPreview();
  }

  function updateAvatarProfile(person, patch = {}) {
    const key = String(person || '').trim().toLowerCase();
    if (!key) return;
    const base = avatarProfile(key);
    state.avatarProfiles[key] = clampAvatarProfile({ ...base, ...patch, image: patch.image !== undefined ? patch.image : base.image });
    persistAvatarProfilesToConfig();
    renderAvatarPreview();
    renderAllCanvases();
  }

  function paintShield(mode) {
    if (!ui.shield) return;
    ui.shield.classList.remove('armed', 'perimeter', 'disarmed');
    const shieldIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v6c0 5-3.2 8-7 9-3.8-1-7-4-7-9V6l7-3z"></path><path d="M9 12.5l2 2 4-4"></path></svg>';
    if (mode === 'armed') {
      ui.shield.classList.add('armed');
      ui.shield.innerHTML = `${shieldIcon}<span>ALLES SCHARF</span>`;
      return;
    }
    if (mode === 'perimeter') {
      ui.shield.classList.add('perimeter');
      ui.shield.innerHTML = `${shieldIcon}<span>PERIMETER AKTIV</span>`;
      return;
    }
    ui.shield.classList.add('disarmed');
    ui.shield.innerHTML = `${shieldIcon}<span>UNSCHARF</span>`;
  }

  function paintOverviewHealth(ok, reasons = []) {
    const el = ui.healthOverviewText;
    if (!el) return;
    el.classList.toggle('ok', !!ok);
    el.classList.toggle('err', !ok);
    el.classList.add('clickable');
    el.setAttribute('aria-expanded', state.healthDetailsOpen ? 'true' : 'false');
    el.textContent = ok ? 'O.K.' : 'Fehler';
    el.title = reasons.length ? reasons.join(' | ') : '';
    renderHealthDetails();
  }

  function renderHealthDetails() {
    const panel = ui.healthDetailsPanel;
    if (!panel) return;
    panel.classList.toggle('hidden', !state.healthDetailsOpen);
    if (!state.healthDetailsOpen) return;
    const checks = Array.isArray(state.health?.checks) ? state.health.checks : [];
    if (checks.length === 0) {
      panel.innerHTML = '<div class="muted">Keine aktiven Health-Checks konfiguriert.</div>';
      return;
    }
    panel.innerHTML = checks.map(c => {
      const icon = c.ok ? '✅' : '❌';
      const cls = c.ok ? 'ok' : 'err';
      const label = String(c.label || 'Sensor');
      const datapoint = String(c.datapoint || '-');
      const reason = String(c.reason || '');
      const title = reason ? `${label}: ${reason}` : `${label}: OK`;
      return `<div class="health-detail-row ${cls}" title="${title}"><span class="health-detail-label">${label}<br><span class="muted">${datapoint}</span></span><span class="health-detail-icon">${icon}</span></div>`;
    }).join('');
  }

  async function checkHeartbeatStatus(id, timeoutSec, label) {
    const now = Date.now();
    const hid = String(id || '').trim();
    if (!hid) {
      return { ok: false, datapoint: '-', reason: `${label} Heartbeat-Datapoint fehlt` };
    }
    const timeoutMs = Math.max(1000, Number(timeoutSec || 2) * 1000);
    const st = await getState(hid);
    const ts = Number(st?.ts || st?.lc || 0);
    if (!Number.isFinite(ts) || ts <= 0) return { ok: false, datapoint: hid, reason: `${label} kein Heartbeat: ${hid}` };
    if ((now - ts) > timeoutMs) return { ok: false, datapoint: hid, reason: `${label} Heartbeat Timeout: ${hid}` };
    return { ok: true, datapoint: hid, reason: '' };
  }

  async function checkOnlineStatus(id, label) {
    const oid = String(id || '').trim();
    if (!oid) return { ok: false, datapoint: '-', reason: `${label} Online-Datapoint fehlt` };
    const st = await getState(oid);
    if (!isTruthyOnline(st?.val)) return { ok: false, datapoint: oid, reason: `${label} offline: ${oid}` };
    return { ok: true, datapoint: oid, reason: '' };
  }

  async function evaluateSystemHealth() {
    ensureTables();
    const reasons = [];
    const checks = [];
    const groups = [
      { key: 'contactSensorsTable', label: 'Türkontakt' },
      { key: 'pirSensorsTable', label: 'PIR' },
      { key: 'camerasTable', label: 'Kamera' },
      { key: 'personDetectionTable', label: 'Kamera' }
    ];
    for (const g of groups) {
      const rows = Array.isArray(state.config[g.key]) ? state.config[g.key] : [];
      for (const row of rows) {
        ensureEntityHealthFields(row);
        const name = String(row.label || row.key || row.id || `${g.label}`);
        const mode = String(row.healthCheckMode || 'none');
        if (mode === 'heartbeat') {
          const label = `${g.label} ${name}`;
          const res = await checkHeartbeatStatus(row.healthHeartbeatId, row.healthHeartbeatMaxSec, label);
          checks.push({ label, mode, datapoint: res.datapoint, ok: res.ok, reason: res.reason });
          if (!res.ok) reasons.push(res.reason);
        } else if (mode === 'online') {
          const label = `${g.label} ${name}`;
          const res = await checkOnlineStatus(row.healthOnlineId, label);
          checks.push({ label, mode, datapoint: res.datapoint, ok: res.ok, reason: res.reason });
          if (!res.ok) reasons.push(res.reason);
        }
      }
    }
    const ok = reasons.length === 0;
    state.health = { ok, reasons, checks };
    paintOverviewHealth(ok, reasons);
    return state.health;
  }

  function parseEventsJson(raw) {
    try {
      const arr = JSON.parse(String(raw || '[]'));
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function formatEventTs(ts) {
    const n = Number(ts || 0);
    if (!Number.isFinite(n) || n <= 0) return '-';
    return new Date(n).toLocaleString('de-DE');
  }

  function renderOverviewEventLog(eventsRaw) {
    const el = ui.overviewEventLog;
    if (!el) return;
    const events = Array.isArray(eventsRaw) ? eventsRaw : [];
    const lastArmTs = Number((events.find(e => String(e?.type || '') === 'zone_armed') || {}).ts || 0);
    const filtered = (lastArmTs > 0 ? events.filter(e => Number(e?.ts || 0) >= lastArmTs) : events).slice(0, 120);
    const lines = filtered
      .slice()
      .reverse()
      .map(e => {
        const ts = formatEventTs(e?.ts);
        const lvl = String(e?.level || 'info').toUpperCase();
        const msg = String(e?.message || e?.type || '');
        return `${ts}  [${lvl}]  ${msg}`;
      });
    el.textContent = lines.length ? lines.join('\n') : 'Noch keine Einträge seit letzter Scharfschaltung';
  }

  async function refreshLiveStatus() {
    const prevLive = {
      perimeterArmed: !!state.live.perimeterArmed,
      aussenArmed: !!state.live.aussenArmed,
      innenArmed: !!state.live.innenArmed,
      fullArmed: !!state.live.fullArmed,
      innerFillArmed: !!state.live.innerFillArmed
    };
    const perDp = await getState(state.config.perimeterStateId || '');
    const hullDp = await getState(getHullProtectionId());
    const allDp = await getState(state.config.armStateId || '');
    const cam = await getState(state.config.cctvArmedId || '');
    const camManual = await getState(`${state.instanceId}.runtime.camerasManualArmed`);
    const eventsState = await getState(`${state.instanceId}.diagnostics.eventsJson`);
    const prevPresence = state.presenceByPerson || { sebastian: false, teresa: false };
    const prevAlerts = JSON.stringify(state.liveAlerts || {});
    const prevHealthOk = !!state.health?.ok;
    const prevHealthReasons = JSON.stringify(state.health?.reasons || []);
    const presenceRows = Array.isArray(state.config.presenceSensorsTable) ? state.config.presenceSensorsTable : [];
    const presenceByPerson = { sebastian: false, teresa: false };
    for (const row of presenceRows) {
      const person = inferPresencePerson(row);
      if (!person || presenceByPerson[person]) continue;
      const st = await getState(String(row.id || ''));
      presenceByPerson[person] = isPresenceHome(row, st?.val);
    }
    state.presenceByPerson = presenceByPerson;
    renderOverviewEventLog(parseEventsJson(eventsState?.val));

    // Keep UI semantics strict to configured datapoints:
    // Alarm=all, Hull=outside shell, Camera=camera only, Perimeter=Hull+Camera.
    const rawPerimeterCombined = asArmed(perDp?.val);
    const rawHull = asArmed(hullDp?.val);
    const fullArmed = asArmed(allDp?.val);
    const innerFillArmed = fullArmed;
    const rawAll = fullArmed;
    const allArmed = rawAll;
    const innenArmed = rawAll;
    const aussenArmed = rawAll || rawHull || rawPerimeterCombined;
    const camerasArmed = asArmed(cam?.val) || asArmed(camManual?.val);
    const perimeterArmed = rawAll || camerasArmed || rawPerimeterCombined;

    const modeText = (perimeterArmed || aussenArmed || innenArmed || allArmed) ? 'armed' : 'disarmed';
    ui.liveMode.textContent = `Mode: ${modeText}`;
    ui.livePerimeter.textContent = `Perimeter: ${perimeterArmed ? 'scharf' : 'unscharf'}`;
    ui.liveAussenhaut.textContent = `Aussenhaut: ${aussenArmed ? 'scharf' : 'unscharf'}`;
    ui.liveInnenraum.textContent = `Innenraum: ${innenArmed ? 'scharf' : 'unscharf'}`;
    ui.liveCameras.textContent = `Kameras: ${camerasArmed ? 'scharf' : 'unscharf'}`;

    ui.liveMode.classList.remove('armed','armed-perimeter','disarmed');
    if (allArmed) ui.liveMode.classList.add('armed');
    else if (perimeterArmed) ui.liveMode.classList.add('armed-perimeter');
    else ui.liveMode.classList.add('disarmed');
    if (allArmed) paintShield('armed');
    else if (perimeterArmed) paintShield('perimeter');
    else paintShield('disarmed');
    paintChip(ui.livePerimeter, perimeterArmed);
    paintChip(ui.liveAussenhaut, aussenArmed);
    paintChip(ui.liveInnenraum, innenArmed);
    paintChip(ui.liveCameras, camerasArmed);
    setToggleButton($('toggleAlarmBtn'), 'Vollschutz', fullArmed);
    setToggleButton($('toggleHullBtn'), 'Außenhaut', rawHull || fullArmed);
    setToggleButton($('togglePerimeterBtn'), 'Perimeter', rawPerimeterCombined || fullArmed);
    setToggleButton($('toggleCamerasBtn'), 'Kamera', asArmed(cam?.val) || camerasArmed);
    // Keep canvas blink logic aligned with effective armed evaluation
    // (datapoints + zone states), not only raw zone states.
    state.live.perimeterArmed = perimeterArmed;
    state.live.aussenArmed = aussenArmed;
    state.live.innenArmed = innenArmed;
    state.live.fullArmed = fullArmed;
    state.live.innerFillArmed = innerFillArmed;
    await refreshAlertStates({ fullArmed, aussenArmed, perimeterArmed, camerasArmed, showSensors: state.overviewShowSensors });
    await evaluateSystemHealth();
    await updateFloorButtons();
    applyZoneArmedVisuals(ui.mini);
    applyZoneArmedVisuals(ui.full);
    const alertsChanged = JSON.stringify(state.liveAlerts || {}) !== prevAlerts;
    const healthChanged = prevHealthOk !== !!state.health?.ok || prevHealthReasons !== JSON.stringify(state.health?.reasons || []);
    const armedChanged = (
      prevLive.perimeterArmed !== perimeterArmed
      || prevLive.aussenArmed !== aussenArmed
      || prevLive.innenArmed !== innenArmed
      || prevLive.fullArmed !== fullArmed
      || prevLive.innerFillArmed !== innerFillArmed
    );
    if (
      armedChanged
      || alertsChanged
      || healthChanged
      || presenceByPerson.sebastian !== prevPresence.sebastian
      || presenceByPerson.teresa !== prevPresence.teresa
    ) {
      renderAllCanvases();
    }
    updateOverviewShowSensorsButton();
  }

  async function saveToInstance() {
    readFormIntoConfig();
    if (!state.profiles['default.json']) state.profiles['default.json'] = clone(state.instanceObj.native);
    const obj = clone(state.instanceObj);
    obj.native = { ...obj.native, ...state.config };
    obj.native.activeConfigProfile = state.activeProfile;
    obj.native.configProfilesJson = JSON.stringify(state.profiles);
    await setObject(state.objectId, obj);
    state.instanceObj = obj;
    setStatus(`Gespeichert: ${state.objectId}`);
    showToast('In Instanz gespeichert');
  }

  function loadProfile() {
    const n = ui.profile.value;
    const p = state.profiles[n];
    if (!p) { setStatus(`Profil nicht gefunden: ${n}`, true); return; }
    state.activeProfile = n;
    state.config = clone(p);
    renderAll();
    setStatus(`Profil geladen: ${n}`);
  }

  function saveAsProfile() {
    readFormIntoConfig();
    const raw = $('newProfileName').value;
    const b = String(raw || '').trim().replace(/[^a-zA-Z0-9_.-]/g, '_');
    const n = b ? (b.endsWith('.json') ? b : `${b}.json`) : '';
    if (!n) { setStatus('Bitte gültigen Profilnamen eingeben', true); return; }
    state.profiles[n] = clone(state.config);
    state.activeProfile = n;
    rebuildProfileSelect();
    setStatus(`Profil gespeichert: ${n}`);
  }

  function deleteProfile() {
    const n = ui.profile.value;
    if (n === 'default.json') { setStatus('default.json kann nicht gelöscht werden', true); return; }
    delete state.profiles[n];
    state.activeProfile = 'default.json';
    state.config = clone(state.profiles['default.json']);
    renderAll();
    setStatus(`Profil gelöscht: ${n}`);
  }

  function renderAll() {
    rebuildProfileSelect();
    void updateFloorButtons();
    renderFields();
    renderGeofenceSettings();
    renderAvatarDesigner();
    ensureFloorLayouts();
    ensureDesignerData();
    applyFloorplanImages();
    renderAllCanvases();
    renderDesigner();
    renderZoneActions();
    renderAlarmActionsCard();
    renderTelegramConfigCard();
  }

  async function reloadFromInstance() {
    let resolved = null;
    for (const c of objectIdCandidates(rawInstance)) {
      try {
        resolved = await getObject(c);
        state.objectId = c;
        state.instanceId = c.replace(/^system\.adapter\./, '');
        break;
      } catch {}
    }
    if (!resolved) throw new Error('Instanzobjekt nicht gefunden');
    state.instanceObj = resolved;
    ensureProfiles();
    state.config = clone(state.instanceObj.native);
    ensureTables();
    ensureFloorLayouts();
    ensureDesignerData();
    state.designerHistory = [];
    if (ui.instance) ui.instance.textContent = `Instanz: ${state.instanceId}`;
    renderAll();
    const today = new Date().toISOString().slice(0,10);
    ui.logDate.value = today;
    ui.logView.textContent = 'Log noch nicht geladen. Bitte "Log laden" klicken.';
    setStatus('Aktuelle Instanzdaten geladen (schneller Startmodus)');
  }

  function bindModal() {
    const openBtn = $('openCanvasBtn');
    const closeBtn = $('closeCanvasBtn');
    if (openBtn && ui.canvasModal && ui.full) {
      openBtn.addEventListener('click', () => {
        ui.canvasModal.classList.remove('hidden');
        renderCanvas(ui.full, true);
        bindCanvasDrops(ui.full);
      });
    }
    if (closeBtn && ui.canvasModal) closeBtn.addEventListener('click', () => ui.canvasModal.classList.add('hidden'));
  }

  function switchPage(page) {
    const isOverview = page === 'overview';
    const isDesigner = page === 'designer';
    const isSettings = page === 'settings';
    ui.overviewPage.classList.toggle('hidden', !isOverview);
    ui.designerPage.classList.toggle('hidden', !isDesigner);
    ui.settingsPage.classList.toggle('hidden', !isSettings);
    ui.pageOverviewBtn.classList.toggle('primary', isOverview);
    ui.pageOverviewBtn.classList.toggle('ghost', !isOverview);
    ui.pageDesignerBtn.classList.toggle('primary', isDesigner);
    ui.pageDesignerBtn.classList.toggle('ghost', !isDesigner);
    ui.pageSettingsBtn.classList.toggle('primary', isSettings);
    ui.pageSettingsBtn.classList.toggle('ghost', !isSettings);
  }

  async function refreshPanicButton() {
    const panicId = String(state.config.panicStateId || '').trim();
    if (!panicId) {
      ui.panicBtn.classList.remove('on');
      ui.panicBtn.textContent = 'PANIC';
      return;
    }
    const raw = readStateVal(await getState(panicId));
    const on = asArmed(raw);
    ui.panicBtn.classList.toggle('on', on);
    ui.panicBtn.textContent = 'PANIC';
  }

  async function togglePanic() {
    const panicId = String(state.config.panicStateId || '').trim();
    if (!panicId) throw new Error('panicStateId ist leer');
    const on = asArmed(readStateVal(await getState(panicId)));
    await setState(panicId, !on);
    await refreshPanicButton();
    setStatus(`PANIC ${!on ? 'aktiviert' : 'deaktiviert'}`);
  }

  async function init() {
    const syncEditButtons = () => {
      if (ui.editImageBtn) {
        ui.editImageBtn.classList.toggle('primary', state.editImage);
        ui.editImageBtn.classList.toggle('ghost', !state.editImage);
      }
      if (ui.editZonesBtn) {
        ui.editZonesBtn.classList.toggle('primary', state.editZones);
        ui.editZonesBtn.classList.toggle('ghost', !state.editZones);
      }
    };
    restoreOverviewLayout();
    connectSocket();
    bindPoolDrop();
    bindModal();
    await reloadFromInstance();
    writeRuleForm(defaultRule());

    $('reloadBtn').addEventListener('click', () => reloadFromInstance().catch(e => setStatus(String(e), true)));
    $('saveBtn').addEventListener('click', () => saveToInstance().catch(e => setStatus(String(e), true)));
    if (ui.layoutModeBtn) ui.layoutModeBtn.addEventListener('click', cycleOverviewLayout);
    ui.pageOverviewBtn.addEventListener('click', () => switchPage('overview'));
    ui.pageDesignerBtn.addEventListener('click', () => switchPage('designer'));
    ui.pageSettingsBtn.addEventListener('click', () => switchPage('settings'));
    if (ui.designerFloor) {
      ui.designerFloor.addEventListener('change', () => renderDesigner());
    }
    if (ui.designerTool) {
      ui.designerTool.addEventListener('change', () => {
        state.designer.pendingBeamConnect = null;
        state.designer.wallFinishCooldownUntil = 0;
        state.designer.dragRotateItemId = null;
        state.designer.dragRotateCenter = null;
        state.designer.dragRotateStartAngle = null;
        state.designer.dragRotateOrigRotation = null;
        state.designer.dragAnchorItemId = null;
        state.designer.drawingWallCursor = null;
        if (String(ui.designerTool.value || '') !== 'wall') {
          state.designer.drawingWall = null;
        }
        renderDesigner();
      });
    }
    if (ui.designerItemType) ui.designerItemType.addEventListener('change', () => renderDesigner());
    if (ui.designerGrid) {
      ui.designerGrid.addEventListener('change', () => {
        state.designer.grid = Math.max(4, Number(ui.designerGrid.value || 12));
        saveDesignerData();
        renderDesigner();
        renderAllCanvases();
      });
    }
    if (ui.designerSnapBtn) {
      ui.designerSnapBtn.addEventListener('click', () => {
        snapshotDesignerState();
        state.designer.snap = !state.designer.snap;
        ui.designerSnapBtn.textContent = `Snap: ${state.designer.snap ? 'an' : 'aus'}`;
        saveDesignerData();
      });
    }
    if (ui.designerZoomOutBtn) {
      ui.designerZoomOutBtn.addEventListener('click', () => {
        const view = getDesignerFloorView();
        const oldScale = normalizedWorkspaceScale(view.workspaceScale);
        const newScale = normalizedWorkspaceScale(oldScale + 0.25);
        if (newScale === oldScale) return;
        snapshotDesignerState();
        const model = getDesignerFloorModel();
        const oldWs = workspaceFromScale(oldScale);
        const newWs = workspaceFromScale(newScale);
        shiftDesignerModel(model, newWs.bgX - oldWs.bgX, newWs.bgY - oldWs.bgY);
        view.workspaceScale = newScale;
        saveDesignerData();
        renderDesigner();
        renderAllCanvases();
      });
    }
    if (ui.designerZoomInBtn) {
      ui.designerZoomInBtn.addEventListener('click', () => {
        const view = getDesignerFloorView();
        const oldScale = normalizedWorkspaceScale(view.workspaceScale);
        const newScale = normalizedWorkspaceScale(oldScale - 0.25);
        if (newScale === oldScale) return;
        snapshotDesignerState();
        const model = getDesignerFloorModel();
        const oldWs = workspaceFromScale(oldScale);
        const newWs = workspaceFromScale(newScale);
        shiftDesignerModel(model, newWs.bgX - oldWs.bgX, newWs.bgY - oldWs.bgY);
        view.workspaceScale = newScale;
        saveDesignerData();
        renderDesigner();
        renderAllCanvases();
      });
    }
    if (ui.designerMoveUpBtn) {
      ui.designerMoveUpBtn.addEventListener('click', () => moveDesignerPlan(0, -Number(state.designer.grid || 12)));
    }
    if (ui.designerMoveDownBtn) {
      ui.designerMoveDownBtn.addEventListener('click', () => moveDesignerPlan(0, Number(state.designer.grid || 12)));
    }
    if (ui.designerMoveLeftBtn) {
      ui.designerMoveLeftBtn.addEventListener('click', () => moveDesignerPlan(-Number(state.designer.grid || 12), 0));
    }
    if (ui.designerMoveRightBtn) {
      ui.designerMoveRightBtn.addEventListener('click', () => moveDesignerPlan(Number(state.designer.grid || 12), 0));
    }
    if (ui.designerRotateBtn) {
      ui.designerRotateBtn.addEventListener('click', () => {
        snapshotDesignerState();
        const model = getDesignerFloorModel();
        rotateDesignerModelClockwise90(model);
        saveDesignerData();
        renderDesigner();
        renderAllCanvases();
        setStatus('Grundriss um 90° gedreht');
      });
    }
    if (ui.designerBgBtn) {
      ui.designerBgBtn.addEventListener('click', () => {
        snapshotDesignerState();
        const view = getDesignerFloorView();
        view.showBg = !view.showBg;
        saveDesignerData();
        ui.designerBgBtn.textContent = `Hintergrund: ${view.showBg ? 'an' : 'aus'}`;
        renderDesigner();
      });
    }
    if (ui.designerUseOnlyBtn) {
      ui.designerUseOnlyBtn.addEventListener('click', () => {
        snapshotDesignerState();
        const view = getDesignerFloorView();
        view.useInOverviewOnly = !view.useInOverviewOnly;
        if (view.useInOverviewOnly) view.showBg = false;
        saveDesignerData();
        ui.designerUseOnlyBtn.textContent = `In Übersicht: ${view.useInOverviewOnly ? 'nur Plan' : 'JPEG'}`;
        renderDesigner();
        renderAllCanvases();
      });
    }
    if (ui.designerPublishBtn) {
      ui.designerPublishBtn.addEventListener('click', () => {
        snapshotDesignerState();
        state.config.floorplanDesignerPublished = !isDesignerPublished();
        saveDesignerData();
        renderDesigner();
        renderAllCanvases();
        setStatus(`Designer-Plan ${isDesignerPublished() ? 'freigegeben' : 'gesperrt'}`);
      });
    }
    if (ui.designerNewBeamChainBtn) {
      ui.designerNewBeamChainBtn.addEventListener('click', () => {
        const floor = (ui.designerFloor.value === 'OG') ? 'OG' : 'EG';
        const model = state.designer[floor] || defaultDesignerFloor();
        state.designer[floor] = model;
        model.lastBeamItemId = null;
        state.designer.pendingBeamConnect = null;
        setStatus('Neue Balkenkette gestartet (nächster Balken ohne Auto-Verbindung)');
      });
    }
    if (ui.designerBindSelectedBtn) {
      ui.designerBindSelectedBtn.addEventListener('click', bindSelectedEntityToSelectedDesignerItem);
    }
    if (ui.designerClearBindBtn) {
      ui.designerClearBindBtn.addEventListener('click', clearBindingOnSelectedDesignerItem);
    }
    if (ui.designerShowSensorsBtn) {
      ui.designerShowSensorsBtn.addEventListener('click', () => {
        snapshotDesignerState();
        state.designer.showSensorsPreview = !state.designer.showSensorsPreview;
        saveDesignerData();
        renderDesigner();
      });
    }
    if (ui.designerPickEntityBtn) {
      ui.designerPickEntityBtn.addEventListener('click', pickDesignerEntityFromSelect);
    }
    if (ui.designerEntitySelect) {
      ui.designerEntitySelect.addEventListener('change', () => pickDesignerEntityFromSelect());
    }
    if (ui.designerCopyFloorBtn) {
      ui.designerCopyFloorBtn.addEventListener('click', () => {
        snapshotDesignerState();
        const from = (ui.designerFloor.value === 'OG') ? 'OG' : 'EG';
        const to = from === 'EG' ? 'OG' : 'EG';
        state.designer[to] = clone(state.designer[from] || defaultDesignerFloor());
        state.designer.floorView[to] = { ...defaultDesignerView(), ...(state.designer.floorView[from] || {}) };
        saveDesignerData();
        renderAllCanvases();
        setStatus(`Designer von ${from} nach ${to} kopiert`);
      });
    }
    if (ui.designerClearBtn) {
      ui.designerClearBtn.addEventListener('click', () => {
        snapshotDesignerState();
        const floor = (ui.designerFloor.value === 'OG') ? 'OG' : 'EG';
        state.designer[floor] = defaultDesignerFloor();
        state.designer.dragItemId = null;
        state.designer.pendingBeamConnect = null;
        state.designer.dragWallId = null;
        state.designer.dragWallPoint = null;
        state.designer.dragWallStart = null;
        state.designer.dragWallOrig = null;
        state.designer.drawingWall = null;
        state.designer.drawingWallCursor = null;
        state.designer.selectedItemId = null;
        state.designer.dragResizeItemId = null;
        state.designer.dragResizeStart = null;
        state.designer.dragResizeOrig = null;
        state.designer.dragAnchorItemId = null;
        state.designer.dragRotateItemId = null;
        state.designer.dragRotateCenter = null;
        state.designer.dragRotateStartAngle = null;
        state.designer.dragRotateOrigRotation = null;
        state.designer.wallFinishCooldownUntil = 0;
        state.designer.drawingPerimeter = null;
        saveDesignerData();
        renderDesigner();
        renderAllCanvases();
        setStatus(`Designer ${floor} geleert`);
      });
    }
    if (ui.designerUndoBtn) {
      ui.designerUndoBtn.addEventListener('click', undoDesignerStep);
    }
    if (ui.designerFinishWallBtn) {
      ui.designerFinishWallBtn.addEventListener('click', () => {
        const m = getDesignerFloorModel();
        const pts = state.designer.drawingWall || [];
        if (!Array.isArray(pts) || pts.length < 2) {
          setStatus('Keine aktive Wand zum Abschließen');
          return;
        }
        const closeLoop = pts.length >= 3;
        const done = finalizeDrawingWall(m, closeLoop);
        if (done) state.designer.wallFinishCooldownUntil = Date.now() + 260;
      });
    }
    bindDesignerInteractions();
    ui.floorEgBtn.addEventListener('click', () => {
      state.currentFloor = 'EG';
      void updateFloorButtons();
      renderAllCanvases();
    });
    ui.floorOgBtn.addEventListener('click', () => {
      state.currentFloor = 'OG';
      void updateFloorButtons();
      renderAllCanvases();
    });
    ui.editImageBtn.addEventListener('click', () => {
      state.editImage = !state.editImage;
      if (state.editImage) state.editZones = false;
      syncEditButtons();
      renderAllCanvases();
    });
    ui.editZonesBtn.addEventListener('click', () => {
      state.editZones = !state.editZones;
      if (state.editZones) state.editImage = false;
      syncEditButtons();
      renderAllCanvases();
    });
    ui.closeZoneBtn.addEventListener('click', () => {
      const z = ui.editZoneSelect.value;
      const l = getCurrentLayout();
      const pts = l.zones[z] || [];
      snapshotCanvasState();
      if (pts.length >= 3 && (pts[0][0] !== pts[pts.length - 1][0] || pts[0][1] !== pts[pts.length - 1][1])) {
        pts.push([pts[0][0], pts[0][1]]);
      }
      writeFloorLayoutsToConfig();
      renderAllCanvases();
    });
    ui.clearZoneBtn.addEventListener('click', () => {
      const z = ui.editZoneSelect.value;
      const l = getCurrentLayout();
      snapshotCanvasState();
      l.zones[z] = [];
      writeFloorLayoutsToConfig();
      renderAllCanvases();
    });
    $('undoCanvasBtn').addEventListener('click', undoCanvasStep);
    if (ui.copyZonesFloorBtn) {
      ui.copyZonesFloorBtn.addEventListener('click', copyZonesToOtherFloor);
    }
    ui.resetImageRectBtn.addEventListener('click', () => {
      const l = getCurrentLayout();
      snapshotCanvasState();
      const ratio = getFloorRatio(state.currentFloor);
      let w = 84;
      let h = w / ratio;
      if (h > 88) { h = 88; w = h * ratio; }
      l.imageRect = { x: 8, y: 6, w, h };
      writeFloorLayoutsToConfig();
      renderAllCanvases();
    });
    $('loadProfileBtn').addEventListener('click', loadProfile);
    $('saveProfileBtn').addEventListener('click', saveAsProfile);
    $('deleteProfileBtn').addEventListener('click', deleteProfile);
    $('addSensorBtn').addEventListener('click', addNewEntity);
    $('addZoneActionBtn').addEventListener('click', addZoneAction);
    if (ui.uploadFloorplansBtn) ui.uploadFloorplansBtn.addEventListener('click', () => uploadFloorplanImages().catch(e => setStatus(String(e), true)));
    if (ui.avatarPersonSelect) {
      ui.avatarPersonSelect.addEventListener('change', () => {
        state.avatarDesigner.person = String(ui.avatarPersonSelect.value || 'sebastian').toLowerCase();
        renderAvatarPreview();
      });
    }
    if (ui.avatarUploadInput) {
      ui.avatarUploadInput.addEventListener('change', async () => {
        const file = ui.avatarUploadInput.files && ui.avatarUploadInput.files[0];
        if (!file) return;
        try {
          const dataUrl = await fileToDataUrl(file);
          updateAvatarProfile(state.avatarDesigner.person, { image: dataUrl, zoom: 1, panX: 0, panY: 0 });
          setStatus(`Avatar geladen: ${state.avatarDesigner.person}`);
        } catch (e) {
          setStatus(String(e), true);
        }
      });
    }
    if (ui.avatarZoomInBtn) {
      ui.avatarZoomInBtn.addEventListener('click', () => {
        const p = avatarProfile(state.avatarDesigner.person);
        updateAvatarProfile(state.avatarDesigner.person, { zoom: Math.min(4, Number(p.zoom || 1) + 0.1) });
      });
    }
    if (ui.avatarZoomOutBtn) {
      ui.avatarZoomOutBtn.addEventListener('click', () => {
        const p = avatarProfile(state.avatarDesigner.person);
        updateAvatarProfile(state.avatarDesigner.person, { zoom: Math.max(0.5, Number(p.zoom || 1) - 0.1) });
      });
    }
    if (ui.avatarResetBtn) {
      ui.avatarResetBtn.addEventListener('click', () => {
        updateAvatarProfile(state.avatarDesigner.person, { zoom: 1, panX: 0, panY: 0 });
      });
    }
    if (ui.avatarApplyBtn) {
      ui.avatarApplyBtn.addEventListener('click', () => {
        persistAvatarProfilesToConfig();
        setStatus('Avatar-Konfiguration übernommen (Speichern nicht vergessen)');
      });
    }
    if (ui.avatarPreviewCircle) {
      const startDrag = (clientX, clientY) => {
        const person = String(state.avatarDesigner.person || 'sebastian');
        const p = avatarProfile(person);
        state.avatarDesigner.dragging = true;
        state.avatarDesigner.startX = Number(clientX);
        state.avatarDesigner.startY = Number(clientY);
        state.avatarDesigner.startPanX = Number(p.panX || 0);
        state.avatarDesigner.startPanY = Number(p.panY || 0);
        ui.avatarPreviewCircle.classList.add('dragging');
      };
      const moveDrag = (clientX, clientY) => {
        if (!state.avatarDesigner.dragging) return;
        const rect = ui.avatarPreviewCircle.getBoundingClientRect();
        const dxPct = ((Number(clientX) - state.avatarDesigner.startX) / Math.max(1, rect.width)) * 100;
        const dyPct = ((Number(clientY) - state.avatarDesigner.startY) / Math.max(1, rect.height)) * 100;
        updateAvatarProfile(state.avatarDesigner.person, {
          panX: Math.max(-100, Math.min(100, state.avatarDesigner.startPanX + dxPct)),
          panY: Math.max(-100, Math.min(100, state.avatarDesigner.startPanY + dyPct))
        });
      };
      const endDrag = () => {
        state.avatarDesigner.dragging = false;
        ui.avatarPreviewCircle.classList.remove('dragging');
      };
      ui.avatarPreviewCircle.addEventListener('mousedown', ev => {
        ev.preventDefault();
        startDrag(ev.clientX, ev.clientY);
      });
      window.addEventListener('mousemove', ev => moveDrag(ev.clientX, ev.clientY));
      window.addEventListener('mouseup', endDrag);
      ui.avatarPreviewCircle.addEventListener('touchstart', ev => {
        const t = ev.touches && ev.touches[0];
        if (!t) return;
        startDrag(t.clientX, t.clientY);
      }, { passive: true });
      window.addEventListener('touchmove', ev => {
        const t = ev.touches && ev.touches[0];
        if (!t) return;
        moveDrag(t.clientX, t.clientY);
      }, { passive: true });
      window.addEventListener('touchend', endDrag);
      window.addEventListener('touchcancel', endDrag);
    }
    const tidyBtn = $('tidyCanvasBtn');
    if (tidyBtn) tidyBtn.addEventListener('click', tidyCanvasLayout);

    $('browseNewIdBtn').addEventListener('click', () => openObjectBrowser($('newId')));
    $('browseZoneActionIdBtn').addEventListener('click', () => openObjectBrowser($('zoneActionId')));
    if (ui.browseSnapshotActionDatapointBtn && ui.snapshotActionDatapointId) ui.browseSnapshotActionDatapointBtn.addEventListener('click', () => openObjectBrowser(ui.snapshotActionDatapointId));
    if (ui.browseRuleHeartbeatIdBtn && ui.ruleHealthHeartbeatId) ui.browseRuleHeartbeatIdBtn.addEventListener('click', () => openObjectBrowser(ui.ruleHealthHeartbeatId));
    if (ui.browseRuleOnlineIdBtn && ui.ruleHealthOnlineId) ui.browseRuleOnlineIdBtn.addEventListener('click', () => openObjectBrowser(ui.ruleHealthOnlineId));
    if (ui.browseRuleSnapshotDatapointBtn && ui.ruleSnapshotDatapointId) ui.browseRuleSnapshotDatapointBtn.addEventListener('click', () => openObjectBrowser(ui.ruleSnapshotDatapointId));
    if (ui.ruleSnapshotZoneMode) ui.ruleSnapshotZoneMode.addEventListener('change', updateSnapshotZoneUiState);
    $('closeBrowserBtn').addEventListener('click', closeObjectBrowser);
    ui.objectSearch.addEventListener('input', renderObjectResults);
    ui.objectResults.addEventListener('click', ev => {
      const item = ev.target.closest('.object-item');
      if (!item) return;
      applyObjectBrowserSelection(item.dataset.id || '');
    });
    if (ui.objectTree) {
      ui.objectTree.addEventListener('click', ev => {
        const toggle = ev.target.closest('[data-tree-toggle]');
        if (toggle) {
          toggleObjectTreePath(toggle.getAttribute('data-tree-toggle') || '');
          return;
        }
        const node = ev.target.closest('[data-tree-node]');
        if (!node) return;
        const wrap = node.closest('[data-tree-path]');
        const leafId = String(wrap?.getAttribute('data-tree-leaf') || '').trim();
        const path = String(wrap?.getAttribute('data-tree-path') || '').trim();
        if (leafId) {
          applyObjectBrowserSelection(leafId);
          return;
        }
        toggleObjectTreePath(path);
      });
    }

    $('closeEntitySettingsBtn').addEventListener('click', () => {
      if (!confirmEntitySettingsBeforeContinue()) return;
      closeEntityModalNow();
    });
    if (ui.entityModal) {
      ui.entityModal.addEventListener('click', ev => {
        if (ev.target !== ui.entityModal) return;
        if (!confirmEntitySettingsBeforeContinue()) return;
        closeEntityModalNow();
      });
    }
    $('saveEntityRuleBtn').addEventListener('click', () => {
      saveSelectedEntitySettings(true);
    });
    $('applyZoneRuleBtn').addEventListener('click', () => {
      if (!state.selectedEntity) return setStatus('Bitte erst ein Element anklicken', true);
      const fromZone = state.selectedEntity.zone;
      const toZone = readZoneSel();
      const rule = readRuleForm();
      const m = getRulesMap();
      getEntities().filter(x => x.zone === fromZone).forEach(x => {
        setEntity(x.kind, x.idx, { zone: toZone });
        m[ruleId(x)] = { ...rule };
      });
      setRulesMap(m);
      renderAllCanvases();
      setStatus(`Auf Zone angewendet: ${toZone}`);
    });

    $('loadTriggerLogBtn').addEventListener('click', () => loadTriggerLogForDate(ui.logDate.value));

    $('toggleAlarmBtn').addEventListener('click', async () => {
      try {
        const st = await getState(state.config.armStateId || '');
        const toOn = !asArmed(st?.val);
        if (toOn) await manualControl('armAlarm');
        else openPinModal('disarmAlarm');
      } catch (e) {
        setStatus(String(e), true);
      }
    });
    $('toggleHullBtn')?.addEventListener('click', async () => {
      try {
        const st = await getState(getHullProtectionId());
        const toOn = !asArmed(st?.val);
        if (toOn) await manualControl('armHull');
        else openPinModal('disarmHull');
      } catch (e) {
        setStatus(String(e), true);
      }
    });
    $('togglePerimeterBtn').addEventListener('click', async () => {
      try {
        const st = await getState(state.config.perimeterStateId || '');
        const toOn = !asArmed(st?.val);
        if (toOn) await manualControl('armPerimeter');
        else openPinModal('disarmPerimeter');
      } catch (e) {
        setStatus(String(e), true);
      }
    });
    $('toggleCamerasBtn').addEventListener('click', async () => {
      try {
        const st = await getState(state.config.cctvArmedId || '');
        const manual = await getState(`${state.instanceId}.runtime.camerasManualArmed`);
        const toOn = !(asArmed(st?.val) || asArmed(manual?.val));
        if (toOn) await manualControl('armCameras');
        else openPinModal('disarmCameras');
      } catch (e) {
        setStatus(String(e), true);
      }
    });
    if (ui.overviewShowSensorsBtn) {
      ui.overviewShowSensorsBtn.addEventListener('click', async () => {
        state.overviewShowSensors = !state.overviewShowSensors;
        updateOverviewShowSensorsButton();
        await refreshLiveStatus();
        renderAllCanvases();
      });
    }
    if (ui.healthOverviewText) {
      ui.healthOverviewText.addEventListener('click', () => {
        state.healthDetailsOpen = !state.healthDetailsOpen;
        renderHealthDetails();
        paintOverviewHealth(!!state.health?.ok, state.health?.reasons || []);
      });
    }

    $('closePinBtn').addEventListener('click', closePinModal);
    $('pinClearBtn').addEventListener('click', () => {
      state.pinInput = '';
      renderPinDots();
      if (ui.pinHint) ui.pinHint.textContent = 'PIN: 4-stellig';
    });
    $('pinBackBtn').addEventListener('click', () => {
      state.pinInput = state.pinInput.slice(0, -1);
      renderPinDots();
      if (ui.pinHint) ui.pinHint.textContent = 'PIN: 4-stellig';
    });
    document.querySelectorAll('.numpad [data-pin]').forEach(btn => {
      btn.addEventListener('click', () => {
        void onPinDigit(btn.getAttribute('data-pin')).catch(e => setStatus(String(e), true));
      });
    });
    ui.panicBtn.addEventListener('click', () => togglePanic().catch(e => setStatus(String(e), true)));
    if (ui.addSnapshotActionBtn) ui.addSnapshotActionBtn.addEventListener('click', addSnapshotActionTarget);
    if (ui.addQuickAlarmActionBtn) ui.addQuickAlarmActionBtn.addEventListener('click', addQuickAlarmAction);
    if (ui.addModeFlowRuleBtn) ui.addModeFlowRuleBtn.addEventListener('click', addModeFlowRulesFromSelection);
    if (ui.addAlarmActionBtn) ui.addAlarmActionBtn.addEventListener('click', addAlarmAction);
    if (ui.addPanicActionBtn) ui.addPanicActionBtn.addEventListener('click', addPanicAction);
    if (ui.browseQuickAlarmDatapointBtn && ui.quickAlarmDatapointId) ui.browseQuickAlarmDatapointBtn.addEventListener('click', () => openObjectBrowser(ui.quickAlarmDatapointId));
    if (ui.browseAlarmActionDatapointBtn && ui.alarmActionDatapointId) ui.browseAlarmActionDatapointBtn.addEventListener('click', () => openObjectBrowser(ui.alarmActionDatapointId));
    if (ui.browsePanicActionDatapointBtn && ui.panicActionDatapointId) ui.browsePanicActionDatapointBtn.addEventListener('click', () => openObjectBrowser(ui.panicActionDatapointId));
    if (ui.quickAlarmScenario) ui.quickAlarmScenario.addEventListener('change', () => {
      updateQuickAlarmActionUiState();
      renderQuickAlarmActionsCard();
    });
    if (ui.quickAlarmTriggerType) ui.quickAlarmTriggerType.addEventListener('change', () => {
      refreshQuickAlarmTriggerEntityOptions();
      renderQuickAlarmActionsCard();
    });
    if (ui.modeFlowSourceSearch) {
      ui.modeFlowSourceSearch.addEventListener('input', renderModeFlowSourceList);
    }
    if (ui.modeFlowSourceList) {
      ui.modeFlowSourceList.addEventListener('change', ev => {
        const input = ev.target.closest('[data-mode-flow-source]');
        if (!input) return;
        const token = String(input.getAttribute('data-mode-flow-source') || '').trim();
        if (!token) return;
        if (input.checked) state.modeFlowSelectedSources.add(token);
        else state.modeFlowSelectedSources.delete(token);
      });
    }
    if (ui.alarmActionScenario) ui.alarmActionScenario.addEventListener('change', () => {
      updateAlarmActionUiState();
      renderAlarmActionsCard();
    });
    if (ui.alarmActionGlobalTiming) ui.alarmActionGlobalTiming.addEventListener('change', () => {
      state.config.alarmActionZoneTriggerTiming = String(ui.alarmActionGlobalTiming.value || 'after_alarm') === 'immediate' ? 'immediate' : 'after_alarm';
      const gf = ui.global?.querySelector('[data-key="alarmActionZoneTriggerTiming"]');
      if (gf && 'value' in gf) gf.value = state.config.alarmActionZoneTriggerTiming;
      renderAlarmActionsCard();
    });
    if (ui.alarmActionTriggerType) ui.alarmActionTriggerType.addEventListener('change', () => {
      refreshAlarmActionTriggerEntityOptions();
      renderAlarmActionsCard();
    });
    if (ui.alarmCountdownAbortMode) ui.alarmCountdownAbortMode.addEventListener('change', () => {
      state.config.countdownAbortMode = String(ui.alarmCountdownAbortMode.value || 'zone_disarmed');
    });
    if (ui.alarmRepeatTelegramEnabled) ui.alarmRepeatTelegramEnabled.addEventListener('change', () => {
      state.config.alarmRepeatTelegramEnabled = String(ui.alarmRepeatTelegramEnabled.value || 'false') === 'true';
    });
    [ui.alarmActionKindDatapoint, ui.alarmActionKindTelegram, ui.alarmActionKindAlexa, ui.alarmActionKindSnapshot, ui.alarmActionKindCameraLed]
      .filter(Boolean)
      .forEach(el => el.addEventListener('change', updateAlarmActionUiState));
    [ui.quickAlarmKindDatapoint, ui.quickAlarmKindTelegram, ui.quickAlarmKindAlexa, ui.quickAlarmKindSnapshot, ui.quickAlarmKindCameraLed]
      .filter(Boolean)
      .forEach(el => el.addEventListener('change', updateQuickAlarmActionUiState));
    [ui.panicActionKindDatapoint, ui.panicActionKindTelegram, ui.panicActionKindAlexa, ui.panicActionKindSnapshot]
      .filter(Boolean)
      .forEach(el => el.addEventListener('change', updatePanicActionUiState));
    if (ui.global) {
      ui.global.addEventListener('change', ev => {
        const el = ev.target;
        if (!el || String(el.dataset?.key || '') !== 'alarmActionZoneTriggerTiming') return;
        const v = String(el.value || 'after_alarm') === 'immediate' ? 'immediate' : 'after_alarm';
        state.config.alarmActionZoneTriggerTiming = v;
        if (ui.alarmActionGlobalTiming) ui.alarmActionGlobalTiming.value = v;
        renderAlarmActionsCard();
      });
    }
    if (ui.alarmActionsList) {
      ui.alarmActionsList.addEventListener('click', ev => {
        const btn = ev.target.closest('[data-del-alarm-action]');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-del-alarm-action'));
        if (!Number.isInteger(idx) || idx < 0) return;
        ensureTables();
        state.config.alarmActionsTable.splice(idx, 1);
        renderAlarmActionsCard();
      });
    }
    if (ui.quickAlarmActionsList) {
      ui.quickAlarmActionsList.addEventListener('click', ev => {
        const btn = ev.target.closest('[data-del-quick-alarm-action]');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-del-quick-alarm-action'));
        if (!Number.isInteger(idx) || idx < 0) return;
        ensureTables();
        state.config.alarmActionsTable.splice(idx, 1);
        renderAlarmActionsCard();
      });
    }
    if (ui.modeFlowRulesList) {
      ui.modeFlowRulesList.addEventListener('click', ev => {
        const btn = ev.target.closest('[data-del-mode-flow-rule]');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-del-mode-flow-rule'));
        if (!Number.isInteger(idx) || idx < 0) return;
        ensureTables();
        state.config.modeFlowRulesTable.splice(idx, 1);
        renderModeFlowCard();
      });
    }
    if (ui.panicActionsList) {
      ui.panicActionsList.addEventListener('click', ev => {
        const btn = ev.target.closest('[data-del-panic-action]');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-del-panic-action'));
        if (!Number.isInteger(idx) || idx < 0) return;
        ensureTables();
        state.config.panicActionsTable.splice(idx, 1);
        renderAlarmActionsCard();
      });
    }
    if (ui.zoneActionsList) {
      ui.zoneActionsList.addEventListener('click', ev => {
        const btn = ev.target.closest('[data-del-zone-action]');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-del-zone-action'));
        if (!Number.isInteger(idx) || idx < 0) return;
        ensureTables();
        state.config.zoneActionsTable.splice(idx, 1);
        renderZoneActions();
      });
    }
    if (ui.snapshotActionsList) {
      ui.snapshotActionsList.addEventListener('click', ev => {
        const btn = ev.target.closest('[data-del-snapshot-action-target]');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-del-snapshot-action-target'));
        if (!Number.isInteger(idx) || idx < 0) return;
        ensureTables();
        state.config.snapshotActionTargetsTable.splice(idx, 1);
        renderSnapshotActionTargetsCard();
      });
    }
    if (ui.telegramAddInstanceBtn) {
      ui.telegramAddInstanceBtn.addEventListener('click', () => {
        ensureTables();
        state.config.telegramInstancesTable.push({ instance: '', token: '' });
        renderTelegramConfigCard();
      });
    }
    if (ui.telegramAddTargetBtn) {
      ui.telegramAddTargetBtn.addEventListener('click', () => {
        ensureTables();
        const firstInstance = String((state.config.telegramInstancesTable?.[0] || {}).instance || '').trim();
        state.config.telegramTargetsTable.push({ instance: firstInstance, chatId: '' });
        renderTelegramConfigCard();
      });
    }
    if (ui.telegramInstancesList) {
      ui.telegramInstancesList.addEventListener('click', ev => {
        const btn = ev.target.closest('[data-del-telegram-instance]');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-del-telegram-instance'));
        if (!Number.isInteger(idx) || idx < 0) return;
        ensureTables();
        state.config.telegramInstancesTable.splice(idx, 1);
        renderTelegramConfigCard();
      });
      ui.telegramInstancesList.addEventListener('input', ev => {
        const input = ev.target.closest('[data-telegram-instance-field]');
        if (!input) return;
        const idx = Number(input.getAttribute('data-telegram-instance-idx'));
        const field = String(input.getAttribute('data-telegram-instance-field') || '');
        if (!Number.isInteger(idx) || idx < 0 || !['instance', 'token'].includes(field)) return;
        ensureTables();
        if (!state.config.telegramInstancesTable[idx]) return;
        state.config.telegramInstancesTable[idx][field] = String(input.value || '').trim();
      });
    }
    if (ui.telegramTargetsList) {
      ui.telegramTargetsList.addEventListener('click', ev => {
        const btn = ev.target.closest('[data-del-telegram-target]');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-del-telegram-target'));
        if (!Number.isInteger(idx) || idx < 0) return;
        ensureTables();
        state.config.telegramTargetsTable.splice(idx, 1);
        renderTelegramConfigCard();
      });
      ui.telegramTargetsList.addEventListener('input', ev => {
        const input = ev.target.closest('[data-telegram-target-field]');
        if (!input) return;
        const idx = Number(input.getAttribute('data-telegram-target-idx'));
        const field = String(input.getAttribute('data-telegram-target-field') || '');
        if (!Number.isInteger(idx) || idx < 0 || !['instance', 'chatId'].includes(field)) return;
        ensureTables();
        if (!state.config.telegramTargetsTable[idx]) return;
        state.config.telegramTargetsTable[idx][field] = String(input.value || '').trim();
      });
    }
    if (ui.telegramTestTextBtn) ui.telegramTestTextBtn.addEventListener('click', () => triggerTelegramTest('text').catch(e => setStatus(String(e), true)));
    if (ui.telegramTestPhotoBtn) ui.telegramTestPhotoBtn.addEventListener('click', () => triggerTelegramTest('photo').catch(e => setStatus(String(e), true)));
    if (ui.telegramTestPhotoCaptionBtn) ui.telegramTestPhotoCaptionBtn.addEventListener('click', () => triggerTelegramTest('photoCaption').catch(e => setStatus(String(e), true)));
    if (ui.canvasEntitiesList) {
      ui.canvasEntitiesList.addEventListener('click', ev => {
        const editBtn = ev.target.closest('[data-entity-edit]');
        if (editBtn) {
          const [kind, idxRaw] = String(editBtn.getAttribute('data-entity-edit') || '').split(':');
          const idx = Number(idxRaw);
          if (!kind || !Number.isInteger(idx) || !state.config[kind]?.[idx]) return;
          const row = state.config[kind][idx];
          const floor = String(row.floor || 'EG') === 'OG' ? 'OG' : 'EG';
          state.currentFloor = floor;
          void updateFloorButtons();
          const id = kind === 'camerasTable'
            ? String(row.personDetectionDp || row.snapshotUrl || row.ip || '')
            : String(row.id || '');
          const x = floor === 'OG' ? row.posXOg : (row.posXEg ?? row.posX);
          const y = floor === 'OG' ? row.posYOg : (row.posYEg ?? row.posY);
          renderAllCanvases();
          selectEntity({
            kind,
            idx,
            id: String(id || ''),
            entityId: String(id || ''),
            entityKey: String(row.key || id),
            label: String(row.label || row.key || id),
            zone: String(row.zone || 'pool'),
            floor,
            posX: Number.isFinite(Number(x)) ? Number(x) : null,
            posY: Number.isFinite(Number(y)) ? Number(y) : null,
            hasPos: Number.isFinite(Number(x)) && Number.isFinite(Number(y))
          });
          return;
        }
        const delBtn = ev.target.closest('[data-entity-del]');
        if (delBtn) {
          const [kind, idxRaw] = String(delBtn.getAttribute('data-entity-del') || '').split(':');
          const idx = Number(idxRaw);
          if (!kind || !Number.isInteger(idx) || !Array.isArray(state.config[kind]) || !state.config[kind][idx]) return;
          snapshotCanvasState();
          const deleted = state.config[kind][idx];
          state.config[kind].splice(idx, 1);
          if (state.selectedEntity && state.selectedEntity.kind === kind && state.selectedEntity.idx === idx) {
            state.selectedEntity = null;
            closeEntityModalNow();
          }
          renderAllCanvases();
          setStatus(`Element gelöscht: ${String(deleted.label || deleted.key || kind)}`);
        }
      });
    }
    if (ui.canvasEntitySearch) {
      ui.canvasEntitySearch.addEventListener('input', renderCanvasEntitiesList);
    }
    $('focusAddEntityBtn')?.addEventListener('click', () => {
      $('newLabel')?.focus();
    });

    updateSnapshotZoneUiState();
    updateOverviewShowSensorsButton();
    await refreshLiveStatus();
    await refreshPanicButton();
    switchPage('overview');
    setInterval(() => { void refreshLiveStatus(); }, 2000);
    setInterval(() => { void refreshPanicButton(); }, 2000);
  }

  init().catch(err => setStatus(String(err), true));
})();
