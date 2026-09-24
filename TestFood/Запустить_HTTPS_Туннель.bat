@echo off
chcp 65001 >nul
title Plan4U Food Scanner - HTTPS Tunnel
color 0B

echo ====================================================================
echo   Запуск HTTPS-туннеля для установки приложения на телефон...
echo ====================================================================
echo.
echo   Ссылка для телефона: https://plan4u-food.loca.lt
echo.

npx -y localtunnel --port 8080 --local-host 127.0.0.1 --subdomain plan4u-food

pause
