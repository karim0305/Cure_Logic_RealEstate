// import { Body, Controller, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { LocalAuthGuard } from './guards/local-auth.guard';
// import { RegisterUserDto } from 'src/users/dto/register-user.dto';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';
// import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { UserDocument } from 'src/users/schemas/user.schema';

// @ApiTags('Auth')
// @Controller('auth')
// export class AuthController {
//   constructor(private authService: AuthService) { }

//   // POST /auth/login - User login
//   @Post('email/login')
//   @ApiOperation({
//     summary: 'User login',
//     description: 'Authenticate user with email and password.'
//   })
//   @ApiResponse({
//     status: 201,
//     description: 'Login successful',
//     schema: { properties: { access_token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } }
//   })
//   @ApiResponse({ status: 401, description: 'Invalid credentials' })
//   async login(@Body() body) {
//     return this.authService.login(body);
//   }

//   // POST /auth/register - Public user registration
//   @Post('email/register')
//   @ApiOperation({
//     summary: 'Register new user',
//     description: 'Create a new user account.'
//   })
//   @ApiResponse({
//     status: 201,
//     description: 'Registration successful',
//     schema: { properties: { access_token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } }
//   })
//   @ApiResponse({ status: 400, description: 'Invalid data' })
//   async register(@Body() registerUserDto: RegisterUserDto) {
//     return this.authService.register(registerUserDto);
//   }

//   // GET /auth/verify - Verify JWT token
//   @Get('verify')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Verify JWT token', description: 'Verify the validity of the JWT token.' })
//   @ApiBearerAuth('access-token')
//   @ApiResponse({
//     status: 200,
//     description: 'Token valid',
//     schema: { properties: { user: { $ref: '#/components/schemas/User' }, valid: { type: 'boolean' } } }
//   })
//   async verify(@Request() req): Promise<{ user: UserDocument; valid: boolean }> {
//     const user = await this.authService.getVerifiedUser(req.user.userId); // Fetch full user data
//     return { user, valid: true };
//   }

//   // POST /auth/refresh - Refresh JWT token
//   @Post('refresh')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Refresh JWT token', description: 'Refresh the access token.' })
//   @ApiBearerAuth('access-token')
//   @ApiResponse({ status: 200, description: 'Token refreshed', schema: { properties: { access_token: { type: 'string' } } } })
//   async refresh(@Request() req) {
//     return this.authService.refreshToken(req.user);
//   }

//   // PATCH /auth/change-password - Change user password
//   @Patch('change-password')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Change user password', description: 'Change the user\'s password with old password verification.' })
//   @ApiBearerAuth('access-token')
//   @ApiResponse({ status: 200, description: 'Password changed', schema: { $ref: '#/components/schemas/User' } })
//   @ApiResponse({ status: 401, description: 'Invalid current password' })
//   async changePassword(@Request() req, @Body() body: { oldPassword: string; newPassword: string }) {
//     return this.authService.changePassword(req.user.userId, body.oldPassword, body.newPassword);
//   }

//   // POST /auth/forgot-password - Request password reset
//   @Post('forgot-password')
//   @ApiOperation({ summary: 'Request password reset', description: 'Send a password reset link to the user\'s email.' })
//   @ApiResponse({ status: 200, description: 'Reset link sent', schema: { properties: { message: { type: 'string' } } } })
//   @ApiResponse({ status: 404, description: 'User not found' })
//   async forgotPassword(@Body('email') email: string) {
//     return this.authService.forgotPassword(email);
//   }

//   // POST /auth/logout - User logout
//   @Post('logout')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'User logout', description: 'Invalidate the user session (client handles token removal).' })
//   @ApiBearerAuth('access-token')
//   @ApiResponse({ status: 200, description: 'Logged out successfully', schema: { properties: { message: { type: 'string' } } } })
//   async logout(@Request() req) {
//     return this.authService.logout(req.user.userId);
//   }
// }




import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/users/dto/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserDocument } from 'src/users/schemas/user.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /auth/login - User login
  @Post('email/login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password.',
  })
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    schema: {
      properties: {
        access_token: { type: 'string' },
        user: { $ref: '#/components/schemas/User' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body, @Res({ passthrough: true }) res: Response) {
    const { access_token, user } = await this.authService.login(body);

    // ✅ Set cookie with JWT
    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only on HTTPS in prod
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return { message: 'Login successful', user, access_token };
  }

  // POST /auth/register - Public user registration
  @Post('email/register')
  @ApiOperation({
    summary: 'Register new user',
    description: 'Create a new user account.',
  })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    schema: {
      properties: {
        access_token: { type: 'string' },
        user: { $ref: '#/components/schemas/User' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  // GET /auth/verify - Verify JWT token
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Verify JWT token',
    description: 'Verify the validity of the JWT token.',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'Token valid',
    schema: {
      properties: {
        user: { $ref: '#/components/schemas/User' },
        valid: { type: 'boolean' },
      },
    },
  })
  async verify(
    @Request() req,
  ): Promise<{ user: UserDocument; valid: boolean }> {
    const user = await this.authService.getVerifiedUser(req.user.userId); // Fetch full user data
    return { user, valid: true };
  }

  // POST /auth/refresh - Refresh JWT token
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Refresh JWT token',
    description: 'Refresh the access token.',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'Token refreshed',
    schema: { properties: { access_token: { type: 'string' } } },
  })
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.user);
  }

  // PATCH /auth/change-password - Change user password
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change user password',
    description: "Change the user's password with old password verification.",
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'Password changed',
    schema: { $ref: '#/components/schemas/User' },
  })
  @ApiResponse({ status: 401, description: 'Invalid current password' })
  async changePassword(
    @Request() req,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      req.user.userId,
      body.oldPassword,
      body.newPassword,
    );
  }

  // POST /auth/forgot-password - Request password reset
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request password reset',
    description: "Send a password reset link to the user's email.",
  })
  @ApiResponse({
    status: 200,
    description: 'Reset link sent',
    schema: { properties: { message: { type: 'string' } } },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  // POST /auth/logout - User logout
  @Post('logout')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidate the user session (client handles token removal).',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    schema: { properties: { message: { type: 'string' } } },
  })
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    // ✅ Clear cookie on logout
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // sirf prod me secure
      sameSite: 'strict',
      path: '/',
    });
  }
}
