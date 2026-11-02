export {};
declare global {
  interface Window {
    droidforge: {
      pickFolder(): Promise<string | null>;
      pickApk(): Promise<string | null>;
      pickSaveFolder(): Promise<string | null>;
      createProject(args: { parent: string; name: string; packageId: string }): Promise<{ path: string; message: string }>;
      buildProject(path: string): Promise<{ code: number; output: string; apk: string | null }>;
      devices(): Promise<{ serial: string; state: string; details: string }[]>;
      installApk(apk: string, serial?: string): Promise<{ ok: boolean; output: string }>;
      openPath(path: string): Promise<void>;
      toolStatus(): Promise<{ adb: boolean; java: boolean; gradle: boolean }>;
      onLog(callback: (line: string) => void): void;
    };
  }
}