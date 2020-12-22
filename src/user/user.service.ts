import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';

// DTO's
import { UserDto, UserRODto } from './user.dto';
// Schemas
import { User } from '../models/user.entity';
//Services
import { TranslateService } from 'src/shared/translate.service';

@Injectable()
export class UserService {

  private connection = getConnection('SEXYHOT')

  constructor(
    private translate: TranslateService
  ) {}

  // Return all users
  public async getAllUsers(): Promise<UserRODto[]> {
    return await this.connection.getRepository(User).find()
    .then(users => users.map(user => user.toResponse(false)))
    .catch(error => {
      return Promise.reject(error);
    });
  }

  public async login(data: UserDto, language: string): Promise<UserRODto> {
    const { userId, password } = data;
    const user = await this.connection.getRepository(User).findOne({userId});

    // Check for existing user and correct password
    if (!user || await user.okPassword(password) === false) {
      return Promise.reject(await this.translate.key('GS-005', language));
    }
    // Response user with token
    return user.toResponse(true);
  }

  // Register new users
  public async register(data: UserDto, language: string): Promise<UserRODto> {
    const user = await this.connection.getRepository(User).findOne({userId: data.userId});

    // Check if exists
    if (user) {
      return Promise.reject(await this.translate.key('GS-006', language));
    }

    // Prepare data
    const userData = data;
    userData['name'] = userData['userName'];  // change userName to name
    delete userData['userName'];
    // Create user in the DBase
    const newUser = this.connection.getRepository(User).create(userData);
    return await this.connection.getRepository(User).save(newUser)
    .then(data => {
      return data.toResponse(false);
    })
    .catch(error => {
      return Promise.reject(`${async () => await this.translate.key('GS-007', language)} ${data.userId} (${error.message})`)
    });
  }
}
