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
  static #unsubs: (() => void)[] = [];

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
    const unsub = () => {
      this.#socket?.off('rootPostResult', callback);
    };
    this.#unsubs.push(unsub);
    return unsub;
  }

  /**
   * Disconnects the current socket and clears it so a future `connect()` will
   * create a fresh connection (useful after logout or API key changes).
   *
   * Also clears all current subscriptions.
   */
  static disconnect() {
    if (!this.#socket) return;
    try {
      this.#unsubs.forEach((unsub) => {
        unsub();
      });
      this.#unsubs = [];
      this.#socket.disconnect();
    } catch (_err) {
      // Ignore disconnect errors; we'll clear the socket reference regardless.
      // Logging is omitted as this is a non-critical cleanup operation.
    }
    this.#socket = undefined;
  }
}
