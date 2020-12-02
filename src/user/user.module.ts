import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { UserController } from './user.controller';
// Schemas
import { User } from '../models/user.entity';
// Services
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User],
      'GLOBOSAT'
    )
  ],
  controllers: [
    UserController
  ],
  providers: [
    UserService
  ]
})
export class UserModule {}
