import { Test, TestingModule } from '@nestjs/testing';
import { BatchsController } from './batchs.controller';

describe('BatchsController', () => {
  let controller: BatchsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchsController],
    }).compile();

    controller = module.get<BatchsController>(BatchsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
