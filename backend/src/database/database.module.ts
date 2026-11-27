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
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL') || '';
        const isProd = configService.get<string>('NODE_ENV') === 'production';
        const forceSync = configService.get<string>('DB_SYNCHRONIZE') === 'true';

        return {
          type: 'postgres',
          url: dbUrl,
          entities: [User, Wedding, BankAccount, Guest, Gift],
          synchronize: !isProd || forceSync,
          ssl:
            isProd || dbUrl.includes('sslmode=require')
              ? { rejectUnauthorized: false }
              : false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
