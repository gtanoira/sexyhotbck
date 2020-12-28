import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// Controllers
import { BatchsController } from './batchs.controller';
// Services
import { TranslateService } from 'src/shared/translate.service';
// Entities
import { Batch } from 'src/models/batch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Batch],
      'SEXYHOT'
    )
  ],
  controllers: [
    BatchsController
  ],
  providers: [
    TranslateService
  ]
})
export class BatchsModule {}
