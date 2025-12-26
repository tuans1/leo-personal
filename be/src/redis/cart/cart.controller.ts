import {
  Body,
  Controller,
  Inject,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import Redis from 'ioredis';

@Controller('cart')
export class CartController {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  @Post()
  async addToCart(@Body() body: { productId: string; quantity: number }) {
    console.log('🚀 ~ CartController ~ addToCart ~ body:', body);
    try {
      await this.redisClient.hset('cart', 'item', JSON.stringify(body));
      await this.redisClient.set(
        'cart_1',
        JSON.stringify({
          productId: body.productId,
          quantity: body.quantity,
        }),
      );
      return true;
    } catch (err: unknown) {
      console.log('🚀 ~ CartController ~ addToCart ~ err:', err);
      // Redis down, timeout, auth fail...
      throw new InternalServerErrorException(err);
    }
  }
}
