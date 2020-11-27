import { Test, TestingModule } from '@nestjs/testing';
import { Grid } from './grid.provider';

describe('Grid', () => {
  let provider: Grid;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Grid],
    }).compile();

    provider = module.get<Grid>(Grid);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
