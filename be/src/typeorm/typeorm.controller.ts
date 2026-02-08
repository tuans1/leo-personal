import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { TypeOrmService } from './typeorm.service';

@Controller('typeorm')
export class TypeOrmController {
  constructor(private readonly typeOrmService: TypeOrmService) {}

  @Get('products')
  async getAllProducts() {
    try {
      return await this.typeOrmService.getAllProducts();
    } catch (err) {
      console.log('🚀 ~ TypeOrmController ~ getAllProducts ~ err:', err);
      throw new InternalServerErrorException(err);
    }
  }
}
