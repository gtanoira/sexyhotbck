import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

// Environment
import { SECRET_KEY } from '../environment/environment.settings';
// DTO's
import { UserRODto } from 'src/user/user.dto';

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

  @Column({ type: 'text' })
  public password!: string;

  @BeforeInsert()
  private async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  public toResponse(showToken = true): UserRODto {
    const responseObj = { 
      id: this.id,
      userId: this.userId,
      userName: this.name,
      createdAt: this.createdAt
    };
    if (showToken) {
      responseObj['token'] = this.token;
    }
    return responseObj;
  }

  public async okPassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }

  private get token() {
    const {id, userId } = this;
    return jwt.sign(
      { id, userId },
      SECRET_KEY,
      { expiresIn: '1d'}
    );
  }

}
