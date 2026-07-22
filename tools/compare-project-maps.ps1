param(
  [Parameter(Mandatory = $true)][string]$Before,
  [Parameter(Mandatory = $true)][string]$After
)

$ErrorActionPreference = "Stop"

$beforeMap = Get-Content -LiteralPath $Before -Raw | ConvertFrom-Json
$afterMap = Get-Content -LiteralPath $After -Raw | ConvertFrom-Json

function Compare-Number {
  param([string]$Name, [int]$Old, [int]$New)
  [PSCustomObject]@{
    metric = $Name
    before = $Old
    after = $New
    delta = $New - $Old
  }
}

$metrics = @(
  Compare-Number "sourceFiles" $beforeMap.totals.sourceFiles $afterMap.totals.sourceFiles
  Compare-Number "assetFiles" $beforeMap.totals.assetFiles $afterMap.totals.assetFiles
  Compare-Number "testFiles" $beforeMap.totals.testFiles $afterMap.totals.testFiles
  Compare-Number "imports" $beforeMap.totals.imports $afterMap.totals.imports
)

$beforeImports = @($beforeMap.imports | ForEach-Object { "$($_.file)|$($_.import)" })
$afterImports = @($afterMap.imports | ForEach-Object { "$($_.file)|$($_.import)" })

$addedImports = @($afterImports | Where-Object { $beforeImports -notcontains $_ })
$removedImports = @($beforeImports | Where-Object { $afterImports -notcontains $_ })

$result = [PSCustomObject]@{
  comparedAt = (Get-Date).ToString("s")
  before = $Before
  after = $After
  metrics = $metrics
  addedImports = $addedImports
  removedImports = $removedImports
}

$result | ConvertTo-Json -Depth 6
