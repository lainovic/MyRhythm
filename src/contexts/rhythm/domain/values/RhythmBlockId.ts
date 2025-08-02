import { v6 as uuid } from "uuid";

class RhythmBlockId {
  readonly value: string = uuid();

  constructor() {}
}

export default RhythmBlockId;
