@echo off
rem 音読コーチを localhost で配信して、Chrome で開く
cd /d "%~dp0"
start "" "http://localhost:8765/"
uv run --no-project python -m http.server 8765 --bind 127.0.0.1
