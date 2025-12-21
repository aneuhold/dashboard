import { type BaseDocument, type DocumentMap, DocumentService } from '@aneuhold/core-ts-db-lib';
import type { UUID } from 'crypto';
import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DocumentMapStoreService, {
  type DocumentInsertOrUpdateInfo,
  type DocumentMapStoreSubscriber
} from './DocumentMapStoreService.svelte';

// Define a concrete implementation for testing
interface TestDoc extends BaseDocument {
  name: string;
  value: number;
}

class TestDocumentMapStoreService extends DocumentMapStoreService<TestDoc> {
  private static instance?: TestDocumentMapStoreService;

  private constructor() {
    super();
  }

  public static getInstance(): TestDocumentMapStoreService {
    if (!TestDocumentMapStoreService.instance) {
      TestDocumentMapStoreService.instance = new TestDocumentMapStoreService();
    }
    return TestDocumentMapStoreService.instance;
  }

  public static resetInstance() {
    TestDocumentMapStoreService.instance = new TestDocumentMapStoreService();
  }

  // Mocks for abstract methods
  public static persistToLocalDataMock = vi.fn<() => DocumentMap<TestDoc>>().mockReturnValue({});
  public static getFromLocalDataMock = vi
    .fn<() => DocumentMap<TestDoc> | null>()
    .mockReturnValue(null);
  public static persistToDbMock =
    vi.fn<(updateInfo: DocumentInsertOrUpdateInfo<TestDoc>) => void>();

  // Expose protected members for testing
  public get storePublic() {
    return this.store;
  }

  public get documentMapPublic() {
    return this.documentMap;
  }

  public getDocStorePublic(docId: UUID) {
    return this.getDocStore(docId);
  }

  protected setupSubscribers(): void {
    // No default subscribers for base test
  }

  protected persistToLocalData(): DocumentMap<TestDoc> {
    return TestDocumentMapStoreService.persistToLocalDataMock();
  }

  protected getFromLocalData(): DocumentMap<TestDoc> | null {
    return TestDocumentMapStoreService.getFromLocalDataMock();
  }

  protected persistToDb(updateInfo: DocumentInsertOrUpdateInfo<TestDoc>): void {
    TestDocumentMapStoreService.persistToDbMock(updateInfo);
  }

  // Helper to add subscribers for testing
  public addSubscriber(subscriber: DocumentMapStoreSubscriber<TestDoc>) {
    this.subscribers.push(subscriber);
  }
}

describe('DocumentMapStoreService', () => {
  let service: TestDocumentMapStoreService;
  const doc1: TestDoc = {
    _id: DocumentService.generateID(),
    name: 'Doc 1',
    value: 10
  };
  const doc2: TestDoc = {
    _id: DocumentService.generateID(),
    name: 'Doc 2',
    value: 20
  };

  beforeEach(() => {
    TestDocumentMapStoreService.persistToLocalDataMock.mockClear();
    TestDocumentMapStoreService.getFromLocalDataMock.mockClear();
    TestDocumentMapStoreService.persistToDbMock.mockClear();
    TestDocumentMapStoreService.resetInstance();
    service = TestDocumentMapStoreService.getInstance();
  });

  it('should initialize with empty map', () => {
    expect(get(service.storePublic)).toEqual({});
  });

  it('should add a document', () => {
    service.storePublic.addDoc(doc1);
    expect(get(service.storePublic)[doc1._id]).toEqual(doc1);
    expect(TestDocumentMapStoreService.persistToDbMock).toHaveBeenCalledWith({ insert: [doc1] });
  });

  it('should get a child store for a document', () => {
    service.storePublic.addDoc(doc1);
    const childStore = service.getDocStorePublic(doc1._id);
    expect(get(childStore)).toEqual(doc1);
  });

  it('should update a document via child store', () => {
    service.storePublic.addDoc(doc1);
    const childStore = service.getDocStorePublic(doc1._id);

    childStore.update((d) => ({ ...d, value: 15 }));

    expect(get(childStore).value).toBe(15);
    expect(get(service.storePublic)[doc1._id]?.value).toBe(15);
    expect(TestDocumentMapStoreService.persistToDbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        update: [expect.objectContaining({ value: 15 })]
      })
    );
  });

  it('should update many documents', () => {
    service.storePublic.addDoc(doc1);
    service.storePublic.addDoc(doc2);

    service.storePublic.updateMany(
      (doc) => doc.value > 0,
      (doc) => ({ ...doc, value: doc.value * 2 })
    );

    const map = get(service.storePublic);
    expect(map[doc1._id]?.value).toBe(20);
    expect(map[doc2._id]?.value).toBe(40);
    expect(TestDocumentMapStoreService.persistToDbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.arrayContaining([
          expect.objectContaining({ _id: doc1._id, value: 20 }),
          expect.objectContaining({ _id: doc2._id, value: 40 })
        ])
      })
    );
  });

  it('should delete a document', () => {
    service.storePublic.addDoc(doc1);
    service.storePublic.deleteDoc(doc1._id);

    expect(get(service.storePublic)[doc1._id]).toBeUndefined();
    expect(TestDocumentMapStoreService.persistToDbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        delete: [doc1]
      })
    );
  });

  describe('Subscribers', () => {
    it('should run beforeDocAddition hook', () => {
      const hook = vi.fn((_map, doc) => ({ ...doc, value: 99 }));
      service.addSubscriber({ beforeDocAddition: hook });

      service.storePublic.addDoc(doc1);

      expect(hook).toHaveBeenCalled();
      expect(get(service.storePublic)[doc1._id]?.value).toBe(99);
    });

    it('should run validateDocDeletion hook', () => {
      service.storePublic.addDoc(doc1);
      service.storePublic.addDoc(doc2);

      // When deleting doc1, also delete doc2
      const hook = vi.fn((_map, _doc) => [doc2._id]);
      service.addSubscriber({ validateDocDeletion: hook });

      service.storePublic.deleteDoc(doc1._id);

      const map = get(service.storePublic);
      expect(map[doc1._id]).toBeUndefined();
      expect(map[doc2._id]).toBeUndefined();
    });

    it('should run beforeDocUpdate hook', () => {
      service.storePublic.addDoc(doc1);
      const hook = vi.fn((map, oldDoc, newDoc) => ({ ...newDoc, name: 'Updated' }));
      service.addSubscriber({ beforeDocUpdate: hook });

      const childStore = service.getDocStorePublic(doc1._id);
      childStore.update((d) => ({ ...d, value: 50 }));

      expect(get(childStore).name).toBe('Updated');
      expect(hook).toHaveBeenCalled();
    });
  });
});
