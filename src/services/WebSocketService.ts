import { io, Socket } from 'socket.io-client';
import { apiKey } from '$stores/local/apiKey';
import { createLogger } from '$util/logging/logger';

const log = createLogger('WebSocketService.ts');

/**
 * A service for handling WebSocket connections used in the application.
 */
export default class WebSocketService {
  static #socket?: Socket;

  static connect() {
    if (this.#socket) {
      return;
    } else {
      this.#socket = io('http://localhost:8080', {
        auth: {
          apiKey: apiKey.get()
        }
      });

      this.#socket.on('connect', () => {
        log.info('Connected to WebSocket server');
      });

      this.#socket.on('disconnect', () => {
        log.info('Disconnected from WebSocket server');
      });
    }
  }

  static subscribe(event: string, callback: (data: unknown) => void) {
    if (!this.#socket) {
      this.connect();
    }
    this.#socket?.on(event, callback);
  }

  static unsubscribe(event: string, callback: (data: unknown) => void) {
    if (!this.#socket) {
      return;
    }
    this.#socket.off(event, callback);
  }

  static emit(event: string, data: unknown) {
    if (!this.#socket) {
      this.connect();
    }
    this.#socket?.emit(event, data);
  }
}
