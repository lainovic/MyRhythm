import { addMinutes } from "date-fns";
import type RhythmBlock from "../../entities/RhythmBlock";
import {
  PlannedBlock,
  type DeadlineBlock,
  type FixedBlock,
  type TimeWindowBlock,
} from "./BlockWrappers";
import { toMilliseconds, toMinutes } from "../../../../../shared/utils/time";
import { findGaps, type Gap } from "./utils";
import type { FlowSession } from "./FlowSession";
import { logger } from "../../../../../shared/logger";

interface FlowStateMachineProps {
  startTime: Date;
  endTime: Date;
}

/**
 * Flow pipeline that processes blocks through ordered stages.
 * Must be used in the correct order: Fixed → Window → Deadline
 */
export class FlowStateMachine {
  private currentStage:
    | "initial"
    | "fixed"
    | "window"
    | "deadline"
    | "complete" = "initial";
  private session: FlowSession;

  constructor(props: FlowStateMachineProps) {
    this.session = {
      startTime: props.startTime,
      endTime: props.endTime,
      blocks: [],
    } as FlowSession;
  }

  /**
   * Stage 1: Process fixed blocks (most constrained)
   * Must be called first
   */
  processFixedBlocks(blocks: FixedBlock[]): FlowStateMachine {
    if (this.currentStage !== "initial") {
      throw new FlowStateMachineError(
        `processFixedBlocks() must be called first. 
        Current stage: ${this.currentStage}`
      );
    }

    logger.trace("start", this.snapshot.blocks, "processFixedBlocks");

    const processedBlocks: PlannedBlock[] = [];

    for (const block of blocks) {
      const placement = this.findFixedBlockPlacement(block);
      if (placement) {
        block.plan(placement.startTime, placement.endTime);
        processedBlocks.push(new PlannedBlock(block));
      }
    }

    logger.trace("processed blocks", processedBlocks, "processFixedBlocks");

    this.updateBlocks(processedBlocks);
    this.currentStage = "fixed";
    return this;
  }

  /**
   * Stage 2: Process window blocks (medium constraint)
   * Must be called after processFixedBlocks()
   */
  processWindowBlocks(blocks: TimeWindowBlock[]): FlowStateMachine {
    if (this.currentStage !== "fixed") {
      throw new FlowStateMachineError(
        `processWindowBlocks() must be called after processFixedBlocks(). 
        Current stage: ${this.currentStage}`
      );
    }

    logger.trace(
      "start",
      { current: this.snapshot.blocks, window: blocks },
      "processWindowBlocks"
    );

    const processedBlocks: PlannedBlock[] = [];
    const gaps: Gap[] = findGaps(this.snapshot);
    logger.trace("gaps", gaps, "processWindowBlocks");

    for (const block of blocks) {
      const placement = this.findWindowBlockPlacement(block, gaps);
      if (placement) {
        block.plan(placement.startTime, placement.endTime);
        processedBlocks.push(block);
      }
    }

    logger.trace("processed blocks", processedBlocks, "processWindowBlocks");

    this.updateBlocks(processedBlocks);
    this.currentStage = "window";
    return this;
  }

  /**
   * Stage 3: Process deadline blocks (least constrained)
   * Must be called after processWindowBlocks()
   */
  processDeadlineBlocks(blocks: DeadlineBlock[]): FlowStateMachine {
    if (this.currentStage !== "window") {
      throw new FlowStateMachineError(
        `processDeadlineBlocks() must be called after processWindowBlocks(). 
        Current stage: ${this.currentStage}`
      );
    }

    logger.trace(
      "start",
      { current: this.snapshot.blocks, deadline: blocks },
      "processDeadlineBlocks"
    );

    const processedBlocks: PlannedBlock[] = [];
    const gaps: Gap[] = findGaps(this.snapshot);

    for (const block of blocks) {
      const placement = this.findDeadlineBlockPlacement(block, gaps);
      if (placement) {
        block.plan(placement.startTime, placement.endTime);
        processedBlocks.push(new PlannedBlock(block));
      }
    }

    logger.trace("processed blocks", processedBlocks, "processDeadlineBlocks");

    this.updateBlocks(processedBlocks);
    this.currentStage = "deadline";
    return this;
  }

  private findFixedBlockPlacement(block: FixedBlock): Placement | null {
    let blockDuration: number | undefined;
    try {
      blockDuration = block.durationInMinutes;
      logger.trace(
        `Processing fixed block: ${block.label}`,
        {
          fixedStartTime: block.fixedStartTime,
          blockDurationInMinutes: blockDuration,
        },
        "findFixedBlockPlacement"
      );
    } catch (error) {
      const message = `Block ${block.label} has no defined duration, cannot place fixed block without duration`;
      logger.warn(message, block, "findFixedBlockPlacement");
      return null;
    }

    const startTime = block.fixedStartTime;
    const endTime = addMinutes(block.fixedStartTime, blockDuration);
    return { startTime, endTime };
  }

  /**
   * Find a suitable placement for a window block within available gaps
   */
  private findWindowBlockPlacement(
    block: TimeWindowBlock,
    gaps: Gap[]
  ): Placement | null {
    let blockDuration: number | undefined;
    try {
      logger.trace(
        `Processing window block: ${block.label}`,
        {
          windowStart: block.windowStartTime,
          windowEnd: block.windowEndTime,
          blockDurationInMinutes: block.durationInMinutes,
          gaps,
        },
        "findWindowBlockPlacement"
      );
      blockDuration = block.durationInMinutes;
    } catch (error) {
      logger.warn(
        `Block ${block.label} has no defined duration, will use flexible duration`,
        "findWindowBlockPlacement"
      );
    }

    for (const gap of gaps) {
      const overlapStart = Math.max(
        gap.start.getTime(),
        block.windowStartTime.getTime()
      );
      const overlapEnd = Math.min(
        gap.end.getTime(),
        block.windowEndTime.getTime()
      );
      const overlapDuration = overlapEnd - overlapStart;

      let actualDuration =
        blockDuration !== undefined
          ? blockDuration
          : toMinutes(overlapDuration);

      /**
       * Validate and adjust duration against min/max constraints
       */
      if (block.minDuration && actualDuration < block.minDuration) {
        logger.trace(
          `⛔ Duration ${actualDuration} minutes is less than minimum ${block.minDuration} minutes`,
          "findWindowBlockPlacement"
        );
        continue;
      }

      if (block.maxDuration && actualDuration > block.maxDuration) {
        logger.trace(
          `📏 Shrinking duration from ${actualDuration} to ${block.maxDuration} minutes (max constraint)`,
          "findWindowBlockPlacement"
        );
        actualDuration = block.maxDuration;
      }

      logger.trace(
        `Checking gap: ${gap.start} - ${gap.end}`,
        {
          gapDuration: gap.end.getTime() - gap.start.getTime(),
          windowDuration:
            block.windowEndTime.getTime() - block.windowStartTime.getTime(),
          overlapDuration: overlapDuration,
          blockDuration: blockDuration,
          actualDuration: actualDuration,
          windowStart: block.windowStartTime,
          windowEnd: block.windowEndTime,
        },
        "findWindowBlockPlacement"
      );

      /**
       * Let's check if a gap overlaps with the window
       * and if the overlap is long enough to fit the block.
       */
      if (
        gap.start <= block.windowEndTime &&
        gap.end >= block.windowStartTime &&
        overlapDuration >= toMilliseconds(actualDuration)
      ) {
        // Calculate the actual start time within the window
        const actualStartTime = new Date(overlapStart);
        const endTime = addMinutes(actualStartTime, actualDuration);

        logger.trace(
          `✅ Placing block in gap: ${actualStartTime} - ${endTime}`,
          "findWindowBlockPlacement"
        );

        return { startTime: actualStartTime, endTime } as Placement;
      } else {
        logger.trace(
          "⛔ Gap doesn't fit window block",
          {
            gapStart: gap.start,
            gapEnd: gap.end,
            windowStart: block.windowStartTime,
            windowEnd: block.windowEndTime,
            gapStartAfterWindow: gap.start >= block.windowStartTime,
            gapEndBeforeWindow: gap.end < block.windowEndTime,
            gapLongEnough: overlapDuration >= toMilliseconds(actualDuration),
          },
          "findWindowBlockPlacement"
        );
      }
    }

    return null;
  }

  private findDeadlineBlockPlacement(
    block: DeadlineBlock,
    gaps: Gap[]
  ): Placement | null {
    let blockDuration: number | undefined;
    try {
      logger.trace(
        `Processing deadline block: ${block.label}`,
        {
          deadline: block.deadline,
          blockDurationInMinutes: block.durationInMinutes,
          gaps,
        },
        "findDeadlineBlockPlacement"
      );

      blockDuration = block.durationInMinutes;
    } catch (error) {
      // Block has no defined duration - we'll use flexible duration
      logger.warn(
        `Block ${block.label} has no defined duration, will use flexible duration`,
        "findDeadlineBlockPlacement"
      );
    }

    for (const gap of gaps) {
      let actualDuration =
        blockDuration !== undefined
          ? blockDuration
          : toMinutes(gap.end.getTime() - gap.start.getTime());

      if (block.minDuration && actualDuration < block.minDuration) {
        logger.trace(
          `⛔ Duration ${actualDuration} minutes is less than minimum ${block.minDuration} minutes`,
          "findDeadlineBlockPlacement"
        );
        continue;
      }

      if (block.maxDuration && actualDuration > block.maxDuration) {
        logger.trace(
          `📏 Shrinking duration from ${actualDuration} to ${block.maxDuration} minutes (max constraint)`,
          "findDeadlineBlockPlacement"
        );
        actualDuration = block.maxDuration;
      }

      const startTime = gap.start;
      const endTime = addMinutes(gap.start, actualDuration);
      if (
        endTime <= block.deadline &&
        gap.end.getTime() - gap.start.getTime() >=
          toMilliseconds(actualDuration)
      ) {
        return { startTime, endTime } as Placement;
      }
    }

    return null;
  }

  /**
   * Complete the pipeline and return the final blocks
   */
  complete(): RhythmBlock[] {
    this.currentStage = "complete";
    return this.session.blocks;
  }

  private updateBlocks(blocks: PlannedBlock[]) {
    this.session.blocks = [...this.session.blocks, ...blocks];

    this.session.blocks.sort((a, b) => {
      return a.startTime.getTime() - b.startTime.getTime();
    });

    logger.trace("blocks after update", this.session.blocks, "updateBlocks");
  }

  get snapshot(): FlowSession {
    return {
      startTime: this.session.startTime,
      endTime: this.session.endTime,
      blocks: [...this.session.blocks],
    };
  }
}

type Placement = { startTime: Date; endTime: Date };

export class FlowStateMachineError extends Error {}
