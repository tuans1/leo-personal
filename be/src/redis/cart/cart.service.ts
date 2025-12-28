import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import Redis from 'ioredis';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class CartService {
  private readonly LOCK_TTL = 10; // seconds
  private readonly CACHE_TTL = 60; // seconds

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly dataSource: DataSource,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async getProductInventory(productId: number): Promise<number | null> {
    const cacheKey = `inventory:product:${productId}`;

    // Try to get from cache first
    const cachedInventory = await this.redisClient.get(cacheKey);
    if (cachedInventory !== null) {
      return parseInt(cachedInventory, 10);
    }

    // If not in cache, get from database
    const product = await this.productRepository.findOne({
      where: { id: productId },
      select: ['id', 'quantity'],
    });

    if (!product) {
      return null;
    }

    const quantity = product.quantity ?? 0;

    // Update cache
    await this.updateInventoryCache(productId, quantity);

    return quantity;
  }

  async updateInventoryCache(
    productId: number,
    quantity: number,
  ): Promise<void> {
    const cacheKey = `inventory:product:${productId}`;
    await this.redisClient.setex(cacheKey, this.CACHE_TTL, quantity.toString());
  }

  async acquireLock(productId: number): Promise<string | null> {
    const lockKey = `lock:product:${productId}`;
    const lockValue = `${Date.now()}-${Math.random()}`;

    // SET key value NX EX ttl
    const result = await this.redisClient.set(
      lockKey,
      lockValue,
      'EX',
      this.LOCK_TTL,
      'NX',
    );
    console.log('🚀 ~ CartService ~ acquireLock ~ result:', result);

    return result === 'OK' ? lockValue : null;
  }

  async releaseLock(productId: number, lockValue: string): Promise<void> {
    const lockKey = `lock:product:${productId}`;

    // Use Lua script to ensure we only delete our own lock
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    await this.redisClient.eval(script, 1, lockKey, lockValue);
  }

  async checkout(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<{ orderId: number; orderItemId: number }> {
    // Validate input
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Acquire distributed lock
    const lockValue = await this.acquireLock(productId);
    console.log('🚀 ~ CartService ~ checkout ~ lockValue:', lockValue);
    if (!lockValue) {
      throw new Error('Failed to acquire lock. Please try again.');
    }
    try {
      // Use transaction to ensure atomicity
      const result = await this.dataSource.transaction(
        async (transactionalEntityManager) => {
          // Get product with lock (FOR UPDATE)
          const product = await transactionalEntityManager
            .createQueryBuilder(Product, 'product')
            .setLock('pessimistic_write')
            .where('product.id = :id', { id: productId })
            .getOne();

          if (!product) {
            throw new Error('Product not found');
          }

          const currentQuantity = product.quantity ?? 0;

          // Check if enough inventory
          if (currentQuantity < quantity) {
            throw new Error(
              `Insufficient inventory. Available: ${currentQuantity}, Requested: ${quantity}`,
            );
          }

          // Update inventory
          const newQuantity = currentQuantity - quantity;
          await transactionalEntityManager.update(
            Product,
            { id: productId },
            { quantity: newQuantity },
          );

          // Create Order
          const order = transactionalEntityManager.create(Order, {
            userId,
            productId,
            status: 'completed',
          });
          const savedOrder = await transactionalEntityManager.save(
            Order,
            order,
          );

          // Create OrderItem
          const orderItem = transactionalEntityManager.create(OrderItem, {
            orderId: savedOrder.id,
            productId,
            quantity,
            price: product.price,
          });
          const savedOrderItem = await transactionalEntityManager.save(
            OrderItem,
            orderItem,
          );

          // Update cache
          await this.updateInventoryCache(productId, newQuantity);

          return {
            orderId: savedOrder.id,
            orderItemId: savedOrderItem.id,
          };
        },
      );

      return result;
    } catch (err: unknown) {
      console.log('🚀 ~ CartService ~ checkout ~ err:', err);
      throw err;
    }
  }
}
