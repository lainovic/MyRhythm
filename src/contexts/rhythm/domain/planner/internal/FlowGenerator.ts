import type RhythmBlock from "../../entities/RhythmBlock";

export type Flow = {
  blocks: RhythmBlock[];
};

export type FlowInput = {
  blocks: RhythmBlock[];
};

export interface FlowGenerator {
  generate(input: FlowInput): Flow;
}
