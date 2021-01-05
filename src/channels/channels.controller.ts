import { Controller, Get, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { getConnection } from 'typeorm';

// Decorators
import { GetLanguage } from 'src/common/get-language.decorator';
import { RolesRequired } from 'src/common/roles-required.decorator';
// Existing ROLES (enum)
import { UserRoles } from 'src/user/user.roles';
// Services
import { AuthGuard } from 'src/shared/auth.guard';
// Entities
import { Channel } from 'src/models/channel.entity';

@Controller('api/channels')
export class ChannelsController {

  // Get all batchs
  @Get('')
  @RolesRequired(UserRoles.READER, UserRoles.EDITOR)
  @UseGuards(AuthGuard)
  async getAll(
    @GetLanguage() language: string,
  ): Promise<Channel[]> {
    
    const connection = getConnection('SEXYHOT')
    return await connection.getRepository(Channel).find()
    .catch(error => {
      throw new ServiceUnavailableException(error.message);
    });
  }
}
