@echo off
chcp 65001 >nul
title Тестер базы продуктов Plan4U (Food Scanner)
color 0A

node "%~dp0server.cjs"

pause
