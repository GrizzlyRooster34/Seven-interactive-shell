// A Heartbeat loop that simulates the autonomic nervous system of the AI
// Enhanced for Android Battery Optimization Awareness & Foreground Services

export class SparkEngine {
  private intervalId: any;
  private listeners: ((pulse: string) => void)[] = [];
  private lastTick: number = 0;
  private readonly TICK_RATE = 10000; // 10 seconds
  private readonly DRIFT_THRESHOLD = 5000; // 5 seconds tolerance

  constructor() {
    this.lastTick = Date.now();
  }

  subscribe(callback: (pulse: string) => void) {
    this.listeners.push(callback);
  }

  private notify(pulse: string) {
    this.listeners.forEach(cb => cb(pulse));
  }

  // Hook for Native Android Foreground Service
  private configureNativeBackground() {
    // In a real build, this calls a Capacitor plugin to start a foreground service
    // ensuring the JS thread isn't killed.
    // e.g., BackgroundMode.enable();
    console.log("[SPARK_ENGINE] Configuring Android Foreground Service strategy...");
  }

  start() {
    if (this.intervalId) return;

    this.configureNativeBackground();
    this.lastTick = Date.now();
    
    this.intervalId = setInterval(() => {
      const now = Date.now();
      const delta = now - this.lastTick;
      
      // Android Background Check:
      // If delta > TICK_RATE + Threshold, app was dozing.
      if (delta > (this.TICK_RATE + this.DRIFT_THRESHOLD)) {
        const secondsLost = Math.floor(delta / 1000);
        this.notify(`CORTICAL_PAUSE_DETECTED: Resuming after ${secondsLost}s sleep cycle.`);
      } else {
        // Standard Pulse
        this.notify("HEARTBEAT_NOMINAL");
      }

      this.lastTick = now;
    }, this.TICK_RATE);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
  }
}

export const sparkEngine = new SparkEngine();