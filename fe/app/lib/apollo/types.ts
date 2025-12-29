export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

export interface TodosData {
  todos: Todo[];
}

export interface TodoData {
  todo: Todo | null;
}

export interface TodosQueryVariables {
  limit?: number;
  offset?: number;
}

export interface TodoQueryVariables {
  id: string;
}

