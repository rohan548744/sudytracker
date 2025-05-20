import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { getFromStorage, saveToStorage } from "@/lib/localStorage";
import { Subject, InsertSubject } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/contexts/user-context";
import { queryClient } from "@/lib/queryClient";

// Initial demo subjects if no subjects exist
const initialSubjects: Subject[] = [
  {
    id: 1,
    userId: 1,
    name: "Calculus",
    color: "blue",
    description: "Calculus and advanced mathematics",
  },
  {
    id: 2,
    userId: 1,
    name: "Physics",
    color: "purple",
    description: "Physics and mechanics",
  },
  {
    id: 3,
    userId: 1,
    name: "Biology",
    color: "green",
    description: "Biology and life sciences",
  },
];

export const useSubjects = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load subjects from local storage or API
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        // Try to load from API first
        if (user && user.id) {
          try {
            const response = await apiRequest("GET", `/api/subjects?userId=${user.id}`, undefined);
            const data = await response.json();
            setSubjects(data);
            saveToStorage("subjects", data);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error("Failed to fetch subjects from API:", error);
            // Fall back to local storage if API fails
          }
        }

        // Load from local storage
        const storedSubjects = getFromStorage<Subject[]>("subjects", initialSubjects);
        setSubjects(storedSubjects);
      } catch (error) {
        console.error("Error loading subjects:", error);
        toast({
          title: "Error",
          description: "Failed to load subject data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSubjects();
  }, [user, toast]);

  // Add a new subject
  const addSubject = useCallback(
    async (subjectData: InsertSubject) => {
      try {
        // Try to add via API first
        if (user && user.id) {
          try {
            const response = await apiRequest("POST", "/api/subjects", subjectData);
            const newSubject = await response.json();
            
            setSubjects((prevSubjects) => {
              const updatedSubjects = [...prevSubjects, newSubject];
              saveToStorage("subjects", updatedSubjects);
              return updatedSubjects;
            });
            
            // Invalidate subjects cache
            queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
            
            return newSubject;
          } catch (error) {
            console.error("Failed to add subject via API:", error);
            // Fall back to local storage if API fails
          }
        }

        // Add to local storage if API is not available
        const newSubject: Subject = {
          ...subjectData,
          id: Math.max(0, ...subjects.map((s) => s.id)) + 1,
        };

        setSubjects((prevSubjects) => {
          const updatedSubjects = [...prevSubjects, newSubject];
          saveToStorage("subjects", updatedSubjects);
          return updatedSubjects;
        });

        return newSubject;
      } catch (error) {
        console.error("Error adding subject:", error);
        toast({
          title: "Error",
          description: "Failed to add new subject",
          variant: "destructive",
        });
        throw error;
      }
    },
    [subjects, user, toast]
  );

  // Update an existing subject
  const updateSubject = useCallback(
    async (subjectId: number, updatedData: Partial<InsertSubject>) => {
      try {
        // Try to update via API first
        if (user && user.id) {
          try {
            const response = await apiRequest("PUT", `/api/subjects/${subjectId}`, updatedData);
            const updatedSubject = await response.json();
            
            setSubjects((prevSubjects) => {
              const updatedSubjects = prevSubjects.map((subject) =>
                subject.id === subjectId ? { ...subject, ...updatedSubject } : subject
              );
              saveToStorage("subjects", updatedSubjects);
              return updatedSubjects;
            });
            
            // Invalidate subjects cache
            queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
            
            return updatedSubject;
          } catch (error) {
            console.error("Failed to update subject via API:", error);
            // Fall back to local storage if API fails
          }
        }

        // Update in local storage if API is not available
        setSubjects((prevSubjects) => {
          const subjectIndex = prevSubjects.findIndex((subject) => subject.id === subjectId);
          
          if (subjectIndex === -1) {
            throw new Error(`Subject with ID ${subjectId} not found`);
          }
          
          const updatedSubjects = [...prevSubjects];
          updatedSubjects[subjectIndex] = {
            ...updatedSubjects[subjectIndex],
            ...updatedData,
          };
          
          saveToStorage("subjects", updatedSubjects);
          return updatedSubjects;
        });

        return subjects.find((subject) => subject.id === subjectId);
      } catch (error) {
        console.error("Error updating subject:", error);
        toast({
          title: "Error",
          description: "Failed to update subject",
          variant: "destructive",
        });
        throw error;
      }
    },
    [subjects, user, toast]
  );

  // Delete a subject
  const deleteSubject = useCallback(
    async (subjectId: number) => {
      try {
        // Try to delete via API first
        if (user && user.id) {
          try {
            await apiRequest("DELETE", `/api/subjects/${subjectId}`, undefined);
            
            setSubjects((prevSubjects) => {
              const updatedSubjects = prevSubjects.filter((subject) => subject.id !== subjectId);
              saveToStorage("subjects", updatedSubjects);
              return updatedSubjects;
            });
            
            // Invalidate subjects cache
            queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
            
            return true;
          } catch (error) {
            console.error("Failed to delete subject via API:", error);
            // Fall back to local storage if API fails
          }
        }

        // Delete from local storage if API is not available
        setSubjects((prevSubjects) => {
          const updatedSubjects = prevSubjects.filter((subject) => subject.id !== subjectId);
          saveToStorage("subjects", updatedSubjects);
          return updatedSubjects;
        });

        return true;
      } catch (error) {
        console.error("Error deleting subject:", error);
        toast({
          title: "Error",
          description: "Failed to delete subject",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast]
  );

  return {
    subjects,
    isLoading,
    addSubject,
    updateSubject,
    deleteSubject,
  };
};
