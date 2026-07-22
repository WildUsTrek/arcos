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

$campaignLevelsFile = Join-Path $resolvedRoot "src\campaign\levels.ts"
$campaignReducerFile = Join-Path $resolvedRoot "src\reducers\campaign.ts"
$campaignIntroFile = Join-Path $resolvedRoot "src\components\screens\CampaignBattleIntro.tsx"
$campaignIntroStylesFile = Join-Path $resolvedRoot "src\components\screens\CampaignBattleIntro.module.scss"
$zoneStatusFile = Join-Path $resolvedRoot "src\components\zoneStatus\ZoneStatus.tsx"
$localstorageFile = Join-Path $resolvedRoot "src\utils\localstorage.ts"
$campaignProgressEpicFile = Join-Path $resolvedRoot "src\epics\campaign\progressEpic.ts"
$screenEndEpicFile = Join-Path $resolvedRoot "src\epics\screen\screenEndEpic.ts"
$campaignLevelsText = if (Test-Path $campaignLevelsFile) { Get-Content -LiteralPath $campaignLevelsFile -Raw } else { "" }
$prefCampaignText = if (Test-Path $pref) { Get-Content -LiteralPath $pref -Raw } else { "" }
$campaignIntroText = if (Test-Path $campaignIntroFile) { Get-Content -LiteralPath $campaignIntroFile -Raw } else { "" }
$campaignIntroStylesText = if (Test-Path $campaignIntroStylesFile) { Get-Content -LiteralPath $campaignIntroStylesFile -Raw } else { "" }
$zoneStatusText = if (Test-Path $zoneStatusFile) { Get-Content -LiteralPath $zoneStatusFile -Raw } else { "" }
$localstorageText = if (Test-Path $localstorageFile) { Get-Content -LiteralPath $localstorageFile -Raw } else { "" }
$campaignProgressEpicText = if (Test-Path $campaignProgressEpicFile) { Get-Content -LiteralPath $campaignProgressEpicFile -Raw } else { "" }
$screenEndEpicText = if (Test-Path $screenEndEpicFile) { Get-Content -LiteralPath $screenEndEpicFile -Raw } else { "" }
Add-Check "campaign-levels-present" (Test-Path $campaignLevelsFile) "Campaign level registry must exist"
Add-Check "campaign-reducer-present" (Test-Path $campaignReducerFile) "Campaign reducer must exist"
Add-Check "campaign-explicit-victory-conditions" ($campaignLevelsText -match "getVictoryConditions" -and $prefCampaignText -match "victoryConditions") "Campaign must expose exact victory conditions per level"
Add-Check "campaign-persisted-seed" ($campaignLevelsText -match "nextCampaignSeed" -and $readLsEpicText -match "campaign") "Campaign challenge rotation must be seed-backed and persisted"
Add-Check "campaign-battle-intro" ((Test-Path $campaignIntroFile) -and $windowListText -match "CampaignBattleIntro" -and $campaignIntroText -match "tavernName" -and $campaignIntroText -match "victoryConditions" -and $campaignIntroStylesText -match "\.tavern") "Campaign battle start must present tavern title, challenger, and victory conditions"
Add-Check "campaign-opponent-name-in-battle" ($zoneStatusText -match "resolveCampaignLevel" -and $zoneStatusText -match "campaignOpponentName") "Battle status must show the resolved campaign opponent name"
Add-Check "campaign-durable-cache" ($localstorageText -match "campaignCacheSet" -and $readLsEpicText -match "campaignCacheGet" -and $campaignProgressEpicText -match "campaignCacheSet") "Campaign progress must be stored in a dedicated durable cache"
Add-Check "campaign-cache-reset-on-finish-or-loss" ($campaignProgressEpicText -match "campaignCompleted" -and $campaignProgressEpicText -match "campaignCacheClear" -and $screenEndEpicText -match "shouldResetCampaign" -and $screenEndEpicText -match "campaignCacheClear") "Campaign cache must clear only on campaign completion or campaign loss"
foreach ($mode in @("training", "stone-race", "thin-wall", "rich-start", "short-hand", "tower-rush", "resource-race", "siege")) {
  Add-Check "campaign-mode:$mode" ($campaignLevelsText -match "'$mode'") "Campaign mode $mode must be represented"
}

$windowStylesFile = Join-Path $resolvedRoot "src\components\screens\Window.module.scss"
$endScreenFile = Join-Path $resolvedRoot "src\components\screens\EndScreen.tsx"
$endScreenStylesFile = Join-Path $resolvedRoot "src\components\screens\EndScreen.module.scss"
$windowStylesText = if (Test-Path $windowStylesFile) { Get-Content -LiteralPath $windowStylesFile -Raw } else { "" }
$endScreenText = if (Test-Path $endScreenFile) { Get-Content -LiteralPath $endScreenFile -Raw } else { "" }
$endScreenStylesText = if (Test-Path $endScreenStylesFile) { Get-Content -LiteralPath $endScreenStylesFile -Raw } else { "" }
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
