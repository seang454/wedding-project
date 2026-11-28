import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Wedding } from '../../weddings/entities/wedding.entity';
import { Guest } from '../../guests/entities/guest.entity';
import { BankAccount } from '../../bank-accounts/entities/bank-account.entity';
import { User } from '../../users/entities/user.entity';

export enum GiftCurrency {
  USD = 'USD',
  KHR = 'KHR',
  THB = 'THB',
  EUR = 'EUR',
}

export enum PaymentMethod {
  CASH = 'CASH',
  QR_CODE = 'QR_CODE',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

@Entity('gifts')
@Index('idx_gifts_wedding_date', ['weddingId', 'createdAt'])
@Index('idx_gifts_guest', ['guestId'])
@Index('idx_gifts_active_guest', ['guestId'], {
  unique: true,
  where: '"is_deleted" = false',
})
@Index('idx_gifts_bank', ['bankAccountId'])
@Index('idx_gifts_clerk', ['recordedBy'])
export class Gift {
  @PrimaryGeneratedColumn('uuid') // Auto-generates UUID automatically!
  id: string;

  @Column({ name: 'wedding_id', type: 'uuid' })
  weddingId: string;

  @Column({ name: 'guest_id', type: 'uuid', nullable: false })
  guestId: string;

  @Column({ name: 'guest_name_snapshot', length: 100 })
  guestNameSnapshot: string;

  @Column({ name: 'amount_usd', type: 'numeric', precision: 12, scale: 2, default: 0 })
  amountUSD: number;

  @Column({ name: 'amount_khr', type: 'numeric', precision: 15, scale: 2, default: 0 })
  amountKHR: number;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 20,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @Column({ name: 'bank_account_id', type: 'uuid', nullable: true })
  bankAccountId?: string;

  @Column({ name: 'transaction_ref', length: 100, nullable: true })
  transactionRef?: string;

  @Column({ name: 'receipt_image_url', type: 'text', nullable: true })
  receiptImageUrl?: string;

  @Column({ type: 'text', nullable: true })
  wishes?: string;

  @Column({ name: 'recorded_by', type: 'uuid', nullable: true })
  recordedBy?: string;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Wedding, (wedding) => wedding.gifts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wedding_id' })
  wedding: Wedding;

  @ManyToOne(() => Guest, (guest) => guest.gifts, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'guest_id' })
  guest: Guest;

  @ManyToOne(() => BankAccount, (account) => account.gifts, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount?: BankAccount;

  @ManyToOne(() => User, (user) => user.recordedGifts, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'recorded_by' })
  recordedByUser?: User;
}
