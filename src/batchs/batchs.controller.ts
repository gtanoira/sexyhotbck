import { Controller, Get, Query, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { getConnection } from 'typeorm';

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

@Controller('api/batchs')
export class BatchsController {
  
  constructor(
    private translate: TranslateService
  ) {}

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
    console.log();
    console.log('*** channelName:', channelName);
    console.log('*** pageNo:', pageNo);
    console.log('*** recsPerPage:', recsPerPage);
    console.log('*** sortField:', sortField);
    console.log('*** sortDirection:', sortDirection);
    
    // Create query params
    const connection = getConnection('SEXYHOT')
    const orderBy = sortDirection ? sortDirection.toUpperCase() : `ASC`;
    console.log('*** orderBy:', orderBy);    
    const cmdSql =  connection.getRepository(Batch)
    .createQueryBuilder('')
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
    console.log('*** SQL:', cmdSql);
    
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
