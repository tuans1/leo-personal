import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FlashSale } from './flash-sale.entity';
import { OrderItem } from './order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'integer', nullable: true })
  price: number | null;

  @Column({ type: 'smallint', nullable: true })
  quantity: number | null;

  // Optimistic locking is not used in this example
  // @VersionColumn()
  // version: number;

  @OneToMany(() => FlashSale, (flashSale) => flashSale.product)
  flashSales: FlashSale[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
