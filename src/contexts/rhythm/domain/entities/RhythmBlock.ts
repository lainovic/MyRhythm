import type RhythmBlockId from "../values/RhythmBlockId";

// Use standard Date objects with date-fns
export interface TimeRange {
  start: Date;
  end: Date;
}

// Validation functions using date-fns
export const isValidTimeRange = (range: TimeRange): boolean => {
  return range.start < range.end;
};

// Utility functions
export const createTimeRange = (start: Date, end: Date): TimeRange => {
  if (start >= end) {
    throw new Error("Start time must be before end time");
  }

  return { start, end };
};

export const getDurationMinutes = (range: TimeRange): number => {
  const diffMs = range.end.getTime() - range.start.getTime();
  return Math.floor(diffMs / (1000 * 60));
};

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

export type RhythmPriority = "essential" | "important" | "flexible";
export interface RhythmBlockProps {
  id: RhythmBlockId;
  label: string;
  timeRange?: TimeRange;
  category: RhythmBlockCategory;
  intensity: RhythmIntensity;
  priority: RhythmPriority;
  isPlanned: boolean;
  wasCompleted?: boolean;
  notes?: string;
}

class RhythmBlock {
  private props: RhythmBlockProps;

  constructor(props: RhythmBlockProps) {
    // Validate that planned blocks have time ranges
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

    this.props = props;
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

  get category(): RhythmBlockProps["category"] {
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

  get duration(): number | undefined {
    return this.props.timeRange
      ? getDurationMinutes(this.props.timeRange)
      : undefined;
  }

  // Plan this block with a time range
  plan(timeRange: TimeRange): void {
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
}

export default RhythmBlock;
