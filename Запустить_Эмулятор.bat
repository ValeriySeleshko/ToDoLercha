@echo off
chcp 65001 >nul
title Запуск Android Эмулятора Plan4U
echo ==============================================
echo  Запуск Android Эмулятора (medium_phone)...
echo ==============================================
start "" "C:\Users\valer\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd medium_phone -no-snapshot-load
echo.
echo Эмулятор запускается на рабочем столе...
timeout /t 8 /nobreak >nul
echo Подключение к эмулятору...
"C:\Users\valer\AppData\Local\Android\Sdk\platform-tools\adb.exe" wait-for-device
echo Установка актуальной версии Plan4U (v0.0.53)...
"C:\Users\valer\AppData\Local\Android\Sdk\platform-tools\adb.exe" install -r "c:\Users\valer\Desktop\ToDoLercha\Plan4U.apk"
echo Запуск приложения...
"C:\Users\valer\AppData\Local\Android\Sdk\platform-tools\adb.exe" shell am start -n com.plan4u.app/com.plan4u.app.MainActivity
echo.
echo ==============================================
echo  Готово! Plan4U открыт в окне эмулятора.
echo ==============================================
timeout /t 4 >nul
