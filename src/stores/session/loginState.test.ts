import { APIService } from '@aneuhold/core-ts-api-lib';
import { get } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sessionExpired } from '$stores/session/sessionExpired';
import LocalData from '$util/LocalData/LocalData';

describe('Unit Tests', () => {
  describe('loginState onAuthExpired handler', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('clears tokens, flags the expired session, and logs out when auth expires', async () => {
      // Start from a logged-out module init so importing the store stays side-effect free.
      LocalData.accessToken = '';
      LocalData.refreshTokenString = '';

      const setOnAuthExpiredSpy = vi.spyOn(APIService, 'setOnAuthExpired');

      // Importing the store runs the callback registration as a module side effect.
      const { loginState, LoginState } = await import('./loginState');

      const authExpiredCallback = setOnAuthExpiredSpy.mock.calls.at(-1)?.[0];
      expect(authExpiredCallback).toBeTypeOf('function');

      LocalData.accessToken = 'access-token';
      LocalData.refreshTokenString = 'refresh-token';
      sessionExpired.set(false);

      authExpiredCallback?.();

      expect(loginState.get()).toBe(LoginState.LoggedOut);
      expect(get(sessionExpired)).toBe(true);
      expect(LocalData.accessToken).toBe('');
      expect(LocalData.refreshTokenString).toBe('');
    });
  });
});
