@echo off
:: VulnScan Silent Server Launcher
cd /d "%~dp0"

:: Start the Python launcher windowless in the background using pythonw
start "" pythonw "%~dp0launcher.py"

:: Immediately close this CMD window so nothing remains open on the screen
exit
