import type { ListItem } from "./types";

const items: ListItem[] = [
  { id: "1", title: "Item mẫu 1", createdAt: "2024-01-15T10:00:00Z" },
  { id: "2", title: "Item mẫu 2", createdAt: "2024-01-14T09:00:00Z" },
  { id: "3", title: "Item mẫu 3", createdAt: "2024-01-13T14:00:00Z" },
];

export function getList(): ListItem[] {
  return [...items];
}

export function addItem(title: string): void {
  const id = crypto.randomUUID?.() ?? String(Date.now());
  items.push({
    id,
    title,
    createdAt: new Date().toISOString(),
  });
}
