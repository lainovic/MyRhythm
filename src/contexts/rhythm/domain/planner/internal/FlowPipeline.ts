import { addMinutes } from "date-fns";
import type RhythmBlock from "../../entities/RhythmBlock";
import type {
  ScheduledBlock,
  TimeWindowBlock,
  PreferredTimeBlock,
  DurationBlock,
} from "./constraint-blocks";
import type { Flow } from "./FlowGenerator";
import { ValidationError } from "../../../../../shared/utils/validations";
import { logger } from "../../../../../shared/logger";
import type { RhythmPriority } from "../../entities/RhythmBlock";

/**
 * FlowPipeline handles the sequential processing and scheduling of rhythm blocks.
 *
 * The pipeline takes blocks with different types of constraints (scheduled, time window,
 * preferred time, duration) and arranges them into a valid flow while respecting their
 * constraints. It processes blocks in order of most to least constrained:
 *
 * 1. Scheduled blocks (fixed time)
 * 2. Time window blocks (must occur within a window)
 * 3. Preferred time blocks (should occur near preferred time)
 * 4. Duration blocks (just need specific duration)
 *
 * The pipeline validates that blocks don't overlap and handles edge cases like blocks
 * outside the daily time bounds. It uses priority and user ordering to resolve conflicts
 * when multiple blocks could fit in the same gap.
 */
export class FlowPipeline {
  private startTime: Date;
  private endTime: Date;
  private outputBlocks: RhythmBlock[] = [];

  constructor({ startTime, endTime }: FlowPipelineProps) {
    this.startTime = startTime;
    this.endTime = endTime;
  }

  /**
   * Adds all scheduled blocks to the flow pipeline.
   *
   * Processes the scheduled blocks and validates that they don't overlap.
   * Blocks that start before the daily start time or end after the daily end time
   * will be skipped with a warning.
   *
   * @param scheduledBlocks - Array of ScheduledBlock objects to add
   * @returns The FlowPipeline instance for method chaining
   * @throws {ValidationError} If any scheduled blocks overlap with each other
   */
  addAllScheduledBlocks(scheduledBlocks: ScheduledBlock[]): FlowPipeline {
    const blocks = this.processScheduledBlocks(scheduledBlocks);
    this.validateNoOverlaps(scheduledBlocks);
    for (const block of blocks) {
      if (block.start < this.startTime) {
        logger.warn(
          `Block starting at ${block.start} is skipped 
          because it starts before the daily start time.`,
        );
      } else if (block.end > this.endTime) {
        logger.warn(
          `Block ending at ${block.end} is skipped 
          because it ends after the daily end time.`,
        );
      } else {
        this.outputBlocks.push(block);
      }
    }
    return this;
  }

  /**
   * Adds time window blocks to the flow pipeline.
   *
   * Finds gaps in the current flow and attempts to fill them with time window blocks
   * that fit within the gaps and their specified time windows. For each gap, it:
   * 1. Finds all time window blocks that could fit in the gap
   * 2. Sorts blocks by their window start time
   * 3. Selects the highest priority block (using selectBlock)
   * 4. Plans the selected block at the start of the gap
   * 5. Adds it to the output blocks
   *
   * @param timeWindowBlocks - Array of TimeWindowBlock objects to add
   * @returns The FlowPipeline instance for method chaining
   */
  addTimeWindowBlocks(timeWindowBlocks: TimeWindowBlock[]): FlowPipeline {
    const gaps = this.findGaps();
    for (const gap of gaps) {
      const availables = this.findAvailableTimeWindowBlocks(
        gap,
        timeWindowBlocks,
      );
      if (availables.length > 0) {
        const winnerBlock = this.selectBlock(availables);
        winnerBlock.plan(
          gap.start,
          addMinutes(gap.start, winnerBlock.durationInMinutes),
        );
        this.outputBlocks.push(winnerBlock);
        // TODO Remove the selected block from the available blocks
      }
    }
    return this;
  }

  /**
   * Adds preferred time blocks to the flow pipeline.
   *
   * Finds gaps in the current flow and attempts to fill them with preferred time blocks
   * that fit within the gaps. For each gap, it:
   * 1. Finds all preferred time blocks that could fit in the gap
   * 2. Sorts blocks by their preferred time
   * 3. Selects the highest priority block (using selectBlock)
   * 4. Plans the selected block at the start of the gap
   * 5. Adds it to the output blocks
   *
   * @param preferredTimeBlocks - Array of PreferredTimeBlock objects to add
   * @returns The FlowPipeline instance for method chaining
   */
  addPreferredBlocks(preferredTimeBlocks: PreferredTimeBlock[]): FlowPipeline {
    const gaps = this.findGaps();
    for (const gap of gaps) {
      const availables = this.findAvailablePreferredTimeBlocks(
        gap,
        preferredTimeBlocks,
      );
      if (availables.length > 0) {
        const winnerBlock = this.selectBlock(availables);
        winnerBlock.plan(
          gap.start,
          addMinutes(gap.start, winnerBlock.durationInMinutes),
        );
        this.outputBlocks.push(winnerBlock);
        // TODO Remove the selected block from the available blocks
      }
    }
    return this;
  }

  /**
   * Adds duration blocks to the flow pipeline.
   *
   * Finds gaps in the current flow and attempts to fill them with duration blocks
   * that fit within the gaps. For each gap, it:
   * 1. Finds all duration blocks that could fit in the gap
   * 2. Selects the highest priority block (using selectBlock)
   * 3. Plans the selected block at the start of the gap
   * 4. Adds it to the output blocks
   *
   * @param durationBlocks - Array of DurationBlock objects to add
   * @returns The FlowPipeline instance for method chaining
   */
  addDurationBlocks(durationBlocks: DurationBlock[]): FlowPipeline {
    const gaps = this.findGaps();
    for (const gap of gaps) {
      const availables = this.findAvailableDurationBlocks(gap, durationBlocks);
      if (availables.length > 0) {
        const winnerBlock = this.selectBlock(availables);
        winnerBlock.plan(
          gap.start,
          addMinutes(gap.start, winnerBlock.durationInMinutes),
        );
        this.outputBlocks.push(winnerBlock);
        // TODO Remove the selected block from the available blocks
      }
    }
    return this;
  }

  toFlow(): Flow {
    return {
      blocks: this.outputBlocks,
    } as Flow;
  }

  /**
   * Processes scheduled blocks by planning their time ranges and sorting them.
   *
   * @param scheduledBlocks - Array of ScheduledBlock objects to process
   * @returns Array of processed and sorted blocks
   * @private
   */
  private processScheduledBlocks(scheduledBlocks: ScheduledBlock[]) {
    const blocks = [];
    for (const block of scheduledBlocks) {
      block.plan(
        block.scheduledTime,
        addMinutes(block.scheduledTime, block.durationInMinutes),
      );
      blocks.push(block);
    }
    blocks.sort((a, b) => a.start.getTime() - b.start.getTime());
    return blocks;
  }

  /**
   * Finds gaps between blocks in the current flow.
   *
   * Assumes that:
   * - All blocks have well defined time ranges
   * - The flow is sorted by start time
   *
   * @returns Array of Gap objects representing time gaps in the flow
   * @private
   */
  private findGaps(): Array<Gap> {
    if (this.outputBlocks.length === 0) {
      return [{ start: this.startTime, end: this.endTime } as Gap];
    }

    const gaps = [];

    const firstBlockStart = this.outputBlocks[0].start;
    if (this.startTime < firstBlockStart) {
      gaps.push({
        start: this.startTime,
        end: firstBlockStart,
      });
    }

    for (let i = 0; i < this.outputBlocks.length - 1; i++) {
      const currentBlockEnd = this.outputBlocks[i].end;
      const nextBlockStart = this.outputBlocks[i + 1].start;

      if (currentBlockEnd < nextBlockStart) {
        gaps.push({
          start: currentBlockEnd,
          end: nextBlockStart,
        });
      }
    }

    const lastBlockEnd = this.outputBlocks[this.outputBlocks.length - 1].end;
    if (lastBlockEnd < this.endTime) {
      gaps.push({
        start: lastBlockEnd,
        end: this.endTime,
      });
    }

    return gaps;
  }

  /**
   * Finds and sorts available time window blocks that fit in a gap.
   *
   * @param gap - The gap to fill
   * @param timeWindowBlocks - Array of TimeWindowBlock objects to check
   * @returns Sorted array of available TimeWindowBlock objects
   * @private
   */
  private findAvailableTimeWindowBlocks(
    gap: Gap,
    timeWindowBlocks: TimeWindowBlock[],
  ): TimeWindowBlock[] {
    return this.findAvailableBlocks(gap, timeWindowBlocks).sort(
      (a, b) => a.windowStartTime.getTime() - b.windowStartTime.getTime(),
    );
  }

  /**
   * Finds and sorts available preferred time blocks that fit in a gap.
   *
   * @param gap - The gap to fill
   * @param preferredTimeBlocks - Array of PreferredTimeBlock objects to check
   * @returns Sorted array of available PreferredTimeBlock objects
   * @private
   */
  private findAvailablePreferredTimeBlocks(
    gap: Gap,
    preferredTimeBlocks: PreferredTimeBlock[],
  ): PreferredTimeBlock[] {
    return this.findAvailableBlocks(gap, preferredTimeBlocks).sort(
      (a, b) => a.preferredTime.getTime() - b.preferredTime.getTime(),
    );
  }

  /**
   * Finds available duration blocks that fit in a gap.
   *
   * @param gap - The gap to fill
   * @param durationBlocks - Array of DurationBlock objects to check
   * @returns Array of available DurationBlock objects
   * @private
   */
  private findAvailableDurationBlocks(
    gap: Gap,
    durationBlocks: DurationBlock[],
  ): DurationBlock[] {
    return this.findAvailableBlocks(gap, durationBlocks);
  }

  /**
   * Finds blocks that fit within a given gap.
   *
   * @param gap - The gap to check against
   * @param blocks - Array of blocks to filter
   * @returns Array of blocks that fit within the gap
   * @private
   */
  private findAvailableBlocks<T extends RhythmBlock>(
    gap: Gap,
    blocks: T[],
  ): T[] {
    const gapDurationInMinutes =
      (gap.start.getTime() - gap.end.getTime()) / 1000 / 60;
    return blocks
      .filter((b) => b.durationInMinutes <= gapDurationInMinutes)
      .filter((b) => b.start >= gap.start && b.end < gap.end);
  }

  /**
   * Selects the highest priority block from an array of blocks.
   *
   * First compares blocks by priority (essential > important > optional).
   * If priorities are equal, compares by user order (lower = higher preference).
   *
   * @param availableBlocks - Non-empty array of blocks to choose from
   * @returns The highest priority block
   * @private
   */
  private selectBlock<T extends RhythmBlock>(availableBlocks: T[]): T {
    const priorityOrder: Record<RhythmPriority, number> = {
      essential: 1,
      important: 2,
      optional: 3,
    };

    return availableBlocks.reduce((best, current) => {
      // First compare by priority.
      const priorityDiff =
        priorityOrder[best.priority] - priorityOrder[current.priority];
      if (priorityDiff !== 0) return priorityDiff < 0 ? best : current;

      // If same priority, compare by user order (lower = higher preference).
      return best.userOrder < current.userOrder ? best : current;
    });
  }

  /**
   * Validates that no scheduled blocks overlap with each other.
   *
   * @param blocks - Array of ScheduledBlock objects to validate
   * @throws {ValidationError} If any blocks overlap
   * @private
   */
  private validateNoOverlaps(blocks: ScheduledBlock[]) {
    blocks.sort((a, b) => a.start.getTime() - b.start.getTime());
    for (let i = 0; i < blocks.length - 1; ++i) {
      if (blocks[i].end > blocks[i + 1].start) {
        throw new ValidationError("Scheduled blocks are overlapping.");
      }
    }

    return true;
  }
}

export type FlowPipelineProps = {
  startTime: Date;
  endTime: Date;
};

/**
 * Represents a gap between two rhythm blocks in a flow.
 * @property start The start time of the gap (inclusive)
 * @property end The end time of the gap (exclusive). E.g., a gap from 9:00 to 10:00
 * includes 9:00-9:59 but not 10:00.
 */
interface Gap {
  start: Date;
  end: Date;
}
