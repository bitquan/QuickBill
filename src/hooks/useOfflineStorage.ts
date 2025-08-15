import { useState, useEffect, useCallback } from 'react';

interface OfflineData {
  id: string;
  type: 'invoice' | 'business-info' | 'settings';
  data: any;
  timestamp: number;
  synced: boolean;
}

interface OfflineStorageHook {
  // Data management
  saveOfflineData: (type: string, id: string, data: any) => Promise<void>;
  getOfflineData: (type: string, id?: string) => Promise<OfflineData[]>;
  removeOfflineData: (type: string, id: string) => Promise<void>;
  clearOfflineData: (type?: string) => Promise<void>;
  
  // Sync management
  syncToServer: (data: OfflineData) => Promise<boolean>;
  syncAllData: () => Promise<void>;
  
  // Status
  isOnline: boolean;
  pendingCount: number;
  isSupported: boolean;
}

const DB_NAME = 'QuickBillOffline';
const DB_VERSION = 1;
const STORE_NAME = 'offlineData';

export function useOfflineStorage(): OfflineStorageHook {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported');
      return;
    }

    const initDB = async () => {
      try {
        const database = await openDatabase();
        setDb(database);
        updatePendingCount();
      } catch (error) {
        console.error('Failed to initialize offline storage:', error);
      }
    };

    initDB();
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      if (db) {
        syncAllData();
      }
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [db]);

  const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id' 
          });
          
          // Create indexes for efficient querying
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  };

  const saveOfflineData = async (type: string, id: string, data: any): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    const offlineData: OfflineData = {
      id: `${type}_${id}`,
      type: type as any,
      data,
      timestamp: Date.now(),
      synced: isOnline ? false : false // Always false initially
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(offlineData);

      request.onsuccess = () => {
        updatePendingCount();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  };

  const getOfflineData = async (type: string, id?: string): Promise<OfflineData[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      if (id) {
        const request = store.get(`${type}_${id}`);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? [result] : []);
        };
        request.onerror = () => reject(request.error);
      } else {
        const index = store.index('type');
        const request = index.getAll(type);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      }
    });
  };

  const removeOfflineData = async (type: string, id: string): Promise<void> => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(`${type}_${id}`);

      request.onsuccess = () => {
        updatePendingCount();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  };

  const clearOfflineData = async (type?: string): Promise<void> => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      if (type) {
        const index = store.index('type');
        const request = index.getAllKeys(type);
        
        request.onsuccess = () => {
          const keys = request.result;
          const deletePromises = keys.map(key => {
            return new Promise<void>((res, rej) => {
              const deleteRequest = store.delete(key);
              deleteRequest.onsuccess = () => res();
              deleteRequest.onerror = () => rej(deleteRequest.error);
            });
          });
          
          Promise.all(deletePromises).then(() => {
            updatePendingCount();
            resolve();
          }).catch(reject);
        };
        request.onerror = () => reject(request.error);
      } else {
        const request = store.clear();
        request.onsuccess = () => {
          setPendingCount(0);
          resolve();
        };
        request.onerror = () => reject(request.error);
      }
    });
  };

  const syncToServer = async (data: OfflineData): Promise<boolean> => {
    if (!isOnline) return false;

    try {
      // Implement actual sync logic based on data type
      switch (data.type) {
        case 'invoice':
          await syncInvoiceToServer(data);
          break;
        case 'business-info':
          await syncBusinessInfoToServer(data);
          break;
        case 'settings':
          await syncSettingsToServer(data);
          break;
        default:
          console.warn('Unknown data type for sync:', data.type);
          return false;
      }

      // Mark as synced
      if (db) {
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.put({ ...data, synced: true });
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      return true;
    } catch (error) {
      console.error('Sync failed for data:', data.id, error);
      return false;
    }
  };

  const syncAllData = async (): Promise<void> => {
    if (!db || !isOnline) return;

    try {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(false)); // Get unsynced data

      request.onsuccess = async () => {
        const unsyncedData = request.result || [];
        
        for (const data of unsyncedData) {
          await syncToServer(data);
        }
        
        updatePendingCount();
      };
    } catch (error) {
      console.error('Sync all failed:', error);
    }
  };

  const updatePendingCount = useCallback(async () => {
    if (!db) return;

    try {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('synced');
      const request = index.count(IDBKeyRange.only(false));

      request.onsuccess = () => {
        setPendingCount(request.result);
      };
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  }, [db]);

  // Placeholder sync functions (to be implemented with actual Firebase integration)
  const syncInvoiceToServer = async (data: OfflineData): Promise<void> => {
    console.log('Syncing invoice to server:', data.id);
    // TODO: Implement with cloudStorageService
  };

  const syncBusinessInfoToServer = async (data: OfflineData): Promise<void> => {
    console.log('Syncing business info to server:', data.id);
    // TODO: Implement with cloudStorageService
  };

  const syncSettingsToServer = async (data: OfflineData): Promise<void> => {
    console.log('Syncing settings to server:', data.id);
    // TODO: Implement with cloudStorageService
  };

  return {
    saveOfflineData,
    getOfflineData,
    removeOfflineData,
    clearOfflineData,
    syncToServer,
    syncAllData,
    isOnline,
    pendingCount,
    isSupported: 'indexedDB' in window && !!db
  };
}

export default useOfflineStorage;
