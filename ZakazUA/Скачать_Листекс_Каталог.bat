@echo off
chcp 65001 >nul
mode con: cols=95 lines=32
title Plan4U Food - Сбор каталога продуктов Listex.info

echo ============================================================
echo   Plan4U Food - Сбор продуктовых разделов с Listex.info
echo ============================================================
echo.

node "%~dp0listex_scraper.cjs"

echo.
pause
