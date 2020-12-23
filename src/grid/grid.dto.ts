import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, MinLength, ValidateNested } from 'class-validator';

export class GridItem {
  @IsNotEmpty({message: 'The eventStart cannot be empty.'})
  @IsDateString({message: 'The eventStart has an incorrect format: YYYY-MM-DDThh:mm:ssZ'})
  public eventStart!: string;
  
  @IsNotEmpty({message: 'The eventDuration cannot be empty.'})
  public eventDuration!: string;

  @IsNotEmpty({message: 'The eventId cannot be empty.'})
  public eventId!: string;

  @IsNotEmpty({message: 'The eventTitle cannot be empty.'})
  public eventTitle!: string;

  public director?: string;

  public cast1?: string;

  public cast2?: string;

  public titleSeason?: string;

  public synopsis?: string;

}

export class GridDto {
  @Type(() => GridItem)
  @ValidateNested({ each: true })
  public events?: GridItem[];
}

// Grid Response Object DTO
export class GridRODto {
  public id!: number;
  public director?: string;
  public cast1?: string;
  public cast2?: string;
  public synopsis?: string;
  public channel?: string;
  public eventStart!: string;
  public eventDuration!: string;
  public eventEnd!: string;
  public eventId!: string;
  public eventTitle!: string;
  public titleSeason?: string;
}
