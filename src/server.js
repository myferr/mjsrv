import { exec } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
import { downloadServer } from "./utils/downloader.js";
import { buildImage } from "./utils/docker.js";

const LATEST_VERSION = "1.21.8";

export class MinecraftServer {
  static create({
    version = LATEST_VERSION,
    motd,
    id = `minecraft-server-${randomUUID().slice(0, 6)}`,
    maxPlayers = 20,
    hardcore = false,
  }) {
    return new Promise((resolve, reject) => {
      if (!motd) {
        console.error("[mjsrv:error] MOTD is required.");
        return reject(new Error("MOTD is required."));
      }

      const serverPath = `./${id}`;
      if (existsSync(serverPath)) {
        console.error(`[mjsrv:error] Server with ID "${id}" already exists.`);
        return reject(new Error(`Server with ID "${id}" already exists.`));
      }

      mkdirSync(serverPath, { recursive: true });

      downloadServer(version, serverPath)
        .then(() => {
          const eulaContent = "eula=true";
          writeFileSync(`${serverPath}/eula.txt`, eulaContent);

          const propertiesContent = `
motd=${motd}
max-players=${maxPlayers}
hardcore=${hardcore}
`;
          writeFileSync(`${serverPath}/server.properties`, propertiesContent);

          console.log(`[mjsrv:server] Created server "${id}" at ${serverPath}`);
          resolve();
        })
        .catch(reject);
    });
  }

  static serve(id, port = 25565) {
    const serverPath = `./${id}`;
    if (!existsSync(serverPath)) {
      console.error(`[mjsrv:error] Server with ID "${id}" not found.`);
      return;
    }

    const propertiesContent = `
server-port=${port}
`;
    writeFileSync(`${serverPath}/server.properties`, propertiesContent, {
      flag: "a",
    });

    const command = `java -Xmx1024M -Xms1024M -jar server.jar nogui`;

    console.log(`[mjsrv:server] Starting server "${id}" on port ${port}...`);

    const serverProcess = exec(command, { cwd: serverPath });

    serverProcess.stdout.on("data", (data) => {
      console.log(`[mjsrv:server:logs] ${data}`);
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(`[mjsrv:server:error] ${data}`);
    });

    serverProcess.on("close", (code) => {
      console.log(`[mjsrv:server] Server process exited with code ${code}`);
    });
  }

  static stop(id) {
    console.log(`[mjsrv:server] Stopping server "${id}"...`);
    // This is a temporary solution and needs to be improved.
    // It tries to kill all java processes, which is not ideal.
    exec("pkill java", (error, stdout, stderr) => {
      if (error) {
        console.error(
          `[mjsrv:server:error] Failed to stop server: ${error.message}`
        );
        return;
      }
      console.log(`[mjsrv:server] Server "${id}" stopped.`);
    });
  }

  static start(id, port = 25565) {
    const serverPath = `./${id}`;
    if (!existsSync(serverPath)) {
      console.error(`[mjsrv:error] Server with ID "${id}" not found.`);
      return;
    }

    const propertiesContent = `
server-port=${port}
`;
    writeFileSync(`${serverPath}/server.properties`, propertiesContent, {
      flag: "a",
    });

    const command = `java -Xmx1024M -Xms1024M -jar server.jar nogui`;

    console.log(`[mjsrv:server] Starting server "${id}" on port ${port}...`);

    const serverProcess = exec(command, { cwd: serverPath });

    serverProcess.stdout.on("data", (data) => {
      console.log(`[mjsrv:server:logs] ${data}`);
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(`[mjsrv:server:error] ${data}`);
    });

    serverProcess.on("close", (code) => {
      console.log(`[mjsrv:server] Server process exited with code ${code}`);
    });
  }

  static restart(id) {
    console.log(`[mjsrv:server] Restarting server "${id}"...`);
    this.stop(id);
    this.start(id);
  }

  static delete(id) {
    console.log(`[mjsrv:server] Deleting server "${id}"...`);
    const serverPath = `./${id}`;
    if (existsSync(serverPath)) {
      exec(`rm -rf ${serverPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(
            `[mjsrv:server:error] Failed to delete server: ${error.message}`
          );
          return;
        }
        console.log(`[mjsrv:server] Server "${id}" deleted.`);
      });
    } else {
      console.error(`[mjsrv:error] Server with ID "${id}" not found.`);
    }
  }

  static toContainer(id, { image = id } = {}) {
    return buildImage(id, image);
  }
}
