import { logger } from "../../../../shared/logger";
import type { Scheduler } from "../../../../shared/Scheduler";
import { Result } from "../../../../shared/utils/Result";
import UserId from "../../../users/domain/values/UserId";
import type { ComplexityLevel } from "../engines/ComplexityEngine";
import { ComplexityEngineV1 } from "../engines/ComplexityEngineV1";
import type { RhythmPriority } from "../entities/RhythmBlock";
import type RhythmBlock from "../entities/RhythmBlock";
import UserRhythm from "../entities/UserRhythm";
import type { FlowGenerator } from "./internal/FlowGenerator";
import { FlowGeneratorV1 } from "./internal/FlowGeneratorV1";
import type {
  PlannerError,
  PlannerInput,
  RhythmPlanner,
} from "./RhythmPlanner";

class RhythmPlannerV1 implements RhythmPlanner {
  private readonly scheduler;
  private readonly complexityEngine = new ComplexityEngineV1();
  private readonly flowGenerators: Map<ComplexityLevel, FlowGenerator> =
    new Map([["simple", new FlowGeneratorV1()]]);

  constructor(scheduler: Scheduler) {
    this.scheduler = scheduler;
  }

  plan(input: PlannerInput): Result<UserRhythm, PlannerError> {
    const blocks = this.preprocess(input.blocks);

    const complexity = this.complexityEngine.analyze(blocks);

    const startTime = this.scheduler.getStartTime();
    const endTime = this.scheduler.getEndTime();

    logger.trace("Starting rhythm planning V1.", {
      blockCount: input.blocks.length,
      timeWindow: { start: startTime, end: endTime },
    });

    const flow = this.flowGenerators
      .get(complexity.level)!
      .generate({ startTime, endTime, blocks });

    logger.info("Rhythm V1 planned.", {
      blockCount: flow.blocks.length,
    });

    const rhythm = new UserRhythm({
      userId: new UserId(),
      blocks: flow.blocks,
    });

    return Result.success(rhythm);
  }

  private preprocess(blocks: RhythmBlock[]): RhythmBlock[] {
    const validBlocks = blocks.filter((block) => this.isValidBlock(block));

    return validBlocks.sort((a, b) => {
      const priorityOrder: Record<RhythmPriority, number> = {
        essential: 1,
        important: 2,
        optional: 3,
      };
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];

      if (priorityDiff !== 0) return priorityDiff;
      return a.userOrder - b.userOrder;
    });
  }

  // Utility methods
  private isValidBlock(block: RhythmBlock): boolean {
    return block.label.trim().length > 0 && block.constraints.length > 0;
  }

  backToRhythm(oldRhythm: UserRhythm): UserRhythm {
    return oldRhythm;
  }
}

export default RhythmPlannerV1;
