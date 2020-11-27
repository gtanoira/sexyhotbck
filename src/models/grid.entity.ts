import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import * as moment from 'moment';

// Entities
import { Channel } from "./channel.entity";

@Entity({
  name: 'grids',
  database: 'globosat'
})
export class Grid {
  @PrimaryGeneratedColumn()
  public id?: number;

  // Relations
  @ManyToOne(type => Channel, channel => channel.grids)
  @JoinColumn({ name: 'channel_id', referencedColumnName: 'id' })
  public channel!: Channel;

  //Columns
  @Column({ name: 'event_start', type: 'datetime' })
  public eventStart!: string;
 
  @Column({ name: 'event_duration' })
  public eventDuration!: string;
  
  public get eventEnd(): string {
    const time = this.eventDuration.split(':');
    return moment(this.eventEnd)
      .add(time[0], 'hours')
      .add(time[1], 'minutes')
      .add(time[2], 'seconds')
      .toISOString();
  }
 
  @Column({name: 'event_id', type: 'int'})
  public eventId!: number;

  @Column({ name: 'event_title' })
  public eventTitle!: string;

  @Column()
  public director?: string;

  @Column()
  public cast1?: string;

  @Column()
  public cast2?: string;

  @Column({ name: 'title_season' })
  public titleSeason?: string;

  @Column({ length: 1000 })
  public synopsis?: string;
}
