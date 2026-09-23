@echo off
chcp 65001 >nul
mode con: cols=95 lines=32
title Plan4U - Сбор базы продуктов Zakaz.ua

node "%~dp0scraper.cjs"

echo.
pause
