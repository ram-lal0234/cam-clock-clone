@echo off
setlocal enabledelayedexpansion

:: Colors for output
set "GREEN=[32m"
set "RED=[31m"
set "YELLOW=[33m"
set "NC=[0m"

echo %GREEN%Starting database migration...%NC%

:: Check if Supabase is in PATH
where supabase >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%Found Supabase CLI in PATH%NC%
) else (
    :: Check common installation paths
    if exist "%LOCALAPPDATA%\supabase\bin\supabase.exe" (
        set "PATH=%LOCALAPPDATA%\supabase\bin;%PATH%"
        echo %GREEN%Found Supabase CLI in %LOCALAPPDATA%\supabase\bin%NC%
    ) else if exist "%USERPROFILE%\scoop\shims\supabase.exe" (
        set "PATH=%USERPROFILE%\scoop\shims;%PATH%"
        echo %GREEN%Found Supabase CLI in %USERPROFILE%\scoop\shims%NC%
    ) else (
        echo %RED%Supabase CLI is not installed or not found. Please install it first.%NC%
        echo %YELLOW%You can install it using:%NC%
        echo 1. winget install Supabase.CLI
        echo 2. Or using Scoop:
        echo    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
        echo    scoop install supabase
        exit /b 1
    )
)

:: Check if user is logged in
supabase projects list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%Not logged in to Supabase. Please run 'supabase login' first.%NC%
    exit /b 1
)

:: Get project reference
echo %GREEN%Enter your Supabase project reference:%NC%
set /p PROJECT_REF=

:: Link project
echo %GREEN%Linking project...%NC%
supabase link --project-ref %PROJECT_REF%

:: Push migrations
echo %GREEN%Pushing migrations...%NC%
supabase db push

:: Check if migration was successful
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%Migration completed successfully!%NC%
    
    :: Show database status
    echo %GREEN%Current database status:%NC%
    supabase db status
) else (
    echo %RED%Migration failed!%NC%
    exit /b 1
) 