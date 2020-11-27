import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

// Environment
import { MYSQL_HOST, MYSQL_PORT, MYSQL_SYNCHRONIZE } from './environment/environment.settings';
// Modules
import { GridModule } from './grid/grid.module';
//Entities
import { Channel } from './models/channel.entity';
import { Grid } from './models/grid.entity';

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
        Channel,
        Grid
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
