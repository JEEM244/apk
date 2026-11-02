import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import path from "node:path";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { createAndroidProject } from "./project";
import { detectDevices, installApk } from "./tools";

let win: BrowserWindow | null = null;
const isDev = !app.isPackaged;
function createWindow() {
  win = new BrowserWindow({
    width: 1180, height: 780, minWidth: 900, minHeight: 620,
    backgroundColor: "#f4f5f7",
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false }
  });
  if (isDev) void win.loadURL("http://localhost:5173");
  else void win.loadFile(path.join(__dirname, "../dist/index.html"));
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

function log(line: string) { win?.webContents.send("process-log", line); }
function run(command: string, args: string[], cwd?: string): Promise<{ code: number; output: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, windowsHide: true, shell: false, env: process.env });
    let output = "";
    child.stdout.on("data", d => { const s = d.toString(); output += s; log(s); });
    child.stderr.on("data", d => { const s = d.toString(); output += s; log(s); });
    child.on("error", reject);
    child.on("close", code => resolve({ code: code ?? -1, output }));
  });
}
ipcMain.handle("pick-folder", async () => {
  const r = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle("pick-apk", async () => {
  const r = await dialog.showOpenDialog({ properties: ["openFile"], filters: [{ name: "Android APK", extensions: ["apk"] }] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle("pick-save-folder", async () => {
  const r = await dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle("create-project", async (_e, args) => createAndroidProject(args));
ipcMain.handle("build-project", async (_e, projectPath: string) => {
  const gradlew = path.join(projectPath, "gradlew.bat");
  const hasWrapper = await fs.access(gradlew).then(() => true).catch(() => false);
  const gradle = hasWrapper ? gradlew : "gradle";
  log(`\n> Gradle assembleDebug: ${projectPath}\n`);
  const result = await run(gradle, ["--no-daemon", "assembleDebug"], projectPath);
  const apk = path.join(projectPath, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
  const exists = await fs.access(apk).then(() => true).catch(() => false);
  return { ...result, apk: exists ? apk : null };
});
ipcMain.handle("devices", async () => detectDevices());
ipcMain.handle("install-apk", async (_e, apk: string, serial?: string) => installApk(apk, serial, log));
ipcMain.handle("open-path", async (_e, target: string) => shell.openPath(target));
ipcMain.handle("tool-status", async () => {
  const check = async (cmd: string, args: string[]) => (await run(cmd, args).catch(() => ({ code: -1, output: "" }))).code === 0;
  const [adb, java, gradle] = await Promise.all([check("adb", ["version"]), check("java", ["-version"]), check("gradle", ["--version"])]);
  return { adb, java, gradle };
});