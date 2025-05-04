// Define todo item type
export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
}

// Define any additional types related to todo functionality here

// Interface for edit state tracking
export interface EditState {
  id: string;
  isEditing: boolean;
  editValue: string;
}