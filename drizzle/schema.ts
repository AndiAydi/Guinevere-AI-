import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Conversation history table - stores all messages between user and Guinevere
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  mode: mysqlEnum("mode", ["normal", "deep", "close", "casual"]).default("normal").notNull(),
  emotionalState: varchar("emotionalState", { length: 50 }).default("neutral"),
  containsButterflyMention: int("containsButterflyMention").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * User relationship tracking - stores the relationship level and personality state for each user
 */
export const userRelationships = mysqlTable("userRelationships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  relationshipLevel: int("relationshipLevel").default(0).notNull(), // 0-100, determines mode switching
  currentMode: mysqlEnum("currentMode", ["normal", "deep", "close", "casual"]).default("normal").notNull(),
  totalInteractions: int("totalInteractions").default(0).notNull(),
  lastInteractionAt: timestamp("lastInteractionAt"),
  hasBeenHurt: int("hasBeenHurt").default(0), // Boolean flag for emotional state
  happinessLevel: int("happinessLevel").default(50).notNull(), // 0-100
  lastButterflyMentionAt: timestamp("lastButterflyMentionAt"),
  personalityNotes: text("personalityNotes"), // Store observations about user
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserRelationship = typeof userRelationships.$inferSelect;
export type InsertUserRelationship = typeof userRelationships.$inferInsert;
/**
 * User preferences table - stores user settings and preferences
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  theme: mysqlEnum("theme", ["light", "dark", "auto"]).default("light").notNull(),
  language: mysqlEnum("language", ["id", "en", "ja"]).default("id").notNull(),
  personalityIntensity: mysqlEnum("personalityIntensity", ["subtle", "normal", "intense"]).default("normal").notNull(),
  autoSaveConversations: int("autoSaveConversations").default(1).notNull(),
  notificationsEnabled: int("notificationsEnabled").default(1).notNull(),
  responseStreamingEnabled: int("responseStreamingEnabled").default(1).notNull(),
  deepLearningEnabled: int("deepLearningEnabled").default(1).notNull(),
  eleganceDisabled: int("eleganceDisabled").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;
