import { addMinutes } from "date-fns";
import type RhythmBlock from "../../entities/RhythmBlock";
import {
  DurationBlock,
  PreferredTimeBlock,
  ScheduledBlock,
  TimeWindowBlock,
} from "./constraint-blocks";
import type { Flow, FlowGenerator, FlowInput } from "./FlowGenerator";
import type { Scheduler } from "../../../../../shared/Scheduler";
import { FlowPipeline } from "./FlowPipeline";
import { logger } from "../../../../../shared/logger";

export class TrivialFlowGenerator implements FlowGenerator {
  private readonly scheduler: Scheduler;

  constructor(scheduler: Scheduler) {
    this.scheduler = scheduler;
  }

  generate(input: FlowInput): Flow {
    const startTime = this.scheduler.getStartTime();
    const endTime = this.scheduler.getEndTime();

    const {
      scheduledBlocks,
      timeWindowBlocks,
      preferredTimeBlocks,
      durationBlocks,
    } = this.groupByConstraint(input.blocks);

    return new FlowPipeline({
      startTime,
      endTime,
    })
      .addAllScheduledBlocks(scheduledBlocks)
      .addTimeWindowBlocks(timeWindowBlocks)
      .addPreferredBlocks(preferredTimeBlocks)
      .addDurationBlocks(durationBlocks)
      .toFlow();
  }

  // TODO expand with the other types of constraints
  private groupByConstraint(blocks: RhythmBlock[]): {
    scheduledBlocks: ScheduledBlock[];
    timeWindowBlocks: TimeWindowBlock[];
    preferredTimeBlocks: PreferredTimeBlock[];
    durationBlocks: DurationBlock[];
  } {
    const scheduledBlocks: ScheduledBlock[] = [];
    const timeWindowBlocks: TimeWindowBlock[] = [];
    const preferredTimeBlocks: PreferredTimeBlock[] = [];
    const durationBlocks: DurationBlock[] = [];

    for (const block of blocks) {
      const hasFixed = block.constraints.some((c) => c.type === "fixed");
      const hasTimeWindow = block.constraints.some((c) => c.type === "window");
      const hasPreferredTime = block.constraints.some(
        (c) => c.type === "preferred",
      );
      const hasDuration = block.constraints.some((c) => c.type === "duration");

      if (hasFixed) {
        scheduledBlocks.push(new ScheduledBlock(block.toJSON()));
      }
      if (hasTimeWindow) {
        timeWindowBlocks.push(new TimeWindowBlock(block.toJSON()));
      }
      if (hasPreferredTime) {
        preferredTimeBlocks.push(new PreferredTimeBlock(block.toJSON()));
      }
      if (hasDuration) {
        durationBlocks.push(new DurationBlock(block.toJSON()));
      }
    }

    logger.debug("scheduledBlocks", scheduledBlocks, "groupByConstraint");
    logger.debug("timeWindowBlocks", timeWindowBlocks, "groupByConstraint");
    logger.debug(
      "preferredTimeBlocks",
      preferredTimeBlocks,
      "groupByConstraint",
    );
    logger.debug("durationBlocks", durationBlocks, "groupByConstraint");

    return {
      scheduledBlocks,
      timeWindowBlocks,
      preferredTimeBlocks,
      durationBlocks,
    };
  }
}
