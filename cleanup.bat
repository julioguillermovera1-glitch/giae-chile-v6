@echo off
cd /d c:\Users\julio\Documents\GitHub\giae-chile-v6
echo Limpiando repositorio...
git reset --hard HEAD~5
git push origin master --force
echo Limpieza completada
pause
