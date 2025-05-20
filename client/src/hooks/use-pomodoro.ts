import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { getFromStorage, saveToStorage } from "@/lib/localStorage";

// Default Pomodoro timer settings
const defaultSettings = {
  focusDuration: 25,        // in minutes
  shortBreakDuration: 5,    // in minutes
  longBreakDuration: 15,    // in minutes
  sessionsBeforeLongBreak: 4,
};

// Types for timer state
type TimerMode = "focus" | "shortBreak" | "longBreak";

interface PomodoroSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

interface PomodoroState {
  settings: PomodoroSettings;
  completedFocusSessions: number;
  totalSessionTime: number;
  dailySessionTime: Record<string, number>;
}

export const usePomodoroTimer = () => {
  const { toast } = useToast();
  
  // Load settings from storage
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    return getFromStorage<PomodoroSettings>("pomodoroSettings", defaultSettings);
  });
  
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState<number>(settings.focusDuration * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(100);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [totalSessionTime, setTotalSessionTime] = useState<number>(0);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Format time to display (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Reset timer when mode changes
  useEffect(() => {
    let duration: number;
    
    switch (mode) {
      case "focus":
        duration = settings.focusDuration * 60;
        break;
      case "shortBreak":
        duration = settings.shortBreakDuration * 60;
        break;
      case "longBreak":
        duration = settings.longBreakDuration * 60;
        break;
      default:
        duration = settings.focusDuration * 60;
    }
    
    setTimeLeft(duration);
    setProgress(100);
    
    // Clean up existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsActive(false);
  }, [mode, settings]);
  
  // Handle timer tick
  const tick = useCallback(() => {
    setTimeLeft((prevTime) => {
      if (prevTime <= 1) {
        // Timer complete
        const wasInFocusMode = mode === "focus";
        
        if (wasInFocusMode) {
          // Increment completed sessions
          const newCompletedSessions = completedSessions + 1;
          setCompletedSessions(newCompletedSessions);
          
          // Add focus time to total
          setTotalSessionTime((prev) => prev + settings.focusDuration);
          
          // Show notification
          toast({
            title: "Focus Session Complete!",
            description: `Great job! You've completed ${newCompletedSessions} sessions today.`,
          });
          
          // Determine next mode
          if (newCompletedSessions % settings.sessionsBeforeLongBreak === 0) {
            setMode("longBreak");
          } else {
            setMode("shortBreak");
          }
        } else {
          // Break is over, go back to focus mode
          setMode("focus");
          
          // Show notification
          toast({
            title: `${mode === "shortBreak" ? "Short" : "Long"} Break Complete`,
            description: "Time to focus again!",
          });
        }
        
        // Stop the timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        setIsActive(false);
        return 0;
      }
      
      // Calculate progress percentage
      let totalSeconds: number;
      switch (mode) {
        case "focus":
          totalSeconds = settings.focusDuration * 60;
          break;
        case "shortBreak":
          totalSeconds = settings.shortBreakDuration * 60;
          break;
        case "longBreak":
          totalSeconds = settings.longBreakDuration * 60;
          break;
      }
      
      const newProgress = ((prevTime - 1) / totalSeconds) * 100;
      setProgress(newProgress);
      
      return prevTime - 1;
    });
  }, [mode, completedSessions, settings, toast]);
  
  // Start the timer
  const start = useCallback(() => {
    if (isActive || timeLeft === 0) return;
    
    setIsActive(true);
    startTimeRef.current = Date.now();
    
    // Set up the timer interval
    timerRef.current = window.setInterval(tick, 1000);
  }, [isActive, timeLeft, tick]);
  
  // Pause the timer
  const pause = useCallback(() => {
    if (!isActive) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsActive(false);
  }, [isActive]);
  
  // Reset the timer
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset timer based on current mode
    let duration: number;
    switch (mode) {
      case "focus":
        duration = settings.focusDuration * 60;
        break;
      case "shortBreak":
        duration = settings.shortBreakDuration * 60;
        break;
      case "longBreak":
        duration = settings.longBreakDuration * 60;
        break;
      default:
        duration = settings.focusDuration * 60;
    }
    
    setTimeLeft(duration);
    setProgress(100);
    setIsActive(false);
  }, [mode, settings]);
  
  // Skip to next session
  const skipToNext = useCallback(() => {
    if (mode === "focus") {
      // If in focus mode, increment completed sessions
      setCompletedSessions((prev) => prev + 1);
      
      // Add focus time to total (only the time elapsed)
      if (startTimeRef.current) {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const elapsedMinutes = Math.ceil(elapsedSeconds / 60);
        setTotalSessionTime((prev) => prev + elapsedMinutes);
      }
      
      // Determine next mode
      if ((completedSessions + 1) % settings.sessionsBeforeLongBreak === 0) {
        setMode("longBreak");
      } else {
        setMode("shortBreak");
      }
    } else {
      // If in break mode, go back to focus
      setMode("focus");
    }
    
    // Reset timer state
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsActive(false);
  }, [mode, completedSessions, settings, startTimeRef]);
  
  // Update timer settings
  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    setSettings((prevSettings) => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      saveToStorage("pomodoroSettings", updatedSettings);
      return updatedSettings;
    });
    
    // Reset the timer with new settings
    reset();
  }, [reset]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return {
    time: formatTime(timeLeft),
    mode,
    isActive,
    progress,
    settings,
    completedSessions,
    totalSessionTime,
    start,
    pause,
    reset,
    setMode,
    updateSettings,
    skipToNext,
  };
};
