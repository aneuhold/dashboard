import { type UserCTO } from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';

export default class StorybookMockData {
  static currentUserCto: UserCTO = {
    _id: new ObjectId(),
    userName: 'Test User'
  };
}
