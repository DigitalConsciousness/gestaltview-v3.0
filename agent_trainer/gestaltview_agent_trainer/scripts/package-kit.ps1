$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$packageJson = Get-Content (Join-Path $root "package.json") -Raw | ConvertFrom-Json
$version = $packageJson.version
$dist = Join-Path $root "dist"
$archiveName = "gestaltview-agent-trainer-v$version.zip"
$archivePath = Join-Path $dist $archiveName

if (-not (Test-Path $dist)) {
  New-Item -ItemType Directory -Path $dist | Out-Null
}

if (Test-Path $archivePath) {
  Remove-Item $archivePath -Force
}

$staging = Join-Path $env:TEMP ("gestaltview-agent-trainer-stage-" + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $staging | Out-Null

try {
  Get-ChildItem -Path $root -Force | Where-Object {
    $_.Name -notin @(
      "node_modules",
      "dist",
      ".env",
      ".env.local",
      ".DS_Store",
      "coverage",
      "CODEX_PROMPT.md",
      "CurrentState.md",
      "SPEC.md",
      "gv_operator_kit.zip"
    )
  } | ForEach-Object {
    Copy-Item $_.FullName -Destination (Join-Path $staging $_.Name) -Recurse -Force
  }

  Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $archivePath -Force
  Write-Host "Created $archivePath"
} finally {
  if (Test-Path $staging) {
    Remove-Item $staging -Recurse -Force
  }
}
