import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { BatchsModule } from './batchs/batchs.module';
import { ChannelsModule } from './channels/channels.module';
import { GridModule } from './grid/grid.module';
import { UserModule } from './user/user.module';
// Databases
import { sexyhotProvider } from './database/database.providers';
import { TranslateService } from './shared/translate.service';

@Module({
  imports: [
    BatchsModule,
    ChannelsModule,
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
