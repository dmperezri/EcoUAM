param([ValidateSet('dev','build','test','preview','install')][string]$Action = 'dev')
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

$pnpm = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
if ($pnpm) {
    & $pnpm.Source $Action
    exit $LASTEXITCODE
}

$node = (Get-Command node.exe -ErrorAction SilentlyContinue).Source
$vite = Join-Path $PWD 'node_modules\vite\bin\vite.js'
if ($Action -eq 'dev' -and $node -and (Test-Path -LiteralPath $vite)) {
    & $node $vite --host 127.0.0.1
    exit $LASTEXITCODE
}

$runtimes = Get-AppxPackage -ErrorAction SilentlyContinue |
    Where-Object Name -like 'OpenAI.CodexPrimaryRuntime*' |
    Sort-Object Version -Descending
foreach ($runtime in $runtimes) {
    $runtimeRoot = Join-Path $runtime.InstallLocation 'dependencies\node'
    $bundledNode = Join-Path $runtimeRoot 'bin\node.exe'
    $bundledPnpm = Join-Path $runtimeRoot 'node_modules\pnpm\bin\pnpm.cjs'
    if ($Action -eq 'dev' -and (Test-Path -LiteralPath $bundledNode) -and (Test-Path -LiteralPath $vite)) {
        & $bundledNode $vite --host 127.0.0.1
        exit $LASTEXITCODE
    }
    if ((Test-Path -LiteralPath $bundledNode) -and (Test-Path -LiteralPath $bundledPnpm)) {
        $env:Path = "$(Split-Path -Parent $bundledNode);$env:Path"
        & $bundledNode $bundledPnpm $Action
        exit $LASTEXITCODE
    }
}

throw 'Instala Node.js 22.12 o superior y pnpm, y vuelve a abrir la terminal de VS Code.'
