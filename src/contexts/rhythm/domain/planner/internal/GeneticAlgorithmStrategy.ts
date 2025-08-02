import { addMinutes, differenceInMinutes } from "date-fns";
import type RhythmBlock from "../../entities/RhythmBlock";
import { logger } from "../../../../../shared/logger";
import type {
  RhythmPriority,
  RhythmEnergyImpact,
  RhythmBlockCategory,
  RhythmIntensity,
} from "../../entities/RhythmBlock";
import type {
  FlowGenerationStrategy,
  FlowOptimizationCriteria,
} from "./FlowGenerationStrategy";
import { findGaps } from "./utils";
import { PlannedBlock } from "./BlockWrappers";
import type { FlowSession } from "./FlowSession";

/**
 * Genetic algorithm-based flow generation strategy
 */
export class GeneticAlgorithmStrategy implements FlowGenerationStrategy {
  private criteria: FlowOptimizationCriteria;
  private snapshot: FlowSession;
  private energyFlowModel: EnergyFlowModel;
  private transitionModel: TransitionModel;

  constructor(criteria: FlowOptimizationCriteria, snapshot: FlowSession) {
    this.criteria = criteria;
    this.snapshot = snapshot;
    this.energyFlowModel = new EnergyFlowModel();
    this.transitionModel = new TransitionModel();
  }

  execute(blocks: RhythmBlock[]): PlannedBlock[] {
    const populationSize = 50;
    const generations = 100;
    const mutationRate = 0.1;

    logger.trace(
      "Starting genetic algorithm strategy",
      {
        blockCount: blocks.length,
      },
      "GeneticAlgorithmStrategy"
    );

    // Initialize population
    let population = this.initializePopulation(blocks, populationSize);

    // Evolution loop
    for (let generation = 0; generation < generations; ++generation) {
      // Evaluate fitness
      const fitnessScores = population.map((flow) =>
        this.calculateFitness(flow)
      );

      // Selection
      const parents = this.selectParents(population, fitnessScores);

      // Crossover
      const offspring = this.crossover(parents);

      // Mutation
      const mutated = this.mutate(offspring, mutationRate);

      population = mutated;

      logger.trace(
        `Generation ${generation}: Best fitness = ${Math.max(...fitnessScores)}`
      );
    }

    // Return best flow
    const finalFitnessScores = population.map((flow) =>
      this.calculateFitness(flow)
    );
    const bestIndex = finalFitnessScores.indexOf(
      Math.max(...finalFitnessScores)
    );

    const finalBlocks = population[bestIndex].map((b) => new PlannedBlock(b));

    logger.info(
      "Genetic algorithm strategy executed",
      {
        blockCount: finalBlocks.length,
      },
      "GeneticAlgorithmStrategy"
    );

    return finalBlocks;
  }

  /**
   * Initializes population for genetic algorithm
   */
  private initializePopulation(
    newBlocks: RhythmBlock[],
    populationSize: number
  ): RhythmBlock[][] {
    const population: RhythmBlock[][] = [];

    // Create multiple variations of the flow
    for (let i = 0; i < populationSize; i++) {
      const currentBlocks = [...this.snapshot.blocks];

      // Add soft blocks in different orders
      const shuffledSoftBlocks = this.shuffleArray([...newBlocks]);

      for (const block of shuffledSoftBlocks) {
        const gaps = findGaps(this.snapshot);
        if (gaps.length > 0) {
          const gap = gaps[0];
          let duration: number;
          try {
            duration = block.durationInMinutes;
          } catch {
            duration = block.maxDuration || 60; // fallback to 60 minutes
          }
          const endTime = addMinutes(gap.start, duration);

          if (endTime <= gap.end) {
            const copy = block.copy();
            copy.plan(gap.start, endTime);
            currentBlocks.push(copy);
          }
        }
      }

      // Sort by start time (only planned blocks)
      currentBlocks.sort((a, b) => {
        if (!a.isPlanned && !b.isPlanned) return 0;
        if (!a.isPlanned) return 1; // unplanned blocks go to end
        if (!b.isPlanned) return -1; // unplanned blocks go to end
        return a.startTime.getTime() - b.startTime.getTime();
      });
      population.push(currentBlocks);
    }

    return population;
  }

  /**
   * Selects parents for genetic algorithm using tournament selection
   */
  private selectParents(
    population: RhythmBlock[][],
    fitnessScores: number[]
  ): RhythmBlock[][] {
    const tournamentSize = 3;
    const selected: RhythmBlock[][] = [];

    for (let i = 0; i < population.length; i++) {
      // Tournament selection
      let bestIndex = Math.floor(Math.random() * population.length);

      for (let j = 1; j < tournamentSize; j++) {
        const candidateIndex = Math.floor(Math.random() * population.length);
        if (fitnessScores[candidateIndex] > fitnessScores[bestIndex]) {
          bestIndex = candidateIndex;
        }
      }

      selected.push(population[bestIndex]);
    }

    return selected;
  }

  /**
   * Performs crossover between parent flows
   */
  private crossover(parents: RhythmBlock[][]): RhythmBlock[][] {
    const offspring: RhythmBlock[][] = [];

    for (let i = 0; i < parents.length; i += 2) {
      if (i + 1 < parents.length) {
        const parent1 = parents[i];
        const parent2 = parents[i + 1];

        // Single-point crossover
        const crossoverPoint = Math.floor(parent1.length / 2);

        const child1 = [
          ...parent1.slice(0, crossoverPoint),
          ...parent2.slice(crossoverPoint),
        ];

        const child2 = [
          ...parent2.slice(0, crossoverPoint),
          ...parent1.slice(crossoverPoint),
        ];

        offspring.push(child1, child2);
      } else {
        offspring.push(parents[i]);
      }
    }

    return offspring;
  }

  /**
   * Performs mutation on offspring flows
   */
  private mutate(
    offspring: RhythmBlock[][],
    mutationRate: number
  ): RhythmBlock[][] {
    return offspring.map((flow) => {
      if (Math.random() < mutationRate) {
        return this.mutateFlow(flow);
      }
      return flow;
    });
  }

  /**
   * Mutates a single flow
   */
  private mutateFlow(flow: RhythmBlock[]): RhythmBlock[] {
    const mutatedFlow = [...flow];

    // Random mutation: swap two blocks
    if (mutatedFlow.length > 1) {
      const i = Math.floor(Math.random() * mutatedFlow.length);
      const j = Math.floor(Math.random() * mutatedFlow.length);

      if (i !== j) {
        [mutatedFlow[i], mutatedFlow[j]] = [mutatedFlow[j], mutatedFlow[i]];

        // Re-plan the swapped blocks
        this.replanFlow(mutatedFlow);
      }
    }

    return mutatedFlow;
  }

  /**
   * Re-plans blocks in a flow to fix timing conflicts
   */
  private replanFlow(flow: RhythmBlock[]): void {
    let currentTime = this.snapshot.startTime;

    for (const block of flow) {
      const endTime = addMinutes(currentTime, block.durationInMinutes);
      block.plan(currentTime, endTime);
      currentTime = endTime;
    }
  }

  /**
   * Calculates multi-criteria fitness score for a flow
   */
  private calculateFitness(flow: RhythmBlock[]): number {
    return (
      this.criteria.constraintSatisfaction *
        this.calculateConstraintScore(flow) +
      this.criteria.energyFlowOptimization * this.calculateEnergyScore(flow) +
      this.criteria.priorityAlignment * this.calculatePriorityScore(flow) +
      this.criteria.transitionSmoothness * this.calculateTransitionScore(flow) +
      this.criteria.bufferTimeOptimization * this.calculateBufferScore(flow) +
      this.criteria.userPreferenceAlignment *
        this.calculateUserPreferenceScore(flow)
    );
  }

  /**
   * Calculates constraint satisfaction score
   */
  private calculateConstraintScore(flow: RhythmBlock[]): number {
    let satisfiedConstraints = 0;
    let totalConstraints = 0;

    for (const block of flow) {
      for (const constraint of block.constraints) {
        totalConstraints++;
        if (this.isConstraintSatisfied(block, constraint)) {
          satisfiedConstraints++;
        }
      }
    }

    return totalConstraints > 0 ? satisfiedConstraints / totalConstraints : 1;
  }

  /**
   * Calculates energy flow optimization score
   */
  private calculateEnergyScore(flow: RhythmBlock[]): number {
    if (flow.length < 2) return 1;

    // Only consider planned blocks for energy scoring
    const plannedBlocks = flow.filter((block) => block.isPlanned);
    if (plannedBlocks.length < 2) return 1;

    let totalScore = 0;
    for (let i = 0; i < plannedBlocks.length - 1; i++) {
      const currentBlock = plannedBlocks[i];
      const nextBlock = plannedBlocks[i + 1];
      totalScore += this.energyFlowModel.calculateTransitionScore(
        currentBlock,
        nextBlock,
        differenceInMinutes(nextBlock.startTime, currentBlock.endTime)
      );
    }

    return totalScore / (plannedBlocks.length - 1);
  }

  /**
   * Calculates priority alignment score
   */
  private calculatePriorityScore(flow: RhythmBlock[]): number {
    const priorityOrder: Record<RhythmPriority, number> = {
      essential: 1,
      important: 2,
      optional: 3,
    };

    let totalScore = 0;
    for (let i = 0; i < flow.length; i++) {
      const block = flow[i];
      const position = i / flow.length; // 0 = early, 1 = late
      const priority = priorityOrder[block.priority];

      // Prefer essential blocks early, optional blocks late
      const idealPosition = (priority - 1) / 2; // 0, 0.5, 1
      const distance = Math.abs(position - idealPosition);
      totalScore += 1 - distance;
    }

    return totalScore / flow.length;
  }

  /**
   * Calculates transition smoothness score
   */
  private calculateTransitionScore(flow: RhythmBlock[]): number {
    if (flow.length < 2) return 1;

    // Only consider planned blocks for transition scoring
    const plannedBlocks = flow.filter((block) => block.isPlanned);
    if (plannedBlocks.length < 2) return 1;

    let totalScore = 0;
    for (let i = 0; i < plannedBlocks.length - 1; i++) {
      const currentBlock = plannedBlocks[i];
      const nextBlock = plannedBlocks[i + 1];
      totalScore += this.transitionModel.calculateSmoothnessScore(
        currentBlock,
        nextBlock
      );
    }

    return totalScore / (plannedBlocks.length - 1);
  }

  /**
   * Calculates buffer time optimization score
   */
  private calculateBufferScore(flow: RhythmBlock[]): number {
    if (flow.length < 2) return 1;

    // Only consider planned blocks for buffer scoring
    const plannedBlocks = flow.filter((block) => block.isPlanned);
    if (plannedBlocks.length < 2) return 1;

    let totalScore = 0;
    for (let i = 0; i < plannedBlocks.length - 1; i++) {
      const currentBlock = plannedBlocks[i];
      const nextBlock = plannedBlocks[i + 1];
      const gap = differenceInMinutes(
        nextBlock.startTime,
        currentBlock.endTime
      );

      // Prefer small gaps (5-15 minutes) for smooth transitions
      if (gap >= 5 && gap <= 15) {
        totalScore += 1;
      } else if (gap > 0 && gap < 30) {
        totalScore += 0.5;
      }
    }

    return totalScore / (plannedBlocks.length - 1);
  }

  /**
   * Calculates user preference alignment score
   */
  private calculateUserPreferenceScore(flow: RhythmBlock[]): number {
    let totalScore = 0;
    for (const block of flow) {
      // Consider user order preference
      const position = flow.indexOf(block);
      const userOrder = block.userOrder;
      const distance = Math.abs(position - userOrder);
      totalScore += 1 / (1 + distance);
    }

    return totalScore / flow.length;
  }

  /**
   * Checks if a constraint is satisfied for a block
   */
  private isConstraintSatisfied(block: RhythmBlock, constraint: any): boolean {
    if (!block.isPlanned) return false;

    switch (constraint.type) {
      case "fixed":
        return (
          Math.abs(block.startTime.getTime() - constraint.time.getTime()) <
          60000
        ); // 1 minute tolerance
      case "window":
        return (
          block.startTime >= constraint.start && block.endTime <= constraint.end
        );
      case "deadline":
        return block.endTime <= constraint.latestTime;
      case "after":
        return block.startTime >= constraint.earliestTime;
      default:
        return true; // Soft constraints
    }
  }

  /**
   * Utility function to shuffle array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

/**
 * Models energy transitions between blocks
 */
class EnergyFlowModel {
  calculateTransitionScore(
    previousBlock: RhythmBlock,
    nextBlock: RhythmBlock,
    transitionTime: number
  ): number {
    const energyMap: Record<RhythmEnergyImpact, number> = {
      draining: -1,
      neutral: 0,
      recharging: 1,
    };

    const previousEnergy = energyMap[previousBlock.energyImpact];
    const nextEnergy = energyMap[nextBlock.energyImpact];

    // Base energy transition score
    let baseScore = 0.5; // neutral transitions

    // Optimal: draining → recharging
    if (previousEnergy === -1 && nextEnergy === 1) baseScore = 1.0;
    // Good: neutral → recharging or draining → neutral
    else if (Math.abs(previousEnergy - nextEnergy) === 1) baseScore = 0.8;
    // Poor: recharging → draining
    else if (previousEnergy === 1 && nextEnergy === -1) baseScore = 0.2;

    // Adjust score based on transition time
    // Longer transitions (more recovery time) are better for draining activities
    if (previousEnergy === -1) {
      // Previous was draining
      if (transitionTime >= 30) {
        // 30+ minutes recovery
        baseScore = Math.min(1.0, baseScore + 0.2);
      } else if (transitionTime >= 15) {
        // 15+ minutes recovery
        baseScore = Math.min(1.0, baseScore + 0.1);
      } else if (transitionTime < 5) {
        // Very short transition
        baseScore = Math.max(0.1, baseScore - 0.3);
      }
    }

    // Short transitions are fine for neutral/recharging activities
    if (previousEnergy >= 0 && transitionTime < 5) {
      baseScore = Math.max(0.1, baseScore - 0.1);
    }

    return baseScore;
  }
}

/**
 * Models transitions between different activity types
 */
class TransitionModel {
  calculateSmoothnessScore(
    currentBlock: RhythmBlock,
    nextBlock: RhythmBlock
  ): number {
    // Consider category transitions
    const categoryCompatibility = this.getCategoryCompatibility(
      currentBlock.category,
      nextBlock.category
    );

    // Consider intensity transitions
    const intensityCompatibility = this.getIntensityCompatibility(
      currentBlock.intensity,
      nextBlock.intensity
    );

    return (categoryCompatibility + intensityCompatibility) / 2;
  }

  private getCategoryCompatibility(
    cat1: RhythmBlockCategory,
    cat2: RhythmBlockCategory
  ): number {
    const compatiblePairs = [
      ["focus", "break"],
      ["exercise", "rest"],
      ["meal", "connect"],
      ["meeting", "focus"],
      ["hobby", "rest"],
    ] as const;

    for (const [a, b] of compatiblePairs) {
      if ((cat1 === a && cat2 === b) || (cat1 === b && cat2 === a)) {
        return 1.0;
      }
    }

    return 0.5; // neutral compatibility
  }

  private getIntensityCompatibility(
    int1: RhythmIntensity,
    int2: RhythmIntensity
  ): number {
    const intensityMap = { high: 3, medium: 2, low: 1 };
    const diff = Math.abs(intensityMap[int1] - intensityMap[int2]);

    if (diff === 0) return 0.7; // same intensity
    if (diff === 1) return 1.0; // gradual change
    return 0.3; // abrupt change
  }
}
