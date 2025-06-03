import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Use email instead of username
      passwordField: 'password', // Explicitly set password field
      passReqToCallback: false, // Set to true if you want to access the full request
    });
  }

  async validate(email: string, password: string): Promise<any> {
    // Debug logging
    console.log('LocalStrategy validate called');
    console.log('Email received:', email);
    console.log('Password received:', password ? '[PROVIDED]' : '[NOT PROVIDED]');
    
    if (!email || !password) {
      console.log('Missing email or password');
      throw new UnauthorizedException('Email and password are required');
    }

    const user = await this.authService.validateUser(email, password);
    if (!user) {
      console.log('User validation failed');
      throw new UnauthorizedException('Invalid email or password');
    }
    
    console.log('User validated successfully:', { id: user.id, email: user.email });
    return user;
  }
}