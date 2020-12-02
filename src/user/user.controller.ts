import { Body, ConflictException, Controller, Get, Post, ServiceUnavailableException, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';

// DTO's
import { UserDto } from 'src/user/user.dto';
// Services
import { UserService } from './user.service';

@Controller('')
export class UserController {

  constructor(
    private userService: UserService
  ) {}

  @Get('/api/users')
  public async getAllUsers() {
    return this.userService.getAllUsers()
    .catch(error => {
      throw new ServiceUnavailableException(error);
    });
  }

  @Post('/login')
  @UsePipes(new ValidationPipe())
  public async login(
    @Body() data: UserDto
  ) {
    return this.userService.login(data)
    .catch(error => {
      throw new UnauthorizedException(error);
    });
  }

  @Post('/register')
  @UsePipes(new ValidationPipe())
  public async register(
    @Body() data: UserDto
  ) {
    return this.userService.register(data)
    .catch(error => {
      throw new ConflictException(error);
    });
  }
}
