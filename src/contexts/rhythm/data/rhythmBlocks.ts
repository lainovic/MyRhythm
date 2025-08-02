import RhythmBlock, {
  RHYTHM_BLOCK_CATEGORIES,
  type RhythmBlockCategory,
  type RhythmConstraint,
} from "../domain/entities/RhythmBlock";

export const mockedBlocks = (): RhythmBlock[] =>
  RHYTHM_BLOCK_CATEGORIES.map((category, idx) =>
    createMockedBlock(category, idx)
  );

const createMockedBlock = (
  category: RhythmBlockCategory,
  idx: number
): RhythmBlock => {
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

  const priorities = {
    focus: "important" as const,
    rest: "optional" as const,
    meal: "essential" as const,
    exercise: "important" as const,
    break: "optional" as const,
    meeting: "essential" as const,
    hobby: "optional" as const,
    connect: "important" as const,
    chore: "optional" as const,
  };

  const intensities = {
    focus: "high" as const,
    rest: "low" as const,
    meal: "medium" as const,
    exercise: "high" as const,
    break: "low" as const,
    meeting: "medium" as const,
    hobby: "medium" as const,
    connect: "medium" as const,
    chore: "low" as const,
  };

  const energyImpacts = {
    focus: "draining" as const,
    rest: "recharging" as const,
    meal: "neutral" as const,
    exercise: "recharging" as const,
    break: "recharging" as const,
    meeting: "draining" as const,
    hobby: "recharging" as const,
    connect: "neutral" as const,
    chore: "draining" as const,
  };

  const maxDurations = {
    focus: 90,
    rest: 30,
    meal: 45,
    exercise: 45,
    break: 15,
    meeting: 60,
    hobby: 120,
    connect: 60,
    chore: 45,
  };

  return new RhythmBlock({
    label: labels[category],
    category,
    priority: priorities[category],
    intensity: intensities[category],
    energyImpact: energyImpacts[category],
    maxDuration: maxDurations[category],
    constraints: getMockedConstraints(category),
    isCompleted: false,
    userOrder: idx,
    notes: `Default ${category} block`,
  });
};

const getMockedConstraints = (
  category: RhythmBlockCategory
): RhythmConstraint[] => {
  switch (category) {
    case "meal":
      // Lunch time window
      const lunchStart = new Date();
      lunchStart.setHours(11, 30, 0, 0);
      const lunchEnd = new Date();
      lunchEnd.setHours(13, 30, 0, 0);
      return [{ type: "window", start: lunchStart, end: lunchEnd }];

    case "exercise":
      // Prefer morning exercise, must be before 9 AM
      const exerciseTime = new Date();
      exerciseTime.setHours(7, 0, 0, 0);
      const exerciseDeadline = new Date();
      exerciseDeadline.setHours(9, 0, 0, 0);
      return [
        { type: "preferred", preferredTime: exerciseTime },
        { type: "deadline", latestTime: exerciseDeadline },
      ];

    case "focus":
      // Focus during business hours, after coffee
      const focusStart = new Date();
      focusStart.setHours(9, 0, 0, 0);
      const focusEnd = new Date();
      focusEnd.setHours(17, 0, 0, 0);
      return [
        { type: "window", start: focusStart, end: focusEnd },
        {
          type: "after",
          earliestTime: new Date(new Date().setHours(8, 30, 0, 0)),
        },
      ];

    case "rest":
      return [{ type: "naturalLanguage", description: "When I need a break" }];

    case "meeting":
      // Fixed team meeting at 10 AM, recurring on weekdays
      const meetingTime = new Date();
      meetingTime.setHours(10, 0, 0, 0);
      return [
        { type: "fixed", time: meetingTime },
        { type: "recurring", days: [1, 2, 3, 4, 5], time: meetingTime }, // Monday-Friday
      ];

    case "hobby":
      // Evening hobby time, after work
      const hobbyStart = new Date();
      hobbyStart.setHours(18, 0, 0, 0);
      const hobbyEnd = new Date();
      hobbyEnd.setHours(22, 0, 0, 0);
      return [
        { type: "window", start: hobbyStart, end: hobbyEnd },
        {
          type: "after",
          earliestTime: new Date(new Date().setHours(17, 0, 0, 0)),
        },
      ];

    case "connect":
      // Social time in evening, natural language
      return [
        { type: "naturalLanguage", description: "When others are available" },
        {
          type: "window",
          start: new Date(new Date().setHours(19, 0, 0, 0)),
          end: new Date(new Date().setHours(21, 0, 0, 0)),
        },
      ];

    case "chore":
      return [{ type: "naturalLanguage", description: "When I have time" }];

    case "break":
      return [
        {
          type: "naturalLanguage",
          description: "When I need a quick refresh",
        },
      ];

    default:
      return [];
  }
};
