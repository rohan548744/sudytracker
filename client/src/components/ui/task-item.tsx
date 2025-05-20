import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Task, Subject } from "@shared/schema";
import { formatDueDate } from "@/lib/dateUtils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TaskItemProps {
  task: Task;
  subject: Subject;
  onToggleComplete: (taskId: number, completed: boolean) => void;
  onEdit: (taskId: number) => void;
  onDelete: (taskId: number) => void;
}

const TaskItem = ({ task, subject, onToggleComplete, onEdit, onDelete }: TaskItemProps) => {
  const { id, title, description, priority, dueDate, completed } = task;
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', id.toString());
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const priorityColors = {
    high: {
      bg: "bg-red-100",
      text: "text-red-800",
    },
    medium: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
    },
    low: {
      bg: "bg-blue-100",
      text: "text-blue-800",
    },
  };

  const getPriorityColor = (priority: string) => {
    return priorityColors[priority] || { bg: "bg-gray-100", text: "text-gray-800" };
  };

  const priorityColor = getPriorityColor(priority);
  const formattedDueDate = formatDueDate(dueDate);

  return (
    <div 
      className={`group bg-white border rounded-lg p-4 mb-3 last:mb-0 hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''} ${completed ? 'opacity-60' : ''}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <input 
            type="checkbox" 
            className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
            checked={completed}
            onChange={(e) => onToggleComplete(id, e.target.checked)}
          />
          <div>
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
            <div className="flex flex-wrap mt-2 gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${subject.color}-100 text-${subject.color}-800`}>
                {subject.name}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColor.bg} ${priorityColor.text}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Due: {formattedDueDate}</span>
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-400 hover:text-gray-600">
                  <FontAwesomeIcon icon="ellipsis-v" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(id)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(id)} className="text-red-600">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
