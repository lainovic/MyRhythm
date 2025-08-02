import type UserId from "../../../users/domain/values/UserId";
import RhythmId from "../values/RhythmId";
import type RhythmBlock from "./RhythmBlock";

interface UserRhythmProps {
  userId: UserId;
  blocks: RhythmBlock[];
}

class UserRhythm {
  readonly id: RhythmId = new RhythmId();
  readonly userId: UserId;
  blocks: RhythmBlock[];

  constructor(props: UserRhythmProps) {
    this.userId = props.userId;
    this.blocks = props.blocks;
  }
}

export default UserRhythm;
