import { User, InsertUser, List, InsertList, Item, InsertItem, Debt } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { nanoid } from "nanoid";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createList(list: InsertList & { createdBy: number }): Promise<List>;
  getList(id: number): Promise<List | undefined>;
  getListByCode(code: string): Promise<List | undefined>;
  getListsForUser(userId: number): Promise<List[]>;
  addUserToList(listId: number, userId: number): Promise<void>;

  addItem(item: InsertItem & { listId: number }): Promise<Item>;
  updateItem(id: number, updates: Partial<Item>): Promise<Item>;
  getItemsForList(listId: number): Promise<Item[]>;

  recordDebt(debt: Omit<Debt, "id">): Promise<Debt>;
  getDebtsForList(listId: number): Promise<Debt[]>;
  settleDebt(id: number): Promise<Debt>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lists: Map<number, List>;
  private items: Map<number, Item>;
  private debts: Map<number, Debt>;
  private listMembers: Map<number, Set<number>>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.lists = new Map();
    this.items = new Map();
    this.debts = new Map();
    this.listMembers = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createList(insertList: InsertList & { createdBy: number }): Promise<List> {
    const id = this.currentId++;
    const list: List = {
      ...insertList,
      id,
      code: nanoid(6),
      createdAt: new Date(),
    };
    this.lists.set(id, list);
    this.listMembers.set(id, new Set([insertList.createdBy]));
    return list;
  }

  async getList(id: number): Promise<List | undefined> {
    return this.lists.get(id);
  }

  async getListByCode(code: string): Promise<List | undefined> {
    return Array.from(this.lists.values()).find((list) => list.code === code);
  }

  async getListsForUser(userId: number): Promise<List[]> {
    return Array.from(this.lists.values()).filter((list) => 
      this.listMembers.get(list.id)?.has(userId)
    );
  }

  async addUserToList(listId: number, userId: number): Promise<void> {
    const members = this.listMembers.get(listId);
    if (!members) throw new Error("List not found");
    members.add(userId);
  }

  async addItem(item: InsertItem & { listId: number }): Promise<Item> {
    const id = this.currentId++;
    const newItem: Item = { ...item, id, completed: false };
    this.items.set(id, newItem);
    return newItem;
  }

  async updateItem(id: number, updates: Partial<Item>): Promise<Item> {
    const item = this.items.get(id);
    if (!item) throw new Error("Item not found");
    const updatedItem = { ...item, ...updates };
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  async getItemsForList(listId: number): Promise<Item[]> {
    return Array.from(this.items.values()).filter(
      (item) => item.listId === listId
    );
  }

  async recordDebt(debt: Omit<Debt, "id">): Promise<Debt> {
    const id = this.currentId++;
    const newDebt: Debt = { ...debt, id };
    this.debts.set(id, newDebt);
    return newDebt;
  }

  async getDebtsForList(listId: number): Promise<Debt[]> {
    return Array.from(this.debts.values()).filter(
      (debt) => debt.listId === listId
    );
  }

  async settleDebt(id: number): Promise<Debt> {
    const debt = this.debts.get(id);
    if (!debt) throw new Error("Debt not found");
    const settledDebt = { ...debt, settled: true };
    this.debts.set(id, settledDebt);
    return settledDebt;
  }
}

export const storage = new MemStorage();