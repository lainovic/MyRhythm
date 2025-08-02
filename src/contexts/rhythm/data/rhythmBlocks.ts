import RhythmBlock, {
  RHYTHM_BLOCK_CATEGORIES,
  type RhythmBlockCategory,
} from "../domain/entities/RhythmBlock";
import RhythmBlockId from "../domain/values/RhythmBlockId";

export const mockedBlocks = (): RhythmBlock[] =>
  RHYTHM_BLOCK_CATEGORIES.map((category) => createMockedBlock(category)).concat(
    [
      new RhythmBlock({
        id: new RhythmBlockId(),
        label: "Morning Awakening",
        category: "break",
        priority: "essential",
        intensity: "medium",
        isPlanned: false,
        wasCompleted: false,
        notes: `block`,
      }),
    ],
  );

const createMockedBlock = (category: RhythmBlockCategory): RhythmBlock => {
  const labels = {
    focus: "Deep Work Session",
    rest: "Rest & Recovery",
    meal: "Lunch Break",
    exercise: "Workout Session",
    break: "Short Break",
    meeting: "Team Meeting",
    hobby: "Creative Hobby",
    connect: "Social Connection",
    chore: "House Chore",
  };

  return new RhythmBlock({
    id: new RhythmBlockId(),
    label: labels[category],
    category,
    priority: "essential",
    intensity: "medium",
    isPlanned: false,
    wasCompleted: false,
    notes: `Default ${category} block`,
  });
};
