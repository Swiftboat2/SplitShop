import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertListSchema, insertItemSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/lists", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const lists = await storage.getListsForUser(req.user.id);
    res.json(lists);
  });

  app.post("/api/lists", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertListSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    
    const list = await storage.createList({
      ...parsed.data,
      createdBy: req.user.id,
    });
    res.status(201).json(list);
  });

  app.post("/api/lists/join/:code", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const list = await storage.getListByCode(req.params.code);
    if (!list) return res.status(404).send("List not found");
    
    await storage.addUserToList(list.id, req.user.id);
    res.json(list);
  });

  app.get("/api/lists/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const items = await storage.getItemsForList(parseInt(req.params.id));
    res.json(items);
  });

  app.post("/api/lists/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    
    const item = await storage.addItem({
      ...parsed.data,
      listId: parseInt(req.params.id),
    });
    res.status(201).json(item);
  });

  app.patch("/api/items/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const item = await storage.updateItem(parseInt(req.params.id), req.body);
    res.json(item);
  });

  app.get("/api/lists/:id/debts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const debts = await storage.getDebtsForList(parseInt(req.params.id));
    res.json(debts);
  });

  app.post("/api/lists/:id/calculate-debts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const listId = parseInt(req.params.id);
    const items = await storage.getItemsForList(listId);
    
    // Simple debt calculation - each person owes an equal share
    const itemsWithPayers = items.filter(item => item.paidBy && item.price);
    const totalPerPerson = new Map<number, number>();
    
    for (const item of itemsWithPayers) {
      const amount = Number(item.price);
      totalPerPerson.set(item.paidBy!, (totalPerPerson.get(item.paidBy!) || 0) + amount);
    }

    const debts: Omit<Debt, "id">[] = [];
    const entries = Array.from(totalPerPerson.entries());
    
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [user1, total1] = entries[i];
        const [user2, total2] = entries[j];
        const diff = total1 - total2;
        
        if (diff > 0) {
          debts.push({
            listId,
            fromUser: user2,
            toUser: user1,
            amount: diff / 2,
            settled: false,
          });
        } else if (diff < 0) {
          debts.push({
            listId,
            fromUser: user1,
            toUser: user2,
            amount: Math.abs(diff) / 2,
            settled: false,
          });
        }
      }
    }

    const createdDebts = await Promise.all(
      debts.map(debt => storage.recordDebt(debt))
    );
    
    res.json(createdDebts);
  });

  app.post("/api/debts/:id/settle", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const debt = await storage.settleDebt(parseInt(req.params.id));
    res.json(debt);
  });

  const httpServer = createServer(app);
  return httpServer;
}
