@echo off
title Kumo Desktop Companion
cd /d "%~dp0"
echo Launching Kumo Native Desktop App...
start "" "%~dp0node_modules\electron\dist\electron.exe" .
exit
