import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("droidforge", {
  pickFolder: () => ipcRenderer.invoke("pick-folder"),
  pickApk: () => ipcRenderer.invoke("pick-apk"),
  pickSaveFolder: () => ipcRenderer.invoke("pick-save-folder"),
  createProject: (args: unknown) => ipcRenderer.invoke("create-project", args),
  buildProject: (p: string) => ipcRenderer.invoke("build-project", p),
  devices: () => ipcRenderer.invoke("devices"),
  installApk: (apk: string, serial?: string) => ipcRenderer.invoke("install-apk", apk, serial),
  openPath: (p: string) => ipcRenderer.invoke("open-path", p),
  toolStatus: () => ipcRenderer.invoke("tool-status"),
  onLog: (callback: (line: string) => void) => ipcRenderer.on("process-log", (_e, line) => callback(line))
});