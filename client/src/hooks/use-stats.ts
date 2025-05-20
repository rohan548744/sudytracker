import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { getFromStorage, saveToStorage } from "@/lib/localStorage";
import { StudyTimeRecord, Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/contexts/user-context";
import { formatHoursMinutes, getCurrentWeekDates, getCurrentMonthDates } from "@/lib/dateUtils";
import { useTaskState } from "./use-tasks";

// Initial demo study time records if none exist
const initialStudyTimeRecords: StudyTimeRecord[] = [];

export const useStatsState = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const { tasks } = useTaskState();
  const [records, setRecords] = useState<StudyTimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get date ranges for current week and month
  const weekDates = getCurrentWeekDates();
  const monthDates = getCurrentMonthDates();

  // Load study time records from storage or API
  useEffect(() => {
    const loadRecords = async () => {
      try {
        // Try to load from API first
        if (user && user.id) {
          try {
            const response = await apiRequest(
              "GET",
              `/api/study-time-records?userId=${user.id}`,
              undefined
            );
            const data = await response.json();
            setRecords(data);
            saveToStorage("studyTimeRecords", data);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error("Failed to fetch study time records from API:", error);
            // Fall back to local storage if API fails
          }
        }

        // Load from local storage
        const storedRecords = getFromStorage<StudyTimeRecord[]>(
          "studyTimeRecords",
          initialStudyTimeRecords
        );
        setRecords(storedRecords);
      } catch (error) {
        console.error("Error loading study time records:", error);
        toast({
          title: "Error",
          description: "Failed to load study time data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, [user, toast]);

  // Filter records for the current week
  const weeklyRecords = useMemo(() => {
    return records.filter(
      (record) => record.date >= weekDates.start && record.date <= weekDates.end
    );
  }, [records, weekDates]);

  // Filter records for the current month
  const monthlyRecords = useMemo(() => {
    return records.filter(
      (record) => record.date >= monthDates.start && record.date <= monthDates.end
    );
  }, [records, monthDates]);

  // Get today's study time
  const todayStudyTime = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = records.filter((record) => record.date === today);
    const totalMinutes = todayRecords.reduce(
      (total, record) => total + record.duration,
      0
    );
    return formatHoursMinutes(totalMinutes);
  }, [records]);

  // Get completed tasks count
  const tasksCompleted = useMemo(() => {
    const completedCount = tasks.filter((task) => task.completed).length;
    return `${completedCount}/${tasks.length}`;
  }, [tasks]);

  // Calculate study streak
  const calculateStreak = (): number => {
    if (records.length === 0) return 0;

    // Get unique dates from records
    const studyDates = [
      ...new Set(records.map((record) => record.date)),
    ].sort();

    if (studyDates.length === 0) return 0;

    const today = new Date().toISOString().split("T")[0];
    let currentStreak = 0;

    // Check if studied today
    const studiedToday = studyDates.includes(today);

    // Start from today or yesterday
    let currentDate = new Date();
    if (!studiedToday) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Count consecutive days
    while (true) {
      const dateString = currentDate.toISOString().split("T")[0];
      if (studyDates.includes(dateString)) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return currentStreak;
  };

  // Calculate average focus score
  const calculateAverageFocusScore = (): string => {
    const scoresWithFocus = records.filter((record) => record.focusScore);
    
    if (scoresWithFocus.length === 0) return "N/A";
    
    const averageScore = Math.round(
      scoresWithFocus.reduce((sum, record) => sum + record.focusScore, 0) /
        scoresWithFocus.length
    );
    
    return `${averageScore}%`;
  };

  // Calculate weekly task completion data
  const weeklyTaskCompletion = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    const total = tasks.length;
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  // Calculate subject distribution
  const subjectDistribution = useMemo(() => {
    const distribution = {};
    
    records.forEach((record) => {
      const subjectId = record.subjectId;
      if (!distribution[subjectId]) {
        distribution[subjectId] = 0;
      }
      distribution[subjectId] += record.duration;
    });
    
    return distribution;
  }, [records]);

  // Compiled stats object
  const stats = useMemo(() => {
    return {
      todayStudyTime,
      tasksCompleted,
      streak: calculateStreak(),
      focusScore: calculateAverageFocusScore(),
    };
  }, [todayStudyTime, tasksCompleted, records]);

  return {
    records,
    weeklyRecords,
    monthlyRecords,
    stats,
    weeklyTaskCompletion,
    subjectDistribution,
    isLoading,
    weekStartDate: weekDates.start,
    weekEndDate: weekDates.end,
  };
};
