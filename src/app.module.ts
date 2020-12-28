import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { BatchsModule } from './batchs/batchs.module';
import { GridModule } from './grid/grid.module';
import { UserModule } from './user/user.module';
// Databases
import { sexyhotProvider } from './database/database.providers';
import { TranslateService } from './shared/translate.service';

@Module({
  imports: [
    BatchsModule,
    GridModule,
    TypeOrmModule.forRoot({
      ...sexyhotProvider,
      type: 'mysql'
    }),
    UserModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
    TranslateService
  ],
})
export class AppModule {}
