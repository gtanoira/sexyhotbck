import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

// Environment
import { SECRET_KEY } from '../environment/environment.settings';
// DTO's
import { UserRODto } from 'src/user/user.dto';

import { UserRoles } from '../user/user.roles';


@Entity({
  name: 'users'
})
export class User {

  @PrimaryGeneratedColumn()
  public id: string;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @Column({
    name: 'user_id',
    type: String, 
    unique: true
  })
  public userId!: string;

  @Column({ default: '' })
  public name?: string;

  @Column({ default: 'reader' })
  public roles?: string;

  @Column({ type: 'text' })
  public password!: string;

  @BeforeInsert()
  private async beforeInsert(): Promise<void> {
    // Hash password field
    this.password = await bcrypt.hash(this.password, 10);
   }

  // What to show as response from a http request
  public toResponse(showToken = true): UserRODto {
    const responseObj = { 
      id: this.id,
      userId: this.userId,
      userName: this.name,
      roles: this.roles,
      createdAt: this.createdAt
    };
    if (showToken) {
      responseObj['token'] = this.token;
    }
    return responseObj;
  }

  // Validate the password received in a http request
  public async okPassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }

  // Generate a token with expiration time
  private get token() {
    const {id, userId, roles } = this;
    return jwt.sign(
      { id, userId, roles },
      SECRET_KEY,
      { expiresIn: '1d'}
    );
  }

}
