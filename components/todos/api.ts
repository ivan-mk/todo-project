import { TodoItem } from './types';

// Fetch all todos
export async function fetchTodos(): Promise<TodoItem[]> {
  try {
    const response = await fetch('/api/todos');
    if (response.status === 401) {
      console.log("User not authorized to fetch todos.");
      return [];
    } 
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    throw error;
  }
}

// Add a new todo
export async function addTodo(title: string): Promise<TodoItem> {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: title.trim() }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Update a todo's completed status
export async function updateTodoStatus(id: string, completed: boolean): Promise<TodoItem> {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Update a todo's title
export async function updateTodoTitle(id: string, title: string): Promise<TodoItem> {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Delete a todo
export async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
}

// Save the order of todos after drag and drop
export async function saveTodoOrder(reorderedTodos: TodoItem[]): Promise<void> {
  const response = await fetch('/api/todos/reorder', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ todos: reorderedTodos }),
  });

  if (!response.ok) {
    throw new Error(`Error saving todo order: ${response.status}`);
  }
}