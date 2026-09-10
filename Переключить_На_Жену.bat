@echo off
chcp 65001 >nul
title Переключение пресета на: Привычки Жены (149 дней)
echo ====================================================================
echo      ПЕРЕКЛЮЧЕНИЕ ПРЕСЕТА PLAN4U: ПРИВЫЧКИ ЖЕНЫ (LERCHA)
echo ====================================================================
echo.
echo Копирование presets/habits_wife.js -> initial_habits.js...
copy /Y "presets\habits_wife.js" "initial_habits.js" >nul
copy /Y "presets\habits_wife.js" "www\initial_habits.js" >nul
echo.
echo [УСПЕХ] Активный пресет: 7 привычек с полной историей за 149 дней!
echo При открытии приложения или сборке АПК загрузятся привычки жены.
echo.
pause
