// Minimal wrapper around IndexedDB using native API
export type Activity = {
  id?: number
  title: string
  description?: string
  createdAt: number
}

const DB_NAME = 'pwa-activities-db'
const STORE_NAME = 'activities'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function addActivity(activity: Activity): Promise<number> {
  const db = await openDB()
  return new Promise<number>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.add(activity)
    req.onsuccess = () => {
      resolve(req.result as number)
      db.close()
    }
    req.onerror = () => {
      reject(req.error)
      db.close()
    }
  })
}

export async function getAllActivities(): Promise<Activity[]> {
  const db = await openDB()
  return new Promise<Activity[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()
    req.onsuccess = () => { 
      resolve((req.result as Activity[]).sort((a, b) => b.createdAt - a.createdAt))
      db.close()
    }
    req.onerror = () => { 
      reject(req.error)
      db.close()
    }
  })
}

export async function deleteActivity(id: number): Promise<void> {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.delete(id)
    req.onsuccess = () => {
      resolve()
      db.close()
    }
    req.onerror = () => {
      reject(req.error)
      db.close()
    }
  })
}
