import { Module } from '@nestjs/common';
import { GridController } from './grid.controller';

@Module({
  controllers: [GridController]
})
export class GridModule {}
