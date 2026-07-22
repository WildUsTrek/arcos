# ArcoMage HD Workmap

## Objective

Transform the current configurable single-player game into a curated Italian-first local/offline campaign experience with progressive numbered battles, visible rewards, named opponents, tavern identity, rotating challenge modes, and a materially stronger enemy AI.

## Current Architecture

- Runtime: Vite, React, TypeScript, Redux, redux-observable, RxJS.
- Core game loop: `src/epics/game_general`, `src/epics/cards`, `src/reducers`, `src/utils/checkVictory.ts`.
- Battle settings: `src/constants/defaultSettings.ts`, `src/data/preSettings.ts`, `src/components/screens/Pref.tsx`.
- AI: `src/ai/main.ts`, `src/ai/getMaxScore.ts`, `src/ai/coefs.ts`, invoked by `src/epics/cards/aiPlayCardEpic.ts`.
- Language: `src/i18n/langs.ts`, `src/i18n/I18nProvider.tsx`, `src/components/screens/LangPref.tsx`, `src/epics/settings_lang_etc`.
- Offline/PWA: `vite.config.ts` uses `vite-plugin-pwa` and caches JS, CSS, HTML, images, audio and fonts.
- Multiplayer: `src/webrtc` and `src/epics/multiplayer`; not fully offline because signaling/STUN are network-dependent.

## Local/Offline Assessment

Single-player can be made fully local/offline after dependencies are installed and the app is built or served locally. The repo contains the game source, cards, images, sound effects, fonts and translations.

Current blockers on this machine:

- `node`, `npm`, `bun` and `git` are not available in PATH.
- `vite.config.ts` currently calls `git log -1`, so build needs either Git available or a fallback for missing Git.
- Existing PWA offline mode works after first successful load/install, not by opening raw source files directly.
- Multiplayer is not offline-complete because PeerJS/signaling and STUN require network services.

## Requirements Registry

| ID | Requirement | Current state | Target |
| --- | --- | --- | --- |
| R1 | Persistent project mapping tool | Missing | `tools/project-map.ps1` generates JSON/Markdown maps. |
| R2 | Italian mandatory language | Missing | Default and locked language `it`; remove language selector or make it non-interactive. |
| R3 | Progressive campaign | Missing | Numbered battles with locked/unlocked progression. |
| R4 | Visible rewards | Missing | Each battle shows reward before starting and records earned rewards. |
| R5 | Increasing difficulty | Partial | Battle config must scale conditions, AI depth, and challenge modifiers. |
| R6 | Stronger AI | Partial/weak | Replace single-turn heuristic with opponent-aware, multi-turn or simulation-based decisioning. |
| R7 | Random rotating challenge modes | Missing | Controlled random mode per battle, persisted in campaign run state. |
| R8 | Named opponents | Partial names only | Curated Italian opponent roster per battle/difficulty. |
| R9 | Tavern identity | Existing tavern data | Show Italian tavern name/location as battle frame, not as settings preset selector. |
| R10 | Restrict settings menu | Missing | Remove/lock gameplay-affecting controls in campaign mode. |
| R11 | Local/offline validation | Partial | Build, preview, PWA smoke test, and no-network single-player test. |

## Why The Current AI Is Too Easy

- It evaluates only the immediate effect of the current card, not multi-turn consequences.
- It has no lookahead for the player response.
- It does not model deck probabilities beyond the current hand.
- It scores generic resource/tower/wall deltas with fixed coefficients.
- It treats discard as a simple inverse score, so hand quality and future draw tempo are weakly represented.
- `aiLevel = 0` only means deterministic best immediate score; it is not a strategic search.
- It does not adapt to battle mode, tavern rules, player style, or imminent threats except direct win/loss checks.

## Proposed Campaign Model

Create a new `src/campaign` module:

- `campaignTypes.ts`: level, reward, opponent, tavern, challenge mode, unlock state.
- `campaignLevels.ts`: numbered canonical campaign map.
- `challengeModes.ts`: modifiers such as limited hand, rich start, fragile tower, high resource victory, fast economy, wall siege.
- `campaignProgress.ts`: localStorage persistence with schema/version.
- `campaignSelectors.ts`: derived current level, next reward, active constraints.

Redux integration:

- Add `campaign` reducer.
- Add campaign actions for start level, complete level, claim reward, reroll allowed challenge mode if designed.
- Extend `INIT`/`INIT_CORE` flow so settings are produced from campaign level instead of freeform preferences.
- End screen writes progression only after validated win.

UI integration:

- Replace free settings workflow with a battle screen: level number, opponent, tavern, challenge mode, reward, start battle.
- Keep sound/graphics/accessibility settings if desired, but remove gameplay parameters and language switching.
- Force Italian strings and keep UI copy concise.

AI upgrade path:

- Phase 1: calibrated heuristic with threat detection, card synergy, resource starvation, discard quality, and victory race awareness.
- Phase 2: one-ply lookahead over likely player hand outcomes.
- Phase 3: Monte Carlo rollouts or bounded minimax for high-level opponents, budgeted to avoid mobile jank.
- Phase 4: battle-specific AI personalities that weight tower rush, resource win, denial, defense, or tempo.

## Validation Contract

Every implementation slice must pass:

- Static project map regenerated with `powershell -ExecutionPolicy Bypass -File tools/project-map.ps1`.
- TypeScript check once Node/Bun are installed.
- Unit tests for campaign progression, settings lock, Italian language lock, AI decision changes.
- Manual smoke test: start game, complete/lose battle, next level unlock behavior, reload persistence.
- Offline smoke test: production preview loaded once, then network disabled, single-player campaign remains playable.
- Regression check: cards render, audio works, mobile landscape notice still works, multiplayer either still works or is explicitly hidden from campaign.

## Work Phases

1. Environment baseline: install/enable Node/Bun/Git or patch build fallback for missing Git.
2. Mapping baseline: run project map and keep generated docs committed.
3. Italian lock: default `it`, remove language button/window, ignore stored non-Italian language.
4. Campaign data model: levels, taverns, opponents, rewards, challenge modes.
5. Campaign game flow: start battle from campaign config and persist progress.
6. Settings restriction: remove gameplay manipulation from user-facing campaign UI.
7. AI hardening: improve heuristic, then add lookahead/simulation where performance allows.
8. Validation pass: automated tests, manual gameplay checks, offline/PWA check.

## Open Decisions

- Number of campaign levels for first release.
- Whether rewards are cosmetic, gameplay modifiers, unlocks, or score/rank badges.
- Whether multiplayer remains accessible outside campaign.
- Whether existing tavern presets are reused exactly or rebalanced for campaign progression.
