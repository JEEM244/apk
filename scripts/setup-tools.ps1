# DroidForge: instala herramientas de Android sin Android Studio.
# Ejecutar desde PowerShell en Windows 10/11 x64 con conexión a Internet.
$ErrorActionPreference = "Stop"
$Root = Join-Path (Split-Path $PSScriptRoot -Parent) "toolchain"
$JdkDir = Join-Path $Root "jdk"
$SdkDir = Join-Path $Root "android-sdk"
$GradleDir = Join-Path $Root "gradle"
New-Item -ItemType Directory -Force -Path $Root, $SdkDir, $GradleDir | Out-Null

Write-Host "DroidForge: descargando JDK 17, Android SDK y Gradle..." -ForegroundColor Cyan
Write-Host "No se instalará Android Studio. La descarga inicial puede ocupar varios GB."

# Eclipse Temurin JDK 17 portable.
$jdkZip = Join-Path $Root "jdk17.zip"
Invoke-WebRequest "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse" -OutFile $jdkZip
Expand-Archive $jdkZip -DestinationPath $JdkDir -Force
$javaHome = (Get-ChildItem $JdkDir -Directory | Select-Object -First 1).FullName

# Android SDK Command-line Tools oficiales.
$cmdZip = Join-Path $Root "commandline-tools.zip"
$temp = Join-Path $Root "cmdtemp"
Invoke-WebRequest "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip" -OutFile $cmdZip
if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
Expand-Archive $cmdZip -DestinationPath $temp -Force
$cmdTarget = Join-Path $SdkDir "cmdline-tools\latest"
New-Item -ItemType Directory -Force -Path (Split-Path $cmdTarget) | Out-Null
if (Test-Path $cmdTarget) { Remove-Item $cmdTarget -Recurse -Force }
Move-Item (Join-Path $temp "cmdline-tools") $cmdTarget
Remove-Item $temp -Recurse -Force

# Gradle 8.9 compatible con Android Gradle Plugin 8.7.x.
$gradleZip = Join-Path $Root "gradle.zip"
Invoke-WebRequest "https://services.gradle.org/distributions/gradle-8.9-bin.zip" -OutFile $gradleZip
Expand-Archive $gradleZip -DestinationPath $GradleDir -Force
$gradleHome = Join-Path $GradleDir "gradle-8.9"

# Configura las variables para esta sesión.
$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $SdkDir
$env:ANDROID_SDK_ROOT = $SdkDir
$env:Path = "$javaHome\bin;$cmdTarget\bin;$SdkDir\platform-tools;$gradleHome\bin;$env:Path"

# Instala las plataformas y herramientas de compilación necesarias.
$sdkmanager = Join-Path $cmdTarget "bin\sdkmanager.bat"
& $sdkmanager "--sdk_root=$SdkDir" "platform-tools" "platforms;android-35" "build-tools;35.0.0"
if ($LASTEXITCODE -ne 0) { throw "sdkmanager falló al instalar los paquetes Android." }

Write-Host "Aceptando licencias Android SDK..." -ForegroundColor Yellow
$answers = ("y`n" * 30)
$answers | & $sdkmanager "--sdk_root=$SdkDir" --licenses
if ($LASTEXITCODE -ne 0) { throw "No se pudieron aceptar las licencias Android SDK." }

# Persistir variables y PATH del usuario para que DroidForge pueda encontrarlas tras reiniciar.
[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $SdkDir, "User")
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $SdkDir, "User")
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$entries = @("$javaHome\bin", "$cmdTarget\bin", "$SdkDir\platform-tools", "$gradleHome\bin")
foreach ($entry in $entries) {
  if (($userPath -split ';') -notcontains $entry) { $userPath = "$userPath;$entry" }
}
[Environment]::SetEnvironmentVariable("Path", $userPath, "User")

Remove-Item $jdkZip, $cmdZip, $gradleZip -Force -ErrorAction SilentlyContinue
Write-Host ""
Write-Host "Herramientas instaladas correctamente." -ForegroundColor Green
Write-Host "Cierra y vuelve a abrir DroidForge para actualizar las variables de entorno."
Write-Host "Android SDK: $SdkDir"
