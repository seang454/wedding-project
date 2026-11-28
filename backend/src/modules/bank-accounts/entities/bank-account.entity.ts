import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Wedding } from '../../weddings/entities/wedding.entity';
import { Gift } from '../../gifts/entities/gift.entity';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid') // Auto-generates UUID automatically!
  id: string;

  @Column({ name: 'wedding_id', type: 'uuid' })
  weddingId: string;

  @Column({ name: 'bank_name', length: 100 })
  bankName: string;

  @Column({ name: 'account_name', length: 100 })
  accountName: string;

  @Column({ name: 'account_number', length: 50 })
  accountNumber: string;

  @Column({ name: 'qr_image_url', type: 'text', nullable: true })
  qrImageUrl: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Wedding, (wedding) => wedding.bankAccounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wedding_id' })
  wedding: Wedding;

  @OneToMany(() => Gift, (gift) => gift.bankAccount)
  gifts: Gift[];
}
