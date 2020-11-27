import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

// Entities
import { GridEntity } from "./grid.entity";

@Entity({
  name: 'channels',
  database: 'globosat'
})
export class ChannelEntity {
  @PrimaryGeneratedColumn()
  public id?: number;
  
  // Relations
  @OneToMany(type => GridEntity, grid => grid.channel)
  grids: GridEntity[];

  // Columns
  @Column()
  public name!: string;
}
