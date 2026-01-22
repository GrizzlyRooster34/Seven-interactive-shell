import { VisualInput } from './VisualInput';
import { CanonicalIngestion } from '../memory/CanonicalIngestion';
import { PermissionManager } from './PermissionManager';

export type SensorInputType = 'IMAGE' | 'TEXT' | 'UNKNOWN';

export interface SensorData {
  type: SensorInputType;
  content: string;
  metadata?: string; // filename etc
}

export const SensorBridge = {
  processInput: async (file: File): Promise<SensorData> => {
    // Check Permissions before processing
    const perms = await PermissionManager.getPermissionStatus();
    
    // Naive check: In real implementation, check specific media perms
    // based on Android version logic.
    
    try {
      if (file.type.startsWith('image/')) {
        const base64 = await VisualInput.processImage(file);
        return {
          type: 'IMAGE',
          content: base64,
          metadata: file.name
        };
      } else {
        // Assume text/code/pdf (if supported)
        const textContent = await CanonicalIngestion.ingestFile(file);
        return {
          type: 'TEXT',
          content: textContent,
          metadata: file.name
        };
      }
    } catch (e) {
      console.error("SensorBridge Error:", e);
      return { type: 'UNKNOWN', content: '', metadata: 'ERROR' };
    }
  }
};