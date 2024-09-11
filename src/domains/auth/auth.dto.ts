import { IsEmail, Length } from 'class-validator';
import { NewUser } from './auth.interface';

export class SignUpUserInput implements Omit<NewUser, 'id' | 'createdAt'> {
  @IsEmail()
  email: string;
  @Length(2, 50)
  firstName: string;
  @Length(2, 50)
  lastName: string;
  @Length(6, 50)
  password: string;
}

export class SignInUserInput implements Pick<NewUser, 'email' | 'password'> {
  @IsEmail()
  email: string;
  @Length(6, 50)
  password: string;
}
