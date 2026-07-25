# Platform Guide

The GestaltView Agent Trainer should be easy to approach whether the buyer is using a shell, Windows, Docker, or a browser-first device.

## Linux and macOS

Use the shell bootstrap:

```bash
npm run bootstrap:sh
npm run verify-setup
npm run wizard
```

## Windows

Use the PowerShell bootstrap:

```powershell
npm run bootstrap:windows
npm run verify-setup
npm run package:windows
```

## Docker

Use Docker when the buyer wants a controlled environment and does not want to install Node directly:

```bash
docker compose run --rm trainer npm run cli -- status
docker compose up wizard
```

The `wizard` service exposes the setup wizard on port `4177`.

## iOS and iPadOS

iOS is realistic as a browser-based operator surface, not as a local Docker or CLI host.

Practical support model:

- serve `setup/setup-wizard.html` through `npm run wizard` or a hosted deployment
- let the operator complete identity, tier, corpus-lane, and environment planning in Safari
- keep terminal and packaging work on a desktop, cloud workspace, or managed deployment

## Recommended Positioning

Be explicit with buyers:

- shell and Windows are first-class for setup and packaging
- Docker is first-class for controlled execution
- iOS is first-class for browser workflows and remote administration
- local iOS container or terminal execution is not a realistic primary target
