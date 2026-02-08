import type { ExampleItem } from "./types";

/**
 * Giả lập fetch data trên server (A)
 */
export async function fetchExampleData(): Promise<ExampleItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [
    {
      id: 1,
      title: "Item 1",
      description: "Mô tả từ server – A fetch, truyền xuống C",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Item 2",
      description: "C là SSR nên nhận data trực tiếp từ A",
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Item 3",
      description: "B chỉ nhận children (output của C), không import C",
      createdAt: new Date().toISOString(),
    },
  ];
}
