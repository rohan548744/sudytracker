import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertSubjectSchema, 
  insertTaskSchema, 
  insertStudySessionSchema, 
  insertStudyTimeRecordSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  });

  // Subject routes
  app.get("/api/subjects", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const subjects = await storage.getSubjects(userId);
    res.status(200).json(subjects);
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(subjectData);
      res.status(201).json(subject);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subjectData = insertSubjectSchema.partial().parse(req.body);
      
      const updatedSubject = await storage.updateSubject(id, subjectData);
      
      if (!updatedSubject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      res.status(200).json(updatedSubject);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteSubject(id);
    
    if (!success) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    res.status(204).end();
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const tasks = await storage.getTasks(userId);
    res.status(200).json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = insertTaskSchema.partial().parse(req.body);
      
      const updatedTask = await storage.updateTask(id, taskData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteTask(id);
    
    if (!success) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.status(204).end();
  });

  // Study Session routes
  app.get("/api/study-sessions", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const sessions = await storage.getStudySessions(userId);
    res.status(200).json(sessions);
  });

  app.post("/api/study-sessions", async (req, res) => {
    try {
      const sessionData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/study-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sessionData = insertStudySessionSchema.partial().parse(req.body);
      
      const updatedSession = await storage.updateStudySession(id, sessionData);
      
      if (!updatedSession) {
        return res.status(404).json({ message: "Study session not found" });
      }
      
      res.status(200).json(updatedSession);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/study-sessions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteStudySession(id);
    
    if (!success) {
      return res.status(404).json({ message: "Study session not found" });
    }
    
    res.status(204).end();
  });

  // Study Time Record routes
  app.get("/api/study-time-records", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    if (startDate && endDate) {
      const records = await storage.getStudyTimeRecordsByDateRange(userId, startDate, endDate);
      return res.status(200).json(records);
    }
    
    const records = await storage.getStudyTimeRecords(userId);
    res.status(200).json(records);
  });

  app.post("/api/study-time-records", async (req, res) => {
    try {
      const recordData = insertStudyTimeRecordSchema.parse(req.body);
      const record = await storage.createStudyTimeRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  return httpServer;
}
