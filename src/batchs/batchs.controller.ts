import { Controller, Delete, Get, Param, Query, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { DeleteResult, getConnection, QueryRunner } from 'typeorm';

// Decorators
import { GetLanguage } from 'src/common/get-language.decorator';
import { RolesRequired } from 'src/common/roles-required.decorator';
// Existing ROLES (enum)
import { UserRoles } from 'src/user/user.roles';
// Services
import { TranslateService } from 'src/shared/translate.service';
import { AuthGuard } from 'src/shared/auth.guard';
// Entities
import { Batch } from 'src/models/batch.entity';
import { Grid } from 'src/models/grid.entity';

@Controller('api/batchs')
export class BatchsController {
  
  constructor(
    private translate: TranslateService
  ) {}

  // Delete a batch
  @Delete('/:id')
  @RolesRequired(UserRoles.EDITOR)
  @UseGuards(AuthGuard)
  async deleteBatch(
    @GetLanguage() language: string,
    @Param('id') id: number,
  ): Promise<{[key: string]: any}> {

    // Variables
    let batchIdToDelete: string;

    const connection = getConnection('SEXYHOT');
    // Get the batchId to delete
    await connection.getRepository(Batch).findOneOrFail({ id })
      .then(batch => batchIdToDelete = batch.batchId)
      .catch(error => {
        throw new ServiceUnavailableException(error.message);  
      })
    
    // Delete
    let gridEventsDeleted = 0;
    let queryRunner: QueryRunner;
    try {
      console.log(`*** START TRANSACTION (delete batch: ${batchIdToDelete} (${id}))`);
      queryRunner = connection.createQueryRunner();
      await queryRunner.connect()  // Establish real database connection
        .catch(error => { throw new Error(error.message); });  
      await queryRunner.startTransaction()  // Open a new transaction
        .catch(error => { throw new Error(error.message); });

      // Delete all the grids event for the batchId to delete
      await connection.getRepository(Grid).delete({ batchId: batchIdToDelete})
        .then(data => gridEventsDeleted = data.affected)
        .catch(error => { throw new Error(error.message); });
      // Delete the batch
      await connection.getRepository(Batch).delete(id)
      .catch(error => { throw new Error(error.message); });

    } catch (error) {
      console.log();
      console.log('*** ROLLBACK');
      queryRunner?.rollbackTransaction();
      queryRunner?.release();  // Release DBase transaction
      throw new ServiceUnavailableException(error.message);
    }

    // Commit transaction
    try {
      console.log('*** COMMIT');
      queryRunner?.commitTransaction();
      queryRunner?.release();  // Release DBase transaction
    } catch (error) {
      console.log('*** ROLLBACK');
      queryRunner?.rollbackTransaction();
      queryRunner?.release();  // Release DBase transaction
      throw new ServiceUnavailableException(error.message);
    }

    const msg = await this.translate.key('BATCH-DELETE-OK', language);  // Batch deleted. Grid Events deleted::
    console.log(`${msg} ${gridEventsDeleted}.`);
    return {message: `${msg} ${gridEventsDeleted}.`}
  }

  // Get all batchs
  @Get('')
  @RolesRequired(UserRoles.READER, UserRoles.EDITOR)
  @UseGuards(AuthGuard)
  async getAll(
    @GetLanguage() language: string,
    @Query('channel_name') channelName: number,
    @Query('page_no') pageNo: number,
    @Query('recs_page') recsPerPage: number,
    @Query('sort_field') sortField: string,
    @Query('sort_direction') sortDirection: string
  ): Promise<Batch[]> {
    
    // Create query params
    const connection = getConnection('SEXYHOT')
    const orderBy = sortDirection ? sortDirection.toUpperCase() : `ASC`;
    const cmdSql =  connection.getRepository(Batch)
    .createQueryBuilder('batch')
    .select('batch.id', 'id')
    .addSelect('batch.batch_id', 'batchId')
    .addSelect('batch.channel_name', 'channelName')
    .addSelect('batch.first_event', 'firstEvent')
    .addSelect('batch.last_event', 'lastEvent')
    .addSelect('batch.total_events', 'totalEvents')
    .addSelect('batch.created_at', 'createdAt')
    .addSelect('batch.created_by', 'createdBy')
    .where(channelName ? `channel_name = '${channelName}'` : null)
    .orderBy(sortField ? sortField : null, orderBy === 'ASC' ? 'ASC' : 'DESC')
    .skip(pageNo ? ((pageNo - 1) * recsPerPage) : null)
    .take(recsPerPage ? recsPerPage : null)
    .getSql();
    
    return await connection.query(cmdSql)
    .catch(error => {
      throw new ServiceUnavailableException(error.message);
    });
  }

  // Get the total of batchs in the DBase
  @Get('total')
  @RolesRequired(UserRoles.READER, UserRoles.EDITOR)
  @UseGuards(AuthGuard)
  async getTotal(): Promise<{[key: string]: number}> {
        
    const connection = getConnection('SEXYHOT')
    return await connection.getRepository(Batch).count()
    .then(total => {
      return { total };
    })
    .catch(error => {
      throw new ServiceUnavailableException(error.message);
    });
  }

}
