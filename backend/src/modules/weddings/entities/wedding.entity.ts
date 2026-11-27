import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BankAccount } from '../../bank-accounts/entities/bank-account.entity';
import { Guest } from '../../guests/entities/guest.entity';
import { Gift } from '../../gifts/entities/gift.entity';

@Entity('weddings')
export class Wedding {
  @PrimaryGeneratedColumn('uuid') // Auto-generates UUID automatically!
  id: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ name: 'groom_name', length: 100 })
  groomName: string;

  @Column({ name: 'bride_name', length: 100 })
  brideName: string;

  @Column({ name: 'wedding_date', type: 'date' })
  weddingDate: Date;

  @Column({ length: 255, nullable: true })
  venue: string;

  @Column({ length: 100, nullable: true })
  province?: string;

  @Column({ length: 100, nullable: true })
  district?: string;

  @Column({ length: 100, nullable: true })
  commune?: string;

  @Column({ length: 30, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({
    name: 'target_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  targetAmount: number;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.weddings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => BankAccount, (account) => account.wedding)
  bankAccounts: BankAccount[];

  @OneToMany(() => Guest, (guest) => guest.wedding)
  guests: Guest[];

  @OneToMany(() => Gift, (gift) => gift.wedding)
  gifts: Gift[];

  @ManyToMany(() => User, (user) => user.assignedWeddings)
  clerks: User[];
}
