# Workflow Constraints

## Mandatory Before Edits

- Ensure `backups/` exists.
- Run `powershell -ExecutionPolicy Bypass -File tools/new-backup.ps1 -Name before-<work-name>` before broad code edits.
- Run `powershell -ExecutionPolicy Bypass -File tools/new-work-snapshot.ps1 -Name before-<work-name>` before architectural changes.

## Mandatory After Edits

- Run `powershell -ExecutionPolicy Bypass -File tools/new-work-snapshot.ps1 -Name after-<work-name>`.
- Run `powershell -ExecutionPolicy Bypass -File tools/validate-workspace.ps1`.
- When Node/Bun are available, also run typecheck, lint and tests.
- For GitHub Pages, publish only `dist/` through GitHub Actions. Never publish the repository root.

## Product Constraints

- The game target is local/offline single-player campaign.
- Online multiplayer must not be exposed in the UI.
- Italian is the mandatory language target.
- Gameplay settings must become campaign-controlled, not freely editable by the player.
- Every campaign level must display exact victory conditions before battle start.
- Challenge rotation must be seed-backed or otherwise persisted, never transient UI-only randomness.
- Every progression feature needs persistence, validation, and reload behavior.

## Technical Constraints

- Prefer additive modules for campaign, AI and validation.
- Legacy multiplayer source must stay removed unless an explicit local-only replacement is designed.
- Keep generated maps under `docs/generated`.
- Keep backups out of runtime imports and app bundles.
