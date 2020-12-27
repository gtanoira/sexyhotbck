import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  ServiceUnavailableException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { getConnection, QueryRunner } from 'typeorm';
import * as xmlJs from 'xml-js';
import * as moment from 'moment';

// Constant
import { oneFileMemoryMulterOptions } from './one-file-opts.multer';
// Decorators
import { GetLanguage } from 'src/common/get-language.decorator';
import { GetUser } from 'src/common/get-user.decorator';
import { RolesRequired } from 'src/common/roles-required.decorator';
// Existing ROLES (enum)
import { UserRoles } from 'src/user/user.roles';
// Services
import { AuthGuard } from 'src/shared/auth.guard';
import { TranslateService } from 'src/shared/translate.service';
//Entities, interfaces
import { Batch } from 'src/models/batch.entity';
import { Channel } from 'src/models/channel.entity';
import { Grid } from 'src/models/grid.entity';
import { GridDto } from './grid.dto';
import { ScheduleEvent, XmlGrid } from 'src/models/xml-grid.interface';
import { User } from 'src/models/user.entity';

@Controller('api/grids')
export class GridController {

  constructor(
    private translate: TranslateService
  ) {}

  // Variable for COMMIT / ROLLBACK transactions
  private queryRunner: QueryRunner;

  // Get all schedule events of a channel for a particular day
  @Get('/:channel/:schYear/:schMonth/:schDay')
  @RolesRequired(UserRoles.READER, UserRoles.EDITOR)
  @UseGuards(AuthGuard)
  async getAll(
    @Param('channel') pchannelId: number,
    @Param('schYear') schYear: string,
    @Param('schMonth') schMonth: string,
    @Param('schDay') schDay: string
  ): Promise<Grid[]> {
    const dayToSearch = `${schYear}-${schMonth}-${schDay}`;
    
    const connection = getConnection('SEXYHOT')
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
  @RolesRequired(UserRoles.EDITOR)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('xmlFile', oneFileMemoryMulterOptions))
  async addGridFromXml(
    @GetLanguage() language: string,
    @Param('channelId') channelId: number,
    @UploadedFile() xmlFile: Express.Multer.File
  ): Promise<{[key: string]: any}> {

    // Connect to the DBase
    const connection = getConnection('SEXYHOT');

    // Convert XML to JSON
    let gridJson: XmlGrid;
    try {
      gridJson = JSON.parse(xmlJs.xml2json(xmlFile.buffer.toString(), {compact: true, spaces: 2}));
    } catch (error) {
      const msg = await this.translate.key('GS-002', language);  // GS-002(E): parsing XML file
      throw new BadRequestException(`${msg} (${error.message})`);
    }

    // Validate the channelId
    let channelInfo: Channel;
    try {
      await connection.getRepository(Channel).findOneOrFail({ id: channelId })
      .then(channel => { 
        channelInfo = channel;
      })
      .catch(error => { 
        throw new Error(error.message) ;
      })
    } catch (error) {
      const msg = await this.translate.key('GS-003', language);  // GS-003(E): the channel doesn't exists.
      throw new BadRequestException(`${msg} (${channelId})`);
    }
    
    // Obtain the schedule items
    const events = <ScheduleEvent[]>gridJson.ListingExport.ListingExportItem;
    
    // Create batch info
    const recBatch = new Batch();
    const batchId = `${channelId}-${channelInfo.name}-${moment().format('YYYYMMDD-HHMMSS')}`;
    recBatch.batchId = batchId;
    recBatch.channelName = channelInfo.name;
    recBatch.createdBy = 'admin';
    recBatch.createdAt = moment().toDate();
    recBatch.firstEvent = this.setDateTime(events[0].scheduleDate._text, events[0].ScheduleItens.ScheduleItem.startTime._text);
    let batchDateEnd = null;

    // Save the schedule items into the grids table
    let recsInserted = 0;  // recs saved
    try {

      // Start DBase transaction
      console.log('*** START TRANSACTION');
      this.queryRunner = connection.createQueryRunner();
      await this.queryRunner.connect()  // Establish real database connection
        .catch(error => { throw new Error(error.message); });  
      await this.queryRunner.startTransaction()  // Open a new transaction
        .catch(error => { throw new Error(error.message); });

      for (const event of events) {

        batchDateEnd = this.setDateTime(event.scheduleDate._text, event.ScheduleItens.ScheduleItem.startTime._text);

        // Create new schedule event
        const gridEvent: Grid = {
          channel: channelInfo,
          eventStart: this.setDateTime(event.scheduleDate._text, event.ScheduleItens.ScheduleItem.startTime._text),
          eventDuration: event.ScheduleItens.ScheduleItem.titleDuration._text,
          eventId: +event.ScheduleItens.ScheduleItem.eventProfileId._text,
          eventTitle: event.ScheduleItens.ScheduleItem.titleName._text ? event.ScheduleItens.ScheduleItem.titleName._text : 'no title',
          director: event.ScheduleItens.ScheduleItem.director._text,
          cast1: event.ScheduleItens.ScheduleItem.cast1._text,
          cast2: event.ScheduleItens.ScheduleItem.cast2._text,
          titleSeason: event.ScheduleItens.ScheduleItem.titleSeason._text,
          synopsis: event.ScheduleItens.ScheduleItem.titleSynopsis._text,
          batchId
        };

        // Save the event
        await connection.getRepository(Grid).insert(gridEvent)
        .then(() => { recsInserted += 1; })
        .catch(async error => {
          const msg = await this.translate.key('GS-004', language);  // GS-004(E): inserting schedule event
          throw new Error(`${msg} ${gridEvent.eventId} @ ${gridEvent.eventStart} (${error.message})`);
        })
      }
      
    } catch (error) {
      console.log();
      console.log('*** ROLLBACK');
      this.queryRunner?.rollbackTransaction();
      this.queryRunner?.release();  // Release DBase transaction
      throw new ServiceUnavailableException(error.message);
    }

    // Save batch
    try {
      // save batch record
      recBatch.lastEvent = batchDateEnd;
      await connection.getRepository(Batch)
      .save(recBatch)
      .catch(async error => {
        const msg = await this.translate.key('DBASE-SAVE', language);  // Error saving record BATCH
        throw new Error(`${msg} BATCH: ${error.message}`);
      });

    } catch (error) {
      console.log('*** ROLLBACK:', error.message);
      this.queryRunner?.rollbackTransaction();
      this.queryRunner?.release();  // Release DBase transaction
      throw new ServiceUnavailableException(error.message);
    }

    // Commit transaction
    try {
      console.log('*** COMMIT');
      this.queryRunner?.commitTransaction();
    } catch (error) {
      console.log('*** ROLLBACK');
      this.queryRunner?.rollbackTransaction();
      this.queryRunner?.release();  // Release DBase transaction
      throw new ServiceUnavailableException(error.message);
    }

    const msg = await this.translate.key('GRID-UPLOAD-OK', language);  // Grid successfully uploaded. Events saved:
    return {message: `${msg} ${recsInserted}.`}
  }
    
  // Post a grid using a JSON object in the body
  @Post('/:channelId/upload/json')
  @RolesRequired(UserRoles.EDITOR)
  @UseGuards(AuthGuard)
  //@UsePipes(new ValidationPipe({errorHttpStatusCode: HttpStatus.BAD_REQUEST}))
  async addGridFromJson(
    @Param('channelId') channelId: number,
    @Body(new ValidationPipe()) gridJson: GridDto,
    @GetLanguage() language: string,
    @GetUser() user: User
  ): Promise<{[key: string]: any}> {

    if (!gridJson && gridJson.events.length <= 0) {
      const msg = await this.translate.key('GS-011', language);  // GS-011(E): there is nothing to process.
      throw new BadRequestException(msg);
    }
    // Connect to the DBase
    const connection = getConnection('SEXYHOT');

    // Validate the channelId
    let channelInfo: Channel;
    try {
      await connection.getRepository(Channel).findOneOrFail({ id: channelId })
      .then(channel => { 
        channelInfo = channel;
      })
      .catch(error => { 
        throw new Error(error.message) ;
      })
    } catch (error) {
      const msg = await this.translate.key('GS-003', language);  // GS-003(E): the channel doesn't exists.
      throw new BadRequestException(`${msg} (${channelId})`);
    }
    
    // Create batch info
    const recBatch = new Batch();
    const batchId = `${channelId}-${channelInfo.name}-${moment().format('YYYYMMDD-HHMMSS')}`;
    recBatch.batchId = batchId;
    recBatch.channelName = channelInfo.name;
    recBatch.createdBy = 'admin';
    recBatch.createdAt = moment().toDate();
    recBatch.firstEvent = moment(gridJson.events[0].eventStart).utc().toISOString();
    let batchDateEnd = null;

    // Save the schedule items into the grids table
    let recsInserted = 0;  // recs saved
    try {

      // Start DBase transaction
      console.log('*** START TRANSACTION');
      this.queryRunner = connection.createQueryRunner();
      await this.queryRunner.connect()  // Establish real database connection
        .catch(error => { throw new Error(error.message); });  
      await this.queryRunner.startTransaction()  // Open a new transaction
        .catch(error => { throw new Error(error.message); });

      for (const event of gridJson.events) {

        batchDateEnd = moment(event.eventStart).utc().toISOString();

        // Create new schedule event
        const gridEvent: Grid = {
          channel: channelInfo,
          eventStart: event.eventStart,
          eventDuration: event.eventDuration,
          eventId: +event.eventId,
          eventTitle: event.eventTitle ? event.eventTitle : 'no title',
          director: event.director,
          cast1: event.cast1,
          cast2: event.cast2,
          titleSeason: event.titleSeason,
          synopsis: event.synopsis,
          batchId
        };

        // Save the event
        await connection.getRepository(Grid).insert(gridEvent)
        .then(() => { recsInserted += 1; })
        .catch(async error => {
          const msg = await this.translate.key('GS-004', language);  // GS-004(E): inserting schedule event
          throw new Error(`${msg} ${gridEvent.eventId} @ ${gridEvent.eventStart} (${error.message})`);
        })
      }
      
    } catch (error) {
      console.log();
      console.log('*** ROLLBACK');
      this.queryRunner?.rollbackTransaction();
      this.queryRunner?.release();  // Release DBase transaction
      throw new ServiceUnavailableException(error.message);
    }

    // Save batch
    try {
      // save batch record
      recBatch.lastEvent = batchDateEnd;
      await connection.getRepository(Batch)
      .save(recBatch)
      .catch(async error => {
        const msg = await this.translate.key('DBASE-SAVE', language);  // Error saving record BATCH
        throw new Error(`${msg} BATCH: ${error.message}`);
      });

    } catch (error) {
      console.log('*** ROLLBACK:', error.message);
      this.queryRunner?.rollbackTransaction();
      this.queryRunner?.release();  // Release DBase transaction
      throw new ServiceUnavailableException(error.message);
    }

    // Commit transaction
    try {
      console.log('*** COMMIT');
      this.queryRunner?.commitTransaction();
    } catch (error) {
      console.log('*** ROLLBACK');
      this.queryRunner?.rollbackTransaction();
      this.queryRunner?.release();  // Release DBase transaction
      throw new ServiceUnavailableException(error.message);
    }

    const msg = await this.translate.key('GRID-UPLOAD-OK', language);  // Grid successfully uploaded. Events saved:
    return {message: `${msg} ${recsInserted}.`}
  }

  // Create a date in the format YYYY-MM-DDTHH:MM:SSZ (UTC) and return null if there is a problem
  private setDateTime(day: string, duration: string): string {
    
    // Set Date
    const auxDate = day.indexOf('/') < 0 ? day.split('-') : day.split('/');
    const rtnDate = `20${this.lPad(auxDate[2], '0', 2)}-${this.lPad(auxDate[0], '0', 2)}-${this.lPad(auxDate[1], '0', 2)}`;

    // Set Time
    const timeDuration = duration.split(':');
    const rtnTime = `${this.lPad(timeDuration[0], '0', 2)}:${this.lPad(timeDuration[1], '0', 2)}:00`;

    // Validate the day created
    let rtnValue = `${rtnDate}T${rtnTime}Z`;
    try {
      const xxx = moment(rtnValue).utc();
    } catch (error) {
      rtnValue = null;
    }
    return rtnValue;
  }

  // Left padding
  private lPad(data: string, character: string, count: number): string {
    const rtnData = `${character.repeat(count)}${data.trim()}`;
    return rtnData.substr(rtnData.length - count, rtnData.length);
  }
}
