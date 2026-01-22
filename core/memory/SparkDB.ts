export interface MemoryRecord {
  id: string;
  timestamp: number;
  importance: number;
  tags: string[];
  content: string;
  type: 'user' | 'model' | 'system' | 'alert' | 'warning';
  // UI helper fields (optional in DB, but useful for runtime)
  is_streaming?: boolean;
}