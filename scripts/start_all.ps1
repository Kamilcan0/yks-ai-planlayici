#requires -version 5.1
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $root
Set-Location $root

$venvPy = Join-Path .venv "Scripts/python.exe"

Start-Process -NoNewWindow -FilePath $venvPy -ArgumentList "-m","uvicorn","api.server:app","--host","127.0.0.1","--port","8000","--reload"
Start-Process -NoNewWindow -FilePath $venvPy -ArgumentList "-m","streamlit","run","app/ui.py","--server.headless","true"

Write-Host "API:    http://127.0.0.1:8000/docs"
Write-Host "UI:     http://127.0.0.1:8501"
