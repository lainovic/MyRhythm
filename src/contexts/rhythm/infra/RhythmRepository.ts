import type UserId from "../../users/domain/values/UserId";
import type UserRhythm from "../domain/entities/UserRhythm";
import type RhythmId from "../domain/values/RhythmId";

export interface RhythmRepository {
  save(rhythm: UserRhythm): Promise<void>;
  findById(userId: UserId, id: RhythmId): Promise<UserRhythm | null>;
  findAllByUser(userId: UserId): Promise<UserRhythm[]>;
  delete(userId: UserId, id: RhythmId): Promise<void>;
}
