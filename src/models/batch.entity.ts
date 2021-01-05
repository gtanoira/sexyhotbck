import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'batchs',
  database: 'sexyhot'
})
export class Batch {
  @PrimaryGeneratedColumn()
  public id?: number;

  // Columns
  @Column({ name: 'batch_id' })
  public batchId!: string;
  
  @Column({ name: 'channel_name' })
  public channelName?: string;
  
  @Column({ name: 'first_event', type: 'datetime' })
  public firstEvent: string;
  
  @Column({ name: 'last_event', type: 'datetime' })
  public lastEvent: string;
  
  @Column({ name: 'total_events', type: 'int', default: 0 })
  public totalEvents: number;

  @Column({ name: 'created_at', type: 'datetime' })
  public createdAt?: Date | null;

  @Column({ name: 'created_by' })
  public createdBy!: string;

}
