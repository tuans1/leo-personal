/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';
import { Product, Order, FlashSale, OrderItem } from '../redis/cart/entities';

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
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [NestTypeOrmModule],
})
export class TypeOrmModule {}
