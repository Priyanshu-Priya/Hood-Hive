import session from "express-session";
import { User, Project, Comment, InsertUser } from "@shared/schema";

export interface IStorage {
  sessionStore: session.Store;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project methods
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: any & { userId: number }): Promise<Project>;
  deleteProject(projectId: number, userId: number): Promise<boolean>;
  updateProjectVotes(projectId: number, userId: number, value: number): Promise<void>;
  hasUserVoted(projectId: number, userId: number): Promise<boolean>;

  // Comment methods
  getProjectComments(projectId: number): Promise<Comment[]>;
  createComment(comment: any & { userId: number }): Promise<Comment>;
}