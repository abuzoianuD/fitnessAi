import { User, UserProfile, UserPreferences } from '../entities/User';
import { FitnessGoal } from '../entities/FitnessGoal';
import { Result } from '@/src/shared/types/Result';

export interface UserRepository {
  saveUser(user: User): Promise<Result<User, string>>;
  getUserById(id: string): Promise<Result<User | null, string>>;
  getUserByEmail(email: string): Promise<Result<User | null, string>>;
  saveUserProfile(userId: string, profile: UserProfile): Promise<Result<UserProfile, string>>;
  saveFitnessGoals(userId: string, goals: FitnessGoal[]): Promise<Result<FitnessGoal[], string>>;
  saveUserPreferences(userId: string, preferences: UserPreferences): Promise<Result<UserPreferences, string>>;
  deleteUser(id: string): Promise<Result<void, string>>;
}