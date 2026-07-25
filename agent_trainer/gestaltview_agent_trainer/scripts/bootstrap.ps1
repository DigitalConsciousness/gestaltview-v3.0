$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

if (-not (Test-Path ".env.local")) {
  Copy-Item "setup/env.example" ".env.local"
  Write-Host "Created .env.local from setup/env.example"
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "npm is required to continue."
}

Write-Host "Installing package dependencies..."
npm install

Write-Host "Running setup verification..."
try {
  npm run verify-setup
} catch {
  Write-Warning "Setup verification did not fully pass yet. This is expected until .env.local is filled in."
}

Write-Host ""
Write-Host "Bootstrap finished."
Write-Host "Next steps:"
Write-Host "1. Fill in .env.local"
Write-Host "2. Re-run: npm run verify-setup"
Write-Host "3. Apply: supabase/seed.sql"
Write-Host "4. Review or serve: setup/setup-wizard.html"
Write-Host "5. Package: npm run package:windows"
