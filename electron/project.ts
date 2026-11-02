import path from "node:path";
import { promises as fs } from "node:fs";

export async function createAndroidProject(args: { parent: string; name: string; packageId: string }) {
  const safeName = args.name.trim().replace(/[^a-zA-Z0-9_-]/g, "");
  const packageId = args.packageId.trim();
  if (!safeName || !/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(packageId)) {
    throw new Error("Nombre o identificador inválido. Ejemplo: com.ejemplo.miapp");
  }
  const root = path.join(args.parent, safeName);
  if (await fs.access(root).then(() => true).catch(() => false)) throw new Error("Ya existe una carpeta con ese nombre.");
  const pkgPath = packageId.replace(/\./g, path.sep);
  const files: Record<string, string> = {
    "settings.gradle.kts": `pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }
dependencyResolutionManagement { repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS); repositories { google(); mavenCentral() } }
rootProject.name = "${safeName}"
include(":app")
`,
    "build.gradle.kts": `plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
}
`,
    "gradle.properties": "org.gradle.jvmargs=-Xmx1536m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nkotlin.code.style=official\n",
    "app/build.gradle.kts": `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "${packageId}"
    compileSdk = 35
    defaultConfig {
        applicationId = "${packageId}"
        minSdk = 23
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }
}
`,
    "app/src/main/AndroidManifest.xml": `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application android:theme="@android:style/Theme.Material.Light.NoActionBar" android:label="${safeName}" android:allowBackup="true">
    <activity android:name=".MainActivity" android:exported="true">
      <intent-filter><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent-filter>
    </activity>
  </application>
</manifest>
`,
    [`app/src/main/java/${pkgPath}/MainActivity.kt`]: `package ${packageId}
import android.app.Activity
import android.os.Bundle
import android.view.Gravity
import android.widget.TextView
class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val label = TextView(this).apply {
            text = "Hola desde ${safeName}"
            textSize = 24f
            gravity = Gravity.CENTER
        }
        setContentView(label)
    }
}
`
  };
  await fs.mkdir(root, { recursive: true });
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(root, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content, "utf8");
  }
  return { path: root, message: "Proyecto Kotlin creado. Se requiere Gradle instalado para compilarlo." };
}