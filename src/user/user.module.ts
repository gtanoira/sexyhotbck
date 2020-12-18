import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { UserController } from './user.controller';
// Schemas
import { i18n } from 'src/models/i18n.entity';
import { User } from '../models/user.entity';
// Services
import { TranslateService } from 'src/shared/translate.service';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, i18n],
      'GLOBOSAT'
    )
  ],
  controllers: [
    UserController
  ],
  providers: [
    TranslateService,
    UserService
  ]
})
export class UserModule {}
