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

foreach ($tool in @("tools\project-map.ps1", "tools\new-backup.ps1", "tools\new-work-snapshot.ps1", "tools\compare-project-maps.ps1")) {
  Add-Check "tool:$tool" (Test-Path (Join-Path $resolvedRoot $tool)) $tool
}

$epicsIndex = Join-Path $resolvedRoot "src\epics\index.ts"
$epicsText = if (Test-Path $epicsIndex) { Get-Content -LiteralPath $epicsIndex -Raw } else { "" }
Add-Check "no-active-multiplayer-epics" ($epicsText -notmatch "\./multiplayer/") "Root epic must not import multiplayer epics"

$pref = Join-Path $resolvedRoot "src\components\screens\Pref.tsx"
$prefText = if (Test-Path $pref) { Get-Content -LiteralPath $pref -Raw } else { "" }
Add-Check "no-multiplayer-preferences-ui" ($prefText -notmatch "SWITCH_MULTIPLAYER_MODE|CONNECT_TO_ID|Your ID|opponent's ID|Multiplayer") "Preferences must not expose online multiplayer"

$webRtcDir = Join-Path $resolvedRoot "src\webrtc"
Add-Check "webrtc-isolated" (Test-Path $webRtcDir) "WebRTC code may exist only as inactive legacy code until physical cleanup"

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
