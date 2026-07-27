param(
  [string]$Root = (Resolve-Path "$PSScriptRoot\..").Path
)

$ErrorActionPreference = "Stop"

$resolvedRoot = (Resolve-Path $Root).Path
$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Details)
  $script:checks.Add([PSCustomObject]@{
    name = $Name
    passed = $Passed
    details = $Details
  })
}

$backupDir = Join-Path $resolvedRoot "backups"
Add-Check "backup-folder" (Test-Path $backupDir) "Required backup folder: backups"

foreach ($tool in @("tools\project-map.ps1", "tools\new-backup.ps1", "tools\new-work-snapshot.ps1", "tools\compare-project-maps.ps1", "tools\work-env.ps1")) {
  Add-Check "tool:$tool" (Test-Path (Join-Path $resolvedRoot $tool)) $tool
}

$epicsIndex = Join-Path $resolvedRoot "src\epics\index.ts"
$epicsText = if (Test-Path $epicsIndex) { Get-Content -LiteralPath $epicsIndex -Raw } else { "" }
Add-Check "no-active-multiplayer-epics" ($epicsText -notmatch "\./multiplayer/") "Root epic must not import multiplayer epics"

$pref = Join-Path $resolvedRoot "src\components\screens\Pref.tsx"
$prefText = if (Test-Path $pref) { Get-Content -LiteralPath $pref -Raw } else { "" }
Add-Check "no-multiplayer-preferences-ui" ($prefText -notmatch "SWITCH_MULTIPLAYER_MODE|CONNECT_TO_ID|Your ID|opponent's ID|Multiplayer") "Preferences must not expose online multiplayer"
Add-Check "no-gameplay-settings-ui" ($prefText -notmatch "NumberInput|winTower|winResource|cardsInHand|brickProd|gemProd|recruitProd") "Campaign screen must not expose gameplay settings controls"

$webRtcDir = Join-Path $resolvedRoot "src\webrtc"
$onlineMultiplayerEpicDir = Join-Path $resolvedRoot "src\epics\multiplayer"
$multiplayerUtilsDir = Join-Path $resolvedRoot "src\utils\multiplayer"
$multiplayerReducerFile = Join-Path $resolvedRoot "src\reducers\multiplayer.ts"
$multiplayerUtilsFiles = if (Test-Path $multiplayerUtilsDir) { @(Get-ChildItem -LiteralPath $multiplayerUtilsDir -File -Recurse) } else { @() }
$packageJson = Join-Path $resolvedRoot "package.json"
$packageText = if (Test-Path $packageJson) { Get-Content -LiteralPath $packageJson -Raw } else { "" }
Add-Check "no-webrtc-source" (-not (Test-Path $webRtcDir)) "WebRTC source directory must be removed"
Add-Check "no-online-multiplayer-epics-dir" (-not (Test-Path $onlineMultiplayerEpicDir)) "Online multiplayer epic directory must be removed"
Add-Check "no-multiplayer-utils-files" ($multiplayerUtilsFiles.Count -eq 0) "Multiplayer utility source files must be removed"
Add-Check "no-multiplayer-reducer" (-not (Test-Path $multiplayerReducerFile)) "Multiplayer reducer must be removed from source"
Add-Check "no-peerjs-dependency" ($packageText -notmatch '"peerjs"') "peerjs dependency must not be present"

$langsFile = Join-Path $resolvedRoot "src\i18n\langs.ts"
$langsText = if (Test-Path $langsFile) { Get-Content -LiteralPath $langsFile -Raw } else { "" }
$buttonBarFile = Join-Path $resolvedRoot "src\components\buttons\ButtonBar.tsx"
$buttonBarText = if (Test-Path $buttonBarFile) { Get-Content -LiteralPath $buttonBarFile -Raw } else { "" }
$langButtonFile = Join-Path $resolvedRoot "src\components\buttons\ButtonLangPref.tsx"
$langScreenFile = Join-Path $resolvedRoot "src\components\screens\LangPref.tsx"
$windowListFile = Join-Path $resolvedRoot "src\components\GameWindowList.tsx"
$windowListText = if (Test-Path $windowListFile) { Get-Content -LiteralPath $windowListFile -Raw } else { "" }
$readLsEpicFile = Join-Path $resolvedRoot "src\epics\settings_lang_etc\readlsUpdatestoreInitEpic.ts"
$readLsEpicText = if (Test-Path $readLsEpicFile) { Get-Content -LiteralPath $readLsEpicFile -Raw } else { "" }
Add-Check "mandatory-italian-default" ($langsText -match "defaultLang = 'it'") "defaultLang must be Italian"
Add-Check "no-language-button" ($buttonBarText -notmatch "ButtonLangPref") "ButtonBar must not expose language selection"
Add-Check "no-language-button-file" (-not (Test-Path $langButtonFile)) "Language button source must be removed"
Add-Check "no-language-screen-file" (-not (Test-Path $langScreenFile)) "Language selection screen source must be removed"
Add-Check "no-language-window-render" ($windowListText -notmatch "LangPref") "GameWindowList must not render language preferences"
Add-Check "stored-language-ignored" ($readLsEpicText -match "lang: defaultLang") "Startup must force default language"
Add-Check "stored-gameplay-settings-ignored" ($readLsEpicText -notmatch "payload: settings") "Startup must not restore old gameplay settings"
Add-Check "stored-ai-level-ignored" ($readLsEpicText -notmatch "UPDATE_AILEVEL_MAIN") "Startup must not restore old AI level"
Add-Check "startup-opens-campaign-menu" ($readLsEpicText -match "SCREEN_PREF" -and $readLsEpicText -notmatch "type: INIT") "Startup must open the campaign menu instead of starting a generic battle"

$campaignLevelsFile = Join-Path $resolvedRoot "src\campaign\levels.ts"
$campaignReducerFile = Join-Path $resolvedRoot "src\reducers\campaign.ts"
$campaignIntroFile = Join-Path $resolvedRoot "src\components\screens\CampaignBattleIntro.tsx"
$campaignIntroStylesFile = Join-Path $resolvedRoot "src\components\screens\CampaignBattleIntro.module.scss"
$fullscreenGateFile = Join-Path $resolvedRoot "src\components\screens\MobileFullscreenGate.tsx"
$gameSizeProviderFile = Join-Path $resolvedRoot "src\utils\contexts\GameSizeProvider.tsx"
$zoneStatusFile = Join-Path $resolvedRoot "src\components\zoneStatus\ZoneStatus.tsx"
$localstorageFile = Join-Path $resolvedRoot "src\utils\localstorage.ts"
$campaignProgressEpicFile = Join-Path $resolvedRoot "src\epics\campaign\progressEpic.ts"
$screenEndEpicFile = Join-Path $resolvedRoot "src\epics\screen\screenEndEpic.ts"
$closeEndEpicFile = Join-Path $resolvedRoot "src\epics\screen\closeScreenEndInitEpic.ts"
$pwaNoticeFile = Join-Path $resolvedRoot "src\components\PwaUpdateNotice.tsx"
$balanceToolFile = Join-Path $resolvedRoot "tools\campaign-balance-report.ts"
$balanceTestFile = Join-Path $resolvedRoot "__test__\campaign\campaignBalance.test.ts"
$cardPosStyleFile = Join-Path $resolvedRoot "src\components\zoneCards\CardPosStyle.tsx"
$statusFile = Join-Path $resolvedRoot "src\components\zoneStatus\Status.tsx"
$statusStylesFile = Join-Path $resolvedRoot "src\components\zoneStatus\Status.module.scss"
$windowFile = Join-Path $resolvedRoot "src\components\screens\Window.tsx"
$windowStylesFile = Join-Path $resolvedRoot "src\components\screens\Window.module.scss"
$endScreenFile = Join-Path $resolvedRoot "src\components\screens\EndScreen.tsx"
$endScreenStylesFile = Join-Path $resolvedRoot "src\components\screens\EndScreen.module.scss"
$campaignLevelsText = if (Test-Path $campaignLevelsFile) { Get-Content -LiteralPath $campaignLevelsFile -Raw } else { "" }
$prefCampaignText = if (Test-Path $pref) { Get-Content -LiteralPath $pref -Raw } else { "" }
$campaignIntroText = if (Test-Path $campaignIntroFile) { Get-Content -LiteralPath $campaignIntroFile -Raw } else { "" }
$campaignIntroStylesText = if (Test-Path $campaignIntroStylesFile) { Get-Content -LiteralPath $campaignIntroStylesFile -Raw } else { "" }
$fullscreenGateText = if (Test-Path $fullscreenGateFile) { Get-Content -LiteralPath $fullscreenGateFile -Raw } else { "" }
$gameSizeProviderText = if (Test-Path $gameSizeProviderFile) { Get-Content -LiteralPath $gameSizeProviderFile -Raw } else { "" }
$zoneStatusText = if (Test-Path $zoneStatusFile) { Get-Content -LiteralPath $zoneStatusFile -Raw } else { "" }
$localstorageText = if (Test-Path $localstorageFile) { Get-Content -LiteralPath $localstorageFile -Raw } else { "" }
$campaignProgressEpicText = if (Test-Path $campaignProgressEpicFile) { Get-Content -LiteralPath $campaignProgressEpicFile -Raw } else { "" }
$screenEndEpicText = if (Test-Path $screenEndEpicFile) { Get-Content -LiteralPath $screenEndEpicFile -Raw } else { "" }
$closeEndEpicText = if (Test-Path $closeEndEpicFile) { Get-Content -LiteralPath $closeEndEpicFile -Raw } else { "" }
$pwaNoticeText = if (Test-Path $pwaNoticeFile) { Get-Content -LiteralPath $pwaNoticeFile -Raw } else { "" }
$balanceToolText = if (Test-Path $balanceToolFile) { Get-Content -LiteralPath $balanceToolFile -Raw } else { "" }
$balanceTestText = if (Test-Path $balanceTestFile) { Get-Content -LiteralPath $balanceTestFile -Raw } else { "" }
$cardPosStyleText = if (Test-Path $cardPosStyleFile) { Get-Content -LiteralPath $cardPosStyleFile -Raw } else { "" }
$statusText = if (Test-Path $statusFile) { Get-Content -LiteralPath $statusFile -Raw } else { "" }
$statusStylesText = if (Test-Path $statusStylesFile) { Get-Content -LiteralPath $statusStylesFile -Raw } else { "" }
$windowText = if (Test-Path $windowFile) { Get-Content -LiteralPath $windowFile -Raw } else { "" }
$windowStylesText = if (Test-Path $windowStylesFile) { Get-Content -LiteralPath $windowStylesFile -Raw } else { "" }
$endScreenText = if (Test-Path $endScreenFile) { Get-Content -LiteralPath $endScreenFile -Raw } else { "" }
$endScreenStylesText = if (Test-Path $endScreenStylesFile) { Get-Content -LiteralPath $endScreenStylesFile -Raw } else { "" }
Add-Check "campaign-levels-present" (Test-Path $campaignLevelsFile) "Campaign level registry must exist"
Add-Check "campaign-reducer-present" (Test-Path $campaignReducerFile) "Campaign reducer must exist"
Add-Check "campaign-explicit-victory-conditions" ($campaignLevelsText -match "getVictoryConditions" -and $prefCampaignText -match "victoryConditions") "Campaign must expose exact victory conditions per level"
Add-Check "campaign-persisted-seed" ($campaignLevelsText -match "nextCampaignSeed" -and $readLsEpicText -match "campaign") "Campaign challenge rotation must be seed-backed and persisted"
Add-Check "campaign-battle-intro" ((Test-Path $campaignIntroFile) -and $windowListText -match "CampaignBattleIntro" -and $campaignIntroText -match "tavernName" -and $campaignIntroText -match "victoryConditions" -and $campaignIntroStylesText -match "\.tavern") "Campaign battle start must present tavern title, challenger, and victory conditions"
Add-Check "campaign-battle-intro-no-global-skip" ($campaignIntroText -notmatch "role=`"presentation`"" -and $campaignIntroText -match "Inizia battaglia" -and $campaignIntroStylesText -match "pointer-events: auto") "Campaign battle intro must not be globally skippable before rules are readable"
Add-Check "campaign-battle-intro-no-duplicate-tavern-card" ($campaignIntroText -notmatch "styles\.location") "Campaign intro rules phase must not duplicate the tavern presentation card"
Add-Check "campaign-battle-intro-no-duplicate-rules-phase" ($campaignIntroText -notmatch "dismissible") "Campaign intro must not show the same rules panel twice before battle start"
Add-Check "campaign-battle-intro-landscape-gated" ($windowListText -match "campaignIntroVisible = !landscape" -and $campaignIntroStylesText -match "aspect-ratio: 16 / 9" -and $campaignIntroStylesText -match "z-index: 130") "Campaign battle intro must respect landscape-first gameplay and overlay priority"
Add-Check "campaign-intro-mobile-landscape" ($campaignIntroStylesText -match "\(height <= 520px\) and \(orientation: landscape\)" -and $campaignIntroStylesText -match "\(width <= 760px\) and \(orientation: portrait\)") "Campaign intro must not collapse into a tall mobile landscape column"
Add-Check "campaign-starts-after-intro" ($prefCampaignText -notmatch "UPDATE_SETTINGS_INIT" -and $campaignIntroText -match "UPDATE_SETTINGS_INIT" -and $campaignIntroText -match "onClick=\{startBattle\}") "Campaign gameplay must initialize only after the premium intro confirmation"
Add-Check "campaign-menu-landscape-grid" ($windowStylesText -match "100dvw" -and $windowStylesText -match "safe-area-inset-right" -and $windowStylesText -match "min-height: min\(760px, calc\(100dvh - 24px\)\)" -and $windowStylesText -match "grid-template-areas" -and $windowStylesText -match "'map'" -and $prefCampaignText -match "Dettagli" -and $windowStylesText -match "campaigndetailsoverlay" -and $windowStylesText -match "position: fixed" -and $windowStylesText -match "z-index: 150") "Campaign menu must use a landscape grid with details moved to a controlled popup"
Add-Check "campaign-menu-mobile-landscape" ($windowStylesText -notmatch "@media \(width <= 900px\), \(height <= 560px\)" -and $windowStylesText -match "\(height <= 560px\) and \(orientation: landscape\)" -and $prefCampaignText -match "campaignstart") "Campaign menu must keep a compact landscape layout on short mobile screens"
Add-Check "campaign-menu-no-close-x" ($prefCampaignText -match "cancellable=\{false\}" -and $windowText -match "cancellable = true") "Campaign menu must not expose a generic close button in the required start flow"
Add-Check "mobile-visual-viewport" ($gameSizeProviderText -match "window\.visualViewport" -and $gameSizeProviderText -match "visualViewport\?\.addEventListener\('resize'" -and $gameSizeProviderText -match "visualViewport\?\.addEventListener\('scroll'") "Mobile sizing must use the visual viewport, not only layout viewport"
Add-Check "mobile-fullscreen-gate" ((Test-Path $fullscreenGateFile) -and $fullscreenGateText -match "Schermo intero richiesto" -and $fullscreenGateText -match "requestFs\(\)" -and $fullscreenGateText -match "pointer: coarse" -and $windowListText -match "MobileFullscreenGate") "Mobile play must require fullscreen where the browser supports it"
Add-Check "campaign-popup-readable-height" ($windowStylesText -match "min-height: calc\(100dvh - 56px\)" -and $windowStylesText -match "min-height: calc\(100dvh - 42px\)" -and $windowStylesText -match "font-size: 0\.9rem") "Campaign and details popups must use more mobile vertical space with readable text"
Add-Check "mobile-card-safe-area" ($cardPosStyleText -match "mobileSafeSideRatio" -and $cardPosStyleText -match "layoutWidth" -and $cardPosStyleText -match "layoutOffsetX") "Mobile battle card layout must reserve side safe area"
Add-Check "mobile-status-safe-area" ($statusText -match "size\.height \* \(size\.narrowMobile \? 1 / 2 : 2 / 3\)" -and $statusStylesText -match "\(height <= 560px\) and \(orientation: landscape\)") "Mobile battle status columns must use compact status-zone sizing"
Add-Check "campaign-opponent-name-in-battle" ($zoneStatusText -match "resolveCampaignLevel" -and $zoneStatusText -match "campaignOpponentName") "Battle status must show the resolved campaign opponent name"
Add-Check "campaign-durable-cache" ($localstorageText -match "campaignCacheSet" -and $readLsEpicText -match "campaignCacheGet" -and $campaignProgressEpicText -match "campaignCacheSet") "Campaign progress must be stored in a dedicated durable cache"
Add-Check "campaign-cache-reset-on-finish-or-loss" ($campaignProgressEpicText -match "campaignCompleted" -and $campaignProgressEpicText -match "campaignCacheClear" -and $screenEndEpicText -match "shouldResetCampaign" -and $screenEndEpicText -match "campaignCacheClear") "Campaign cache must clear only on campaign completion or campaign loss"
Add-Check "end-screen-returns-to-campaign-menu" ($closeEndEpicText -match "SCREEN_PREF" -and $closeEndEpicText -notmatch "type: INIT") "Closing the end screen must return to campaign menu instead of starting a generic battle"
Add-Check "campaign-map-present" ($prefCampaignText -match "campaignmap" -and $prefCampaignText -match "campaignnode" -and $windowStylesText -match "campaignmap") "Campaign menu must show a persistent level map"
Add-Check "campaign-loss-explained" ($screenEndEpicText -match "campaign-lost" -and $endScreenText -match "Campagna perduta" -and $endScreenStylesText -match "campaignlost") "Campaign loss must be explicitly explained to the player"
Add-Check "pwa-update-notice" ((Test-Path $pwaNoticeFile) -and $pwaNoticeText -match "registerSW" -and $pwaNoticeText -match "Nuova versione disponibile") "PWA must expose a visible update notice"
Add-Check "campaign-balance-tool" ((Test-Path $balanceToolFile) -and $balanceToolText -match "evaluateCampaignBalance" -and $balanceToolText -match "difficultyScore") "Campaign balance tool must evaluate every level"
Add-Check "campaign-balance-tests" ((Test-Path $balanceTestFile) -and $balanceTestText -match "difficulty trends upward" -and $balanceTestText -match "structural warnings") "Campaign balance must be covered by tests"
foreach ($mode in @("training", "stone-race", "thin-wall", "rich-start", "short-hand", "tower-rush", "resource-race", "siege")) {
  Add-Check "campaign-mode:$mode" ($campaignLevelsText -match "'$mode'") "Campaign mode $mode must be represented"
}

Add-Check "campaign-premium-panel" ($windowStylesText -match "campaignreward" -and $windowStylesText -match "campaignvictory") "Campaign screen must have reward and victory-condition presentation styles"
Add-Check "campaign-win-advance-panel" ($endScreenText -match "Next level unlocked" -and $endScreenStylesText -match "campaignadvance") "Win screen must present campaign reward/unlock progress"

$aiMainFile = Join-Path $resolvedRoot "src\ai\main.ts"
$aiIndexFile = Join-Path $resolvedRoot "src\ai\index.ts"
$aiCoefsFile = Join-Path $resolvedRoot "src\ai\coefs.ts"
$aiMainText = if (Test-Path $aiMainFile) { Get-Content -LiteralPath $aiMainFile -Raw } else { "" }
$aiIndexText = if (Test-Path $aiIndexFile) { Get-Content -LiteralPath $aiIndexFile -Raw } else { "" }
$aiCoefsText = if (Test-Path $aiCoefsFile) { Get-Content -LiteralPath $aiCoefsFile -Raw } else { "" }
Add-Check "ai-threat-lookahead" ($aiMainText -match "hasImmediateWinningReply" -and $aiIndexText -match "playerCardList") "AI must score immediate player winning replies from the player's hand"
Add-Check "ai-threat-coefficients" ($aiCoefsText -match "playerImmediateWinPenalty") "AI threat coefficients must exist"
Add-Check "ai-reply-penalty" ($aiMainText -match "estimateBestPlayerReplyScore" -and $aiCoefsText -match "playerReplyPenalty") "AI must penalize strong player replies"
Add-Check "ai-discard-quality" ($aiMainText -match "discardScore" -and $aiCoefsText -match "deadCardDiscardBonus") "AI must score discard quality"
Add-Check "ai-campaign-profile" ($aiMainText -match "profileScore" -and $aiIndexText -match "aiProfile") "AI must use campaign opponent profiles"

$failed = @($checks | Where-Object { -not $_.passed })
$report = [PSCustomObject]@{
  validatedAt = (Get-Date).ToString("s")
  passed = $failed.Count -eq 0
  checks = $checks
}

$report | ConvertTo-Json -Depth 5

if ($failed.Count -gt 0) {
  exit 1
}
