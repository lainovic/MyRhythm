import RhythmBlockId from "../values/RhythmBlockId";

class RhythmBlock {
  private props: RhythmBlockProps;

  constructor(props: RhythmBlockProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: RhythmBlockProps) {
    if (props.isPlanned && !props.timeRange) {
      throw new Error("Planned blocks must have a time range");
    }

    // Validate that unplanned blocks don't have time ranges
    if (!props.isPlanned && props.timeRange) {
      throw new Error("Unplanned blocks should not have time ranges");
    }

    // Validate time range if provided
    if (props.timeRange && !isValidTimeRange(props.timeRange)) {
      throw new Error("Invalid time range");
    }
  }

  get id(): RhythmBlockId {
    return this.props.id;
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
  hasTimeRange(): boolean {
    return this.props.timeRange !== undefined;
  }

  /**
   * Gets the start time of this block
   * @throws {Error} If the block has no time range assigned
   * @returns The start time
   */
  get start(): Date {
    return this.props.timeRange!.start;
  }

  /**
   * Gets the end time of this block
   * @throws {Error} If the block has no time range assigned
   * @returns The end time
   */
  get end(): Date {
    return this.props.timeRange!.end;
  }

  get category(): RhythmBlockCategory {
    return this.props.category;
  }

  get isPlanned(): boolean {
    return this.props.isPlanned;
  }

  get wasCompleted(): boolean | undefined {
    return this.props.wasCompleted;
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

  get durationInMinutes(): number {
    return this.props.durationInMinutes;
  }

  get constraints(): RhythmConstraint[] {
    return this.props.constraints;
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
    if (!isValidTimeRange(timeRange)) {
      throw new Error("Invalid time range");
    }
    this.props.timeRange = timeRange;
    this.props.isPlanned = true;
  }

  // Unplan this block (remove time range)
  unplan(): void {
    this.props.timeRange = undefined;
    this.props.isPlanned = false;
  }

  markCompleted(): void {
    this.props.wasCompleted = true;
  }

  updateLabel(newLabel: string): void {
    this.props.label = newLabel;
  }

  updateTimeRange(newRange: TimeRange): void {
    if (!this.props.isPlanned) {
      throw new Error("Cannot update time range for unplanned block");
    }
    if (!isValidTimeRange(newRange)) {
      throw new Error("Invalid time range");
    }
    this.props.timeRange = newRange;
  }

  toJSON(): RhythmBlockProps {
    return { ...this.props };
  }

  copy(props?: NullableRhythmBlockProps): RhythmBlock {
    return new RhythmBlock({
      id: new RhythmBlockId(),
      label: props?.label ?? this.label,
      durationInMinutes: props?.durationInMinutes ?? this.durationInMinutes,
      category: props?.category ?? this.category,
      intensity: props?.intensity ?? this.intensity,
      priority: props?.priority ?? this.priority,
      energyImpact: props?.energyImpact ?? this.energyImpact,
      constraints: props?.constraints ?? this.constraints,
      isPlanned: props?.isPlanned ?? this.isPlanned,
      wasCompleted: props?.wasCompleted ?? this.wasCompleted,
      notes: props?.notes ?? this.notes,
      timeRange: props?.timeRange ?? this.timeRange,
      userOrder: props?.userOrder ?? this.userOrder,
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

export type RhythmPriority = "important" | "essential" | "optional";

export type RhythmConstraint =
  | { type: "fixed"; time: Date }
  | { type: "window"; start: Date; end: Date }
  | { type: "preferred"; preferredTime: Date }
  | { type: "duration"; maxDurationInMinutes: number }
  | { type: "before"; deadline: Date }
  | { type: "after"; earliestTime: Date }
  | { type: "recurring"; days: number[]; time: Date }
  | { type: "natural-language"; description: string };

/**
 * Properties for creating or modifying a RhythmBlock
 */
export interface RhythmBlockProps {
  /** Unique identifier for the block */
  id: RhythmBlockId;

  /** Display name/title of the block */
  label: string;

  /** Duration of the block in minutes */
  durationInMinutes: number;

  /** Optional time range when this block is scheduled */
  timeRange?: TimeRange;

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

  /** Whether this block has been scheduled */
  isPlanned: boolean;

  /** Whether this block was completed by the user */
  wasCompleted?: boolean;

  /** Optional notes/description for this block */
  notes?: string;

  /** User-defined ordering for display */
  userOrder: number;
}

// Use standard Date objects with date-fns
export interface TimeRange {
  start: Date;
  end: Date;
}

// Validation functions using date-fns
const isValidTimeRange = (range: TimeRange): boolean => {
  return range.start < range.end;
};

// Utility functions
export const createTimeRange = (start: Date, end: Date): TimeRange => {
  if (start >= end) {
    throw new TimeRangeError("Start time must be before end time");
  }

  return { start, end };
};

class TimeRangeError extends Error {}

export type NullableRhythmBlockProps = Partial<RhythmBlockProps>;

export default RhythmBlock;
