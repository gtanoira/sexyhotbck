import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

// Environment
import { MYSQL_HOST, MYSQL_PORT, MYSQL_SYNCHRONIZE } from './environment/environment.settings';
// Modules
import { GridModule } from './grid/grid.module';
//Entities
import { ChannelEntity } from './models/channel.entity';
import { GridEntity } from './models/grid.entity';

@Module({
  imports: [
    GridModule,
    TypeOrmModule.forRoot({
      name: 'GLOBOSAT',
      type: 'mysql',
      host: `${MYSQL_HOST}`,
      port: MYSQL_PORT,
      username: 'root',
      password: 'root123',
      database: 'globosat',
      entities: [
        ChannelEntity,
        GridEntity
      ],
      synchronize: MYSQL_SYNCHRONIZE
    }),
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
})
export class AppModule {
  // constructor(private connection: Connection) {}
}
