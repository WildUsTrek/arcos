param(
  [string]$Root = (Resolve-Path "$PSScriptRoot\..").Path,
  [string]$Name = ""
)

$ErrorActionPreference = "Stop"

$resolvedRoot = (Resolve-Path $Root).Path
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safeName = if ($Name -eq "") { "manual" } else { $Name -replace "[^a-zA-Z0-9._-]", "-" }
$backupRoot = Join-Path $resolvedRoot "backups"
$backupDir = Join-Path $backupRoot "$stamp-$safeName"

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$paths = @(
  "src",
  "tools",
  "docs",
  "__test__",
  "package.json",
  "vite.config.ts",
  "tsconfig.json",
  "index.html"
)

foreach ($relative in $paths) {
  $source = Join-Path $resolvedRoot $relative
  if (Test-Path $source) {
    $target = Join-Path $backupDir $relative
    $targetParent = Split-Path $target -Parent
    New-Item -ItemType Directory -Force -Path $targetParent | Out-Null
    Copy-Item -LiteralPath $source -Destination $target -Recurse -Force
  }
}

$manifest = [PSCustomObject]@{
  createdAt = (Get-Date).ToString("s")
  root = $resolvedRoot
  name = $safeName
  backupDir = $backupDir
  included = $paths
}

$manifest | ConvertTo-Json -Depth 4 |
  Set-Content -LiteralPath (Join-Path $backupDir "backup-manifest.json") -Encoding UTF8

Write-Host "Backup created: $backupDir"
