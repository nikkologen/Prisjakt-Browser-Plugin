[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $projectRoot 'manifest.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$version = [string]$manifest.version
if ($version -notmatch '^\d+(\.\d+){0,3}$') {
    throw 'The manifest must contain a valid numeric extension version.'
}

$packageItems = @('manifest.json', 'src', 'popup', 'icons')
$packagePaths = foreach ($item in $packageItems) {
    $itemPath = Join-Path $projectRoot $item
    if (-not (Test-Path -LiteralPath $itemPath)) {
        throw "Required extension item is missing: $item"
    }
    $itemPath
}

$outputDirectory = Join-Path $projectRoot 'dist'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$outputPath = Join-Path $outputDirectory "prisjakt-historical-low-$version.zip"
Compress-Archive -LiteralPath $packagePaths -DestinationPath $outputPath -Force

Write-Output "Created: $outputPath"
