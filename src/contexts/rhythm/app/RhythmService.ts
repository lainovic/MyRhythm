import type UserId from "../../users/domain/values/UserId";
import type { RhythmPlanner } from "../domain/planner/RhythmPlanner";
import type RhythmBlock from "../domain/entities/RhythmBlock";
import type UserRhythm from "../domain/entities/UserRhythm";
import { Result } from "../../../shared/utils/Result";
import { require } from "../../../shared/utils/validations";
import { none } from "../../../shared/utils/arrays";

export interface ServiceError extends Error {}

export class GenericServiceError implements ServiceError {
  public readonly name: string;
  public readonly message: string;

  constructor(name: string, message: string) {
    this.name = name;
    this.message = message;
  }
}

class RhythmService {
  private planner: RhythmPlanner;

  constructor(planner: RhythmPlanner) {
    this.planner = planner;
  }

  planRhythm(
    userId: UserId,
    blocks: RhythmBlock[],
  ): Result<UserRhythm, ServiceError> {
    this.validateNoneBlocksPlanned(blocks);

    const result = this.planner.plan({
      userId,
      blocks,
    });

    return result
      .ifSuccess((rhythm) => {
        this.validateAllBlocksPlanned(rhythm.blocks);
      })
      .mapError((error) => {
        return new GenericServiceError(error.name, error.message);
      });
  }

  private validateNoneBlocksPlanned(blocks: RhythmBlock[]) {
    require(none(blocks, (block) => block.isPlanned), () =>
      `Not all blocks are planned!`);
  }

  private validateAllBlocksPlanned(blocks: RhythmBlock[]) {
    require(blocks.every((block) => block.isPlanned), () =>
      `Not all blocks are planned!`);
  }
}

export default RhythmService;
