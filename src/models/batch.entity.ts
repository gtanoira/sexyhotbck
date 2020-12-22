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

  @Column({ name: 'created_at', type: 'datetime' })
  public createdAt?: Date | null;

  @Column({ name: 'created_by' })
  public createdBy!: string;

  @Column()
  public description?: string;

  @Column({ name: 'channel_name' })
  public channelName?: string;

}
