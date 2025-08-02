import RhythmBlockId from "../values/RhythmBlockId";

// TODO consider segregating
export interface RhythmBlockProps {
  /** Display name/title of the block */
  label: string;

  /** Duration of the block in minutes */
  durationInMinutes?: number;

  /** Category that describes the type of activity */
  category: RhythmBlockCategory;

  /** Energy/focus level required for this block */
  intensity: RhythmIntensity;

  /** How this block affects the user's energy level - can be draining, neutral, or recharging */
  energyImpact: RhythmEnergyImpact;

  /** Importance level of completing this block */
  priority: RhythmPriority;

  /** Array of scheduling constraints for this block */
  constraints: RhythmConstraint[];

  /** Whether this block was completed by the user */
  isCompleted?: boolean;

  /** Optional notes/description for this block */
  notes?: string;

  /** User-defined ordering for display */
  userOrder: number;

  /** Optional time range when this block is scheduled */
  timeRange?: TimeRange;

  /** Minimum duration in minutes that this block must take */
  minDuration?: number;

  /** Maximum duration in minutes that this block can take */
  maxDuration?: number;
}

// Use standard Date objects with date-fns
export interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * Represents a block of time in a user's rhythm/schedule.
 *
 * A RhythmBlock encapsulates:
 * - Basic metadata like id, label, category
 * - Energy/intensity characteristics
 * - Priority and scheduling constraints
 * - Time range when scheduled
 * - Completion status
 *
 * The block can be planned (assigned a time range) and unplanned.
 * It validates time ranges to ensure they are valid.
 *
 * @throws {TimeRangeError} When constructing with an invalid time range
 * @throws {TimeRangeError} When accessing start/end times of an unplanned block
 *
 * @throws {Error} When planning with invalid time range (end before start)
 * @throws {Error} When updating time range of unplanned block
 * @throws {Error} When updating to invalid time range
 */
class RhythmBlock {
  readonly id = new RhythmBlockId();
  protected props: RhythmBlockProps;

  constructor(props: RhythmBlockProps) {
    this.props = props;
    this.validate();
  }

  private validate() {
    this.validateTimeRange();
  }

  // Validate time range if provided
  private validateTimeRange() {
    if (this.props.timeRange && !isValidTimeRange(this.props.timeRange)) {
      throw new TimeRangeError("Invalid time range");
    }
  }

  get label(): string {
    return this.props.label;
  }

  get timeRange(): TimeRange | undefined {
    return this.props.timeRange;
  }

  /**
   * Checks if this block has a time range assigned
   * @returns true if the block has a time range, false otherwise
   */
  private hasTimeRange(): boolean {
    return this.props.timeRange !== undefined;
  }

  /**
   * Gets the start time of this block
   * @throws {TimeRangeError} If the block has no time range assigned
   * @returns The start time
   */
  get startTime(): Date {
    this.requireTimeRange();
    return this.props.timeRange!.start;
  }

  /**
   * Gets the end time of this block
   * @throws {TimeRangeError} If the block has no time range assigned
   * @returns The end time
   */
  get endTime(): Date {
    this.requireTimeRange();
    return this.props.timeRange!.end;
  }

  protected requireTimeRange() {
    if (!this.hasTimeRange()) {
      throw new TimeRangeError(`time range not defined, 
        block planned status: ${this.isPlanned}`);
    }
  }

  get category(): RhythmBlockCategory {
    return this.props.category;
  }

  get isPlanned(): boolean {
    return this.hasTimeRange();
  }

  get isCompleted(): boolean | undefined {
    return this.props.isCompleted;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get intensity(): RhythmIntensity {
    return this.props.intensity;
  }

  get priority(): RhythmPriority {
    return this.props.priority;
  }

  get energyImpact(): RhythmEnergyImpact {
    return this.props.energyImpact;
  }

  /**
   * Gets the duration of this block in minutes
   * @returns The duration in minutes (minimum 1 minute)
   */
  get durationInMinutes(): number {
    if (this.isPlanned) {
      return Math.max(
        1, // Minimum 1 minute
        (this.props.timeRange!.end.getTime() -
          this.props.timeRange!.start.getTime()) /
          (1000 * 60)
      );
    }

    if (this.props.durationInMinutes === undefined) {
      throw new TypeError("Duration must be defined for unplanned blocks");
    }

    return this.props.durationInMinutes;
  }

  /**
   * Sets the duration of this block in minutes
   * @param value The duration in minutes to set
   * @throws {TypeError} If trying to modify duration of a planned block
   * @throws {TypeError} If duration is less than minimum allowed duration
   * @throws {TypeError} If duration exceeds maximum allowed duration
   */
  set durationInMinutes(value: number) {
    if (this.isPlanned) {
      throw new TypeError("Cannot modify duration of a planned block");
    }
    if (this.props.minDuration && value < this.props.minDuration) {
      throw new TypeError(
        `Duration ${value} minutes is less than minimum duration of ${this.props.minDuration} minutes`
      );
    }
    if (this.props.maxDuration && value > this.props.maxDuration) {
      throw new TypeError(
        `Duration ${value} minutes exceeds maximum duration of ${this.props.maxDuration} minutes`
      );
    }

    this.props.durationInMinutes = value;
  }

  get constraints(): RhythmConstraint[] {
    return this.props.constraints;
  }

  get minDuration(): number | undefined {
    return this.props.minDuration;
  }

  get maxDuration(): number | undefined {
    return this.props.maxDuration;
  }

  get userOrder(): number {
    return this.props.userOrder;
  }

  /**
   * Plans this block by assigning it a time range.
   * @param start The start time for the block
   * @param end The end time for the block
   * @throws {Error} If the time range is invalid (e.g. end before start)
   */
  plan(start: Date, end: Date): void {
    const timeRange = createTimeRange(start, end);
    this.props.timeRange = timeRange;
    this.validateTimeRange();
  }

  unplan(): void {
    this.props.timeRange = undefined;
  }

  markCompleted(): void {
    this.props.isCompleted = true;
  }

  updateLabel(newLabel: string): void {
    this.props.label = newLabel;
  }

  updateTime(start: Date, end: Date): void {
    this.plan(start, end);
  }

  toJSON(): RhythmBlockProps & { id: string } {
    return {
      ...this.props,
      id: this.id.value,
    };
  }

  copy(props?: Partial<RhythmBlockProps>): RhythmBlock {
    return new RhythmBlock({
      label: props?.label ?? this.label,
      durationInMinutes:
        props?.durationInMinutes ?? this.props.durationInMinutes,
      category: props?.category ?? this.props.category,
      intensity: props?.intensity ?? this.props.intensity,
      priority: props?.priority ?? this.props.priority,
      energyImpact: props?.energyImpact ?? this.props.energyImpact,
      constraints: props?.constraints ?? this.props.constraints,
      isCompleted: props?.isCompleted ?? this.props.isCompleted,
      notes: props?.notes ?? this.props.notes,
      timeRange: props?.timeRange ?? this.props.timeRange,
      userOrder: props?.userOrder ?? this.props.userOrder,
    });
  }
}

export const RHYTHM_BLOCK_CATEGORIES = [
  "focus",
  "rest",
  "meal",
  "exercise",
  "break",
  "meeting",
  "hobby",
  "connect",
  "chore",
] as const;

export type RhythmBlockCategory = (typeof RHYTHM_BLOCK_CATEGORIES)[number];

export type RhythmIntensity = "high" | "medium" | "low";

export type RhythmEnergyImpact = "draining" | "neutral" | "recharging";

export type RhythmPriority = "essential" | "important" | "optional";

export type RhythmConstraintEnforcement = "hard" | "soft";

export type RhythmConstraintType =
  | "fixed"
  | "window"
  | "preferred"
  | "dependsOn"
  | "deadline"
  | "after"
  | "recurring"
  | "naturalLanguage";

type RhythmConstraintMap = {
  fixed: { time: Date };
  window: { start: Date; end: Date };
  preferred: { preferredTime: Date };
  deadline: { latestTime: Date };
  dependsOn: { block: RhythmBlock };
  after: { earliestTime: Date };
  recurring: { days: number[]; time: Date };
  naturalLanguage: { description: string };
};

export type RhythmConstraint = {
  [K in RhythmConstraintType]: { type: K } & RhythmConstraintMap[K];
}[RhythmConstraintType];

// Utility functions
const isValidTimeRange = (range: TimeRange): boolean => {
  return range.start < range.end;
};

export const createTimeRange = (start: Date, end: Date): TimeRange => {
  if (start >= end) {
    throw new TimeRangeError("Start time must be before end time");
  }

  return { start, end };
};

class TimeRangeError extends Error {}

export default RhythmBlock;
