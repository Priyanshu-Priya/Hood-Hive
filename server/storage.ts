import { db } from "./firebase";
import type { User, Project, Comment, InsertUser } from "@shared/schema";
import type { IStorage } from "./types";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class FirebaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const doc = await db.collection('users').doc(id.toString()).get();
    return doc.exists ? (doc.data() as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const snapshot = await db.collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();

    if (snapshot.empty) return undefined;
    return { id: parseInt(snapshot.docs[0].id), ...snapshot.docs[0].data() } as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const usersRef = db.collection('users');
    const countSnapshot = await usersRef.count().get();
    const id = countSnapshot.data().count + 1;

    const user: User = {
      ...insertUser,
      id,
      reputation: 0,
      avatar: null
    };

    await usersRef.doc(id.toString()).set(user);
    return user;
  }

  async getAllProjects(): Promise<Project[]> {
    const snapshot = await db.collection('projects').get();
    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    })) as Project[];
  }

  async getProject(id: number): Promise<Project | undefined> {
    const doc = await db.collection('projects').doc(id.toString()).get();
    if (!doc.exists) return undefined;
    return { id, ...doc.data() } as Project;
  }

  async createProject(project: any & { userId: number }): Promise<Project> {
    const projectsRef = db.collection('projects');
    const countSnapshot = await projectsRef.count().get();
    const id = countSnapshot.data().count + 1;

    const newProject: Project = {
      ...project,
      id,
      status: "active",
      impactScore: 0,
      votes: 0,
      createdAt: new Date()
    };

    await projectsRef.doc(id.toString()).set(newProject);
    return newProject;
  }

  async deleteProject(projectId: number, userId: number): Promise<boolean> {
    const projectRef = db.collection('projects').doc(projectId.toString());
    const doc = await projectRef.get();

    if (!doc.exists) return false;
    const project = doc.data();
    if (project?.userId !== userId) return false;

    await projectRef.delete();
    return true;
  }

  async hasUserVoted(projectId: number, userId: number): Promise<boolean> {
    const snapshot = await db.collection('project_votes')
      .where('projectId', '==', projectId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    return !snapshot.empty;
  }

  async updateProjectVotes(projectId: number, userId: number, value: number): Promise<void> {
    const projectRef = db.collection('projects').doc(projectId.toString());
    const votesRef = db.collection('project_votes');

    await db.runTransaction(async (transaction) => {
      // Check if user has already voted
      const voteSnapshot = await votesRef
        .where('projectId', '==', projectId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (!voteSnapshot.empty) {
        throw new Error('User has already voted on this project');
      }

      // Update project votes
      const projectDoc = await transaction.get(projectRef);
      if (!projectDoc.exists) {
        throw new Error('Project not found');
      }

      const currentVotes = projectDoc.data()?.votes || 0;
      transaction.update(projectRef, { votes: currentVotes + value });

      // Record the vote
      const voteDoc = votesRef.doc();
      transaction.set(voteDoc, {
        userId,
        projectId,
        value,
        createdAt: new Date()
      });
    });
  }

  async getProjectComments(projectId: number): Promise<Comment[]> {
    const snapshot = await db.collection('comments')
      .where('projectId', '==', projectId)
      .get();

    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    })) as Comment[];
  }

  async createComment(comment: any & { userId: number }): Promise<Comment> {
    const commentsRef = db.collection('comments');
    const countSnapshot = await commentsRef.count().get();
    const id = countSnapshot.data().count + 1;

    const newComment: Comment = {
      ...comment,
      id,
      createdAt: new Date()
    };

    await commentsRef.doc(id.toString()).set(newComment);
    return newComment;
  }
}

export const storage = new FirebaseStorage();