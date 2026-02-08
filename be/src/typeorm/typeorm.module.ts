/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';
import { Product, Order, FlashSale, OrderItem } from '../redis/cart/entities';
import { TypeOrmController } from './typeorm.controller';
import { TypeOrmService } from './typeorm.service';

@Module({
  imports: [
    NestTypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          url: configService.get<string>('DATABASE_URL'),
          entities: [Product, Order, FlashSale, OrderItem],
          synchronize: true,
          extra: {
            // Connection pool settings
            max: 10,
            min: 2,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
            // PostgreSQL statement timeout (in milliseconds)
            // This prevents queries from timing out too quickly
            statement_timeout: 60000, // 60 seconds
            query_timeout: 60000,
          },
        };
      },
      inject: [ConfigService],
    }),
    NestTypeOrmModule.forFeature([Product, Order, OrderItem]),
  ],
  controllers: [TypeOrmController],
  providers: [TypeOrmService],
  exports: [NestTypeOrmModule],
})
export class TypeOrmModule {}
