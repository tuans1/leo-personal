"use server";

import { revalidatePath } from "next/cache";
import { addItem } from "./mock-data";

export async function addItemAction(
  title: string
): Promise<{ success: boolean; error?: string }> {
  const trimmed = title?.trim();
  if (!trimmed) {
    return { success: false, error: "Vui lòng nhập tiêu đề." };
  }

  try {
    addItem(trimmed);
    revalidatePath("/basic/list-form");
    return { success: true };
  } catch (error) {
    console.error("Error adding item:", error);
    return { success: false, error: "Có lỗi xảy ra khi thêm item." };
  }
}
