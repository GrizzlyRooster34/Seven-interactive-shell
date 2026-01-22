import { MemoryRecord } from './SparkDB';

// --- STORAGE ADAPTER PATTERN ---
interface StorageAdapter {
  write(path: string, data: string): Promise<void>;
  read(path: string): Promise<string | null>;
  append(path: string, data: string): Promise<void>;
}

// 1. Browser Adapter (LocalStorage fallback)
const BrowserAdapter: StorageAdapter = {
  write: async (path, data) => localStorage.setItem(path, data),
  read: async (path) => localStorage.getItem(path),
  append: async (path, data) => {
    const existing = localStorage.getItem(path) || '';
    localStorage.setItem(path, existing + data);
  }
};

// 2. Native Adapter (Mock Capacitor Filesystem)
const NativeAdapter: StorageAdapter = {
  write: async (path, data) => {
    console.log(`[NATIVE_FS_WRITE] Writing to /sdcard/Android/data/com.seven.shell/${path}`);
    // Filesystem.writeFile({ path, data, directory: Directory.Documents })
  },
  read: async (path) => {
    console.log(`[NATIVE_FS_READ] Reading from ${path}`);
    return null; // Mock empty
  },
  append: async (path, data) => {
    console.log(`[NATIVE_FS_APPEND] Appending to ${path}`);
  }
};

// Factory
const getAdapter = (): StorageAdapter => {
  // Check if running in Capacitor Native
  const isNative = window.location.protocol === 'file:' || (window as any).Capacitor;
  return isNative ? NativeAdapter : BrowserAdapter;
};

// --- TEMPORAL MEMORY IMPLEMENTATION ---
export const TemporalMemory = {
  adapter: getAdapter(),
  
  saveState: async (key: string, data: any) => {
    await TemporalMemory.adapter.write(`state/${key}.json`, JSON.stringify(data));
  },

  loadState: async (key: string) => {
    const raw = await TemporalMemory.adapter.read(`state/${key}.json`);
    return raw ? JSON.parse(raw) : null;
  },

  logEvent: async (event: string) => {
    const entry = `[${new Date().toISOString()}] ${event}\n`;
    await TemporalMemory.adapter.append('logs/ghost_diary.log', entry);
  }
};