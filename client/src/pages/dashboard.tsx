import { useState } from "react";
import { useLocation } from "wouter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCurrentDate } from "@/lib/dateUtils";
import { useUser } from "@/contexts/user-context";
import { useTaskState } from "@/hooks/use-tasks";
import { useScheduleState } from "@/hooks/use-schedule";
import { useStatsState } from "@/hooks/use-stats";

import StatCard from "@/components/ui/stat-card";
import ScheduleItem from "@/components/ui/schedule-item";
import TaskItem from "@/components/ui/task-item";
import PomodoroTimer from "@/components/ui/pomodoro-timer";
import WeeklyProgressChart from "@/components/ui/weekly-progress-chart";
import DeadlineItem from "@/components/ui/deadline-item";
import NewTaskModal from "@/components/ui/new-task-modal";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Dashboard = () => {
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");
  const [editingTask, setEditingTask] = useState(null);

  // Get the current data from hooks
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    getSubjectForTask 
  } = useTaskState();
  
  const { 
    todaySessions, 
    upcomingDeadlines, 
    startStudySession 
  } = useScheduleState();
  
  const { 
    stats, 
    weeklyRecords, 
    weekStartDate, 
    weekEndDate 
  } = useStatsState();

  // Filter tasks based on selected priority
  const filteredTasks = tasks.filter(task => {
    if (taskPriorityFilter === "all") return !task.completed;
    return !task.completed && task.priority === taskPriorityFilter;
  }).slice(0, 3); // Show only 3 tasks on dashboard

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

  const handleCreateTask = (taskData) => {
    addTask({
      ...taskData,
      userId: user.id,
    });
    
    toast({
      title: "Task Created",
      description: "New task has been added to your list",
    });
  };

  const handleUpdateTask = (taskData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully",
      });
      
      setEditingTask(null);
    }
  };

  const handleTaskSubmit = (taskData) => {
    if (editingTask) {
      handleUpdateTask(taskData);
    } else {
      handleCreateTask(taskData);
    }
  };

  // Handle start study session button
  const handleStartStudySession = () => {
    startStudySession();
    navigate('/pomodoro');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Date and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{getCurrentDate()}</h2>
          <p className="text-gray-600">Welcome back, {user.firstName}!</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
          <Button 
            className="primary-button"
            onClick={() => {
              setEditingTask(null);
              setIsNewTaskModalOpen(true);
            }}
          >
            <FontAwesomeIcon icon="plus" className="mr-2" />
            New Task
          </Button>
          <Button 
            className="secondary-button"
            onClick={handleStartStudySession}
          >
            <FontAwesomeIcon icon="play" className="mr-2" />
            Start Session
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Study Time Today" 
          value={stats.todayStudyTime} 
          icon="clock" 
          color="primary" 
        />
        <StatCard 
          title="Tasks Completed" 
          value={stats.tasksCompleted} 
          icon="check" 
          color="green" 
        />
        <StatCard 
          title="Study Streak" 
          value={stats.streak} 
          icon="calendar-alt" 
          color="secondary" 
        />
        <StatCard 
          title="Focus Score" 
          value={stats.focusScore} 
          icon="fire" 
          color="yellow" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule and Active Tasks */}
        <div className="lg:col-span-2">
          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Today's Schedule</h3>
              <button 
                className="text-primary-600 hover:text-primary-800"
                onClick={() => navigate('/schedule')}
              >
                View all <FontAwesomeIcon icon="arrow-right" className="ml-1" />
              </button>
            </div>
            <div className="p-6">
              {todaySessions.length > 0 ? (
                todaySessions.map(session => (
                  <ScheduleItem key={session.id} session={session} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No study sessions scheduled for today.
                </p>
              )}
            </div>
          </div>

          {/* Active Tasks */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Active Tasks</h3>
              <div className="flex space-x-2">
                <Select 
                  value={taskPriorityFilter}
                  onValueChange={setTaskPriorityFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
                <button 
                  className="text-primary-600 hover:text-primary-800"
                  onClick={() => navigate('/tasks')}
                >
                  View all <FontAwesomeIcon icon="arrow-right" className="ml-1" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
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
                  No active tasks. Create a new task to get started.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pomodoro Timer */}
          <PomodoroTimer />

          {/* Weekly Progress */}
          <WeeklyProgressChart 
            records={weeklyRecords}
            startDate={weekStartDate}
            endDate={weekEndDate}
          />

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Upcoming Deadlines</h3>
            </div>
            <div className="p-4">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map(task => (
                  <DeadlineItem 
                    key={task.id} 
                    task={task}
                    subject={getSubjectForTask(task.id)}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No upcoming deadlines.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      <NewTaskModal
        open={isNewTaskModalOpen}
        onOpenChange={setIsNewTaskModalOpen}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        isEdit={!!editingTask}
      />
    </div>
  );
};

export default Dashboard;
