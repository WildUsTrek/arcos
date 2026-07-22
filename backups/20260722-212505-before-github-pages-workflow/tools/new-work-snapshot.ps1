param(
  [string]$Root = (Resolve-Path "$PSScriptRoot\..").Path,
  [string]$Name = ""
)

$ErrorActionPreference = "Stop"

$resolvedRoot = (Resolve-Path $Root).Path
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safeName = if ($Name -eq "") { "snapshot" } else { $Name -replace "[^a-zA-Z0-9._-]", "-" }
$snapshotDir = Join-Path $resolvedRoot "docs\generated\snapshots\$stamp-$safeName"

New-Item -ItemType Directory -Force -Path $snapshotDir | Out-Null

& (Join-Path $resolvedRoot "tools\project-map.ps1") `
  -Root $resolvedRoot `
  -OutDir "docs\generated\snapshots\$stamp-$safeName" `
  -SnapshotName "$stamp-$safeName"

$latestDir = Join-Path $resolvedRoot "docs\generated"
Copy-Item -LiteralPath (Join-Path $snapshotDir "project-map.json") -Destination (Join-Path $latestDir "project-map.json") -Force
Copy-Item -LiteralPath (Join-Path $snapshotDir "project-map.md") -Destination (Join-Path $latestDir "project-map.md") -Force

Write-Host "Snapshot created: $snapshotDir"
