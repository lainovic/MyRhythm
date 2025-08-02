import { v6 as uuid } from "uuid";

class RhythmId {
  readonly value: string = uuid();

  constructor() {}
}

export default RhythmId;
