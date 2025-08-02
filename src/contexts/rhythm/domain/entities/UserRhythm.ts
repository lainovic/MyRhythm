import type UserId from "../../../users/domain/values/UserId";
import RhythmId from "../values/RhythmId";
import type RhythmBlock from "./RhythmBlock";

class UserRhythm {
  readonly id: RhythmId = new RhythmId();
  readonly userId: UserId;
  blocks: RhythmBlock[] = [];

  constructor(userId: UserId) {
    this.userId = userId;
  }
}

export default UserRhythm;
