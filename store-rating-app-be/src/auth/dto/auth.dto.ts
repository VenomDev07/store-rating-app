import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  password: string;
}

export class RegisterDto {
  @IsString()
  @Length(1, 60, { message: 'Name must be between 1 and 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MaxLength(400, { message: 'Address cannot exceed 400 characters' })
  address: string;

  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.{8,16})/, {
    message: 'Password must be 8-16 characters with at least one uppercase letter and one special character (!@#$&*)',
  })
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @Matches(/^(?=.*[!@#$&*])(?=.{8,16})/, {
    message: 'Password must be 8-16 characters with at least one uppercase letter and one special character (!@#$&*)',
  })
  newPassword: string;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    address: string
  };
}