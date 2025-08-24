import { exec } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";

const LATEST_VERSION = "1.21.8";

class MinecraftServer {
  static create({
    version = LATEST_VERSION,
    motd,
    id = `minecraft-server-${randomUUID().slice(0, 6)}`,
    maxPlayers = 20,
    hardcore = false,
  }) {
    return new Promise((resolve, reject) => {
      if (!motd) {
        console.error("[mc.js:error] MOTD is required.");
        return reject(new Error("MOTD is required."));
      }

      const serverPath = `./${id}`;
      if (existsSync(serverPath)) {
        console.error(`[mc.js:error] Server with ID "${id}" already exists.`);
        return reject(new Error(`Server with ID "${id}" already exists.`));
      }

      mkdirSync(serverPath, { recursive: true });

      const manifestUrl =
        "https://launchermeta.mojang.com/mc/game/version_manifest.json";
      exec(`curl -s ${manifestUrl}`, (error, stdout, stderr) => {
        if (error) {
          console.error(
            `[mc.js:server:error] Failed to get version manifest: ${error.message}`,
          );
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
            console.error(
              `[mc.js:server:error] Failed to get version data: ${error.message}`,
            );
            return reject(error);
          }

          const versionData = JSON.parse(stdout);
          const downloadUrl = versionData.downloads.server.url;

          const downloadCommand = `curl -o ${serverPath}/server.jar ${downloadUrl}`;

          console.log(
            `[mc.js:server] Downloading Minecraft server version ${version}...`,
          );
          exec(downloadCommand, (error, stdout, stderr) => {
            if (error) {
              console.error(
                `[mc.js:server:error] Failed to download server.jar: ${error.message}`,
              );
              return reject(error);
            }

            console.log(`[mc.js:server] Download complete.`);

            const eulaContent = "eula=true";
            writeFileSync(`${serverPath}/eula.txt`, eulaContent);

            const propertiesContent = `
motd=${motd}
max-players=${maxPlayers}
hardcore=${hardcore}
`;
            writeFileSync(`${serverPath}/server.properties`, propertiesContent);

            console.log(
              `[mc.js:server] Created server "${id}" at ${serverPath}`,
            );
            resolve();
          });
        });
      });
    });
  }

  static serve(id, port = 25565) {
    const serverPath = `./${id}`;
    if (!existsSync(serverPath)) {
      console.error(`[mc.js:error] Server with ID "${id}" not found.`);
      return;
    }

    const propertiesContent = `
server-port=${port}
`;
    writeFileSync(`${serverPath}/server.properties`, propertiesContent, {
      flag: "a",
    });

    const command = `java -Xmx1024M -Xms1024M -jar server.jar nogui`;

    console.log(`[mc.js:server] Starting server "${id}" on port ${port}...`);

    const serverProcess = exec(command, { cwd: serverPath });

    serverProcess.stdout.on("data", (data) => {
      console.log(`[mc.js:server:logs] ${data}`);
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(`[mc.js:server:error] ${data}`);
    });

    serverProcess.on("close", (code) => {
      console.log(`[mc.js:server] Server process exited with code ${code}`);
    });
  }

  static stop(id) {
    console.log(`[mc.js:server] Stopping server "${id}"...`);
    exec("pkill java", (error, stdout, stderr) => {
      if (error) {
        console.error(
          `[mc.js:server:error] Failed to stop server: ${error.message}`,
        );
        return;
      }
      console.log(`[mc.js:server] Server "${id}" stopped.`);
    });
  }

  static start(id, port = 25565) {
    const serverPath = `./${id}`;
    if (!existsSync(serverPath)) {
      console.error(`[mc.js:error] Server with ID "${id}" not found.`);
      return;
    }

    const propertiesContent = `
server-port=${port}
`;
    writeFileSync(`${serverPath}/server.properties`, propertiesContent, {
      flag: "a",
    });

    const command = `java -Xmx1024M -Xms1024M -jar server.jar nogui`;

    console.log(`[mc.js:server] Starting server "${id}" on port ${port}...`);

    const serverProcess = exec(command, { cwd: serverPath });

    serverProcess.stdout.on("data", (data) => {
      console.log(`[mc.js:server:logs] ${data}`);
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(`[mc.js:server:error] ${data}`);
    });

    serverProcess.on("close", (code) => {
      console.log(`[mc.js:server] Server process exited with code ${code}`);
    });
  }

  static restart(id) {
    console.log(`[mc.js:server] Restarting server "${id}"...`);
    this.stop(id);
    this.start(id);
  }

  static delete(id) {
    console.log(`[mc.js:server] Deleting server "${id}"...`);
    const serverPath = `./${id}`;
    if (existsSync(serverPath)) {
      exec(`rm -rf ${serverPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(
            `[mc.js:server:error] Failed to delete server: ${error.message}`,
          );
          return;
        }
        console.log(`[mc.js:server] Server "${id}" deleted.`);
      });
    } else {
      console.error(`[mc.js:error] Server with ID "${id}" not found.`);
    }
  }

  static toContainer(id, { image = id } = {}) {
    console.log(
      `[mc.js:server] Converting server "${id}" to container with image "${image}"...`,
    );
    const serverPath = `./${id}`;
    if (!existsSync(serverPath)) {
      console.error(`[mc.js:error] Server with ID "${id}" not found.`);
      return;
    }

    exec("docker info", (error, stdout, stderr) => {
      if (error) {
        console.error(
          "[mc.js:error] Docker is not installed or the Docker daemon is not running.",
        );
        return;
      }

      const dockerfileContent = `
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY . .
CMD ["java", "-Xmx1024M", "-Xms1024M", "-jar", "server.jar", "nogui"]
`;
      writeFileSync(`${serverPath}/Dockerfile`, dockerfileContent);

      const buildCommand = `docker build -t ${image} .`;
      exec(buildCommand, { cwd: serverPath }, (error, stdout, stderr) => {
        if (error) {
          console.error(
            `[mc.js:docker:error] Failed to build Docker image: ${error.message}`,
          );
          return;
        }
        console.log(
          `[mc.js:docker] Docker image "${image}" built successfully.`,
        );
      });
    });
  }
}

class Containers {
  static start(id, image, port) {
    console.log(`[mc.js:container] Starting container for server "${id}"...`);
    const command = `docker run -d -p ${port}:${port} --name ${id} ${image}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(
          `[mc.js:docker:error] Failed to start container: ${error.message}`,
        );
        return;
      }
      console.log(
        `[mc.js:docker] Container for server "${id}" started successfully.`,
      );
    });
  }

  static stop(id) {
    console.log(`[mc.js:container] Stopping container for server "${id}"...`);
    const command = `docker stop ${id}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(
          `[mc.js:docker:error] Failed to stop container: ${error.message}`,
        );
        return;
      }
      console.log(
        `[mc.js:docker] Container for server "${id}" stopped successfully.`,
      );
    });
  }

  static restart(id) {
    console.log(`[mc.js:container] Restarting container for server "${id}"...`);
    const command = `docker restart ${id}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(
          `[mc.js:docker:error] Failed to restart container: ${error.message}`,
        );
        return;
      }
      console.log(
        `[mc.js:docker] Container for server "${id}" restarted successfully.`,
      );
    });
  }

  static delete(id) {
    console.log(`[mc.js:container] Deleting container for server "${id}"...`);
    const command = `docker rm ${id}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(
          `[mc.js:docker:error] Failed to delete container: ${error.message}`,
        );
        return;
      }
      console.log(
        `[mc.js:docker] Container for server "${id}" deleted successfully.`,
      );
    });
  }
}

export { MinecraftServer, Containers };
