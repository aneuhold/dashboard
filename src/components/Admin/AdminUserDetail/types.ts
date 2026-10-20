import type { AdminInput } from '@aneuhold/core-ts-api-lib';

/**
 * Applies an admin update for the user being viewed, refreshes the user
 * detail from the response, and shows a snackbar with the outcome.
 */
export type AdminUserDetailUpdater = (
  update: NonNullable<AdminInput['update']>,
  successMessage: string,
  errorMessage: string
) => Promise<void>;
