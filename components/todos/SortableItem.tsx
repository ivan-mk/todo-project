import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { XMarkIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { TodoItem } from './types';

interface SortableItemProps {
  todo: TodoItem;
  onToggleComplete: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onSaveEdit: () => void;
}

export function SortableItem({ 
  todo, 
  onToggleComplete, 
  onRemove, 
  onEdit, 
  isEditing,
  editValue,
  onEditChange,
  onSaveEdit
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limit input to 120 characters
    onEditChange(e.target.value.slice(0, 120));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSaveEdit();
    }
  };
  
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 bg-white shadow-sm rounded mb-1 ${isDragging ? 'z-50' : ''}`}
    >
      {/* Drag handle on the left */}
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-move mr-1 px-1 py-2 flex items-center justify-center"
      >
        <svg width="8" height="14" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 14C4 15.1 3.1 16 2 16C0.9 16 0 15.1 0 14C0 12.9 0.9 12 2 12C3.1 12 4 12.9 4 14ZM2 6C0.9 6 0 6.9 0 8C0 9.1 0.9 10 2 10C3.1 10 4 9.1 4 8C4 6.9 3.1 6 2 6ZM2 0C0.9 0 0 0.9 0 2C0 3.1 0.9 4 2 4C3.1 4 4 3.1 4 2C4 0.9 3.1 0 2 0ZM8 4C9.1 4 10 3.1 10 2C10 0.9 9.1 0 8 0C6.9 0 6 0.9 6 2C6 3.1 6.9 4 8 4ZM8 6C6.9 6 6 6.9 6 8C6 9.1 6.9 10 8 10C9.1 10 10 9.1 10 8C10 6.9 9.1 6 8 6ZM8 12C6.9 12 6 12.9 6 14C6 15.1 6.9 16 8 16C9.1 16 10 15.1 10 14C10 12.9 9.1 12 8 12Z" fill="#718096"/>
        </svg>
      </div>
      
      <div className="flex items-center flex-grow mr-1 w-full sm:w-auto">
        <div className="flex-none mr-2 flex items-center self-center">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggleComplete(todo.id)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
        </div>
        
        {isEditing ? (
          <div className="flex-grow relative">
            <input
              type="text"
              value={editValue}
              onChange={handleEditChange}
              onKeyDown={handleKeyDown}
              className="w-full border border-blue-400 rounded px-2 py-1 pr-16 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
              maxLength={120}
            />
            <span className="text-xs text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 px-1 rounded">
              {editValue.length}/120
            </span>
          </div>
        ) : (
          <span
            className={`flex-grow cursor-pointer break-words whitespace-normal overflow-wrap-anywhere hyphens-auto text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
            onClick={() => onToggleComplete(todo.id)}
            lang="en"
            style={{ maxWidth: '100%', wordBreak: 'break-word' }}
          >
            {todo.title}
          </span>
        )}
      </div>
      
      <div className="flex items-center">
        {/* Edit/Save button */}
        {isEditing ? (
          <button
            onClick={onSaveEdit}
            className="p-1 text-green-500 hover:bg-green-100 rounded-full focus:outline-none focus:ring-1 focus:ring-green-400 transition-colors duration-200 mr-0.5"
            aria-label="Save edit"
          >
            <CheckIcon className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => onEdit(todo.id)}
            className="p-1 text-blue-500 hover:bg-blue-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors duration-200 mr-0.5"
            aria-label="Edit todo"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
        
        {/* Remove button with X icon */}
        <button
          onClick={() => onRemove(todo.id)}
          className="p-1 text-red-500 hover:bg-red-100 rounded-full focus:outline-none focus:ring-1 focus:ring-red-400 transition-colors duration-200"
          aria-label="Remove todo"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}