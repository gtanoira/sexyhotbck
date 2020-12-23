import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import * as moment from 'moment';

// Entities
import { Channel } from "./channel.entity";

@Entity({
  name: 'grids',
  database: 'sexyhot'
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

  @Column({name: 'event_id', type: 'int'})
  public eventId!: number;

  @Column({ name: 'event_title' })
  public eventTitle!: string;

  @Column({ default: null })
  public director?: string;

  @Column({ default: null })
  public cast1?: string;

  @Column({ default: null })
  public cast2?: string;

  @Column({ name: 'title_season', default: null })
  public titleSeason?: string;

  @Column({ length: 1000, default: null })
  public synopsis?: string;

  @Column({ name: 'batch_id' })
  public batchId?: string;
}
