export type PermissionState = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';

export interface SevenPermissions {
  camera: PermissionState;
  microphone: PermissionState;
  notifications: PermissionState;
  storage_legacy: PermissionState; // Android 12
  media_images: PermissionState;   // Android 14+
  media_audio: PermissionState;    // Android 14+
}

// Mock Capacitor Device Info
const getAndroidSDK = (): number => {
  const ua = navigator.userAgent;
  const match = ua.match(/Android\s([0-9]+)/);
  // Default to 34 (Android 14) for testing UI, or 31 (Android 12) if needed
  return match ? parseInt(match[1]) : 34; 
};

export const PermissionManager = {
  checkAndroidVersion: () => {
    const sdk = getAndroidSDK();
    return sdk >= 13 ? 'MODERN (Android 13+)' : 'LEGACY (Android 12-)';
  },

  getPermissionStatus: async (): Promise<SevenPermissions> => {
    // In a real Capacitor app, calls: Permissions.query(...)
    
    // Mocking statuses
    return {
      camera: 'prompt',
      microphone: 'granted',
      notifications: 'prompt',
      storage_legacy: 'denied', // Would be used on Android 12
      media_images: 'prompt',   // Used on Android 14
      media_audio: 'prompt'
    };
  },

  requestInitialPermissions: async (): Promise<boolean> => {
    const sdk = getAndroidSDK();
    console.log(`[PERMISSION_MANAGER] Detected Android SDK: ${sdk}`);

    try {
      // 1. Core Hardware (Both versions)
      await PermissionManager.requestNative('CAMERA');
      await PermissionManager.requestNative('RECORD_AUDIO');

      // 2. Notifications (Android 13+)
      if (sdk >= 13) {
        await PermissionManager.requestNative('POST_NOTIFICATIONS');
      }

      // 3. Storage Bifurcation
      if (sdk >= 13) {
        // Android 13/14: Granular
        console.log('[PERMISSION_MANAGER] Requesting READ_MEDIA_IMAGES & AUDIO (Granular)');
        await PermissionManager.requestNative('READ_MEDIA_IMAGES');
        await PermissionManager.requestNative('READ_MEDIA_AUDIO');
      } else {
        // Android 12: Legacy
        console.log('[PERMISSION_MANAGER] Requesting READ_EXTERNAL_STORAGE (Legacy)');
        await PermissionManager.requestNative('READ_EXTERNAL_STORAGE');
      }

      return true;
    } catch (e) {
      console.error("Permission Request Failed", e);
      return false;
    }
  },

  requestNative: async (permissionName: string): Promise<PermissionState> => {
    // Stub for Capacitor Permissions.request({ name: permissionName })
    console.log(`[NATIVE_BRIDGE] Requesting: ${permissionName}`);
    
    // Web Fallback for notifications
    if (permissionName === 'POST_NOTIFICATIONS' && 'Notification' in window) {
       const res = await Notification.requestPermission();
       return res as PermissionState;
    }
    
    return 'granted';
  }
};