
import { exec } from 'child_process';
import { writeFileSync } from 'fs';

export function buildImage(id, image) {
  return new Promise((resolve, reject) => {
    const serverPath = `./${id}`;
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
        console.error(`[mc.js:docker:error] Failed to build Docker image: ${error.message}`);
        return reject(error);
      }
      console.log(`[mc.js:docker] Docker image "${image}" built successfully.`);
      resolve();
    });
  });
}

export function startContainer(id, image, port) {
  return new Promise((resolve, reject) => {
    const command = `docker run -d -p ${port}:${port} --name ${id} ${image}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`[mc.js:docker:error] Failed to start container: ${error.message}`);
        return reject(error);
      }
      console.log(`[mc.js:docker] Container for server "${id}" started successfully.`);
      resolve();
    });
  });
}

export function stopContainer(id) {
  return new Promise((resolve, reject) => {
    const command = `docker stop ${id}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`[mc.js:docker:error] Failed to stop container: ${error.message}`);
        return reject(error);
      }
      console.log(`[mc.js:docker] Container for server "${id}" stopped successfully.`);
      resolve();
    });
  });
}

export function restartContainer(id) {
  return new Promise((resolve, reject) => {
    const command = `docker restart ${id}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`[mc.js:docker:error] Failed to restart container: ${error.message}`);
        return reject(error);
      }
      console.log(`[mc.js:docker] Container for server "${id}" restarted successfully.`);
      resolve();
    });
  });
}

export function deleteContainer(id) {
  return new Promise((resolve, reject) => {
    const command = `docker rm ${id}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`[mc.js:docker:error] Failed to delete container: ${error.message}`);
        return reject(error);
      }
      console.log(`[mc.js:docker] Container for server "${id}" deleted successfully.`);
      resolve();
    });
  });
}
