import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProjectSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Projects
  app.get("/api/projects", async (req, res) => {
    const projects = await storage.getAllProjects();
    res.json(projects);
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validated = insertProjectSchema.parse(req.body);
    const project = await storage.createProject({
      ...validated,
      userId: req.user.id
    });
    res.status(201).json(project);
  });

  app.get("/api/projects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    if (!project) return res.sendStatus(404);
    res.json(project);
  });

  app.delete("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const projectId = parseInt(req.params.id);
    const success = await storage.deleteProject(projectId, req.user.id);
    if (!success) return res.sendStatus(403);
    res.sendStatus(200);
  });

  // Comments
  app.get("/api/projects/:id/comments", async (req, res) => {
    const id = parseInt(req.params.id);
    const comments = await storage.getProjectComments(id);
    res.json(comments);
  });

  app.post("/api/projects/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const projectId = parseInt(req.params.id);
    const validated = insertCommentSchema.parse(req.body);
    const comment = await storage.createComment({
      ...validated,
      projectId,
      userId: req.user.id
    });
    res.status(201).json(comment);
  });

  // Votes
  app.post("/api/projects/:id/vote", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const projectId = parseInt(req.params.id);
    const vote = z.object({ value: z.number().min(-1).max(1) }).parse(req.body);

    try {
      await storage.updateProjectVotes(projectId, req.user.id, vote.value);
      res.sendStatus(200);
    } catch (error) {
      if (error.message === 'User has already voted on this project') {
        return res.status(400).json({ message: 'You have already voted on this project' });
      }
      throw error;
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}