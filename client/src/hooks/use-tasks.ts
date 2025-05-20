import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { getFromStorage, saveToStorage } from "@/lib/localStorage";
import { Task, InsertTask, Subject } from "@shared/schema";
import { useSubjects } from "./use-subjects";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/contexts/user-context";
import { queryClient } from "@/lib/queryClient";

// Initial demo tasks if no tasks exist
const initialTasks: Task[] = [];

export const useTaskState = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const { subjects } = useSubjects();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from local storage or API
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Try to load from API first
        if (user && user.id) {
          try {
            const response = await apiRequest("GET", `/api/tasks?userId=${user.id}`, undefined);
            const data = await response.json();
            setTasks(data);
            saveToStorage("tasks", data);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error("Failed to fetch tasks from API:", error);
            // Fall back to local storage if API fails
          }
        }

        // Load from local storage
        const storedTasks = getFromStorage<Task[]>("tasks", initialTasks);
        setTasks(storedTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
        toast({
          title: "Error",
          description: "Failed to load tasks data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [user, toast]);

  // Add a new task
  const addTask = useCallback(
    async (taskData: InsertTask) => {
      try {
        // Try to add via API first
        if (user && user.id) {
          try {
            const response = await apiRequest("POST", "/api/tasks", taskData);
            const newTask = await response.json();
            
            setTasks((prevTasks) => {
              const updatedTasks = [...prevTasks, newTask];
              saveToStorage("tasks", updatedTasks);
              return updatedTasks;
            });
            
            // Invalidate tasks cache
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
            
            return newTask;
          } catch (error) {
            console.error("Failed to add task via API:", error);
            // Fall back to local storage if API fails
          }
        }

        // Add to local storage if API is not available
        const newTask: Task = {
          ...taskData,
          id: Math.max(0, ...tasks.map((t) => t.id)) + 1,
        };

        setTasks((prevTasks) => {
          const updatedTasks = [...prevTasks, newTask];
          saveToStorage("tasks", updatedTasks);
          return updatedTasks;
        });

        return newTask;
      } catch (error) {
        console.error("Error adding task:", error);
        toast({
          title: "Error",
          description: "Failed to add new task",
          variant: "destructive",
        });
        throw error;
      }
    },
    [tasks, user, toast]
  );

  // Update an existing task
  const updateTask = useCallback(
    async (taskId: number, updatedData: Partial<InsertTask>) => {
      try {
        // Try to update via API first
        if (user && user.id) {
          try {
            const response = await apiRequest("PUT", `/api/tasks/${taskId}`, updatedData);
            const updatedTask = await response.json();
            
            setTasks((prevTasks) => {
              const updatedTasks = prevTasks.map((task) =>
                task.id === taskId ? { ...task, ...updatedTask } : task
              );
              saveToStorage("tasks", updatedTasks);
              return updatedTasks;
            });
            
            // Invalidate tasks cache
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
            
            return updatedTask;
          } catch (error) {
            console.error("Failed to update task via API:", error);
            // Fall back to local storage if API fails
          }
        }

        // Update in local storage if API is not available
        setTasks((prevTasks) => {
          const taskIndex = prevTasks.findIndex((task) => task.id === taskId);
          
          if (taskIndex === -1) {
            throw new Error(`Task with ID ${taskId} not found`);
          }
          
          const updatedTasks = [...prevTasks];
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            ...updatedData,
          };
          
          saveToStorage("tasks", updatedTasks);
          return updatedTasks;
        });

        return tasks.find((task) => task.id === taskId);
      } catch (error) {
        console.error("Error updating task:", error);
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
        throw error;
      }
    },
    [tasks, user, toast]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (taskId: number) => {
      try {
        // Try to delete via API first
        if (user && user.id) {
          try {
            await apiRequest("DELETE", `/api/tasks/${taskId}`, undefined);
            
            setTasks((prevTasks) => {
              const updatedTasks = prevTasks.filter((task) => task.id !== taskId);
              saveToStorage("tasks", updatedTasks);
              return updatedTasks;
            });
            
            // Invalidate tasks cache
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
            
            return true;
          } catch (error) {
            console.error("Failed to delete task via API:", error);
            // Fall back to local storage if API fails
          }
        }

        // Delete from local storage if API is not available
        setTasks((prevTasks) => {
          const updatedTasks = prevTasks.filter((task) => task.id !== taskId);
          saveToStorage("tasks", updatedTasks);
          return updatedTasks;
        });

        return true;
      } catch (error) {
        console.error("Error deleting task:", error);
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast]
  );

  // Get subject for a specific task
  const getSubjectForTask = useCallback(
    (taskId: number): Subject => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) {
        // Return a default subject if task not found
        return {
          id: 0,
          userId: user.id,
          name: "Unknown",
          color: "gray",
          description: "",
        };
      }

      const subject = subjects.find((s) => s.id === task.subjectId);
      if (!subject) {
        // Return a default subject if subject not found
        return {
          id: 0,
          userId: user.id,
          name: "Unknown",
          color: "gray",
          description: "",
        };
      }

      return subject;
    },
    [tasks, subjects, user]
  );

  return {
    tasks,
    subjects,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    getSubjectForTask,
  };
};
