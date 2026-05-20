import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

// 1. Definisikan semua Enum di luar (Global)
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const modeEnum = pgEnum("mode", ["normal", "deep", "close", "casual"]);
export const conversationRoleEnum = pgEnum("conversation_role", ["user", "assistant"]);
export const themeEnum = pgEnum("theme", ["light", "dark", "auto"]);
export const langEnum = pgEnum("language", ["id", "en", "ja"]);
export const intensityEnum = pgEnum("personalityIntensity", ["subtle", "normal", "intense"]);

// 2. Tabel Users
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// 3. Tabel Conversations
export const conversations = pgTable("conversations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull().references(() => users.id),
  role: conversationRoleEnum("role").notNull(), // Pakai Enum global
  content: text("content").notNull(),
  mode: modeEnum("mode").default("normal").notNull(),
  emotionalState: varchar("emotionalState", { length: 50 }).default("neutral"),
  containsButterflyMention: integer("containsButterflyMention").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// 4. Tabel User Relationships
export const userRelationships = pgTable("userRelationships", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull().unique().references(() => users.id),
  relationshipLevel: integer("relationshipLevel").default(0).notNull(),
  currentMode: modeEnum("currentMode").default("normal").notNull(),
  totalInteractions: integer("totalInteractions").default(0).notNull(),
  lastInteractionAt: timestamp("lastInteractionAt"),
  hasBeenHurt: integer("hasBeenHurt").default(0),
  happinessLevel: integer("happinessLevel").default(50).notNull(),
  lastButterflyMentionAt: timestamp("lastButterflyMentionAt"),
  personalityNotes: text("personalityNotes"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 5. Tabel User Preferences
export const userPreferences = pgTable("userPreferences", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull().unique().references(() => users.id),
  theme: themeEnum("theme").default("light").notNull(),
  language: langEnum("language").default("id").notNull(),
  personalityIntensity: intensityEnum("personalityIntensity").default("normal").notNull(),
  autoSaveConversations: integer("autoSaveConversations").default(1).notNull(),
  notificationsEnabled: integer("notificationsEnabled").default(1).notNull(),
  responseStreamingEnabled: integer("responseStreamingEnabled").default(1).notNull(),
  deepLearningEnabled: integer("deepLearningEnabled").default(1).notNull(),
  eleganceDisabled: integer("eleganceDisabled").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Types (biar TypeScript lu seneng)
export type User = typeof users.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type UserRelationship = typeof userRelationships.$inferSelect;
export type UserPreference = typeof userPreferences.$inferSelect;