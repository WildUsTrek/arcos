# Workflow Constraints

## Mandatory Before Edits

- Ensure `backups/` exists.
- Run `powershell -ExecutionPolicy Bypass -File tools/new-backup.ps1 -Name before-<work-name>` before broad code edits.
- Run `powershell -ExecutionPolicy Bypass -File tools/new-work-snapshot.ps1 -Name before-<work-name>` before architectural changes.

## Mandatory After Edits

- Run `powershell -ExecutionPolicy Bypass -File tools/new-work-snapshot.ps1 -Name after-<work-name>`.
- Run `powershell -ExecutionPolicy Bypass -File tools/validate-workspace.ps1`.
- When Node/Bun are available, also run typecheck, lint and tests.

## Product Constraints

- The game target is local/offline single-player campaign.
- Online multiplayer must not be exposed in the UI.
- Italian is the mandatory language target.
- Gameplay settings must become campaign-controlled, not freely editable by the player.
- Every progression feature needs persistence, validation, and reload behavior.

## Technical Constraints

- Prefer additive modules for campaign, AI and validation.
- Do not delete legacy multiplayer files until the root epic and UI are clean and tests exist for the single-player path.
- Keep generated maps under `docs/generated`.
- Keep backups out of runtime imports and app bundles.
