import type { Flow, FlowGenerator, FlowInput } from "./FlowGenerator";
import type { FlowOptimizationCriteria } from "./FlowGenerationStrategy";
import { logger } from "../../../../../shared/logger";
import { addMinutes } from "date-fns";
import { GeneticAlgorithmStrategy } from "./GeneticAlgorithmStrategy";
import {
  DeadlineBlock,
  FixedBlock,
  HARD_CONSTRAINT_PRIORITY,
  HardPrioritizedBlock,
  NaturalLanguageBlock,
  PlannedBlock,
  PreferredTimeBlock,
  TimeWindowBlock,
  type HardBlock,
  type SoftBlock,
} from "./BlockWrappers";
import { FlowStateMachine } from "./FlowStateMachine";
import RhythmBlock from "../../entities/RhythmBlock";

export class FlowGeneratorV1 implements FlowGenerator {
  private readonly optimizationCriteria: FlowOptimizationCriteria;

  constructor(criteria?: Partial<FlowOptimizationCriteria>) {
    this.optimizationCriteria = {
      constraintSatisfaction: 0.3, // Must satisfy constraints
      energyFlowOptimization: 0.25, // Optimize energy transitions
      priorityAlignment: 0.2, // Align with priorities
      userPreferenceAlignment: 0.15, // Respect user preferences
      transitionSmoothness: 0.1, // Smooth transitions
      bufferTimeOptimization: 0.05, // Optimal buffer times
      deadlineCompliance: 0.05, // Meet deadlines
      ...criteria,
    };
  }

  generate(input: FlowInput): Flow {
    const { startTime, endTime, blocks } = input;
    const fsm = new FlowStateMachine({
      startTime,
      endTime,
    });

    const { hardBlocks, softBlocks } = this.separateByConstraint(blocks);
    this.solveHardConstraints(fsm, hardBlocks);
    this.solveSoftConstraints(fsm, softBlocks);

    const finalBlocks = this.postProcess(fsm.complete());

    return {
      blocks: finalBlocks,
    } as Flow;
  }

  private separateByConstraint(blocks: RhythmBlock[]): {
    hardBlocks: HardBlock[];
    softBlocks: SoftBlock[];
  } {
    const hardConstrained: RhythmBlock[] = [];
    const softConstrained: RhythmBlock[] = [];
    for (const block of blocks) {
      const hasHardConstraints = block.constraints.some((constraint) =>
        this.isHardConstraint(constraint)
      );

      if (hasHardConstraints) {
        hardConstrained.push(block);
      } else {
        softConstrained.push(block);
      }
    }

    const hard = this.createHardConstraintBlocks(hardConstrained);
    const soft = this.createSoftConstraintBlocks(softConstrained);

    return {
      hardBlocks: hard,
      softBlocks: soft,
    };
  }

  private solveHardConstraints(fsm: FlowStateMachine, hardBlocks: HardBlock[]) {
    fsm.processFixedBlocks(this.filterTo(hardBlocks, FixedBlock));
    fsm.processWindowBlocks(this.filterTo(hardBlocks, TimeWindowBlock));
    fsm.processDeadlineBlocks(this.filterTo(hardBlocks, DeadlineBlock));
  }

  /**
   * Determines if a constraint is hard (must be satisfied)
   */
  private isHardConstraint(constraint: any): boolean {
    return HARD_CONSTRAINT_PRIORITY.includes(constraint.type);
  }

  private createHardConstraintBlocks(blocks: RhythmBlock[]): HardBlock[] {
    return blocks.map((b) => new HardPrioritizedBlock(b).toHardBlock());
  }

  private createSoftConstraintBlocks(blocks: RhythmBlock[]): SoftBlock[] {
    return blocks
      .filter((b) =>
        b.constraints.some(
          (c) => c.type === "preferred" || c.type === "naturalLanguage"
        )
      )
      .map((b) => {
        if (b.constraints.some((c) => c.type === "preferred")) {
          return new PreferredTimeBlock(b);
        } else {
          return new NaturalLanguageBlock(b);
        }
      });
  }

  private solveSoftConstraints(
    fsm: FlowStateMachine,
    softBlocks: SoftBlock[]
  ): PlannedBlock[] {
    const strategy = new GeneticAlgorithmStrategy(
      this.optimizationCriteria,
      fsm.snapshot
    );

    const result = strategy.execute(softBlocks);
    return result;
  }

  private filterTo<T extends HardBlock>(
    blocks: HardBlock[],
    WrapperClass: new (...args: any[]) => T
  ): T[] {
    return blocks.filter((b): b is T => b instanceof WrapperClass);
  }

  /**
   * Post-processes the optimized flow for final adjustments
   */
  private postProcess(blocks: RhythmBlock[]): RhythmBlock[] {
    // Add buffer times between incompatible activities
    const bufferedBlocks = this.addBufferTimes(blocks);

    // Validate final flow
    const validatedBlocks = this.validateFinalFlow(bufferedBlocks);

    // Sort by start time
    return validatedBlocks.sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );
  }

  private addBufferTimes(blocks: RhythmBlock[]): RhythmBlock[] {
    const result: RhythmBlock[] = [];

    for (let i = 0; i < blocks.length; i++) {
      result.push(blocks[i]);

      // Add buffer between current and next block if needed
      if (i < blocks.length - 1) {
        const currentBlock = blocks[i];
        const nextBlock = blocks[i + 1];

        if (this.needsBuffer(currentBlock, nextBlock)) {
          const bufferBlock = this.createBufferBlock(currentBlock, nextBlock);
          result.push(bufferBlock);
        }
      }
    }

    return result;
  }

  /**
   * Determines if buffer is needed between two blocks
   */
  private needsBuffer(block1: RhythmBlock, block2: RhythmBlock): boolean {
    // High intensity to high intensity needs buffer
    if (block1.intensity === "high" && block2.intensity === "high") {
      return true;
    }

    // Draining to draining needs buffer
    if (
      block1.energyImpact === "draining" &&
      block2.energyImpact === "draining"
    ) {
      return true;
    }

    // Incompatible categories need buffer
    const incompatiblePairs = [
      ["focus", "meeting"],
      ["exercise", "meal"],
      ["meeting", "exercise"],
    ];

    for (const [cat1, cat2] of incompatiblePairs) {
      if (
        (block1.category === cat1 && block2.category === cat2) ||
        (block1.category === cat2 && block2.category === cat1)
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Creates a rest/break buffer block between two activities
   *
   */
  private createBufferBlock(
    block1: RhythmBlock,
    block2: RhythmBlock
  ): RhythmBlock {
    const bufferStart = block1.endTime;
    const bufferEnd = addMinutes(bufferStart, 10); // 10-minute buffer

    const bufferBlock = new RhythmBlock({
      label: "Buffer",
      category: "break",
      intensity: "low",
      energyImpact: "neutral",
      priority: "optional",
      constraints: [],
      userOrder: (block1.userOrder + block2.userOrder) / 2,
    });

    bufferBlock.plan(bufferStart, bufferEnd);
    return bufferBlock;
  }

  /**
   * Validates the final flow
   */
  private validateFinalFlow(blocks: RhythmBlock[]): RhythmBlock[] {
    const validBlocks: RhythmBlock[] = [];

    for (const block of blocks) {
      if (this.isValidScheduledBlock(block)) {
        validBlocks.push(block);
      } else {
        logger.warn(`Removing invalid block: ${block.label}`);
      }
    }

    return validBlocks;
  }

  private isValidScheduledBlock(block: RhythmBlock): boolean {
    return block.isPlanned && block.startTime < block.endTime;
  }
}
