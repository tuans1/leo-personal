import { gql } from "graphql-tag";

export const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      title
      description
      completed
      createdAt
    }
  }
`;

export const GET_TODO_BY_ID = gql`
  query GetTodoById($id: ID!) {
    todo(id: $id) {
      id
      title
      description
      completed
      createdAt
    }
  }
`;

