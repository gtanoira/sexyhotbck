import { Controller, Get, Param, ServiceUnavailableException } from '@nestjs/common';
import { getConnection } from 'typeorm';

//Entities
import { Channel } from 'src/models/channel.entity';
import { Grid } from 'src/models/grid.entity';

@Controller('grids')
export class GridController {

  // Get all schedule events of a channel for a particular day
  @Get('/:channel/:schYear/:schMonth/:schDay')
  async getAll(
    @Param('channel') pchannelId: number,
    @Param('schYear') schYear: string,
    @Param('schMonth') schMonth: string,
    @Param('schDay') schDay: string,
  ): Promise<Grid[]> {
    const dayToSearch = `${schYear}-${schMonth}-${schDay}`;

    const connection = getConnection('GLOBOSAT')
    const cmdSql =  connection.getRepository(Grid)
      .createQueryBuilder('grid')
      .select('grid.id', 'id')
      .addSelect('channel.name', 'channel')
      .addSelect('grid.event_start', 'eventStart')
      .addSelect('grid.event_duration', 'eventDuration')
      .addSelect('ADDTIME(grid.event_start, grid.event_duration)', 'eventEnd')
      .addSelect('grid.event_id', 'eventId')
      .addSelect('grid.event_title', 'eventTitle')
      .addSelect('grid.director', 'director')
      .addSelect('grid.cast1', 'cast1')
      .addSelect('grid.cast2', 'cast2')
      .addSelect('grid.title_season', 'titleSeason')
      .addSelect('grid.synopsis', 'synopsis')
      .innerJoin('grid.channel', 'channel')
      .where(`grid.channel_id = ${pchannelId}`)
      .andWhere(`DATE(grid.event_start) = '${dayToSearch}'`)
      .orderBy('event_start')
      .getSql();
   
    return await connection.getRepository(Channel).query(cmdSql)
    .catch(error => {
      throw new ServiceUnavailableException(error.message);
    });

      /*  
      // Método usando puro TypeORM 
      return await connection.getRepository(Grid)
      .find({
        relations: ['channel'],
        where: {
          channel: channelId
        }
      })
      */
  }
}
