# Conectar un Android por USB

1. En Android abre **Ajustes → Acerca del teléfono**.
2. Pulsa siete veces **Número de compilación** para habilitar Opciones de desarrollador.
3. Entra en **Opciones de desarrollador** y activa **Depuración USB**.
4. Conecta el teléfono a Windows con un cable que permita transferencia de datos.
5. Desbloquea el teléfono y acepta el diálogo **¿Permitir depuración USB?**. Puedes marcar "Permitir siempre desde este ordenador".
6. En DroidForge abre **Dispositivo** y pulsa **Buscar dispositivos**.

## Si aparece unauthorized

Desbloquea el teléfono, desconecta y vuelve a conectar el cable. Acepta el diálogo RSA. Si no aparece, en Opciones de desarrollador usa "Revocar autorizaciones de depuración USB" y vuelve a conectar.

## Si no aparece ningún dispositivo

- Prueba otro cable USB de datos y otro puerto.
- Selecciona "Transferencia de archivos" en la notificación USB del teléfono.
- En Windows instala el controlador USB del fabricante si el dispositivo lo requiere.
- Comprueba desde PowerShell con `adb devices -l`.
