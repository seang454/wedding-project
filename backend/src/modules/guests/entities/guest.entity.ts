import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Wedding } from '../../weddings/entities/wedding.entity';
import { Gift } from '../../gifts/entities/gift.entity';

export enum GuestSide {
  GROOM = 'GROOM',
  BRIDE = 'BRIDE',
  BOTH = 'BOTH',
}

export enum InvitationStatus {
  INVITED = 'INVITED',
  ATTENDED = 'ATTENDED',
  DECLINED = 'DECLINED',
}

@Entity('guests')
@Index('idx_guests_search', ['weddingId', 'name'])
@Index('idx_guests_phone', ['weddingId', 'phone'])
export class Guest {
  @PrimaryGeneratedColumn('uuid') // Auto-generates UUID automatically!
  id: string;

  @Column({ name: 'wedding_id', type: 'uuid' })
  weddingId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: GuestSide.BOTH,
  })
  side: GuestSide;

  @Column({ length: 50, nullable: true })
  relationship: string;

  @Column({ name: 'table_number', type: 'int', nullable: true })
  tableNumber: number;

  @Column({
    name: 'invitation_status',
    type: 'varchar',
    length: 20,
    default: InvitationStatus.INVITED,
  })
  invitationStatus: InvitationStatus;

  // Cambodia Address (Populated via Next.js location dropdowns)
  @Column({ length: 100, nullable: true })
  province: string;

  @Column({ length: 100, nullable: true })
  district: string;

  @Column({ length: 100, nullable: true })
  commune: string;

  @Column({ length: 100, nullable: true })
  village: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Wedding, (wedding) => wedding.guests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wedding_id' })
  wedding: Wedding;

  @OneToMany(() => Gift, (gift) => gift.guest)
  gifts: Gift[];
}
