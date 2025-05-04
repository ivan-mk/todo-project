'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PomodoroTimer from './PomodoroTimer';
// Import dnd-kit components
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

// Import our new modular components
import { TodoItem, EditState } from './todos/types';
import { fetchTodos, addTodo, updateTodoStatus, deleteTodo, saveTodoOrder, updateTodoTitle } from './todos/api';
import { SortableItem } from './todos/SortableItem';

export default function TodoList({ initialTodos = [] }: { initialTodos?: TodoItem[] }) {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(!user && initialTodos.length === 0);
  const [error, setError] = useState<string | null>(null);
  const dragActiveRef = useRef(false);
  
  // Define a constant for the maximum character limit
  const MAX_TODO_LENGTH = 120;
  
  // State for managing the editing of todos
  const [editState, setEditState] = useState<EditState>({
    id: '',
    isEditing: false,
    editValue: ''
  });
  
  // Prevent scroll on touchmove when dragging
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (dragActiveRef.current) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Set up sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms long press
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadTodos = useCallback(async () => {
    if (!user) {
      setTodos([]);
      setIsLoading(false);
      return;
    }
    console.log("Fetching todos for user:", user.id);
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTodos();
      console.log("Fetched todos:", data);
      setTodos(data);
    } catch (e: any) {
      console.error("Failed to fetch todos:", e);
      setError('Failed to load todos. Please try again later.');
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Call API to save the new order
        saveTodoOrder(newArray).catch(error => {
          console.error("Failed to save todo order:", error);
        });
        
        return newArray;
      });
    }
  };

  const handleAddTodo = async () => {
    if (!user) {
      setError("You must be logged in to add todos.");
      return;
    }
    if (newTodo.trim() === '') return;
    
    // Limit todo text to 120 characters
    const trimmedTodo = newTodo.trim().slice(0, MAX_TODO_LENGTH);
    setError(null);

    try {
      const createdTodo = await addTodo(trimmedTodo);
      // Add the new todo to the beginning of the array instead of the end
      setTodos([createdTodo, ...todos]);
      setNewTodo('');
    } catch (e: any) {
      console.error("Failed to add todo:", e);
      setError(e.message || 'Failed to add todo. Please try again.');
    }
  };

  const handleToggleComplete = async (id: string) => {
    if (!user) {
      setError("You must be logged in to update todos.");
      return;
    }
    // Don't toggle if currently editing this item
    if (editState.isEditing && editState.id === id) return;
    
    setError(null);
    const todoToUpdate = todos.find(todo => todo.id === id);
    if (!todoToUpdate) return;

    const newCompletedStatus = !todoToUpdate.completed;

    try {
      const updatedTodo = await updateTodoStatus(id, newCompletedStatus);
      setTodos(
        todos.map(todo =>
          todo.id === id ? { ...todo, completed: updatedTodo.completed } : todo
        )
      );
    } catch (e: any) {
      console.error("Failed to toggle todo:", e);
      setError(e.message || 'Failed to update todo status. Please try again.');
    }
  };

  const handleRemoveTodo = async (id: string) => {
    if (!user) {
      setError("You must be logged in to remove todos.");
      return;
    }
    setError(null);
    const originalTodos = [...todos];
    setTodos(todos.filter(todo => todo.id !== id));

    try {
      await deleteTodo(id);
    } catch (e: any) {
      console.error("Failed to remove todo:", e);
      setError(e.message || 'Failed to remove todo. Please try again.');
      setTodos(originalTodos);
    }
  };

  // Handle edit button click
  const handleEdit = (id: string) => {
    const todoToEdit = todos.find(todo => todo.id === id);
    if (!todoToEdit) return;
    
    setEditState({
      id,
      isEditing: true,
      editValue: todoToEdit.title
    });
  };
  
  // Handle edit input change
  const handleEditChange = (value: string) => {
    setEditState({
      ...editState,
      editValue: value
    });
  };
  
  // Handle save edit
  const handleSaveEdit = async () => {
    if (!user || !editState.id || editState.editValue.trim() === '') return;
    
    const originalTodos = [...todos];
    try {
      const updatedTodo = await updateTodoTitle(editState.id, editState.editValue.trim());
      
      setTodos(
        todos.map(todo =>
          todo.id === editState.id ? { ...todo, title: updatedTodo.title } : todo
        )
      );
      
      // Reset edit state
      setEditState({
        id: '',
        isEditing: false,
        editValue: ''
      });
    } catch (e: any) {
      console.error("Failed to update todo title:", e);
      setError(e.message || 'Failed to update todo. Please try again.');
      setTodos(originalTodos);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limit input to MAX_TODO_LENGTH characters
    setNewTodo(e.target.value.slice(0, MAX_TODO_LENGTH));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-2 md:mt-4 p-4 md:p-6 bg-white rounded-xl shadow-lg">
      <PomodoroTimer />
      
      {user && (
        <div className="flex flex-col mb-3">
          <div className="flex relative">
            <input
              type="text"
              value={newTodo}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="What needs to be done?"
              className="flex-1 rounded-l px-3 py-1.5 border border-gray-300 pr-20 text-sm"
              disabled={!user}
              maxLength={MAX_TODO_LENGTH}
            />
            <span className="absolute right-20 top-1/2 -translate-y-1/2 text-xs text-gray-500 bg-white bg-opacity-70 px-1 rounded">
              {newTodo.length}/{MAX_TODO_LENGTH}
            </span>
            <button
              onClick={handleAddTodo}
              className={`rounded-r bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 text-sm ${!user ? 'bg-gray-400 cursor-not-allowed' : ''}`}
              disabled={!user}
            >
              Add
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded relative mb-3 text-sm" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {isLoading ? (
        <div className="text-center text-gray-500 py-3 text-sm">Loading todos...</div>
      ) : !user ? (
        <div className="text-center text-gray-500 mt-3 p-3 bg-gray-50 rounded-lg text-sm">
          Please log in to manage your todos.
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={() => { dragActiveRef.current = true; }}
          onDragEnd={event => {
            dragActiveRef.current = false;
            handleDragEnd(event);
          }}
          onDragCancel={() => { dragActiveRef.current = false; }}
        >
          <SortableContext 
            items={todos.map(todo => todo.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {todos.map(todo => (
                <SortableItem 
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={handleToggleComplete}
                  onRemove={handleRemoveTodo}
                  onEdit={handleEdit}
                  isEditing={editState.isEditing && editState.id === todo.id}
                  editValue={editState.isEditing && editState.id === todo.id ? editState.editValue : todo.title}
                  onEditChange={handleEditChange}
                  onSaveEdit={handleSaveEdit}
                />
              ))}
              {todos.length === 0 && user && !isLoading && (
                <div className="text-center text-gray-500 mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                  You have no todos yet. Add one above!
                </div>
              )}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
