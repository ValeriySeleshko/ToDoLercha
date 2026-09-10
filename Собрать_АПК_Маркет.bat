@echo off
chcp 65001 >nul
title Сборка APK Plan4U для Маркета (Чистая версия)
echo ====================================================================
echo      СБОРКА АПК PLAN4U: ДЛЯ МАРКЕТА / ЧИСТАЯ ВЕРСИЯ
echo ====================================================================
echo.
echo 1. Установка чистого пресета (Вода 2л и Зарядка)...
copy /Y "presets\habits_clean.js" "initial_habits.js" >nul
copy /Y "presets\habits_clean.js" "www\initial_habits.js" >nul
copy /Y "index.html" "www\index.html" >nul
copy /Y "style.css" "www\style.css" >nul
copy /Y "app.js" "www\app.js" >nul
copy /Y "i18n.js" "www\i18n.js" >nul
echo [OK] Чистый пресет активен.
echo.
echo 2. Синхронизация веб-ресурсов в Android проект (Capacitor)...
call npx cap sync android
echo.
echo 3. Компиляция APK через Gradle...
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
cd android
call gradlew.bat assembleDebug
cd ..
echo.
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "Plan4U_Clean.apk" >nul
    echo ====================================================================
    echo  [УСПЕХ] ЧИСТЫЙ АПК ДЛЯ МАРКЕТА УСПЕШНО СОБРАН:
    echo  Файл: Plan4U_Clean.apk (в папке ToDoLercha на рабочем столе)
    echo  При первом запуске будут только 2 стартовые привычки (Вода и Зарядка)!
    echo ====================================================================
) else (
    echo [ОШИБКА] Не удалось найти собранный app-debug.apk
)
echo.
pause
