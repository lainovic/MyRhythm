import { requireNotNull } from "../../../../../shared/utils/assert";
import RhythmBlock from "../../entities/RhythmBlock";
import type {
  RhythmBlockProps,
  RhythmConstraint,
  RhythmConstraintType,
} from "../../entities/RhythmBlock";

/**
 * RhythmBlock wrappers that provide type-safe access to specific constraints.
 * Each wrapper ensures the block has the appropriate constraint type and provides
 * convenient access to the constraint's properties.
 */

export class FixedBlock extends RhythmBlock {
  readonly fixedStartTime: Date;

  constructor(block: RhythmBlock) {
    const { id, ...props } = block.toJSON();
    super(props);
    this.fixedStartTime = this.getFixedStartTime();
  }

  private getFixedStartTime(): Date {
    const constraint = this.constraints.find((c) => c.type === "fixed");
    if (!constraint || constraint.type !== "fixed") {
      throw new Error("ScheduledBlock must have a fixed constraint");
    }
    return constraint.time;
  }
}

export class TimeWindowBlock extends RhythmBlock {
  readonly windowStartTime: Date;
  readonly windowEndTime: Date;

  constructor(block: RhythmBlock) {
    const { id, ...props } = block.toJSON();
    super(props);
    const { start, end } = this.windowTimeConstraint;
    this.windowStartTime = start;
    this.windowEndTime = end;
  }

  private get windowTimeConstraint() {
    const constraint = this.constraints.find((c) => c.type === "window");
    if (!constraint || constraint.type !== "window") {
      throw new Error("TimeWindowBlock must have a window constraint");
    }
    return constraint;
  }
}

export class PreferredTimeBlock extends RhythmBlock {
  readonly preferredTime: Date;

  constructor(block: RhythmBlock) {
    const { id, ...props } = block.toJSON();
    super(props);
    this.preferredTime = this.preferredTimeConstraint.preferredTime;
  }

  private get preferredTimeConstraint() {
    const constraint = this.constraints.find((c) => c.type === "preferred");
    if (!constraint || constraint.type !== "preferred") {
      throw new Error("PreferredBlock must have a preferred constraint");
    }
    return constraint;
  }
}

export class DeadlineBlock extends RhythmBlock {
  readonly deadline: Date;

  constructor(block: RhythmBlock) {
    const { id, ...props } = block.toJSON();
    super(props);
    this.deadline = this.deadlineConstraint.latestTime;
  }

  private get deadlineConstraint() {
    const constraint = this.constraints.find((c) => c.type === "deadline");
    if (!constraint || constraint.type !== "deadline") {
      throw new Error("DeadlineBlock must have a deadline constraint");
    }
    return constraint;
  }
}

export class AfterBlock extends RhythmBlock {
  readonly earliestTime: Date;

  constructor(block: RhythmBlock) {
    const { id, ...props } = block.toJSON();
    super(props);
    this.earliestTime = this.earliestStartConstraint.earliestTime;
  }

  private get earliestStartConstraint() {
    const constraint = this.constraints.find((c) => c.type === "after");
    if (!constraint || constraint.type !== "after") {
      throw new Error("AfterBlock must have an after constraint");
    }
    return constraint;
  }
}

export class DependentBlock extends RhythmBlock {
  readonly dependency: RhythmBlock;

  constructor(block: RhythmBlock) {
    const { id, ...props } = block.toJSON();
    super(props);
    this.dependency = this.dependencyConstraint.block;
  }

  private get dependencyConstraint() {
    const constraint = this.constraints.find((c) => c.type === "dependsOn");
    if (!constraint || constraint.type !== "dependsOn") {
      throw new Error("DependentBlock must have a dependsOn constraint");
    }
    return constraint;
  }
}

export class RecurringBlock extends RhythmBlock {
  readonly days: number[];
  readonly time: Date;

  constructor(block: RhythmBlock) {
    const { id, ...props } = block.toJSON();
    super(props);
    const { days, time } = this.recurringScheduleConstraint;
    this.days = days;
    this.time = time;
  }

  private get recurringScheduleConstraint() {
    const constraint = this.constraints.find((c) => c.type === "recurring");
    if (!constraint || constraint.type !== "recurring") {
      throw new Error("RecurringBlock must have a recurring constraint");
    }
    return constraint;
  }
}

export class NaturalLanguageBlock extends RhythmBlock {
  readonly description: string;

  constructor(block: RhythmBlock) {
    const { id, ...props } = block.toJSON();
    super(props);
    this.description = this.naturalLanguageDescriptionConstraint.description;
  }

  private get naturalLanguageDescriptionConstraint() {
    const constraint = this.constraints.find(
      (c) => c.type === "naturalLanguage"
    );
    if (!constraint || constraint.type !== "naturalLanguage") {
      throw new Error(
        "NaturalLanguageBlock must have a natural-language constraint"
      );
    }
    return constraint;
  }
}

export class PlannedBlock extends RhythmBlock {
  constructor(block: RhythmBlock) {
    const { id, ...props } = block.toJSON();
    super(props);
    this.requireTimeRange();
  }
}

export const HARD_CONSTRAINT_PRIORITY: RhythmConstraintType[] = [
  "fixed", // Highest priority - must be exact
  "window", // High priority - must be in window
  "deadline", // High priority - must meet deadline
  "after", // Medium priority - must be after time
  "dependsOn", // Medium priority - must follow dependency
  "recurring", // Lower priority - recurring pattern
];

export type HardBlock =
  | FixedBlock
  | TimeWindowBlock
  | DeadlineBlock
  | AfterBlock
  | DependentBlock
  | RecurringBlock;

export type SoftBlock = PreferredTimeBlock | NaturalLanguageBlock;

export class HardPrioritizedBlock extends RhythmBlock {
  constructor(block: RhythmBlock) {
    const { id, ...props } = block.toJSON();
    super(props);
  }

  get allConstraints(): RhythmConstraint[] {
    return this.constraints;
  }

  get primaryConstraint(): RhythmConstraintType {
    const constraints = this.constraints;

    for (const constraint of HARD_CONSTRAINT_PRIORITY) {
      if (constraints.some((c) => c.type === constraint)) return constraint;
    }

    return constraints[0].type;
  }

  toHardBlock(): HardBlock {
    switch (this.primaryConstraint) {
      case "fixed":
        return new FixedBlock(this);
      case "window":
        return new TimeWindowBlock(this);
      case "deadline":
        return new DeadlineBlock(this);
      case "after":
        return new AfterBlock(this);
      case "dependsOn":
        return new DependentBlock(this);
      case "recurring":
        return new RecurringBlock(this);
      default:
        throw new TypeError(
          `Cannot convert block with primary constraint type '${this.primaryConstraint}' to hard block`
        );
    }
  }
}
