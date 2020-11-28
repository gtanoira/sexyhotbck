import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Batch } from 'src/models/batch.entity';
import { Grid } from 'src/models/grid.entity';

// Controllers
import { GridController } from './grid.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Batch, Grid],
      'GLOBOSAT'
    )
  ],
  controllers: [GridController]
})
export class GridModule {}
