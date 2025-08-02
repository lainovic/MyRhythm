import type { Result } from "../../../../shared/utils/Result";
import type UserId from "../../../users/domain/values/UserId";
import type RhythmBlock from "../entities/RhythmBlock";
import type UserRhythm from "../entities/UserRhythm";

export interface PlannerInput {
  userId: UserId;
  blocks: RhythmBlock[];
}

export class PlannerError extends Error {}

/**
 * RhythmPlanner interface defines the contract for planning daily rhythms.
 * Implementations should provide algorithms for organizing rhythm blocks into
 * a coherent daily schedule based on constraints and priorities.
 */
export interface RhythmPlanner {
  /**
   * Plans a daily rhythm by organizing blocks according to their constraints and priorities.
   * @param input - The planning input containing user ID and rhythm blocks to organize
   * @returns A Result containing either the planned UserRhythm or a PlannerError
   */
  plan(input: PlannerInput): Result<UserRhythm, PlannerError>;

  /**
   * Restores a previously planned rhythm, maintaining block order and timing.
   * @param oldRhythm - The previous UserRhythm to restore
   * @returns The restored UserRhythm
   */
  backToRhythm(oldRhythm: UserRhythm): UserRhythm;
}
