import type { DashboardWebSocketServerToClientEvents } from '@aneuhold/core-ts-api-lib';
import { io, Socket } from 'socket.io-client';
import { apiKey } from '$stores/local/apiKey';
import { createLogger } from '$util/logging/logger';

const log = createLogger('WebSocketService.ts');

/**
 * A service for handling WebSocket connections used in the application.
 */
export default class WebSocketService {
  static #socket?: Socket<DashboardWebSocketServerToClientEvents, never>;

  static connect() {
    if (this.#socket) {
      return;
    } else {
      // Use the namespace `/dashboard` to ensure that we only connect to the dashboard parts
      this.#socket = io('http://localhost:8080/dashboard', {
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

  /**
   * Gets the current socket ID. Helpful to pass along in requests to the server.
   */
  static getSocketId() {
    if (!this.#socket) {
      return;
    }
    return this.#socket.id;
  }

  /**
   * Subscribes to the `rootPostResult` event.
   *
   * @param callback the callback function to call when the event is emitted
   * @returns a function to unsubscribe from the event
   */
  static subscribeToRootPostResult(
    callback: DashboardWebSocketServerToClientEvents['rootPostResult']
  ) {
    if (!this.#socket) {
      this.connect();
    }
    this.#socket?.on('rootPostResult', callback);
    return () => {
      this.#socket?.off('rootPostResult', callback);
    };
  }
}
