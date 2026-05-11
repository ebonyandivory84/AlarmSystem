# Alarmanlage Adapter Blueprint (ioBroker)

## Ziel
Ein zentraler, modularer Adapter mit gleicher Funktion wie die aktuellen JavaScript-Skripte, aber mit:
- einer zentralen State Machine
- konfigurierbaren Sensor-/Aktor-Mappings
- klarer Trennung von Core-Logik und Integrationen
- sauberer Erweiterbarkeit für neue Sensoren, Kameras, Trigger und Hardware

## Empfohlene Adapter-Struktur

```text
alarmcenter/
  package.json
  io-package.json
  admin/
    jsonConfig.json
  src/
    main.ts
    config/
      types.ts
      normalize.ts
      validate.ts
    core/
      eventBus.ts
      stateMachine.ts
      transitionTable.ts
      guards.ts
      timers.ts
    domain/
      sensors/
        aggregator.ts
        matcher.ts
      alarm/
        arming.ts
        countdown.ts
        siren.ts
        triggerReason.ts
      ui/
        displayManager.ts
        ledManager.ts
        buzzerManager.ts
        standbyManager.ts
      auth/
        pinCommands.ts
        fingerprintAuth.ts
      automation/
        awayAutoArm.ts
        bedtimePerimeter.ts
        checkBeforeArm.ts
        panic.ts
    integrations/
      telegram.ts
      reolink.ts
      cameras.ts
      alexa.ts
      hmip.ts
      tuya.ts
    objects/
      objectTree.ts
```

## Zentrale Architekturprinzipien
- Alle `subscribeForeignStates` laufen in `sensors/aggregator.ts`.
- Alle eingehenden Änderungen werden als normalisierte Domain-Events verarbeitet.
- Nur die FSM entscheidet über Zustandsübergänge (`disarmed`, `perimeter`, `armed`, `countdown`, `alarm`, `panic`).
- Aktoren (Display/Buzzer/LED/Sirene) reagieren auf FSM-Zustand + Kontext, nicht direkt auf rohe Sensorwerte.
- Neue Sensoren/Kameras werden nur in der Konfiguration ergänzt, ohne Codeänderung.

## Ereignismodell (normalisiert)

```ts
type DomainEvent =
  | { type: 'SENSOR_OPEN'; sensorId: string; sensorType: 'door'|'window'|'motion'|'cameraHuman' }
  | { type: 'SENSOR_CLOSED'; sensorId: string; sensorType: 'door'|'window'|'motion'|'cameraHuman' }
  | { type: 'ARM_REQUEST'; mode: 'full'|'perimeter'; source: 'ui'|'telegram'|'auto' }
  | { type: 'DISARM_REQUEST'; source: 'ui'|'fingerprint'|'telegram'|'pin' }
  | { type: 'PANIC_ON'; source: string }
  | { type: 'PANIC_OFF'; source: string }
  | { type: 'COUNTDOWN_EXPIRED' }
  | { type: 'AUTH_OK'; method: 'fingerprint'|'pin'|'telegram'; actor?: string }
  | { type: 'AUTH_FAILED'; method: 'fingerprint'|'pin'|'telegram'; actor?: string };
```

## Zustände und Übergänge (FSM)
- `disarmed`
- `perimeter`
- `armed`
- `countdown`
- `alarm`
- `panic`

### Kernübergänge
1. `disarmed` -> `perimeter` bei `ARM_REQUEST(mode=perimeter)`
2. `disarmed` -> `armed` bei `ARM_REQUEST(mode=full)`
3. `perimeter|armed` -> `countdown` bei Trigger in aktiver Sensorgruppe
4. `countdown` -> `disarmed` bei `AUTH_OK`/`DISARM_REQUEST`
5. `countdown` -> `alarm` bei `COUNTDOWN_EXPIRED`
6. `alarm` -> `disarmed` bei `AUTH_OK`/`DISARM_REQUEST`
7. `*` -> `panic` bei `PANIC_ON`
8. `panic` -> `disarmed` bei `PANIC_OFF`

## Konfigurierbarkeit (entscheidend für Erweiterbarkeit)
- Sensorlisten (beliebig viele) inkl. Typ und Triggerwerten
- Arming-Profile (welche Sensorgruppen aktiv sind)
- Countdown-/Cooldown-/Retry-Zeiten
- Fingerprint-Whitelist
- PIN-Sequenzen und Aktionen (Garage, PDLC, etc.)
- Kamera-Mappings (humanDetection DP, snapshot URL, Reolink-Sirene, LED)
- Notification-Kanäle und Empfänger

## Migration deiner bestehenden Skripte auf Module
- `ActivateAlarmCountdown*`, `ActivateSiren*`, `AlarmTrigger`, `Status` -> `core/stateMachine` + `domain/alarm/*`
- `Display`, `LED`, `StandBy`, `beepsWhenDoorOpens`, `confirm_perimeter_protection` -> `domain/ui/*`
- `DoorbellFingerprint*`, `PDLC_control`, `GarageDoorControl` -> `domain/auth/*` + `domain/automation/*`
- `PerimeterKeeper`, `Camera & AlarmCenter Connection`, `PANIC` -> `integrations/*` + `domain/automation/panic.ts`
- `armWhenNobody...`, `PerimeterProtection_at_bedtime` -> `domain/automation/*`

## Technische Leitplanken
- Keine Secrets im Code; nur Adapter-Config (verschlüsselte Felder).
- Keine dynamischen `on`-Registrierungen während Laufzeit.
- Keine Polling-Loops für Türstatus; eventbasiert arbeiten.
- Debounce/Dedupe zentral pro Eventquelle.
- Jede Aktor-Ausgabe über Rate-Limiter (Display/Buzzer/Telegram).

## Empfohlene Implementierungsphasen
1. Basisadapter + Objektbaum + Konfigschema
2. Sensor-Aggregation + FSM (nur intern, read-only)
3. Arming/Countdown/Alarm/Sirene
4. AlarmCenter UI (Display/LED/Buzzer/StandBy)
5. Auth (Fingerprint/PIN) + Garage/PDLC
6. Kamera/Telegram/Panic/AutoArm
7. Alt-Skripte schrittweise deaktivieren (A/B Vergleich)
