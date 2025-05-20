import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTaskState } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import TaskItem from "@/components/ui/task-item";
import NewTaskModal from "@/components/ui/new-task-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { tasks, subjects, addTask, updateTask, deleteTask, getSubjectForTask } = useTaskState();
  const { toast } = useToast();

  // Filter tasks based on active filters and search query
  const getFilteredTasks = (completed = false) => {
    return tasks.filter(task => {
      // Filter by completion status
      if (task.completed !== completed) return false;
      
      // Filter by search query
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by priority
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }
      
      // Filter by subject
      if (subjectFilter !== "all" && task.subjectId.toString() !== subjectFilter) {
        return false;
      }
      
      return true;
    });
  };

  const activeTasks = getFilteredTasks(false);
  const completedTasks = getFilteredTasks(true);

  // Handlers for task operations
  const handleTaskComplete = (taskId: number, completed: boolean) => {
    updateTask(taskId, { completed });
    
    toast({
      title: completed ? "Task Completed" : "Task Marked Incomplete",
      description: completed ? "Great job on completing your task!" : "Task marked as incomplete",
    });
  };

  const handleEditTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setIsNewTaskModalOpen(true);
    }
  };

  const handleSubmitTask = (taskData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully",
      });
      
      setEditingTask(null);
    } else {
      addTask({
        ...taskData,
        userId: 1, // Assuming a demo user ID, this would come from auth context
      });
      
      toast({
        title: "Task Created",
        description: "New task has been added to your list",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Task Management</h2>
        <Button 
          className="primary-button mt-4 sm:mt-0"
          onClick={() => {
            setEditingTask(null);
            setIsNewTaskModalOpen(true);
          }}
        >
          <FontAwesomeIcon icon="plus" className="mr-2" />
          Add New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Select 
              value={priorityFilter}
              onValueChange={setPriorityFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select 
              value={subjectFilter}
              onValueChange={setSubjectFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Tasks ({activeTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Tasks ({completedTasks.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {activeTasks.length > 0 ? (
                activeTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task}
                    subject={getSubjectForTask(task.id)}
                    onToggleComplete={handleTaskComplete}
                    onEdit={handleEditTask}
                    onDelete={deleteTask}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No active tasks found. Create a new task or adjust your filters.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {completedTasks.length > 0 ? (
                completedTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task}
                    subject={getSubjectForTask(task.id)}
                    onToggleComplete={handleTaskComplete}
                    onEdit={handleEditTask}
                    onDelete={deleteTask}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No completed tasks found. Complete some tasks or adjust your filters.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Task Modal */}
      <NewTaskModal
        open={isNewTaskModalOpen}
        onOpenChange={setIsNewTaskModalOpen}
        onSubmit={handleSubmitTask}
        initialData={editingTask}
        isEdit={!!editingTask}
      />
    </div>
  );
};

export default Tasks;
