# DroidForge

Aplicación ligera para Windows para compilar proyectos Android e instalar APK en un teléfono conectado por USB, sin Android Studio.

## Estado

Primera base del proyecto: Electron + React + TypeScript, importación de proyectos Gradle, generador de proyecto Kotlin, compilación debug e instalación por ADB.

## Requisitos de desarrollo

- Windows 10/11 x64
- Node.js 20+
- Para compilar apps: JDK 17, Android SDK Command-line Tools, Android Platform Tools, Android Build Tools y Gradle.
- Android con Opciones de desarrollador y Depuración USB activadas.

## Desarrollo

```powershell
npm install
npm run dev
```

## Preparar las herramientas Android

Abre PowerShell en la carpeta del repositorio:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup-tools.ps1
```

El script descarga las herramientas oficiales necesarias sin instalar Android Studio. Requiere internet durante la instalación inicial.

## Uso

1. Abre DroidForge.
2. Importa un proyecto Android Gradle o crea uno Kotlin de ejemplo.
3. Pulsa **Compilar APK**.
4. Conecta el celular por USB y acepta la autorización de depuración.
5. Instala el APK desde la aplicación.

## Limitaciones de esta primera versión

- Genera APK debug, no APK firmado de publicación.
- El generador crea una Activity Kotlin mínima; no es todavía un editor de código completo.
- Los proyectos importados deben ser proyectos Android Gradle compatibles.
- La primera instalación de herramientas ocupa espacio; Android Studio no es necesario.
