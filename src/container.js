
import {
  startContainer,
  stopContainer,
  restartContainer,
  deleteContainer,
} from './utils/docker.js';

export class Containers {
  static start(id, image, port) {
    return startContainer(id, image, port);
  }

  static stop(id) {
    return stopContainer(id);
  }

  static restart(id) {
    return restartContainer(id);
  }

  static delete(id) {
    return deleteContainer(id);
  }
}
