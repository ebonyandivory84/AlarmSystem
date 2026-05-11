# Vorgeschlagener State-Baum (Adapter Instanz)

Basis: `alarmcenter.0.*`

## runtime
- `runtime.mode` (string): `disarmed|perimeter|armed|countdown|alarm|panic`
- `runtime.armed` (boolean)
- `runtime.perimeter` (boolean)
- `runtime.countdownActive` (boolean)
- `runtime.countdownRemainingSec` (number)
- `runtime.alarmActive` (boolean)
- `runtime.panicActive` (boolean)
- `runtime.lastTriggerSensor` (string)
- `runtime.lastTriggerType` (string)
- `runtime.lastTriggerTs` (number)
- `runtime.nightMode` (boolean)

## commands (writeable)
- `commands.armFull`
- `commands.armPerimeter`
- `commands.disarm`
- `commands.panicOn`
- `commands.panicOff`
- `commands.acknowledge`

## ui
- `ui.displayText`
- `ui.displayClear`
- `ui.buzzerPattern`
- `ui.ledRed`
- `ui.ledYellow`
- `ui.standby`

## diagnostics
- `diagnostics.health`
- `diagnostics.lastTransition`
- `diagnostics.lastError`
- `diagnostics.listenerCount`
- `diagnostics.eventRatePerMin`

## mirrors (optional, für Rückwärtskompatibilität)
- `compat.mqttAlarmSystemArmed` -> schreibt auf `mqtt.1.AlarmCenter.AlarmSystemArmed`
- `compat.mqttPerimeterProtection` -> schreibt auf `mqtt.1.AlarmCenter.PerimeterProtection`
- `compat.mqttActivateCountdown` -> schreibt auf `mqtt.1.AlarmCenter.ActivateAlarmCountdown`
- `compat.mqttActivateSiren` -> schreibt auf `mqtt.1.AlarmCenter.ActivateSiren`
- `compat.mqttAlarmTrigger` -> schreibt auf `mqtt.1.AlarmCenter.AlarmTrigger`

Hinweis: `compat.*` nur temporär für Migration verwenden, später abschalten.
