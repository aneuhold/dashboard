import { type UserCTO } from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';

/**
 * Static user data for testing to avoid circular dependencies.
 */
export default class TestUsers {
  static currentUserCto: UserCTO = {
    _id: new ObjectId(),
    userName: 'storybookUser'
  };
  static collaborator1: UserCTO = {
    _id: new ObjectId(),
    userName: 'Collaborator1'
  };
  static collaborator2: UserCTO = {
    _id: new ObjectId(),
    userName: 'Collaborator2'
  };
}
