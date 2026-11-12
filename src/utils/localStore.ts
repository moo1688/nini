import { openDB } from 'idb';

const DB_NAME = 'localagent';
const DB_VERSION = 1;
const STORE = 'records';

async function db() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE);
    },
  });
}

export async function readRecord<T>(key: string, fallback: T): Promise<T> {
  try { return (await (await db()).get(STORE, key)) ?? fallback; }
  catch { return fallback; }
}

export async function writeRecord<T>(key: string, value: T): Promise<void> {
  await (await db()).put(STORE, value, key);
}

export async function deleteRecord(key: string): Promise<void> {
  await (await db()).delete(STORE, key);
}
