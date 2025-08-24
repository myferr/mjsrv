# mc.js

A JavaScript library for creating and managing Minecraft Java servers.

## Installation

```bash
npm install mc.js
```

## Quick Start

```javascript
import { MinecraftServer } from 'mc.js';

MinecraftServer.create({
  version: '1.21',
  motd: 'Welcome to my server!',
  id: 'my-server',
});

setTimeout(() => {
  MinecraftServer.serve('my-server');
}, 5000);
```

## Documentation

### `MinecraftServer`

The `MinecraftServer` class provides methods for creating and managing Minecraft servers.

#### `MinecraftServer.create(options)`

Creates a new Minecraft server.

**Options:**

*   `version` (string): The version of the Minecraft server to create. Defaults to the latest version.
*   `motd` (string): The message of the day for the server. **Required**.
*   `id` (string): The ID of the server. Defaults to `minecraft-server-<random_6_figure_uuid>`.
*   `maxPlayers` (number): The maximum number of players that can join the server. Defaults to `20`.
*   `hardcore` (boolean): Whether to enable hardcore mode. Defaults to `false`.

**Example:**

```javascript
import { MinecraftServer } from 'mc.js';

MinecraftServer.create({
  version: '1.21',
  motd: 'Welcome to my hardcore server!',
  id: 'my-hardcore-server',
  hardcore: true,
});
```

#### `MinecraftServer.serve(id, port)`

Starts a Minecraft server.

*   `id` (string): The ID of the server to start.
*   `port` (number): The port to start the server on. Defaults to `25565`.

#### `MinecraftServer.start(id, port)`

Starts a Minecraft server.

*   `id` (string): The ID of the server to start.
*   `port` (number): The port to start the server on. Defaults to `25565`.

#### `MinecraftServer.stop(id)`

Stops a Minecraft server.

*   `id` (string): The ID of the server to stop.

#### `MinecraftServer.restart(id)`

Restarts a Minecraft server.

*   `id` (string): The ID of the server to restart.

#### `MinecraftServer.delete(id)`

Deletes a Minecraft server.

*   `id` (string): The ID of the server to delete.

#### `MinecraftServer.toContainer(id, options)`

Converts a Minecraft server to a Docker container.

*   `id` (string): The ID of the server to convert.
*   `options` (object):
    *   `image` (string): The name of the Docker image to create. Defaults to the server ID.

**Example:**

```javascript
import { MinecraftServer } from 'mc.js';

MinecraftServer.toContainer('my-server', { image: 'my-minecraft-image' });
```

### `Containers`

The `Containers` class provides methods for managing Docker containers for Minecraft servers.

#### `Containers.start(id, image, port)`

Starts a Docker container for a Minecraft server.

*   `id` (string): The ID of the server.
*   `image` (string): The name of the Docker image to use.
*   `port` (number): The port to start the server on. Defaults to `25565`.

#### `Containers.stop(id)`

Stops a Docker container for a Minecraft server.

*   `id` (string): The ID of the server.

#### `Containers.restart(id)`

Restarts a Docker container for a Minecraft server.

*   `id` (string): The ID of the server.

#### `Containers.delete(id)`

Deletes a Docker container for a Minecraft server.

*   `id` (string): The ID of the server.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

[MIT](LICENSE)
