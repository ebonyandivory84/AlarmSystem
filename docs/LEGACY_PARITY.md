# Legacy Parity Matrix (23/23)

Statusziel: Alle ursprünglichen JavaScript-Skripte sind im Adapter funktional abgebildet.
Kategorien:
- `Abgedeckt`: direkt im Adapter umgesetzt
- `Stabilisiert`: gleiche Funktion, aber robuster umgesetzt (weniger Race/Polling)

## AlarmCenter

1. `AlarmCenter_-_BuzzerWarning_when_leaving_house_and_a_door_is_open`
- Status: `Abgedeckt`
- Mapping: Eingang/Nebeneingang open + weitere Öffnung offen -> `Buzzer=decline` (timed)

2. `AlarmCenter_-_DoorbellFingerprint_match_deactivates_alarm_IV`
- Status: `Abgedeckt`
- Mapping: Fingerprint-Name-Match + Dedupe -> Disarm + Telegram

3. `AlarmCenter_-_PDLC_control`
- Status: `Abgedeckt`
- Mapping: PIN `*4/*5` -> PDLC open/close

4. `AlarmCenter_ActivateAlarmCountdown_(PerimeterProtection)`
- Status: `Abgedeckt`
- Mapping: Trigger bei aktiver Zone -> Entry Countdown

5. `AlarmCenter_ActivateAlarmCountdown_(SystemArmed)`
- Status: `Abgedeckt`
- Mapping: Trigger bei Full/Innenraum-Zone -> Entry Countdown

6. `AlarmCenter_ActivateSiren_II`
- Status: `Stabilisiert`
- Mapping: Countdown -> Sirene, Abbruch bei Unscharf, Buzzer-/Display-Führung

7. `AlarmCenter_AlarmMessage_Telegram`
- Status: `Abgedeckt`
- Mapping: Alarmmeldung + Triggerbezug via Telegram

8. `AlarmCenter_AlarmTrigger`
- Status: `Stabilisiert`
- Mapping: Triggergrund-Text + Speicherung im Runtime/Eventlog

9. `AlarmCenter_Display`
- Status: `Stabilisiert`
- Mapping: Display-Hinweise bei Alarm/Countdown/PIN/Garage + Clear-Handling

10. `AlarmCenter_GarageDoorControl`
- Status: `Abgedeckt`
- Mapping: PIN `*1/*2` -> Garage open/close + Displaytext

11. `AlarmCenter_LED_s`
- Status: `Stabilisiert`
- Mapping: LED rot/gelb nach Kontakt-/Bewegungslage

12. `AlarmCenter_PerimeterProtection_at_bedtime_II`
- Status: `Abgedeckt`
- Mapping: bedtime + light threshold + home presence -> perimeter arm

13. `AlarmCenter_StandBy_(if_no_motion)`
- Status: `Stabilisiert`
- Mapping: no motion -> standby true + periodischer Safety-Check

14. `AlarmCenter_Status`
- Status: `Abgedeckt`
- Mapping: Status-Text inkl. offen/scharf/inaktiv

15. `AlarmCenter_armWhenNobody_sAtHome`
- Status: `Abgedeckt`
- Mapping: nobody home -> delayed auto-arm + Telegram

16. `AlarmCenter_beepsWhenDoorOpens`
- Status: `Abgedeckt`
- Mapping: Kontakt open -> `Buzzer=beep 2x` + reset

17. `AlarmCenter_check_doors_before_arming`
- Status: `Abgedeckt`
- Mapping: `CheckRed/CheckYellow` nach Türzuständen

18. `AlarmCenter_confirm_perimeter_protection`
- Status: `Abgedeckt`
- Mapping: Perimeter arm -> confirm buzzer + display message

19. `AlarmCenter_reset_human_detection`
- Status: `Abgedeckt`
- Mapping: Initial reset auf `-` + delayed reset nach Änderungen

## AlarmSystem

20. `AlarmSystem_-_Camera_&_AlarmCenter_Connection`
- Status: `Stabilisiert`
- Mapping: Arm/Disarm Spiegelung auf CCTV + Triggerpfade

21. `AlarmSystem_-_PANIC_II`
- Status: `Abgedeckt`
- Mapping: Panic ON/OFF -> Camera flags + Reolink sirens + disarmed marker

22. `AlarmSystem_-_PerimeterKeeper_VII`
- Status: `Stabilisiert`
- Mapping: Person detection -> Snapshot/Telegram + Kameraalarm/LED + Guarding/Cooldowns

23. `AlarmCenter.json` (Channel-Struktur)
- Status: `Abgedeckt`
- Mapping: Adapter-seitige State-Struktur + AlarmCenter-HI Konfigtab

---

## Sichtbare WENN/DANN-Logik im Adapter
- `alarmsystem.0.rules.ifThenText`
- `alarmsystem.0.rules.ifThenJson`

## Hinweise
- Einige Alt-Skripte enthielten bewusst unstabile Patterns (z. B. Polling/Mehrfachlistener).
- Im Adapter wurden diese gleich funktional, aber robuster umgesetzt.
