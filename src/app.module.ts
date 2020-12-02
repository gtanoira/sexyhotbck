import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { GridModule } from './grid/grid.module';
import { UserModule } from './user/user.module';
// Databases
import { globosatProvider } from './database/database.providers';

@Module({
  imports: [
    GridModule,
    TypeOrmModule.forRoot({
      ...globosatProvider,
      type: 'mysql'
    }),
    UserModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {}
