import { APIService, type DashboardWebSocketServerToClientEvents } from '@aneuhold/core-ts-api-lib';
import { DateService } from '@aneuhold/core-ts-lib';
import { io, Socket } from 'socket.io-client';
import LocalData from '$util/LocalData/LocalData';
import { createLogger } from '$util/logging/logger';

/**
 * A service for handling WebSocket connections used in the application.
 */
export default class WebSocketService {
  static readonly #log = createLogger('WebSocket.service.ts');
  static #socket?: Socket<DashboardWebSocketServerToClientEvents, never>;
  static #unsubs: (() => void)[] = [];

  static connect() {
    if (this.#socket) {
      return;
    } else {
      // Use the namespace `/dashboard` to ensure that we only connect to the dashboard parts
      this.#socket = io(`${APIService.getCurrentAPIUrl()}dashboard`, {
        auth: {
          accessToken: LocalData.accessToken || undefined
        }
      });

      this.#socket.on('connect', () => {
        this.#log.info('Connected to WebSocket server');
      });

      this.#socket.on('disconnect', () => {
        this.#log.info('Disconnected from WebSocket server');
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
    this.#socket?.on('rootPostResult', (data) => {
      this.#reviveDates(data);
      callback(data);
    });
    const unsub = () => {
      this.#socket?.off('rootPostResult', callback);
    };
    this.#unsubs.push(unsub);
    return unsub;
  }

  /**
   * Disconnects the current socket and clears it so a future `connect()` will
   * create a fresh connection (useful after logout).
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

  /**
   * This really needs to be refactored into something else. Maybe Zod. It is used and exactly
   * the same on the server as well.
   *
   * @param body the body to revive
   */
  static #reviveDates(body: unknown) {
    if (!WebSocketService.#isRecord(body)) {
      return;
    }

    for (const key of Object.keys(body)) {
      const value = body[key];
      const revivedValue = DateService.dateReviver(key, value);
      if (revivedValue !== value) {
        body[key] = revivedValue;
      } else if (typeof value === 'object') {
        this.#reviveDates(value);
      }
    }
  }

  /**
   * Type guard narrowing an unknown value to a string-keyed record.
   *
   * @param value the value to check
   */
  static #isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object';
  }
}
