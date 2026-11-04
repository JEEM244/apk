# DroidForge

DroidForge es una aplicación para Windows que estoy desarrollando para probar una forma más sencilla de compilar proyectos Android e instalar el APK en un teléfono conectado por USB, sin tener que abrir Android Studio.

La aplicación todavía es una primera versión y tiene limitaciones.

## Qué se puede hacer

- Importar un proyecto Android Gradle.
- Crear un proyecto Kotlin básico.
- Preparar las herramientas de Android necesarias.
- Compilar una versión debug del proyecto.
- Instalar el APK en un teléfono conectado por USB mediante ADB.

## Requisitos

- Windows 10 u 11 de 64 bits.
- Node.js 20 o superior.
- Para compilar: JDK 17, Android SDK Command-line Tools, Platform Tools, Build Tools y Gradle.
- Un teléfono Android con depuración USB activada y autorizado en la computadora.

## Ejecutar en desarrollo

```powershell
npm install
npm run dev
```

## Preparar las herramientas

Desde PowerShell, en la carpeta del proyecto:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup-tools.ps1
```

La preparación inicial necesita internet para descargar las herramientas. Revisa el script antes de ejecutarlo y asegúrate de usar las descargas oficiales.

## Limitaciones

- Por ahora genera APK de depuración; no prepara una versión firmada para publicar.
- El generador crea una Activity Kotlin básica, no es un editor completo.
- Los proyectos importados deben ser compatibles con Android Gradle.
- La primera descarga de herramientas puede ocupar bastante espacio.

## Tecnologías

Electron, React, TypeScript, Node.js, Gradle y ADB.

La idea es seguir mejorando el flujo de compilación y hacer que sea más fácil revisar qué herramientas faltan cuando algo no funciona.
