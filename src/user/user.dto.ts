import { IsNotEmpty } from 'class-validator';

export class UserDto {
  @IsNotEmpty({message: 'The userId cannot be empty.'})
  public userId!: string;

  public userName?: string;
  
  @IsNotEmpty({message: 'The password cannot be empty..'})
  public password!: string;
}

// User Response DTO
export class UserRODto {
  public userId!: string;
  public userName?: string;
  public createdAt!: Date;
  public token?: string;
}
