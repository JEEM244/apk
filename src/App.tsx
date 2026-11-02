import { useEffect, useState } from "react";
import { Cable, Smartphone, FolderOpen, Hammer, Download, Plus, RefreshCw, Terminal, AlertCircle, Package, Code2, Settings, ExternalLink } from "lucide-react";

type Device = { serial: string; state: string; details: string };
export default function App() {
  const [tab, setTab] = useState<"build" | "device" | "tools">("build");
  const [project, setProject] = useState("");
  const [apk, setApk] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [selected, setSelected] = useState("");
  const [logs, setLogs] = useState("DroidForge listo. Conecta tu celular por USB.\n");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ adb: false, java: false, gradle: false });
  const [newName, setNewName] = useState("MiAplicacion");
  const [packageId, setPackageId] = useState("com.ejemplo.miapp");
  const [notice, setNotice] = useState("Selecciona un proyecto Android o crea uno nuevo.");

  useEffect(() => {
    window.droidforge.onLog(line => setLogs(old => (old + line).slice(-16000)));
    void refresh();
    void window.droidforge.toolStatus().then(setStatus);
  }, []);
  async function refresh() {
    const found = await window.droidforge.devices();
    setDevices(found);
    if (found.length && !found.some(d => d.serial === selected)) setSelected(found[0].serial);
  }
  async function chooseProject() {
    const p = await window.droidforge.pickFolder();
    if (p) { setProject(p); setNotice("Proyecto seleccionado."); }
  }
  async function createProject() {
    const parent = await window.droidforge.pickSaveFolder();
    if (!parent) return;
    setBusy(true);
    try {
      const result = await window.droidforge.createProject({ parent, name: newName, packageId });
      setProject(result.path); setNotice(result.message);
    } catch (e) { setNotice(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }
  async function build() {
    if (!project) { setNotice("Primero selecciona o crea un proyecto."); return; }
    setBusy(true); setLogs(old => old + "\n> Iniciando compilación...\n");
    try {
      const result = await window.droidforge.buildProject(project);
      if (result.apk) { setApk(result.apk); setNotice("APK generado correctamente."); }
      else setNotice("No se encontró el APK. Revisa la consola.");
      if (result.code !== 0) setNotice("La compilación falló. Revisa los errores de la consola.");
    } catch (e) { setNotice(`No se pudo iniciar Gradle: ${e instanceof Error ? e.message : String(e)}`); }
    finally { setBusy(false); }
  }
  async function chooseApk() {
    const p = await window.droidforge.pickApk();
    if (p) { setApk(p); setNotice("APK listo para instalar."); }
  }
  async function install() {
    if (!apk) { setNotice("Selecciona un APK primero."); return; }
    if (!devices.some(d => d.state === "device")) { setNotice("No hay un celular autorizado. Revisa la conexión USB."); return; }
    setBusy(true);
    const result = await window.droidforge.installApk(apk, selected || undefined);
    setNotice(result.ok ? "APK instalado correctamente." : "No se pudo instalar. Revisa la consola.");
    setBusy(false);
  }
  const connected = devices.some(d => d.state === "device");
  const toolRows = [
    { name: "ADB (Platform Tools)", ok: status.adb, desc: "Detecta el celular e instala APK." },
    { name: "Java JDK", ok: status.java, desc: "Necesario para ejecutar Gradle." },
    { name: "Gradle", ok: status.gradle, desc: "Compila proyectos Android." }
  ];
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brandIcon"><Package size={21} /></div><div><b>DroidForge</b><small>ANDROID BUILD TOOL</small></div></div>
      <div className="navLabel">PROYECTO</div>
      <button className={tab === "build" ? "nav active" : "nav"} onClick={() => setTab("build")}><Hammer size={17} /> Compilar APK</button>
      <button className={tab === "device" ? "nav active" : "nav"} onClick={() => setTab("device")}><Smartphone size={17} /> Dispositivo</button>
      <button className={tab === "tools" ? "nav active" : "nav"} onClick={() => setTab("tools")}><Settings size={17} /> Herramientas</button>
      <div className="sidebarBottom"><span className="dot" /> Versión 0.1.0 <span className="muted">· Windows</span></div>
    </aside>
    <main className="main">
      <header><div><div className="eyebrow">ANDROID DEVELOPMENT / WINDOWS</div><h1>{tab === "build" ? "Compilar aplicación" : tab === "device" ? "Dispositivo conectado" : "Herramientas del sistema"}</h1></div><div className="topStatus"><span className={connected ? "dot green" : "dot"} />{connected ? "Celular conectado" : "Sin dispositivo"}</div></header>
      {tab === "build" && <div className="content">
        <section className="panel">
          <div className="panelHead"><div><h2>Proyecto Android</h2><p>Importa un proyecto existente o crea uno desde cero.</p></div><Code2 size={20} /></div>
          <div className="projectPath"><FolderOpen size={17} /><span title={project}>{project || "Ningún proyecto seleccionado"}</span><button className="secondary" onClick={chooseProject}>Explorar</button></div>
          <div className="or"><span>O CREA UN PROYECTO NUEVO</span></div>
          <div className="fields"><label>Nombre de la aplicación<input value={newName} onChange={e => setNewName(e.target.value)} /></label><label>Identificador de paquete<input value={packageId} onChange={e => setPackageId(e.target.value)} /></label></div>
          <button className="secondary create" disabled={busy} onClick={createProject}><Plus size={16} /> Crear proyecto Kotlin</button>
          <div className="notice"><AlertCircle size={16} />{notice}</div>
          <div className="actions"><button className="primary" disabled={busy || !project} onClick={build}><Hammer size={17} />{busy ? "Procesando..." : "Compilar APK"}</button><button className="secondary" disabled={!apk} onClick={() => void window.droidforge.openPath(apk)}><ExternalLink size={16} /> Ver APK</button></div>
        </section>
        <section className="panel installPanel">
          <div className="panelHead"><div><h2>Instalar en celular</h2><p>Envía el APK al dispositivo por USB.</p></div><Smartphone size={20} /></div>
          <div className="projectPath"><Package size={17} /><span title={apk}>{apk || "Ningún APK seleccionado"}</span><button className="secondary" onClick={chooseApk}>Elegir APK</button></div>
          <div className="deviceMini"><div className="deviceGlyph"><Smartphone size={22} /></div><div><b>{devices.find(d => d.serial === selected)?.serial || "Conecta tu Android"}</b><small>{connected ? "Listo para instalar" : "Activa depuración USB y autoriza este equipo"}</small></div><button className="iconButton" onClick={() => void refresh()}><RefreshCw size={16} /></button></div>
          <button className="primary installButton" disabled={busy || !apk || !connected} onClick={install}><Download size={17} /> Instalar APK en dispositivo</button>
        </section>
      </div>}
      {tab === "device" && <section className="panel standalone"><div className="panelHead"><div><h2>Conexión USB</h2><p>Los dispositivos se detectan mediante Android Debug Bridge (ADB).</p></div><Cable size={21} /></div><button className="secondary" onClick={() => void refresh()}><RefreshCw size={16} /> Buscar dispositivos</button>{devices.length === 0 ? <div className="empty"><Smartphone size={34} /><b>No se detectaron dispositivos</b><p>Conecta el celular, activa Opciones de desarrollador → Depuración USB y acepta el aviso RSA.</p></div> : devices.map(d => <div className="deviceRow" key={d.serial}><Smartphone /><div><b>{d.serial}</b><small>{d.details || "Android"}</small></div><span className={d.state === "device" ? "state good" : "state"}>{d.state}</span><button className="secondary" onClick={() => setSelected(d.serial)}>{selected === d.serial ? "Seleccionado" : "Seleccionar"}</button></div>)}</section>}
      {tab === "tools" && <section className="panel standalone"><div className="panelHead"><div><h2>Requisitos de compilación</h2><p>DroidForge no incluye Android Studio. Estas herramientas son necesarias.</p></div><Settings size={21} /></div>{toolRows.map(t => <div className="toolRow" key={t.name}><div className="toolIcon"><Terminal size={18} /></div><div><b>{t.name}</b><small>{t.desc}</small></div><span className={t.ok ? "state good" : "state"}>{t.ok ? "Detectado" : "No detectado"}</span></div>)}<div className="helpBox"><b>Configuración inicial</b><p>Ejecuta <code>scripts/setup-tools.ps1</code> desde PowerShell para preparar JDK, Android SDK, Platform Tools y Gradle sin Android Studio. Después reinicia DroidForge.</p></div></section>}
      <section className="console"><div className="consoleHead"><span><Terminal size={15} /> CONSOLA DE COMPILACIÓN</span><button onClick={() => setLogs("")}>Limpiar</button></div><pre>{logs || "La salida de compilación aparecerá aquí."}</pre></section>
    </main>
  </div>;
}