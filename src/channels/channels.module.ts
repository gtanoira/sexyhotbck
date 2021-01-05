import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { ChannelsController } from './channels.controller';
// Entities
import { Channel } from 'src/models/channel.entity';
// Services
import { TranslateService } from 'src/shared/translate.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Channel],
      'SEXYHOT'
    )
  ],
  controllers: [
    ChannelsController],
  providers: [
    TranslateService
  ]
})
export class ChannelsModule {}
