import { 
  BadRequestException,
  Body, 
  ConflictException, 
  Controller, 
  Get, 
  Post, 
  Req, 
  Res, 
  ServiceUnavailableException, 
  UnauthorizedException, 
  UseGuards, 
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';

// DTO's
import { UserDto } from 'src/user/user.dto';
// Services
import { AuthGuard } from 'src/shared/auth.guard';
import { UserService } from './user.service';
import { GetUser } from 'src/common/get-user.decorator';
// User roles
import { UserRoles } from './user.roles';
// Decorators
import { RolesRequired } from 'src/common/roles-required.decorator';

@Controller('')
export class UserController {

  constructor(
    private userService: UserService
  ) {}

  @Get('/api/users')
  @RolesRequired(UserRoles.EDITOR, UserRoles.READER)
  @UseGuards(AuthGuard)
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
  @RolesRequired(UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  public async register(
    @GetUser('roles') roles: string,
    @Body() data: UserDto,
    @Req() req: any
  ) {
    // Check if the user has the admin role
    if (!roles || roles.indexOf(UserRoles.ADMIN) < 0) {
      throw new UnauthorizedException('GS-009(E): insufficient privileges.')
    }
    // Validate user roles
    const rolesToValidate = data.roles.split(',');
    rolesToValidate.forEach(role => {
      if (!(role.toUpperCase() in UserRoles)) { 
        throw new BadRequestException(`GS-010(E): incorrect role ${role}`);
      }
    });
    // Create the new user
    data['createdBy'] = req.user.userId;  // add UserId
    return this.userService.register(data)
    .catch(error => {
      throw new ConflictException(error);
    });
  }
}
