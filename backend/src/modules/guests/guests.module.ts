import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guest } from './entities/guest.entity';
import { Gift } from '../gifts/entities/gift.entity';
import { GuestsService } from './guests.service';
import { GuestsController } from './guests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Guest, Gift])],
  controllers: [GuestsController],
  providers: [GuestsService],
  exports: [GuestsService],
})
export class GuestsModule {}
