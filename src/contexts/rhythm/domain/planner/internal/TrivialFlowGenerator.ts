import type { Flow, FlowGenerator, FlowInput } from "./FlowGenerator";

export class TrivialFlowGenerator implements FlowGenerator {
  generate(input: FlowInput): Flow {
    return {
      blocks: input.blocks.map((b) => {
        const res = b.copy();
        const now = new Date();
        const durationMs = res.durationInMinutes * 60 * 1000;
        const end = new Date(now.getTime() + durationMs);
        res.plan(now, end);
        return res;
      }),
    } as Flow;
  }
}
