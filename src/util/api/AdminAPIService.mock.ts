import type {
  AdminOutput,
  AdminOutputUserDetail,
  AdminOutputUserDocumentCounts
} from '@aneuhold/core-ts-api-lib';
import {
  DashboardUserConfigSchema,
  DocumentService,
  type User,
  UserSchema
} from '@aneuhold/core-ts-db-lib';
import type { UUID } from 'crypto';

/**
 * A mock provider for AdminAPIService responses. Manages a set of mock
 * users and provides methods to build API responses for storybook stories
 * and tests.
 */
export default class AdminAPIServiceMock {
  private users: User[] = [];

  constructor() {
    this.reset();
  }

  /**
   * Resets the mock to a default set of users.
   */
  reset(): void {
    this.users = [
      UserSchema.parse({
        _id: DocumentService.generateID(),
        userName: 'alice',
        email: 'alice@example.com',
        auth: { isSuperAdmin: true },
        projectAccess: { dashboard: true, workout: true }
      }),
      UserSchema.parse({
        _id: DocumentService.generateID(),
        userName: 'bob',
        email: 'bob@example.com',
        projectAccess: { dashboard: true, workout: false }
      }),
      UserSchema.parse({
        _id: DocumentService.generateID(),
        userName: 'charlie',
        projectAccess: { dashboard: false, workout: true }
      })
    ];
  }

  /**
   * Gets the current list of mock users.
   */
  getUsers(): User[] {
    return this.users;
  }

  /**
   * Gets a specific mock user by index.
   *
   * @param index - The index of the user in the mock list.
   */
  getUser(index: number): User {
    return this.users[index];
  }

  /**
   * Creates a mock AdminOutput containing all users.
   */
  createUsersResponse(): AdminOutput {
    return { users: this.users };
  }

  /**
   * Creates a mock AdminOutputUserDetail for a specific user, with
   * a generated DashboardUserConfig and document counts.
   *
   * @param userId - The user ID to create detail for. Defaults to the first mock user.
   */
  createUserDetail(userId?: UUID): AdminOutputUserDetail {
    const user = userId
      ? (this.users.find((u) => u._id === userId) ?? this.users[0])
      : this.users[0];

    return {
      user,
      userConfig: DashboardUserConfigSchema.parse({
        userId: user._id,
        enableDevMode: true,
        enableAdminPage: true,
        enabledFeatures: {
          financePage: true,
          adminPage: true
        }
      }),
      documentCounts: this.createDocumentCounts()
    };
  }

  /**
   * Creates a mock AdminOutput containing user detail.
   *
   * @param userId - The user ID to create detail for. Defaults to the first mock user.
   */
  createUserDetailResponse(userId?: UUID): AdminOutput {
    return { userDetail: this.createUserDetail(userId) };
  }

  /**
   * Creates mock document counts.
   */
  createDocumentCounts(): AdminOutputUserDocumentCounts {
    return {
      tasks: 42,
      nonogramKatanaItems: 7,
      nonogramKatanaUpgrades: 3,
      workoutExercises: 15,
      workoutEquipmentTypes: 4,
      workoutMuscleGroups: 8,
      workoutMesocycles: 2,
      workoutMicrocycles: 6,
      workoutSessions: 18,
      workoutSessionExercises: 54,
      workoutSets: 162,
      workoutExerciseCalibrations: 12
    };
  }
}
