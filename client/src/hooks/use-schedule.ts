import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { getFromStorage, saveToStorage } from "@/lib/localStorage";
import { StudySession, InsertStudySession, Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/contexts/user-context";
import { queryClient } from "@/lib/queryClient";
import { useTaskState } from "./use-tasks";
import { getCurrentDate, formatDate } from "@/lib/dateUtils";

// Initial demo study sessions if none exist
const initialStudySessions: StudySession[] = [];

export const useScheduleState = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const { tasks } = useTaskState();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load study sessions from storage or API
  useEffect(() => {
    const loadSessions = async () => {
      try {
        // Try to load from API first
        if (user && user.id) {
          try {
            const response = await apiRequest(
              "GET",
              `/api/study-sessions?userId=${user.id}`,
              undefined
            );
            const data = await response.json();
            setSessions(data);
            saveToStorage("studySessions", data);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error("Failed to fetch study sessions from API:", error);
            // Fall back to local storage if API fails
          }
        }

        // Load from local storage
        const storedSessions = getFromStorage<StudySession[]>(
          "studySessions",
          initialStudySessions
        );
        setSessions(storedSessions);
      } catch (error) {
        console.error("Error loading study sessions:", error);
        toast({
          title: "Error",
          description: "Failed to load study session data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [user, toast]);

  // Get today's study sessions
  const todaySessions = sessions.filter(
    (session) => session.date === formatDate(new Date())
  );

  // Get upcoming deadlines (non-completed tasks with due dates, sorted by closest due date)
  const upcomingDeadlines = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    })
    .slice(0, 3); // Get only the 3 closest deadlines

  // Add a new study session
  const addSession = useCallback(
    async (sessionData: InsertStudySession) => {
      try {
        // Try to add via API first
        if (user && user.id) {
          try {
            const response = await apiRequest(
              "POST",
              "/api/study-sessions",
              sessionData
            );
            const newSession = await response.json();

            setSessions((prevSessions) => {
              const updatedSessions = [...prevSessions, newSession];
              saveToStorage("studySessions", updatedSessions);
              return updatedSessions;
            });

            // Invalidate sessions cache
            queryClient.invalidateQueries({
              queryKey: ["/api/study-sessions"],
            });

            return newSession;
          } catch (error) {
            console.error("Failed to add study session via API:", error);
            // Fall back to local storage if API fails
          }
        }

        // Add to local storage if API is not available
        const newSession: StudySession = {
          ...sessionData,
          id: Math.max(0, ...sessions.map((s) => s.id)) + 1,
        };

        setSessions((prevSessions) => {
          const updatedSessions = [...prevSessions, newSession];
          saveToStorage("studySessions", updatedSessions);
          return updatedSessions;
        });

        return newSession;
      } catch (error) {
        console.error("Error adding study session:", error);
        toast({
          title: "Error",
          description: "Failed to add new study session",
          variant: "destructive",
        });
        throw error;
      }
    },
    [sessions, user, toast]
  );

  // Update an existing study session
  const updateSession = useCallback(
    async (sessionId: number, updatedData: Partial<InsertStudySession>) => {
      try {
        // Try to update via API first
        if (user && user.id) {
          try {
            const response = await apiRequest(
              "PUT",
              `/api/study-sessions/${sessionId}`,
              updatedData
            );
            const updatedSession = await response.json();

            setSessions((prevSessions) => {
              const updatedSessions = prevSessions.map((session) =>
                session.id === sessionId
                  ? { ...session, ...updatedSession }
                  : session
              );
              saveToStorage("studySessions", updatedSessions);
              return updatedSessions;
            });

            // Invalidate sessions cache
            queryClient.invalidateQueries({
              queryKey: ["/api/study-sessions"],
            });

            return updatedSession;
          } catch (error) {
            console.error("Failed to update study session via API:", error);
            // Fall back to local storage if API fails
          }
        }

        // Update in local storage if API is not available
        setSessions((prevSessions) => {
          const sessionIndex = prevSessions.findIndex(
            (session) => session.id === sessionId
          );

          if (sessionIndex === -1) {
            throw new Error(`Study session with ID ${sessionId} not found`);
          }

          const updatedSessions = [...prevSessions];
          updatedSessions[sessionIndex] = {
            ...updatedSessions[sessionIndex],
            ...updatedData,
          };

          saveToStorage("studySessions", updatedSessions);
          return updatedSessions;
        });

        return sessions.find((session) => session.id === sessionId);
      } catch (error) {
        console.error("Error updating study session:", error);
        toast({
          title: "Error",
          description: "Failed to update study session",
          variant: "destructive",
        });
        throw error;
      }
    },
    [sessions, user, toast]
  );

  // Delete a study session
  const deleteSession = useCallback(
    async (sessionId: number) => {
      try {
        // Try to delete via API first
        if (user && user.id) {
          try {
            await apiRequest(
              "DELETE",
              `/api/study-sessions/${sessionId}`,
              undefined
            );

            setSessions((prevSessions) => {
              const updatedSessions = prevSessions.filter(
                (session) => session.id !== sessionId
              );
              saveToStorage("studySessions", updatedSessions);
              return updatedSessions;
            });

            // Invalidate sessions cache
            queryClient.invalidateQueries({
              queryKey: ["/api/study-sessions"],
            });

            return true;
          } catch (error) {
            console.error("Failed to delete study session via API:", error);
            // Fall back to local storage if API fails
          }
        }

        // Delete from local storage if API is not available
        setSessions((prevSessions) => {
          const updatedSessions = prevSessions.filter(
            (session) => session.id !== sessionId
          );
          saveToStorage("studySessions", updatedSessions);
          return updatedSessions;
        });

        return true;
      } catch (error) {
        console.error("Error deleting study session:", error);
        toast({
          title: "Error",
          description: "Failed to delete study session",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast]
  );

  // Get sessions for a specific date
  const getSessionsByDate = useCallback(
    (date: string) => {
      return sessions.filter((session) => session.date === date);
    },
    [sessions]
  );

  // Start a new study session (navigate to Pomodoro and pre-select task)
  const startStudySession = useCallback(() => {
    // This is just a placeholder function - actual implementation would involve
    // redirecting to the Pomodoro timer page, possibly with a selected task
    toast({
      title: "Study Session Started",
      description: "Timer is ready for your focus session",
    });
  }, [toast]);

  return {
    sessions,
    isLoading,
    todaySessions,
    upcomingDeadlines,
    addSession,
    updateSession,
    deleteSession,
    getSessionsByDate,
    startStudySession,
  };
};
