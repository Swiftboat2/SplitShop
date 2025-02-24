import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const listMembers = pgTable("list_members", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  userId: integer("user_id").notNull(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  name: text("name").notNull(),
  price: numeric("price"),
  completed: boolean("completed").default(false),
  paidBy: integer("paid_by"),
});

export const debts = pgTable("debts", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  fromUser: integer("from_user").notNull(),
  toUser: integer("to_user").notNull(),
  amount: numeric("amount").notNull(),
  settled: boolean("settled").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertListSchema = createInsertSchema(lists).pick({
  name: true,
});

export const insertItemSchema = createInsertSchema(items).pick({
  name: true,
  price: true,
  paidBy: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type List = typeof lists.$inferSelect;
export type InsertList = z.infer<typeof insertListSchema>;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Debt = typeof debts.$inferSelect;
