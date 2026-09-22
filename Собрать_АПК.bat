@echo off
chcp 65001 >nul
title Сборка APK Plan4U
echo ====================================================================
echo                   СБОРКА АПК PLAN4U
echo ====================================================================
echo.
echo 1. Автоматическая сборка и синхронизация проекта (scripts/build.cjs)...
call npm run build:android
if %errorlevel% neq 0 (
    echo [ОШИБКА] Сборка или синхронизация завершилась с ошибкой!
    pause
    exit /b %errorlevel%
)
echo.
echo 3. Компиляция APK через Gradle...
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0android"
call gradlew.bat assembleDebug
cd /d "%~dp0"
echo.
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "Plan4U.apk" >nul
    echo ====================================================================
    echo  [УСПЕХ] АПК УСПЕШНО СОБРАН:
    echo  Файл: Plan4U.apk (в папке ToDoLercha)
    echo ====================================================================
) else (
    echo [ОШИБКА] Не удалось найти собранный app-debug.apk
)
echo.
pause
