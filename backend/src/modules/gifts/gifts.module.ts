import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gift } from './entities/gift.entity';
import { Guest } from '../guests/entities/guest.entity';
import { Wedding } from '../weddings/entities/wedding.entity';
import { BankAccount } from '../bank-accounts/entities/bank-account.entity';
import { GiftsService } from './gifts.service';
import { GiftsController } from './gifts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Gift, Guest, Wedding, BankAccount])],
  controllers: [GiftsController],
  providers: [GiftsService],
  exports: [GiftsService],
})
export class GiftsModule {}
