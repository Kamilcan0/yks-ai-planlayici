#requires -version 5.1
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $projectRoot
Set-Location $projectRoot

$venvPy = Join-Path .venv "Scripts/python.exe"
$venvPyTest = Join-Path .venv "Scripts/pytest.exe"

if (!(Test-Path $venvPy)) {
    Write-Error "Sanal ortam bulunamadi. Once scripts/setup_env.ps1 calistirin."
    exit 1
}

& $venvPy -m pip --version | Write-Output

& $venvPyTest -q | Write-Output
