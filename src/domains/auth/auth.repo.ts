import { inject, injectable } from 'inversify';
import type { Db } from '@/db';
import { TYPES } from '@/ioc/types';
import type { NewUser } from './auth.interface';
import { users } from './auth.schema';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

@injectable()
export class AuthRepository {
  constructor(@inject(TYPES.Db) private db: Db) {}

  public async create(values: NewUser) {
    const [createdUser] = await this.db
      .insert(users)
      .values({ ...values, id: nanoid(30) })
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      });
    return createdUser!;
  }

  public async get({ by, value }: { by: 'email' | 'id'; value: string }) {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        password: users.password,
      })
      .from(users)
      .where(eq(users[by], value))
      .limit(1);
    return user;
  }
}
