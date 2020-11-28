import { BadRequestException, Catch, Controller, Get, Param, Post, ServiceUnavailableException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { getConnection, QueryRunner } from 'typeorm';
import * as xmlJs from 'xml-js';
import * as moment from 'moment';

// Constant
import { oneFileMemoryMulterOptions } from './one-file-opts.multer';
//Entities, interfaces
import { Channel } from 'src/models/channel.entity';
import { Grid } from 'src/models/grid.entity';
import { ScheduleEvent, XmlGrid } from 'src/models/xml-grid.interface';

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
    
  // Post a grid using a XML file
  @Post('/:channelId/upload/xml')
  @UseInterceptors(FileInterceptor('xmlFile', oneFileMemoryMulterOptions))
  async addGrid(
    @Param('channel') channelId: number,
    @UploadedFile() xmlFile: Express.Multer.File
  ): Promise<{[key: string]: any}> {

    // Connect to the DBase
    const connection = getConnection('GLOBOSAT');

    // Convert XML to JSON
    let gridJson: XmlGrid;
    try {
      gridJson = JSON.parse(xmlJs.xml2json(xmlFile.buffer.toString(), {compact: true, spaces: 2}));
    } catch (error) {
      throw new BadRequestException(`GS-002(E): parsing XML file (${error.message})`);
    }

    // Validate the channelId
    let channelInfo: Channel;
    try {
      await connection.getRepository(Channel).findOne(channelId)
      .then(channel => { channelInfo = channel })
      .catch(error => { Promise.reject(error.message); })
    } catch (error) {
      throw new BadRequestException(`GS-003(E): the channel (${channelId}) doesn't exists.` )
    }
    
    // Create batch info
    console.log('*** channelInfo:', channelInfo);
    const batchId = `${channelId}-${channelInfo.name}-${moment().format('YYYYMMDD-HHMMSS')}`;
    const batchUserId = 'globosat';
    
    // Obtain the schedule items
    const events = <ScheduleEvent[]>gridJson.ListingExport.ListingExportItem;

    // Save the schedule items into the grids table
    let queryRunner: QueryRunner;
    let recsInserted = 0;  // recs saved
    try {

      // Start DBase transaction
      console.log('*** START TRANSACTION');
      const queryRunner: QueryRunner = connection.createQueryRunner();
      await queryRunner.connect()  // Establish real database connection
        .catch(error => { Promise.reject(error.message); });  
      await queryRunner.startTransaction()  // Open a new transaction
        .catch(error => { Promise.reject(error.message); });

      for (const event of events) {
        // Prepare some data
        const eventStart = moment(`${event.scheduleDate._text} ${this.setTime(event.ScheduleItens.ScheduleItem.startTime._text)}`, 'MM-DD-YY HH:MM:SS').format('YYYY-MM-DD HH:MM:SS');
        
        // Create new schedule event
        const gridEvent: Grid = {
          channel: channelInfo,
          eventStart,
          eventDuration: event.ScheduleItens.ScheduleItem.titleDuration._text,
          eventId: +event.ScheduleItens.ScheduleItem.eventProfileId._text,
          eventTitle: event.ScheduleItens.ScheduleItem.titleName._text,
          director: event.ScheduleItens.ScheduleItem.director._text,
          cast1: event.ScheduleItens.ScheduleItem.cast1._text,
          cast2: event.ScheduleItens.ScheduleItem.cast2._text,
          titleSeason: event.ScheduleItens.ScheduleItem.titleSeason._text,
          synopsis: event.ScheduleItens.ScheduleItem.titleSynopsis._text
        };

        // Save the event
        await connection.getRepository(Grid).insert(gridEvent)
        .then(() => { recsInserted += 1; })
        .catch(error => { Promise.reject(`GS-004(E): inserting schedule event ${gridEvent.eventId} @ ${gridEvent.eventStart} (${error.message})`); })
      }
      
    } catch (error) {
      queryRunner.rollbackTransaction();
      queryRunner.release();  // Release DBase transaction
      throw new ServiceUnavailableException(error);
    }

    // Commit transaction
    try {
      queryRunner.commitTransaction();
    } catch (error) {
      queryRunner.rollbackTransaction();
      queryRunner.release();  // Release DBase transaction
      throw new ServiceUnavailableException(error);
    }

    return {message: `File succesfully uploaded. ${recsInserted} schedule events were saved.`}
  }

  private setTime(duration: string): string {
    let rtnTime = '00:00:00';
    if (duration.indexOf(':')) {
      const timeDuration = duration.split(':');
      rtnTime = `${this.lPad(timeDuration[0], '0', 2)}:${this.lPad(timeDuration[1], '0', 2)}:00`;
    }
    return rtnTime;
  }

  private lPad(data: string, character: string, count: number): string {
    const rtnData = `${character.repeat(count)}${data.trim()}`;
    return rtnData.substr(rtnData.length - count, rtnData.length);
  }
}
