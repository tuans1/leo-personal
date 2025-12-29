import { Todo } from "./types";

export const mockTodos: Todo[] = [
  {
    id: "1",
    title: "Học Apollo Client",
    description: "Tìm hiểu cách cache hoạt động trong Apollo Client",
    completed: false,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Setup GraphQL Server",
    description: "Cài đặt và cấu hình GraphQL server",
    completed: true,
    createdAt: "2024-01-14T09:00:00Z",
  },
  {
    id: "3",
    title: "Test Cache Functionality",
    description: "Kiểm tra cache trong Apollo DevTools",
    completed: false,
    createdAt: "2024-01-13T14:00:00Z",
  },
  {
    id: "4",
    title: "Implement Mutations",
    description: "Thêm create, update, delete mutations",
    completed: false,
    createdAt: "2024-01-12T11:00:00Z",
  },
  {
    id: "5",
    title: "Optimistic Updates",
    description: "Thực hiện optimistic UI updates",
    completed: false,
    createdAt: "2024-01-11T16:00:00Z",
  },
];

export const getTodoById = (id: string): Todo | undefined => {
  return mockTodos.find((todo) => todo.id === id);
};

export const getAllTodos = (): Todo[] => {
  return mockTodos;
};

