@echo off
REM Script de inicio para Windows
REM Crea una tarea programada que inicia el servidor al arrancar Windows

SET SCRIPT_DIR=%~dp0
SET TASK_NAME=MPTickets-PrintService

echo.
echo ====================================================
echo   INSTALADOR DE SERVICIO DE IMPRESION - WINDOWS
echo ====================================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado
    echo Por favor instala Node.js desde: https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js detectado
echo.

REM Eliminar tarea existente si existe
schtasks /query /tn "%TASK_NAME%" >nul 2>&1
if %errorlevel% equ 0 (
    echo Eliminando tarea existente...
    schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1
)

REM Crear archivo XML de configuración de la tarea
echo ^<?xml version="1.0" encoding="UTF-16"?^> > "%TEMP%\mptickets-task.xml"
echo ^<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task"^> >> "%TEMP%\mptickets-task.xml"
echo   ^<RegistrationInfo^> >> "%TEMP%\mptickets-task.xml"
echo     ^<Description^>Servidor de impresion termica para MPTickets^</Description^> >> "%TEMP%\mptickets-task.xml"
echo   ^</RegistrationInfo^> >> "%TEMP%\mptickets-task.xml"
echo   ^<Triggers^> >> "%TEMP%\mptickets-task.xml"
echo     ^<LogonTrigger^> >> "%TEMP%\mptickets-task.xml"
echo       ^<Enabled^>true^</Enabled^> >> "%TEMP%\mptickets-task.xml"
echo     ^</LogonTrigger^> >> "%TEMP%\mptickets-task.xml"
echo   ^</Triggers^> >> "%TEMP%\mptickets-task.xml"
echo   ^<Principals^> >> "%TEMP%\mptickets-task.xml"
echo     ^<Principal^> >> "%TEMP%\mptickets-task.xml"
echo       ^<LogonType^>InteractiveToken^</LogonType^> >> "%TEMP%\mptickets-task.xml"
echo       ^<RunLevel^>LeastPrivilege^</RunLevel^> >> "%TEMP%\mptickets-task.xml"
echo     ^</Principal^> >> "%TEMP%\mptickets-task.xml"
echo   ^</Principals^> >> "%TEMP%\mptickets-task.xml"
echo   ^<Settings^> >> "%TEMP%\mptickets-task.xml"
echo     ^<MultipleInstancesPolicy^>IgnoreNew^</MultipleInstancesPolicy^> >> "%TEMP%\mptickets-task.xml"
echo     ^<DisallowStartIfOnBatteries^>false^</DisallowStartIfOnBatteries^> >> "%TEMP%\mptickets-task.xml"
echo     ^<StopIfGoingOnBatteries^>false^</StopIfGoingOnBatteries^> >> "%TEMP%\mptickets-task.xml"
echo     ^<AllowHardTerminate^>true^</AllowHardTerminate^> >> "%TEMP%\mptickets-task.xml"
echo     ^<StartWhenAvailable^>true^</StartWhenAvailable^> >> "%TEMP%\mptickets-task.xml"
echo     ^<RunOnlyIfNetworkAvailable^>false^</RunOnlyIfNetworkAvailable^> >> "%TEMP%\mptickets-task.xml"
echo     ^<AllowStartOnDemand^>true^</AllowStartOnDemand^> >> "%TEMP%\mptickets-task.xml"
echo     ^<Enabled^>true^</Enabled^> >> "%TEMP%\mptickets-task.xml"
echo     ^<Hidden^>false^</Hidden^> >> "%TEMP%\mptickets-task.xml"
echo     ^<ExecutionTimeLimit^>PT0S^</ExecutionTimeLimit^> >> "%TEMP%\mptickets-task.xml"
echo   ^</Settings^> >> "%TEMP%\mptickets-task.xml"
echo   ^<Actions^> >> "%TEMP%\mptickets-task.xml"
echo     ^<Exec^> >> "%TEMP%\mptickets-task.xml"
echo       ^<Command^>cmd^</Command^> >> "%TEMP%\mptickets-task.xml"
echo       ^<Arguments^>/c "set PORT=3003 && cd /d %SCRIPT_DIR% && node servidor-impresion.js"^</Arguments^> >> "%TEMP%\mptickets-task.xml"
echo       ^<WorkingDirectory^>%SCRIPT_DIR%^</WorkingDirectory^> >> "%TEMP%\mptickets-task.xml"
echo     ^</Exec^> >> "%TEMP%\mptickets-task.xml"
echo   ^</Actions^> >> "%TEMP%\mptickets-task.xml"
echo ^</Task^> >> "%TEMP%\mptickets-task.xml"

REM Crear la tarea programada
schtasks /create /tn "%TASK_NAME%" /xml "%TEMP%\mptickets-task.xml" /f

if %errorlevel% equ 0 (
    echo.
    echo [OK] Servicio creado exitosamente
    echo.
    echo El servidor de impresion se iniciara automaticamente
    echo al iniciar sesion en Windows.
    echo.
    echo Comandos utiles:
    echo   Ver tareas: schtasks /query /tn "%TASK_NAME%"
    echo   Iniciar:    schtasks /run /tn "%TASK_NAME%"
    echo   Detener:    taskkill /F /IM node.exe /FI "WINDOWTITLE eq servidor-impresion*"
    echo   Eliminar:   schtasks /delete /tn "%TASK_NAME%" /f
    echo.
    
    REM Iniciar el servicio ahora
    echo Iniciando servicio ahora...
    schtasks /run /tn "%TASK_NAME%"
    
    timeout /t 3 /nobreak >nul
    echo.
    echo [OK] Servicio iniciado
) else (
    echo.
    echo [ERROR] No se pudo crear el servicio
    echo Verifica que ejecutaste este script como Administrador
)

echo.
del "%TEMP%\mptickets-task.xml" >nul 2>&1
pause
