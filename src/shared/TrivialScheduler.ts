import type { Scheduler } from "./Scheduler";

class TrivialScheduler implements Scheduler {
  getStartTime(): Date {
    const today = new Date();
    today.setHours(7, 0, 0, 0); // 7:00 AM
    return today;
  }

  getEndTime(): Date {
    const today = new Date();
    today.setHours(23, 0, 0, 0); // 11:00 PM
    return today;
  }
}

export default TrivialScheduler;
