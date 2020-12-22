import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'i18n',
  database: 'sexyhot'
})
export class i18n {
  @PrimaryGeneratedColumn()
  public id?: number;
  
  // Columns
  @Column()
  public key!: string;

  @Column()
  public language!: string;

  @Column()
  public text!: string;

}
