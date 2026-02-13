/**
 * SENSOR BRIDGE - Environment and System Telemetry
 *
 * Mobile-adapted sensor system for collecting device state,
 * user interaction patterns, and environmental context
 */

export interface SystemSensors {
  memory_usage: number; // MB
  cpu_load: number; // 0-100
  battery_level: number; // 0-100
  uptime: number; // seconds
  network_status: 'online' | 'offline' | 'unknown';
}

export interface UserSensors {
  last_interaction: string; // ISO timestamp
  idle_time: number; // seconds
  input_rate: number; // chars per minute
  interaction_pattern: 'active' | 'passive' | 'idle';
}

export interface EnvironmentSensors {
  time_of_day: string;
  local_time: string;
  tick_count: number;
  session_duration: number; // seconds
}

export interface SensorSnapshot {
  system: SystemSensors;
  user: UserSensors;
  environment: EnvironmentSensors;
  timestamp: string;
}

class SensorBridgeImpl {
  private tickCount: number = 0;
  private sessionStart: number = Date.now();
  private lastInteraction: number = Date.now();
  private interactionHistory: number[] = [];

  async collectAll(): Promise<SensorSnapshot> {
    return {
      system: await this.collectSystemSensors(),
      user: this.collectUserSensors(),
      environment: this.collectEnvironmentSensors(),
      timestamp: new Date().toISOString()
    };
  }

  private async collectSystemSensors(): Promise<SystemSensors> {
    const memory = (performance as any).memory;
    return {
      memory_usage: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
      cpu_load: 0,
      battery_level: await this.getBatteryLevel(),
      uptime: Math.floor((Date.now() - this.sessionStart) / 1000),
      network_status: navigator.onLine ? 'online' : 'offline'
    };
  }

  private async getBatteryLevel(): Promise<number> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return Math.round(battery.level * 100);
      }
    } catch (e) {}
    return 100;
  }

  private collectUserSensors(): UserSensors {
    const now = Date.now();
    const idleTime = Math.floor((now - this.lastInteraction) / 1000);
    const recentInteractions = this.interactionHistory.filter(time => now - time < 60000);
    const inputRate = recentInteractions.length;

    let pattern: 'active' | 'passive' | 'idle';
    if (idleTime > 300) pattern = 'idle';
    else if (inputRate > 10) pattern = 'active';
    else pattern = 'passive';

    return {
      last_interaction: new Date(this.lastInteraction).toISOString(),
      idle_time: idleTime,
      input_rate: inputRate,
      interaction_pattern: pattern
    };
  }

  private collectEnvironmentSensors(): EnvironmentSensors {
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay: string;
    if (hour < 6) timeOfDay = 'night';
    else if (hour < 12) timeOfDay = 'morning';
    else if (hour < 18) timeOfDay = 'afternoon';
    else if (hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    return {
      time_of_day: timeOfDay,
      local_time: now.toLocaleTimeString(),
      tick_count: this.tickCount,
      session_duration: Math.floor((Date.now() - this.sessionStart) / 1000)
    };
  }

  async processInput(file: File): Promise<{ type: 'IMAGE' | 'TEXT', content: string }> {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
              if (file.type.startsWith('image/')) {
                  const base64 = (reader.result as string).split(',')[1];
                  resolve({ type: 'IMAGE', content: base64 });
              } else {
                  resolve({ type: 'TEXT', content: reader.result as string });
              }
          };
          reader.onerror = reject;
          if (file.type.startsWith('image/')) {
              reader.readAsDataURL(file);
          } else {
              reader.readAsText(file);
          }
      });
  }

  recordInteraction(): void {
    this.lastInteraction = Date.now();
    this.interactionHistory.push(this.lastInteraction);
    if (this.interactionHistory.length > 100) this.interactionHistory.shift();
  }

  incrementTick(): void {
    this.tickCount++;
  }

  resetSession(): void {
    this.sessionStart = Date.now();
    this.lastInteraction = Date.now();
    this.interactionHistory = [];
    this.tickCount = 0;
  }
}

export const SensorBridge = new SensorBridgeImpl();
export const sensorBridge = SensorBridge;