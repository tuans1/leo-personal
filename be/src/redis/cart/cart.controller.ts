import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import Redis from 'ioredis';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly cartService: CartService,
  ) {}

  @Get('products')
  async getAllProducts() {
    try {
      return await this.cartService.getAllProducts();
    } catch (err: unknown) {
      console.log('🚀 ~ CartController ~ getAllProducts ~ err:', err);
      throw new InternalServerErrorException(err);
    }
  }

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
