import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wedding } from './entities/wedding.entity';
import { WeddingsService } from './weddings.service';
import { WeddingsController } from './weddings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Wedding])],
  controllers: [WeddingsController],
  providers: [WeddingsService],
  exports: [WeddingsService],
})
export class WeddingsModule {}
