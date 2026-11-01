@echo off
title The Gilded Code - local preview
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
if errorlevel 1 pause
