import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { Wedding } from '../modules/weddings/entities/wedding.entity';
import { BankAccount } from '../modules/bank-accounts/entities/bank-account.entity';
import { Guest } from '../modules/guests/entities/guest.entity';
import { Gift } from '../modules/gifts/entities/gift.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [User, Wedding, BankAccount, Guest, Gift],
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // Automatically creates/updates tables in development
        ssl:
          configService.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
  ],
})
export class DatabaseModule {}
