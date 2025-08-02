import type RhythmBlock from "../entities/RhythmBlock";
import type { Complexity, ComplexityEngine } from "./ComplexityEngine";

export class ComplexityEngineV1 implements ComplexityEngine {
  analyze(blocks: RhythmBlock[]): Complexity {
    let hardConstraints = 0;
    let softConstraints = 0;
    let energyTransitions = 0;
    for (const block of blocks) {
      for (const constraint of block.constraints) {
        if (this.isHardConstraint(constraint)) {
          hardConstraints++;
        } else {
          softConstraints++;
        }
      }
    }

    // Count potential energy transitions
    for (let i = 0; i < blocks.length - 1; i++) {
      if (blocks[i].energyImpact !== blocks[i + 1].energyImpact) {
        energyTransitions++;
      }
    }

    const totalConstraints = hardConstraints + softConstraints;
    const isSimple = totalConstraints < 10 && energyTransitions < 3;

    return {
      level: "simple", // TODO: unmock this
      reason: isSimple
        ? "Low complexity - using simple pipeline"
        : "High complexity - using optimization",
      metrics: {
        hardConstraints,
        softConstraints,
        totalConstraints,
        energyTransitions,
      },
    };
  }

  private isHardConstraint(constraint: any): boolean {
    const hardTypes = ["fixed", "window", "deadline", "dependsOn", "recurring"];
    return hardTypes.includes(constraint.type);
  }
}
