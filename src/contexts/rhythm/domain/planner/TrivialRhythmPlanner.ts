import TrivialScheduler from "../../../../shared/TrivialScheduler";
import { Result } from "../../../../shared/utils/Result";
import UserId from "../../../users/domain/values/UserId";
import UserRhythm from "../entities/UserRhythm";
import { TrivialFlowGenerator } from "./internal/TrivialFlowGenerator";
import type {
  PlannerError,
  PlannerInput,
  RhythmPlanner,
} from "./RhythmPlanner";

class TrivialRhythmPlanner implements RhythmPlanner {
  private readonly flowGenerator = new TrivialFlowGenerator();
  private readonly scheduler = new TrivialScheduler();

  plan(input: PlannerInput): Result<UserRhythm, PlannerError> {
    const flow = this.flowGenerator.generate({
      startTime: this.scheduler.getStartTime(),
      endTime: this.scheduler.getEndTime(),
      blocks: input.blocks,
    });

    const rhythm = new UserRhythm({
      userId: new UserId(),
      blocks: flow.blocks,
    });
    return Result.success(rhythm);
  }

  backToRhythm(oldRhythm: UserRhythm): UserRhythm {
    return oldRhythm;
  }
}

export default TrivialRhythmPlanner;
