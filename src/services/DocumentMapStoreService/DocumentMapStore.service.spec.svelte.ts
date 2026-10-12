import type { ProjectDashboardOptions } from '@aneuhold/core-ts-api-lib';
import { type BaseDocument, type DocumentMap, DocumentService } from '@aneuhold/core-ts-db-lib';
import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';
import DashboardAPIService from '$services/DashboardAPIService/DashboardAPI.service';
import DocumentMapStoreService from './DocumentMapStore.service.svelte';
import type { DashboardApiInsertKey } from './types';

interface TestDoc extends BaseDocument {
  name: string;
  value: number;
}

describe('DocumentMapStoreService', () => {
  let service: DocumentMapStoreService<TestDoc>;
  let queryApiSpy: MockInstance<(apiOptions: ProjectDashboardOptions) => void>;
  let doc1: TestDoc;
  let doc2: TestDoc;

  const testKey = 'tasks';
  const otherKey: DashboardApiInsertKey = 'nonogramKatanaItems';

  const persistToLocalDataMock = vi.fn<(map: DocumentMap<TestDoc>) => void>();

  function createTestService(dashboardApiInsertKey: DashboardApiInsertKey = testKey) {
    return new DocumentMapStoreService<TestDoc>({
      dashboardApiInsertKey,
      persistToLocalData: persistToLocalDataMock,
      handleApiOutput: vi.fn()
    });
  }

  beforeEach(() => {
    persistToLocalDataMock.mockClear();
    queryApiSpy = vi.spyOn(DashboardAPIService, 'queryApi').mockImplementation(() => undefined);
    service = createTestService();

    doc1 = {
      _id: DocumentService.generateID(),
      name: 'Doc 1',
      value: 10
    };
    doc2 = {
      _id: DocumentService.generateID(),
      name: 'Doc 2',
      value: 20
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with empty values', () => {
    expect(service.allDocs).toEqual([]);
  });

  it('should add a document', () => {
    service.addDoc(doc1);
    expect(service.getDoc(doc1._id)).toEqual(doc1);
    expect(queryApiSpy).toHaveBeenCalledWith({
      insert: { [testKey]: [doc1] },
      get: { [testKey]: true }
    });
    expect(persistToLocalDataMock).toHaveBeenCalled();
  });

  it('should update a document', () => {
    service.addDoc(doc1);
    queryApiSpy.mockClear();
    persistToLocalDataMock.mockClear();

    service.updateDoc(doc1._id, (doc) => {
      doc.value = 15;
      return doc;
    });

    expect(service.getDoc(doc1._id)?.value).toBe(15);
    expect(queryApiSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { [testKey]: [expect.objectContaining({ value: 15 })] }
      })
    );
    expect(persistToLocalDataMock).toHaveBeenCalled();
  });

  it('should update many documents', () => {
    service.addDoc(doc1);
    service.addDoc(doc2);
    queryApiSpy.mockClear();

    service.updateManyDocs(
      (doc) => doc.value > 0,
      (doc) => {
        doc.value = doc.value * 2;
        return doc;
      }
    );

    expect(service.getDoc(doc1._id)?.value).toBe(20);
    expect(service.getDoc(doc2._id)?.value).toBe(40);
    expect(queryApiSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        update: {
          [testKey]: expect.arrayContaining([
            expect.objectContaining({ _id: doc1._id, value: 20 }),
            expect.objectContaining({ _id: doc2._id, value: 40 })
          ])
        }
      })
    );
  });

  it('should delete a document', () => {
    service.addDoc(doc1);
    queryApiSpy.mockClear();

    service.deleteDoc(doc1._id);

    expect(service.getDoc(doc1._id)).toBeUndefined();
    expect(queryApiSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        delete: { [testKey]: [doc1._id] }
      })
    );
  });

  it('should upsert many documents', () => {
    service.addDoc(doc1);
    queryApiSpy.mockClear();

    const doc3: TestDoc = {
      _id: DocumentService.generateID(),
      name: 'Doc 3',
      value: 30
    };

    service.upsertManyDocs({
      filter: (doc) => doc._id === doc1._id,
      mutator: (doc) => {
        doc.value = 99;
        return doc;
      },
      newDocs: [doc3]
    });

    expect(service.getDoc(doc1._id)?.value).toBe(99);
    expect(service.getDoc(doc3._id)).toEqual(doc3);

    expect(queryApiSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        insert: { [testKey]: [doc3] },
        update: { [testKey]: [expect.objectContaining({ _id: doc1._id, value: 99 })] }
      })
    );
  });

  it('should set map', () => {
    const newMap = { [doc1._id]: doc1, [doc2._id]: doc2 };
    service.setMap(newMap);

    expect(service.getDoc(doc1._id)).toEqual(doc1);
    expect(service.getDoc(doc2._id)).toEqual(doc2);
    expect(service.allDocs).toHaveLength(2);
    expect(persistToLocalDataMock).toHaveBeenCalled();
    // setMap does NOT persist to DB
    expect(queryApiSpy).not.toHaveBeenCalled();
  });

  describe('prepareDocsForSave', () => {
    it('should stage an insert under the document type key', () => {
      const options = service.prepareDocsForSave({ insert: [doc1] });

      expect(options.insert?.[testKey]).toEqual([doc1]);
    });

    it('should append inserts across repeated calls instead of overwriting', () => {
      const options = service.prepareDocsForSave({ insert: [doc1] });
      service.prepareDocsForSave({ insert: [doc2] }, options);

      expect(options.insert?.[testKey]).toEqual([doc1, doc2]);
    });

    it('should append updates across repeated calls', () => {
      const options = service.prepareDocsForSave({ update: [doc1] });
      service.prepareDocsForSave({ update: [doc2] }, options);

      expect(options.update?.[testKey]).toEqual([doc1, doc2]);
    });

    it('should append deletes across repeated calls', () => {
      const options = service.prepareDocsForSave({ delete: [doc1._id] });
      service.prepareDocsForSave({ delete: [doc2._id] }, options);

      expect(options.delete?.[testKey]).toEqual([doc1._id, doc2._id]);
    });

    it('should keep operations for different document types independent', () => {
      const otherService = createTestService(otherKey);

      const options = service.prepareDocsForSave({ insert: [doc1] });
      otherService.prepareDocsForSave({ insert: [doc2] }, options);

      expect(options.insert?.[testKey]).toEqual([doc1]);
      expect(options.insert?.[otherKey]).toEqual([doc2]);
    });

    it('should merge get options rather than replacing them', () => {
      const options = service.prepareDocsForSave({ get: { tasks: true } });
      service.prepareDocsForSave({ get: { userConfig: true } }, options);

      expect(options.get).toEqual({ tasks: true, userConfig: true });
    });
  });

  describe('allDocs $derived reactivity', () => {
    it('should compute once on initial subscription', () => {
      const cleanup = $effect.root(() => {
        service.addDocWithoutPersist(doc1);
        let computeCount = 0;
        let docs: TestDoc[] = [];

        $effect(() => {
          docs = service.allDocs;
          computeCount++;
        });

        flushSync();
        expect(computeCount).toBe(1);
        expect(docs).toHaveLength(1);
      });
      cleanup();
    });

    it('should NOT recompute when a property within a document changes', () => {
      const cleanup = $effect.root(() => {
        service.addDocWithoutPersist(doc1);
        let computeCount = 0;

        $effect(() => {
          const docs = service.allDocs;
          expect(docs).toBeDefined();
          computeCount++;
        });

        flushSync();
        expect(computeCount).toBe(1);

        service.updateDoc(doc1._id, (d) => {
          d.value = 999;
          return d;
        });
        flushSync();

        expect(service.getDoc(doc1._id)?.value).toBe(999);
        expect(computeCount).toBe(1);
      });
      cleanup();
    });

    it('should recompute when a document is added', () => {
      const cleanup = $effect.root(() => {
        service.addDocWithoutPersist(doc1);
        let computeCount = 0;
        let docs: TestDoc[] = [];

        $effect(() => {
          docs = service.allDocs;
          computeCount++;
        });

        flushSync();
        expect(computeCount).toBe(1);

        service.addDocWithoutPersist(doc2);
        flushSync();

        expect(computeCount).toBe(2);
        expect(docs).toHaveLength(2);
      });
      cleanup();
    });

    it('should recompute when a document is removed', () => {
      const cleanup = $effect.root(() => {
        service.addDocWithoutPersist(doc1);
        service.addDocWithoutPersist(doc2);
        let computeCount = 0;
        let docs: TestDoc[] = [];

        $effect(() => {
          docs = service.allDocs;
          computeCount++;
        });

        flushSync();
        expect(computeCount).toBe(1);

        service.deleteDoc(doc1._id);
        flushSync();

        expect(computeCount).toBe(2);
        expect(docs).toHaveLength(1);
      });
      cleanup();
    });

    it('should recompute when the entire map is replaced via setMap', () => {
      const cleanup = $effect.root(() => {
        service.addDocWithoutPersist(doc1);
        let computeCount = 0;
        let docs: TestDoc[] = [];

        $effect(() => {
          docs = service.allDocs;
          computeCount++;
        });

        flushSync();
        expect(computeCount).toBe(1);

        service.setMap({ [doc2._id]: doc2 });
        flushSync();

        expect(computeCount).toBe(2);
        expect(docs).toHaveLength(1);
        expect(docs[0]._id).toBe(doc2._id);
      });
      cleanup();
    });
  });
});
