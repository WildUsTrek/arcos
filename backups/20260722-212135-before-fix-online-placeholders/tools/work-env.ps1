param(
  [string]$Root = (Resolve-Path "$PSScriptRoot\..").Path
)

$ErrorActionPreference = "Stop"

$runtimeRoot = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies"
$tools = [ordered]@{
  git = Join-Path $runtimeRoot "native\git\cmd\git.exe"
  node = Join-Path $runtimeRoot "node\bin\node.exe"
  pnpm = Join-Path $runtimeRoot "bin\fallback\pnpm.cmd"
}

$result = foreach ($item in $tools.GetEnumerator()) {
  $pathCommand = Get-Command $item.Key -ErrorAction SilentlyContinue
  if ($pathCommand) {
    [PSCustomObject]@{
      name = $item.Key
      available = $true
      source = "PATH"
      path = $pathCommand.Source
    }
  } elseif (Test-Path $item.Value) {
    [PSCustomObject]@{
      name = $item.Key
      available = $true
      source = "codex-runtime"
      path = $item.Value
    }
  } else {
    [PSCustomObject]@{
      name = $item.Key
      available = $false
      source = "missing"
      path = ""
    }
  }
}

$result | ConvertTo-Json -Depth 3
