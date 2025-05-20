import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { getFromStorage, saveToStorage } from "@/lib/localStorage";

// Default user for demo purposes
const defaultUser: User = {
  id: 1,
  username: "john_student",
  password: "password123", // In a real app, never store passwords like this
  firstName: "John",
  lastName: "Student",
  email: "john@example.com",
};

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  isLoading: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = getFromStorage<User>("user", defaultUser);
        setUser(storedUser);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Update local storage when user changes
  useEffect(() => {
    if (!isLoading) {
      saveToStorage("user", user);
    }
  }, [user, isLoading]);

  // Log out user (reset to default in this demo)
  const logout = () => {
    setUser(defaultUser);
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
