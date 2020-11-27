import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grid } from 'src/models/grid.entity';

// Controllers
import { GridController } from './grid.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grid], 'GLOBOSAT')
  ],
  controllers: [GridController]
})
export class GridModule {}
