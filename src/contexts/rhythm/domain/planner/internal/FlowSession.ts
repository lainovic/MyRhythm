import type RhythmBlock from "../../entities/RhythmBlock";

export type FlowSession = {
  startTime: Date;
  endTime: Date;
  blocks: RhythmBlock[];
};
