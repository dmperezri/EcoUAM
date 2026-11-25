param([ValidateSet('dev','build','test','preview','install')][string]$Action = 'dev')
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$pnpmCommand = Get-Command pnpm -ErrorAction SilentlyContinue
if ($pnpmCommand) { & $pnpmCommand.Source $Action; exit $LASTEXITCODE }
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCommand) { throw 'Instala Node.js 22.12 o superior y pnpm para continuar.' }
$bundledPnpm = Join-Path (Split-Path (Split-Path $nodeCommand.Source -Parent) -Parent) 'node_modules\pnpm\bin\pnpm.cjs'
if (-not (Test-Path -LiteralPath $bundledPnpm)) { throw 'No se encuentra pnpm. Instala pnpm y vuelve a ejecutar este archivo.' }
& $nodeCommand.Source $bundledPnpm $Action
exit $LASTEXITCODE
