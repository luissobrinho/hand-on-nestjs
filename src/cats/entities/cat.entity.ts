import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  breed: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updated_at: Date;
}
