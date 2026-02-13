export type PermissionStatus = 'GRANTED' | 'DENIED' | 'PROMPT' | 'UNKNOWN';

export interface SystemPermissions {
  notifications: PermissionStatus;
  microphone: PermissionStatus;
  camera: PermissionStatus;
  background_sync: PermissionStatus;
}

// Mock detection of Android Version (would be populated by a native bridge/UserAgent parser)
const getAndroidVersion = (): number | null => {
  const ua = navigator.userAgent;
  const match = ua.match(/Android\s([0-9]+)/);
  return match ? parseInt(match[1]) : null;
};

export const PermissionGate = {
  getSystemStatus: async (): Promise<SystemPermissions> => {
    // Web API Checks
    let notif: PermissionStatus = 'UNKNOWN';
    if ('Notification' in window) {
      notif = Notification.permission === 'granted' ? 'GRANTED' : 
              Notification.permission === 'denied' ? 'DENIED' : 'PROMPT';
    }

    // Mic/Cam usually requires an active stream to check 'granted' reliably in standard web,
    // but we can check if the API exists.
    // In a real PWA/Capacitor app, we would query the native plugin here.
    
    return {
      notifications: notif,
      microphone: 'PROMPT', // Web standard doesn't allow querying mic permission without triggering it easily
      camera: 'PROMPT',
      background_sync: 'GRANTED' // Service workers usually default allow
    };
  },

  requestNotificationAccess: async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    
    // Android 13+ (API 33) requires explicit POST_NOTIFICATIONS
    // The browser abstracts this, but asking triggers the OS prompt.
    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  requestMediaAccess: async (type: 'audio' | 'video'): Promise<boolean> => {
    try {
      const constraints = type === 'audio' ? { audio: true } : { video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Immediately stop the tracks, we just wanted the permission prompt
      stream.getTracks().forEach(t => t.stop());
      return true;
    } catch (e) {
      console.error(`Permission denied for ${type}`, e);
      return false;
    }
  },

  // Logic for handling File Input specifics between Android 12 and 14
  getFileInputConfig: () => {
    const androidVer = getAndroidVersion();
    
    // Android 13+ (SDK 33) uses Granular Media Permissions (Photo Picker)
    // The web <input> triggers this automatically, but if we were native, we'd need logic.
    if (androidVer && androidVer >= 13) {
      return {
        accept: "image/*, video/*, audio/*",
        capture: false, // Let the OS Photo Picker handle it
        multiple: true
      };
    }
    
    // Android 12 and below (Legacy Storage)
    return {
        accept: "*/*", // Broader acceptance as fallback
        capture: false,
        multiple: false
    };
  }
};