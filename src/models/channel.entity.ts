import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

// Entities
import { Grid } from "./grid.entity";

@Entity({
  name: 'channels',
  database: 'globosat'
})
export class Channel {
  @PrimaryGeneratedColumn()
  public id?: number;
  
  // Relations
  @OneToMany(type => Grid, grid => grid.channel)
  grids: Grid[];

  // Columns
  @Column()
  public name!: string;
}
