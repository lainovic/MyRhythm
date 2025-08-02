import type RhythmBlock from "../../entities/RhythmBlock";
import type PlannedRhythmBlock from "../../entities/RhythmBlock";

/**
 * Multi-objective optimization criteria for flow construction
 */
export interface FlowOptimizationCriteria {
  constraintSatisfaction: number; // 0-1 score
  energyFlowOptimization: number; // 0-1 score
  priorityAlignment: number; // 0-1 score
  userPreferenceAlignment: number; // 0-1 score
  transitionSmoothness: number; // 0-1 score
  bufferTimeOptimization: number; // 0-1 score
  deadlineCompliance: number; // 0-1 score
}

/**
 * Strategy interface for flow generation algorithms
 */
export interface FlowGenerationStrategy {
  execute(blocks: RhythmBlock[]): PlannedRhythmBlock[];
}
