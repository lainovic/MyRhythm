import type { FlowSession } from "./FlowSession";

export interface Gap {
  start: Date;
  end: Date;
}

export function findGaps(snapshot: FlowSession): Gap[] {
  const { startTime, endTime, blocks } = snapshot;

  if (blocks.length === 0) {
    return [{ start: startTime, end: endTime }] as Gap[];
  }

  const gaps = [];

  // Only consider planned blocks for gap finding
  const plannedBlocks = blocks.filter((block) => block.isPlanned);

  if (plannedBlocks.length === 0) {
    return [{ start: startTime, end: endTime }];
  }

  const sortedFlow = plannedBlocks.sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );

  // Gap before first block
  const firstBlockStart = sortedFlow[0].startTime;
  if (startTime < firstBlockStart) {
    gaps.push({
      start: startTime,
      end: firstBlockStart,
    });
  }

  // Gaps between blocks
  for (let i = 0; i < sortedFlow.length - 1; i++) {
    const currentBlockEnd = sortedFlow[i].endTime;
    const nextBlockStart = sortedFlow[i + 1].startTime;

    if (currentBlockEnd < nextBlockStart) {
      gaps.push({
        start: currentBlockEnd,
        end: nextBlockStart,
      });
    }
  }

  // Gap after last block
  const lastBlockEnd = sortedFlow[sortedFlow.length - 1].endTime;
  if (lastBlockEnd < endTime) {
    gaps.push({
      start: lastBlockEnd,
      end: endTime,
    });
  }

  return gaps;
}
