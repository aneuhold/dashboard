import type { AdminInput } from '@aneuhold/core-ts-api-lib';

/**
 * Applies an admin update for a user, refreshes the user
 * detail from the response, and shows a snackbar with the outcome.
 */
export type AdminUserDetailUpdater = (
  update: AdminUserDetailUpdate,
  successMessage: string,
  errorMessage: string
) => Promise<void>;

/**
 * An admin update applied to a user.
 */
export type AdminUserDetailUpdate = NonNullable<AdminInput['update']>;
