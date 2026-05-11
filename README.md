# ioBroker AlarmSystem Adapter

Custom ioBroker adapter blueprint and starter implementation for a modular alarm system.

## Goals
- Centralized alarm logic (FSM based)
- Fully configurable sensors, triggers, and cameras
- No hardcoded secrets (tokens/passwords are configured in adapter settings only)
- Extensible module structure for future hardware and integrations

## Current Content
- Architecture and migration blueprint in `blueprint/`
- Initial adapter scaffold (`src/main.ts`)
- Config schema examples without sensitive defaults
- Admin JSON config to manage mappings and credentials

## Security
No passwords/tokens are shipped as defaults. Fill credentials only in adapter instance settings.
