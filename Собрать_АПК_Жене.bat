@echo off
chcp 65001 >nul
title Сборка APK Plan4U для Жены (с полной историей)
echo ====================================================================
echo      СБОРКА АПК PLAN4U: ДЛЯ ЖЕНЫ (С ИСТОРИЕЙ ЗА 149 ДНЕЙ)
echo ====================================================================
echo.
echo 1. Установка пресета жены...
copy /Y "presets\habits_wife.js" "initial_habits.js" >nul
copy /Y "presets\habits_wife.js" "www\initial_habits.js" >nul
copy /Y "index.html" "www\index.html" >nul
copy /Y "style.css" "www\style.css" >nul
copy /Y "app.js" "www\app.js" >nul
copy /Y "i18n.js" "www\i18n.js" >nul
echo [OK] Пресет жены активен.
echo.
echo 2. Синхронизация веб-ресурсов в Android проект (Capacitor)...
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
    copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "Plan4U_Lercha.apk" >nul
    if exist "%USERPROFILE%\Desktop\Habits" (
        copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Desktop\Habits\Plan4U.apk" >nul
    )
    echo ====================================================================
    echo  [УСПЕХ] АПК ДЛЯ ЖЕНЫ УСПЕШНО СОБРАН:
    echo  Файл: Plan4U.apk (в папке ToDoLercha на рабочем столе)
    echo  При первом запуске на телефоне откроются все 7 привычек и вся история!
    echo ====================================================================
) else (
    echo [ОШИБКА] Не удалось найти собранный app-debug.apk
)
echo.
pause
