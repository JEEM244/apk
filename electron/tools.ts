import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";

function exec(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(command, args, { windowsHide: true, shell: false });
    let out = "";
    p.stdout.on("data", d => out += d.toString());
    p.stderr.on("data", d => out += d.toString());
    p.on("error", reject);
    p.on("close", code => code === 0 ? resolve(out) : reject(new Error(out || `${command} terminó con código ${code}`)));
  });
}
export async function detectDevices() {
  try {
    const output = await exec("adb", ["devices", "-l"]);
    return output.split(/\r?\n/).slice(1).filter(x => x.trim() && !x.startsWith("*")).map(line => {
      const parts = line.trim().split(/\s+/);
      return { serial: parts[0], state: parts[1], details: parts.slice(2).join(" ") };
    });
  } catch { return []; }
}
export async function installApk(apk: string, serial: string | undefined, log: (s: string) => void) {
  await fs.access(apk);
  const args = serial ? ["-s", serial, "install", "-r", apk] : ["install", "-r", apk];
  log(`\n> adb ${args.join(" ")}\n`);
  try {
    const output = await exec("adb", args);
    log(output);
    return { ok: true, output };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    log(message);
    return { ok: false, output: message };
  }
}