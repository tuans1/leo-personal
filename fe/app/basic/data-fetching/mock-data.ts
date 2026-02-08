import type { Product } from "./types";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Áo thun basic",
    price: 199000,
    description: "Áo thun cotton cao cấp, thoáng mát.",
  },
  {
    id: "2",
    name: "Quần jean slim",
    price: 449000,
    description: "Quần jean form slim fit, bền đẹp.",
  },
  {
    id: "3",
    name: "Giày sneaker",
    price: 599000,
    description: "Giày thể thao nhẹ, êm chân.",
  },
  {
    id: "4",
    name: "Túi đeo chéo",
    price: 299000,
    description: "Túi vải canvas, nhiều ngăn.",
  },
  {
    id: "5",
    name: "Mũ lưỡi trai",
    price: 149000,
    description: "Mũ unisex, vành rộng.",
  },
];

/**
 * Simulate API: get all products (delay ~300ms).
 * Used by static and dynamic examples.
 */
export async function getProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...MOCK_PRODUCTS];
}

/**
 * Simulate API: get product by id (delay ~200ms).
 * Used by products/[id] page.
 */
export async function getProductById(id: string): Promise<Product | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
}
