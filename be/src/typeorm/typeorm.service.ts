import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/redis/cart/entities';
import { Repository } from 'typeorm';

export class TypeOrmService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.find({
      where: {
        name: 'Product_1999999',
      },
      //   order: {
      //     id: 'ASC',
      //   },
    });
  }
}
