import { 
  users, User, InsertUser, 
  subjects, Subject, InsertSubject,
  tasks, Task, InsertTask,
  studySessions, StudySession, InsertStudySession,
  studyTimeRecords, StudyTimeRecord, InsertStudyTimeRecord
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Subject methods
  getSubjects(userId: number): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: number): Promise<boolean>;
  
  // Task methods
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Study Session methods
  getStudySessions(userId: number): Promise<StudySession[]>;
  getStudySession(id: number): Promise<StudySession | undefined>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: number, session: Partial<InsertStudySession>): Promise<StudySession | undefined>;
  deleteStudySession(id: number): Promise<boolean>;
  
  // Study Time Record methods
  getStudyTimeRecords(userId: number): Promise<StudyTimeRecord[]>;
  createStudyTimeRecord(record: InsertStudyTimeRecord): Promise<StudyTimeRecord>;
  getStudyTimeRecordsByDateRange(userId: number, startDate: string, endDate: string): Promise<StudyTimeRecord[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subjects: Map<number, Subject>;
  private tasks: Map<number, Task>;
  private studySessions: Map<number, StudySession>;
  private studyTimeRecords: Map<number, StudyTimeRecord>;
  
  private userId: number;
  private subjectId: number;
  private taskId: number;
  private sessionId: number;
  private recordId: number;

  constructor() {
    this.users = new Map();
    this.subjects = new Map();
    this.tasks = new Map();
    this.studySessions = new Map();
    this.studyTimeRecords = new Map();
    
    this.userId = 1;
    this.subjectId = 1;
    this.taskId = 1;
    this.sessionId = 1;
    this.recordId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Subject methods
  async getSubjects(userId: number): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(
      (subject) => subject.userId === userId
    );
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = this.subjectId++;
    const subject: Subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }

  async updateSubject(id: number, updatedSubject: Partial<InsertSubject>): Promise<Subject | undefined> {
    const existingSubject = this.subjects.get(id);
    if (!existingSubject) return undefined;
    
    const updated = { ...existingSubject, ...updatedSubject };
    this.subjects.set(id, updated);
    return updated;
  }

  async deleteSubject(id: number): Promise<boolean> {
    return this.subjects.delete(id);
  }

  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updatedTask: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updated = { ...existingTask, ...updatedTask };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Study Session methods
  async getStudySessions(userId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  async getStudySession(id: number): Promise<StudySession | undefined> {
    return this.studySessions.get(id);
  }

  async createStudySession(insertSession: InsertStudySession): Promise<StudySession> {
    const id = this.sessionId++;
    const session: StudySession = { ...insertSession, id };
    this.studySessions.set(id, session);
    return session;
  }

  async updateStudySession(id: number, updatedSession: Partial<InsertStudySession>): Promise<StudySession | undefined> {
    const existingSession = this.studySessions.get(id);
    if (!existingSession) return undefined;
    
    const updated = { ...existingSession, ...updatedSession };
    this.studySessions.set(id, updated);
    return updated;
  }

  async deleteStudySession(id: number): Promise<boolean> {
    return this.studySessions.delete(id);
  }

  // Study Time Record methods
  async getStudyTimeRecords(userId: number): Promise<StudyTimeRecord[]> {
    return Array.from(this.studyTimeRecords.values()).filter(
      (record) => record.userId === userId
    );
  }

  async createStudyTimeRecord(insertRecord: InsertStudyTimeRecord): Promise<StudyTimeRecord> {
    const id = this.recordId++;
    const record: StudyTimeRecord = { ...insertRecord, id };
    this.studyTimeRecords.set(id, record);
    return record;
  }

  async getStudyTimeRecordsByDateRange(userId: number, startDate: string, endDate: string): Promise<StudyTimeRecord[]> {
    return Array.from(this.studyTimeRecords.values()).filter(
      (record) => record.userId === userId && 
                  record.date >= startDate && 
                  record.date <= endDate
    );
  }
}

export const storage = new MemStorage();
