@echo off
chcp 65001 >nul
mode con: cols=95 lines=32
title Plan4U Food - Визуальный интерфейс Listex.info

echo ============================================================
echo   Plan4U Food - Запуск визуального дашборда Listex.info...
echo ============================================================
echo.
echo Открываем веб-интерфейс в браузере (http://localhost:3737)...
echo Нажмите Ctrl+C в этом окне, если захотите остановить сервер.
echo.

node "%~dp0listex_server.cjs"

echo.
pause
