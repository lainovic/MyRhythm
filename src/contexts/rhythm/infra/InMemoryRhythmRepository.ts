import type UserId from "../../users/domain/values/UserId";
import type UserRhythm from "../domain/entities/UserRhythm";
import type RhythmId from "../domain/values/RhythmId";
import type { RhythmRepository } from "./RhythmRepository";

class InMemoryRhythmRepository implements RhythmRepository {
  private rhythms: Map<string, UserRhythm> = new Map();

  async save(rhythm: UserRhythm): Promise<void> {
    const key = this.generateKey(rhythm.userId, rhythm.id);
    this.rhythms.set(key, rhythm);
  }

  async findById(userId: UserId, id: RhythmId): Promise<UserRhythm | null> {
    const key = this.generateKey(userId, id);
    return this.rhythms.get(key) ?? null;
  }

  async findAllByUser(userId: UserId): Promise<UserRhythm[]> {
    return Array.from(this.rhythms.values()).filter((r) => r.userId === userId);
  }

  async delete(userId: UserId, id: RhythmId): Promise<void> {
    const key = this.generateKey(userId, id);
    this.rhythms.delete(key);
  }

  private generateKey(userId: UserId, rhythmId: RhythmId): string {
    return `${userId}${rhythmId}`;
  }
}

export default InMemoryRhythmRepository;
