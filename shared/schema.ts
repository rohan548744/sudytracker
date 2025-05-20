import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
});

// Subject schema
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  description: text("description"),
});

export const insertSubjectSchema = createInsertSchema(subjects).pick({
  userId: true,
  name: true,
  color: true,
  description: true,
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull(), // high, medium, low
  dueDate: text("due_date").notNull(),
  estimatedTime: integer("estimated_time"), // in minutes
  completed: boolean("completed").default(false),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  subjectId: true,
  title: true,
  description: true,
  priority: true,
  dueDate: true,
  estimatedTime: true,
  completed: true,
});

// Schedule/Study Session schema
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  date: text("date").notNull(),
  completed: boolean("completed").default(false),
  participants: integer("participants"),
});

export const insertStudySessionSchema = createInsertSchema(studySessions).pick({
  userId: true,
  subjectId: true,
  title: true,
  description: true,
  location: true,
  startTime: true,
  endTime: true,
  date: true,
  completed: true,
  participants: true,
});

// Study Time Record schema
export const studyTimeRecords = pgTable("study_time_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  taskId: integer("task_id"),
  date: text("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  focusScore: integer("focus_score"), // 0-100
});

export const insertStudyTimeRecordSchema = createInsertSchema(studyTimeRecords).pick({
  userId: true,
  subjectId: true,
  taskId: true,
  date: true,
  duration: true,
  focusScore: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;

export type StudyTimeRecord = typeof studyTimeRecords.$inferSelect;
export type InsertStudyTimeRecord = z.infer<typeof insertStudyTimeRecordSchema>;
