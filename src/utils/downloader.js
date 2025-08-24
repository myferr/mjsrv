
import { exec } from 'child_process';

export function downloadServer(version, serverPath) {
  return new Promise((resolve, reject) => {
    const manifestUrl = "https://launchermeta.mojang.com/mc/game/version_manifest.json";
    exec(`curl -s ${manifestUrl}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`[mc.js:server:error] Failed to get version manifest: ${error.message}`);
        return reject(error);
      }

      const manifest = JSON.parse(stdout);
      const versionInfo = manifest.versions.find((v) => v.id === version);

      if (!versionInfo) {
        console.error(`[mc.js:server:error] Version ${version} not found.`);
        return reject(new Error(`Version ${version} not found.`));
      }

      exec(`curl -s ${versionInfo.url}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`[mc.js:server:error] Failed to get version data: ${error.message}`);
          return reject(error);
        }

        const versionData = JSON.parse(stdout);
        const downloadUrl = versionData.downloads.server.url;

        const downloadCommand = `curl -o ${serverPath}/server.jar ${downloadUrl}`;

        console.log(`[mc.js:server] Downloading Minecraft server version ${version}...`);
        exec(downloadCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`[mc.js:server:error] Failed to download server.jar: ${error.message}`);
            return reject(error);
          }

          console.log(`[mc.js:server] Download complete.`);
          resolve();
        });
      });
    });
  });
}
