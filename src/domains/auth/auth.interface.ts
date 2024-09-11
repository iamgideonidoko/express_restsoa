import { users } from './auth.schema';

export interface JwtAddedPayload {
  id: string;
}

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type SignUpUserResponse = Omit<NewUser, 'password'> & { id: string };

export type SignInUserResponse = SignUpUserResponse;

export type GetUserProfileResponse = Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
