import { type RhythmBlockCategory } from "../domain/entities/RhythmBlock";

function getEffect(category: RhythmBlockCategory | undefined): string {
  switch (category) {
    case "meeting":
      return "animate-shimmer-silver";
    case "break":
      return "animate-shimmer-nature";
    case "exercise":
      return "animate-shimmer-golden";
    case "meal":
      return "animate-shimmer-earth";
    case "focus":
      return "animate-shimmer-neon";
    case "rest":
      return "animate-shimmer-ocean";
    case "hobby":
      return "animate-shimmer-executive";
    case "connect":
      return "animate-shimmer-sunset";
    case "chore":
      return "animate-shimmer-cool";
    default:
      return "animate-shimmer-cool opacity-20";
  }
}

export { getEffect };
