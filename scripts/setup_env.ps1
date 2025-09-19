#requires -version 5.1
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
# scripts klasorunun bir ustu proje koku
$projectRoot = Split-Path -Parent $projectRoot
Set-Location $projectRoot

Write-Host "[1/4] Proje klasoru: $projectRoot"

# Python tespiti
$python = "python"
try {
    $v = & $python --version
    Write-Host "Python bulundu: $v"
} catch {
    Write-Error "Python bulunamadi. Lütfen Python 3.11 64-bit kurun."
    exit 1
}

Write-Host "[2/4] Sanal ortam olusturuluyor (.venv)"
if (!(Test-Path .venv)) {
    & $python -m venv .venv
}

$venvPy = Join-Path .venv "Scripts/python.exe"
$venvPip = Join-Path .venv "Scripts/pip.exe"

Write-Host "[3/4] pip/setuptools/wheel guncelleniyor"
& $venvPy -m pip install --upgrade pip setuptools wheel | Write-Output

Write-Host "[4/4] requirements kuruluyor"
& $venvPip install -r requirements.txt | Write-Output

Write-Host "Kurulum tamamlandi. Sanal ortami etkinlestirmek icin: .\.venv\Scripts\Activate.ps1"
