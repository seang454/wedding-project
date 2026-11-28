import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Wedding } from '../../weddings/entities/wedding.entity';
import { Gift } from '../../gifts/entities/gift.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  CLERK = 'CLERK',
  ACCOUNTANT = 'ACCOUNTANT',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') // Auto-generates UUID automatically!
  id: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ unique: true, nullable: true, length: 255 })
  email: string;

  @Column({ unique: true, nullable: true, length: 30 })
  phone: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255, nullable: true })
  refreshTokenHash?: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.CLERK,
  })
  role: UserRole;

  @Column({ name: 'created_by_owner_id', type: 'uuid', nullable: true })
  createdByOwnerId?: string;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Wedding, (wedding) => wedding.owner)
  weddings: Wedding[];

  @ManyToMany(() => Wedding, (wedding) => wedding.clerks)
  @JoinTable({
    name: 'wedding_clerks',
    joinColumn: { name: 'clerk_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'wedding_id', referencedColumnName: 'id' },
  })
  assignedWeddings: Wedding[];

  @OneToMany(() => Gift, (gift) => gift.recordedByUser)
  recordedGifts: Gift[];
}
