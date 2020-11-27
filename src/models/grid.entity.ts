import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import * as moment from 'moment';

// Entities
import { ChannelEntity } from "./channel.entity";

@Entity({
  name: 'grids',
  database: 'globosat'
})
export class GridEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  // Relations
  @ManyToOne(type => ChannelEntity, channel => channel.id)
  public channel!: ChannelEntity;

  //Columns
  @Column({ type: 'datetime', comment: 'Starting Date & Time (YYYY-MM-DD HH24:MI:SS) for the event' })
  public eventStart!: string;
 
  @Column({ comment: 'Duration (HH:MM:SS) of the event'})
  public eventDuration!: string;
  
  public get eventEnd(): string {
    const time = this.eventDuration.split(':');
    return moment(this.eventEnd)
      .add(time[0], 'hours')
      .add(time[1], 'minutes')
      .add(time[2], 'seconds')
      .toISOString();
  }
 
  @Column({type: 'int'})
  public eventId!: number;

  @Column()
  public eventTitle!: string;

  @Column()
  public director?: string;

  @Column()
  public cast1?: string;

  @Column()
  public cast2?: string;

  @Column()
  public titleSeason?: string;

  @Column({ length: 1000 })
  public synopsis?: string;
}
