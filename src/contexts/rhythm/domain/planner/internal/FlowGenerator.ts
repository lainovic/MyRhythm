import type RhythmBlock from "../../entities/RhythmBlock";

export type Flow = {
  blocks: RhythmBlock[];
};

export type FlowInput = {
  startTime: Date;
  endTime: Date;
  blocks: RhythmBlock[];
};

export interface FlowGenerator {
  generate(input: FlowInput): Flow;
}
