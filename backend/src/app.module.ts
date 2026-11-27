import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { StorageModule } from './modules/storage/storage.module';
import { WeddingsModule } from './modules/weddings/weddings.module';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module';
import { GuestsModule } from './modules/guests/guests.module';
import { GiftsModule } from './modules/gifts/gifts.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

@Module({
  imports: [
    // 1. Global Environment Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // 2. Rate Limiting Protection (Max 30 requests per minute across all APIs)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),

    // 3. PostgreSQL Database Connection
    DatabaseModule,

    // 4. Feature Modules
    UsersModule,
    AuthModule,
    HealthModule,
    StorageModule,
    WeddingsModule,
    BankAccountsModule,
      GuestsModule,
      GiftsModule,
      RealtimeModule,
    ],
  controllers: [AppController],
  providers: [
    AppService,
    // Enable rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
