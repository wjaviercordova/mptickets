@echo off
REM ============================================================
REM SCRIPT PARA DETENER EL SERVICIO DE IMPRESION MPTICKETS
REM ============================================================
REM 
REM Uso: detener-servicio.bat
REM 
REM Este script detiene el servidor de impresion que esta
REM corriendo en segundo plano en Windows.
REM ============================================================

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║     🛑  DETENER SERVICIO DE IMPRESION MPTICKETS       ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo 🔍 Buscando procesos del servidor de impresion...
echo.

REM Buscar procesos de Node.js que contengan "servidor-impresion"
tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH > temp_processes.txt

REM Verificar si hay procesos de node.exe
findstr /C:"node.exe" temp_processes.txt >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
  echo ℹ️  No se encontraron procesos del servidor de impresion ejecutandose.
  echo.
  echo ✅ El servicio ya esta detenido.
  echo.
  del temp_processes.txt >nul 2>&1
  pause
  exit /b 0
)

echo 📋 Procesos de Node.js encontrados:
echo.
tasklist /FI "IMAGENAME eq node.exe" /V
echo.

REM Preguntar confirmacion
set /p CONFIRM="¿Desea detener todos los procesos de Node.js? (S/N): "

if /I not "%CONFIRM%"=="S" (
  echo.
  echo ❌ Operacion cancelada.
  echo.
  del temp_processes.txt >nul 2>&1
  pause
  exit /b 0
)

echo.
echo 🛑 Deteniendo procesos...
echo.

REM Detener todos los procesos de node.exe
taskkill /F /IM node.exe /T >nul 2>&1

if %ERRORLEVEL% EQU 0 (
  echo ✅ Todos los procesos del servidor de impresion han sido detenidos correctamente.
  echo.
  echo 💡 Para reiniciar el servicio:
  echo    • Manualmente: node servidor-impresion.js
  echo    • Tarea programada: schtasks /run /tn "MPTickets-PrintService"
  echo.
) else (
  echo ❌ Error: No se pudieron detener los procesos.
  echo    Es posible que necesites permisos de administrador.
  echo.
  echo    Intenta ejecutar este script como administrador:
  echo    Click derecho en el archivo ^> "Ejecutar como administrador"
  echo.
)

del temp_processes.txt >nul 2>&1

pause
exit /b 0
