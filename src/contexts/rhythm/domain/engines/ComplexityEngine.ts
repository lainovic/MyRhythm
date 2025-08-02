import type RhythmBlock from "../entities/RhythmBlock";

export type ComplexityLevel =
  | "simple" // Basic sequential processing
  | "moderate" // Some optimization needed
  | "complex" // Multi-objective optimization
  | "highly-complex" // Advanced genetic algorithms
  | "extreme"; // Specialized algorithms

export type Complexity = {
  level: ComplexityLevel;
  reason: string;
  metrics: {
    hardConstraints: number;
    softConstraints: number;
    totalConstraints: number;
    energyTransitions: number;
  };
};

export interface ComplexityEngine {
  analyze(blocks: RhythmBlock[]): Complexity;
}
