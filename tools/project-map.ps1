param(
  [string]$Root = (Resolve-Path "$PSScriptRoot\..").Path,
  [string]$OutDir = "docs\generated",
  [string]$SnapshotName = ""
)

$ErrorActionPreference = "Stop"

$resolvedRoot = (Resolve-Path $Root).Path
$resolvedOutDir = Join-Path $resolvedRoot $OutDir
New-Item -ItemType Directory -Force -Path $resolvedOutDir | Out-Null

function Get-RelativePathCompat {
  param(
    [string]$BasePath,
    [string]$TargetPath
  )

  $baseUri = New-Object System.Uri(($BasePath.TrimEnd('\') + '\'))
  $targetUri = New-Object System.Uri($TargetPath)
  return [System.Uri]::UnescapeDataString(
    $baseUri.MakeRelativeUri($targetUri).ToString()
  ).Replace('/', '\')
}

function Resolve-WorkspaceTool {
  param([string]$Name)

  $pathTool = Get-Command $Name -ErrorAction SilentlyContinue
  if ($pathTool) {
    return [PSCustomObject]@{
      name = $Name
      available = $true
      source = "PATH"
      path = $pathTool.Source
    }
  }

  $runtimeRoot = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies"
  $fallbacks = @{
    node = Join-Path $runtimeRoot "node\bin\node.exe"
    npm = Join-Path $runtimeRoot "bin\fallback\npm.cmd"
    pnpm = Join-Path $runtimeRoot "bin\fallback\pnpm.cmd"
    git = Join-Path $runtimeRoot "native\git\cmd\git.exe"
  }

  if ($fallbacks.ContainsKey($Name) -and (Test-Path $fallbacks[$Name])) {
    return [PSCustomObject]@{
      name = $Name
      available = $true
      source = "codex-runtime"
      path = $fallbacks[$Name]
    }
  }

  return [PSCustomObject]@{
    name = $Name
    available = $false
    source = "missing"
    path = ""
  }
}

$sourceFiles = Get-ChildItem -Path (Join-Path $resolvedRoot "src") -Recurse -File |
  Where-Object { $_.Extension -in ".ts", ".tsx", ".scss" }

$assetFiles = Get-ChildItem -Path (Join-Path $resolvedRoot "assets") -Recurse -File
$testFiles = Get-ChildItem -Path (Join-Path $resolvedRoot "__test__") -Recurse -File -ErrorAction SilentlyContinue
$packagePath = Join-Path $resolvedRoot "package.json"
$package = if (Test-Path $packagePath) {
  Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json
} else {
  $null
}

$imports = foreach ($file in $sourceFiles | Where-Object { $_.Extension -in ".ts", ".tsx" }) {
  $relative = Get-RelativePathCompat $resolvedRoot $file.FullName
  $content = Get-Content -LiteralPath $file.FullName
  foreach ($line in $content) {
    if ($line -match "^\s*import(?:\s+type)?(?:.+?\s+from\s+)?['""]([^'""]+)['""]") {
      [PSCustomObject]@{
        file = $relative
        import = $Matches[1]
      }
    }
  }
}

$sourceByArea = $sourceFiles |
  ForEach-Object {
    $relative = Get-RelativePathCompat (Join-Path $resolvedRoot "src") $_.FullName
    $area = ($relative -split "\\|/")[0]
    [PSCustomObject]@{
      area = $area
      extension = $_.Extension
      file = Get-RelativePathCompat $resolvedRoot $_.FullName
    }
  } |
  Group-Object area |
  Sort-Object Name |
  ForEach-Object {
    [PSCustomObject]@{
      area = $_.Name
      files = $_.Count
      ts = @($_.Group | Where-Object { $_.extension -eq ".ts" }).Count
      tsx = @($_.Group | Where-Object { $_.extension -eq ".tsx" }).Count
      scss = @($_.Group | Where-Object { $_.extension -eq ".scss" }).Count
    }
  }

$assetByType = $assetFiles |
  Group-Object Extension |
  Sort-Object Name |
  ForEach-Object {
    [PSCustomObject]@{
      extension = if ($_.Name -eq "") { "[none]" } else { $_.Name }
      files = $_.Count
      bytes = ($_.Group | Measure-Object Length -Sum).Sum
    }
  }

$importsByAlias = $imports |
  Group-Object {
    if ($_.import.StartsWith("@/")) { "@/" }
    elseif ($_.import.StartsWith("@assets/")) { "@assets/" }
    elseif ($_.import.StartsWith("@root/")) { "@root/" }
    elseif ($_.import.StartsWith(".")) { "relative" }
    else { "package" }
  } |
  Sort-Object Name |
  ForEach-Object {
    [PSCustomObject]@{
      kind = $_.Name
      count = $_.Count
      values = @($_.Group.import | Sort-Object -Unique)
    }
  }

$packageImports = @($imports | Where-Object {
  -not $_.import.StartsWith("@/") -and
  -not $_.import.StartsWith("@assets/") -and
  -not $_.import.StartsWith("@root/") -and
  -not $_.import.StartsWith(".")
} | ForEach-Object {
  $value = $_.import
  if ($value.StartsWith("@")) {
    ($value -split "/")[0..1] -join "/"
  } else {
    ($value -split "/")[0]
  }
} | Sort-Object -Unique)

$declaredPackages = @()
if ($package -ne $null) {
  foreach ($section in @("dependencies", "devDependencies", "optionalDependencies")) {
    $deps = $package.$section
    if ($deps -ne $null) {
      $declaredPackages += @($deps.PSObject.Properties.Name | ForEach-Object {
        [PSCustomObject]@{
          name = $_
          section = $section
          version = $deps.$_
        }
      })
    }
  }
}

$declaredPackageNames = @($declaredPackages.name | Sort-Object -Unique)
$missingDeclaredImports = @($packageImports | Where-Object { $declaredPackageNames -notcontains $_ })
$unusedDeclaredPackages = @($declaredPackageNames | Where-Object { $packageImports -notcontains $_ })

$toolAvailability = @("node", "npm", "pnpm", "bun", "git") | ForEach-Object {
  Resolve-WorkspaceTool $_
}

$hotspots = @(
  "src\ai",
  "src\data",
  "src\epics",
  "src\reducers",
  "src\components\screens",
  "src\i18n",
  "src\webrtc",
  "src\utils\localstorage.ts",
  "vite.config.ts",
  "package.json"
) | ForEach-Object {
  $path = Join-Path $resolvedRoot $_
  [PSCustomObject]@{
    path = $_
    exists = Test-Path $path
  }
}

$report = [PSCustomObject]@{
  generatedAt = (Get-Date).ToString("s")
  snapshotName = $SnapshotName
  root = $resolvedRoot
  totals = [PSCustomObject]@{
    sourceFiles = $sourceFiles.Count
    assetFiles = $assetFiles.Count
    testFiles = if ($testFiles -eq $null) { 0 } else { $testFiles.Count }
    imports = $imports.Count
  }
  sourceByArea = @($sourceByArea)
  assetByType = @($assetByType)
  importsByKind = @($importsByAlias)
  dependencyHealth = [PSCustomObject]@{
    packageImports = @($packageImports)
    declaredPackages = @($declaredPackages)
    missingDeclaredImports = @($missingDeclaredImports)
    unusedDeclaredPackages = @($unusedDeclaredPackages)
  }
  toolAvailability = @($toolAvailability)
  hotspots = @($hotspots)
  imports = @($imports | Sort-Object file, import)
}

$jsonPath = Join-Path $resolvedOutDir "project-map.json"
$mdPath = Join-Path $resolvedOutDir "project-map.md"

$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $jsonPath -Encoding UTF8

$lines = @()
$lines += "# Project Map"
$lines += ""
$lines += "Generated: $($report.generatedAt)"
if ($SnapshotName -ne "") {
  $lines += "Snapshot: $SnapshotName"
}
$lines += ""
$lines += "## Totals"
$lines += ""
$lines += "- Source files: $($report.totals.sourceFiles)"
$lines += "- Asset files: $($report.totals.assetFiles)"
$lines += "- Test files: $($report.totals.testFiles)"
$lines += "- Static imports: $($report.totals.imports)"
$lines += ""
$lines += "## Source Areas"
$lines += ""
foreach ($area in $sourceByArea) {
  $lines += "- $($area.area): $($area.files) files ($($area.ts) ts, $($area.tsx) tsx, $($area.scss) scss)"
}
$lines += ""
$lines += "## Assets"
$lines += ""
foreach ($asset in $assetByType) {
  $mb = [Math]::Round(($asset.bytes / 1MB), 2)
  $lines += "- $($asset.extension): $($asset.files) files, $mb MB"
}
$lines += ""
$lines += "## Import Kinds"
$lines += ""
foreach ($kind in $importsByAlias) {
  $lines += "- $($kind.kind): $($kind.count)"
}
$lines += ""
$lines += "## Dependency Health"
$lines += ""
$lines += "- Imported external packages: $($packageImports.Count)"
$lines += "- Declared packages: $($declaredPackageNames.Count)"
$lines += "- Imported but not declared: $($missingDeclaredImports.Count)"
$lines += "- Declared but not statically imported: $($unusedDeclaredPackages.Count)"
$lines += ""
$lines += "## Tool Availability"
$lines += ""
foreach ($tool in $toolAvailability) {
  $state = if ($tool.available) { "available via $($tool.source)" } else { "missing" }
  $lines += "- $($tool.name): $state"
}
$lines += ""
$lines += "## Hotspots"
$lines += ""
foreach ($hotspot in $hotspots) {
  $state = if ($hotspot.exists) { "present" } else { "missing" }
  $lines += "- $($hotspot.path): $state"
}

$lines | Set-Content -LiteralPath $mdPath -Encoding UTF8

Write-Host "Wrote $jsonPath"
Write-Host "Wrote $mdPath"
