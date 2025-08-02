import RhythmBlock from "../../entities/RhythmBlock";
import type { RhythmBlockProps } from "../../entities/RhythmBlock";

/**
 * RhythmBlock wrappers that provide type-safe access to specific constraints.
 * Each wrapper ensures the block has the appropriate constraint type and provides
 * convenient access to the constraint's properties.
 */

class ScheduledBlock extends RhythmBlock {
  readonly scheduledTime: Date;

  constructor(props: RhythmBlockProps) {
    super(props);
    this.scheduledTime = this.fixedTime;
  }

  private get fixedTime(): Date {
    const fixedConstraint = this.constraints.find((c) => c.type === "fixed");
    if (!fixedConstraint || fixedConstraint.type !== "fixed") {
      throw new Error("ScheduledBlock must have a fixed constraint");
    }
    return fixedConstraint.time;
  }
}

class TimeWindowBlock extends RhythmBlock {
  readonly windowStartTime: Date;
  readonly windowEndTime: Date;

  constructor(props: RhythmBlockProps) {
    super(props);
    const { start, end } = this.windowTimeConstraint;
    this.windowStartTime = start;
    this.windowEndTime = end;
  }

  private get windowTimeConstraint() {
    const windowConstraint = this.constraints.find((c) => c.type === "window");
    if (!windowConstraint || windowConstraint.type !== "window") {
      throw new Error("TimeWindowBlock must have a window constraint");
    }
    return windowConstraint;
  }
}

class PreferredTimeBlock extends RhythmBlock {
  readonly preferredTime: Date;

  constructor(props: RhythmBlockProps) {
    super(props);
    this.preferredTime = this.preferredTimeConstraint.preferredTime;
  }

  private get preferredTimeConstraint() {
    const preferredConstraint = this.constraints.find(
      (c) => c.type === "preferred",
    );
    if (!preferredConstraint || preferredConstraint.type !== "preferred") {
      throw new Error("PreferredBlock must have a preferred constraint");
    }
    return preferredConstraint;
  }
}

class DurationBlock extends RhythmBlock {
  readonly maxDurationInMinutes: number;

  constructor(props: RhythmBlockProps) {
    super(props);
    this.maxDurationInMinutes = this.maxDurationConstraint.maxDurationInMinutes;
  }

  private get maxDurationConstraint() {
    const durationConstraint = this.constraints.find(
      (c) => c.type === "duration",
    );
    if (!durationConstraint || durationConstraint.type !== "duration") {
      throw new Error("DurationBlock must have a duration constraint");
    }
    return durationConstraint;
  }
}

class DeadlineBlock extends RhythmBlock {
  readonly deadline: Date;

  constructor(props: RhythmBlockProps) {
    super(props);
    this.deadline = this.deadlineConstraint.deadline;
  }

  private get deadlineConstraint() {
    const beforeConstraint = this.constraints.find((c) => c.type === "before");
    if (!beforeConstraint || beforeConstraint.type !== "before") {
      throw new Error("DeadlineBlock must have a before constraint");
    }
    return beforeConstraint;
  }
}

class AfterBlock extends RhythmBlock {
  readonly earliestTime: Date;

  constructor(props: RhythmBlockProps) {
    super(props);
    this.earliestTime = this.earliestStartConstraint.earliestTime;
  }

  private get earliestStartConstraint() {
    const afterConstraint = this.constraints.find((c) => c.type === "after");
    if (!afterConstraint || afterConstraint.type !== "after") {
      throw new Error("AfterBlock must have an after constraint");
    }
    return afterConstraint;
  }
}

class RecurringBlock extends RhythmBlock {
  readonly days: number[];
  readonly time: Date;

  constructor(props: RhythmBlockProps) {
    super(props);
    const { days, time } = this.recurringScheduleConstraint;
    this.days = days;
    this.time = time;
  }

  private get recurringScheduleConstraint() {
    const recurringConstraint = this.constraints.find(
      (c) => c.type === "recurring",
    );
    if (!recurringConstraint || recurringConstraint.type !== "recurring") {
      throw new Error("RecurringBlock must have a recurring constraint");
    }
    return recurringConstraint;
  }
}

class NaturalLanguageBlock extends RhythmBlock {
  readonly description: string;

  constructor(props: RhythmBlockProps) {
    super(props);
    this.description = this.naturalLanguageDescriptionConstraint.description;
  }

  private get naturalLanguageDescriptionConstraint() {
    const naturalLanguageConstraint = this.constraints.find(
      (c) => c.type === "natural-language",
    );
    if (
      !naturalLanguageConstraint ||
      naturalLanguageConstraint.type !== "natural-language"
    ) {
      throw new Error(
        "NaturalLanguageBlock must have a natural-language constraint",
      );
    }
    return naturalLanguageConstraint;
  }
}

export {
  ScheduledBlock,
  TimeWindowBlock,
  PreferredTimeBlock,
  DurationBlock,
  DeadlineBlock,
  AfterBlock,
  RecurringBlock,
  NaturalLanguageBlock,
};
