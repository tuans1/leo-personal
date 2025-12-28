import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Post,
  ServiceUnavailableException,
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

  @Post('checkout')
  async checkout(
    @Body()
    body: {
      userId: number;
      productId: number;
      quantity: number;
    },
  ) {
    try {
      // Validate request
      if (!body.userId || !body.productId || !body.quantity) {
        throw new BadRequestException(
          'userId, productId, and quantity are required',
        );
      }

      if (body.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than 0');
      }

      // Process checkout
      const result = await this.cartService.checkout(
        body.userId,
        body.productId,
        body.quantity,
      );

      return {
        success: true,
        message: 'Checkout successful',
        data: result,
      };
    } catch (err: unknown) {
      console.log('🚀 ~ CartController ~ checkout ~ err:', err);

      if (err instanceof BadRequestException) {
        throw err;
      }

      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';

      // Handle specific error cases
      if (errorMessage.includes('Failed to acquire lock')) {
        throw new ServiceUnavailableException(
          'Service is busy. Please try again in a moment.',
        );
      }

      if (errorMessage.includes('Insufficient inventory')) {
        throw new ConflictException(errorMessage);
      }

      if (errorMessage.includes('Product not found')) {
        throw new BadRequestException(errorMessage);
      }

      // Generic error
      throw new InternalServerErrorException(errorMessage);
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
