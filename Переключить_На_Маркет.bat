@echo off
chcp 65001 >nul
title Переключение пресета на: Чистый Маркет (2 привычки)
echo ====================================================================
echo      ПЕРЕКЛЮЧЕНИЕ ПРЕСЕТА PLAN4U: ЧИСТЫЙ МАРКЕТ / ДЛЯ СЕБЯ
echo ====================================================================
echo.
echo Копирование presets/habits_clean.js -> initial_habits.js...
copy /Y "presets\habits_clean.js" "initial_habits.js" >nul
copy /Y "presets\habits_clean.js" "www\initial_habits.js" >nul
echo.
echo [УСПЕХ] Активный пресет: 2 стартовые привычки (Вода 2л и Зарядка, чистая история).
echo При открытии приложения или сборке АПК загрузится чистая база.
echo.
pause
