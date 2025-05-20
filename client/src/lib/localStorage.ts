// Types for local storage
type StorageKey =
  | "user"
  | "subjects"
  | "tasks"
  | "studySessions"
  | "studyTimeRecords"
  | "pomodoroSettings";

/**
 * Get data from local storage with type safety
 */
export function getFromStorage<T>(key: StorageKey, defaultValue: T): T {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from local storage:`, error);
    return defaultValue;
  }
}

/**
 * Save data to local storage
 */
export function saveToStorage<T>(key: StorageKey, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to local storage:`, error);
  }
}

/**
 * Clear a specific item from local storage
 */
export function clearFromStorage(key: StorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from local storage:`, error);
  }
}

/**
 * Clear all app data from local storage
 */
export function clearAllStorage(): void {
  try {
    clearFromStorage("user");
    clearFromStorage("subjects");
    clearFromStorage("tasks");
    clearFromStorage("studySessions");
    clearFromStorage("studyTimeRecords");
    clearFromStorage("pomodoroSettings");
  } catch (error) {
    console.error("Error clearing all data from local storage:", error);
  }
}

/**
 * Check if the app has been initialized with data
 */
export function isAppInitialized(): boolean {
  return !!localStorage.getItem("user");
}
