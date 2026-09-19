@echo off
chcp 65001 >nul
title Сборка APK Plan4U
echo ====================================================================
echo                   СБОРКА АПК PLAN4U
echo ====================================================================
echo.
echo 1. Синхронизация файлов в папку www...
copy /Y "index.html" "www\index.html" >nul
copy /Y "style.css" "www\style.css" >nul
copy /Y "app.js" "www\app.js" >nul
copy /Y "i18n.js" "www\i18n.js" >nul
copy /Y "initial_habits.js" "www\initial_habits.js" >nul
copy /Y "cycle_tracker.js" "www\cycle_tracker.js" >nul
copy /Y "finance_tracker.js" "www\finance_tracker.js" >nul
copy /Y "maine_quests.js" "www\maine_quests.js" >nul
copy /Y "maine_quests_data.js" "www\maine_quests_data.js" >nul
copy /Y "sw.js" "www\sw.js" >nul
copy /Y "package.json" "www\package.json" >nul
xcopy /E /I /Y "assets" "www\assets" >nul
echo [OK] Файлы www синхронизированы.
echo.
echo 2. Синхронизация с Android проектом (Capacitor)...
call npx cap sync android
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
