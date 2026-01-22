// Stub: A Heartbeat loop
export class SparkEngine {
  private intervalId: any;

  constructor() {
    // 10-second setInterval loop that logs "Heartbeat."
  }

  start() {
    this.intervalId = setInterval(() => {
      // console.log("SparkEngine: Heartbeat...");
    }, 10000);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}

export const sparkEngine = new SparkEngine();