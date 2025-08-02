import { v6 as uuid } from "uuid";

class UserId {
  readonly value: string;

  constructor() {
    this.value = uuid();
  }
}

export default UserId;
