@echo off
chcp 65001 >nul
title Запись логов Plan4U для анализа
echo ====================================================================
echo             ЗАПИСЬ ЛОГОВ ПРИЛОЖЕНИЯ PLAN4U (ADB LOGCAT)
echo ====================================================================
echo.
echo 1. Очистка старых логов...
"C:\Users\valer\AppData\Local\Android\Sdk\platform-tools\adb.exe" logcat -c
echo.
echo --------------------------------------------------------------------
echo  [!] СЕЙЧАС ПРОВЕДИТЕ ТЕСТ В ПРИЛОЖЕНИИ НА ТЕЛЕФОНЕ ИЛИ ЭМУЛЯТОРЕ
echo      (например: откройте меню, переименуйте блок, нажмите иконку)
echo --------------------------------------------------------------------
echo.
echo После выполнения действий вернитесь сюда и нажмите любую клавишу...
pause >nul
echo.
echo 2. Сохранение логов в файл android_debug_logs.txt...
"C:\Users\valer\AppData\Local\Android\Sdk\platform-tools\adb.exe" logcat -d -v time > "c:\Users\valer\Desktop\ToDoLercha\android_debug_logs.txt"
echo.
echo ====================================================================
echo  [УСПЕХ] Лог сохранен в: c:\Users\valer\Desktop\ToDoLercha\android_debug_logs.txt
echo  Теперь напишите боту: "Я записал логи"
echo ====================================================================
echo.
pause
