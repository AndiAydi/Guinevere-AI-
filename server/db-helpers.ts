import { eq, desc } from "drizzle-orm";
import { conversations, userRelationships, type InsertConversation, type InsertUserRelationship } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get or create user relationship record
 */
export async function getOrCreateUserRelationship(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(userRelationships).where(eq(userRelationships.userId, userId)).limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new relationship record
  const newRelationship: InsertUserRelationship = {
    userId,
    relationshipLevel: 0,
    currentMode: "normal",
    totalInteractions: 0,
    happinessLevel: 50,
  };

  await db.insert(userRelationships).values(newRelationship);

  const created = await db.select().from(userRelationships).where(eq(userRelationships.userId, userId)).limit(1);

  return created[0];
}

/**
 * Get conversation history untuk user
 */
export async function getConversationHistory(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const history = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.createdAt))
    .limit(limit);

  // Reverse to get chronological order
  return history.reverse();
}

/**
 * Add message to conversation history
 */
export async function addConversationMessage(
  userId: number,
  role: "user" | "assistant",
  content: string,
  mode: "normal" | "deep" | "close" = "normal",
  emotionalState: string = "neutral",
  containsButterflyMention: boolean = false
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const message: InsertConversation = {
    userId,
    role,
    content,
    mode,
    emotionalState,
    containsButterflyMention: containsButterflyMention ? 1 : 0,
  };

  await db.insert(conversations).values(message);
}

/**
 * Update user relationship
 */
export async function updateUserRelationship(userId: number, updates: Partial<typeof userRelationships.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(userRelationships).set({ ...updates, updatedAt: new Date() }).where(eq(userRelationships.userId, userId));

  // Return updated record
  const updated = await db.select().from(userRelationships).where(eq(userRelationships.userId, userId)).limit(1);

  return updated[0];
}

/**
 * Get recent conversations untuk context (last 10 messages)
 */
export async function getRecentConversationContext(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const recent = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.createdAt))
    .limit(limit);

  // Reverse to get chronological order and format for LLM
  return recent
    .reverse()
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
}

/**
 * Clear old conversations (keep last 100)
 */
export async function cleanupOldConversations(userId: number, keepCount: number = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all conversations for user, ordered by date
  const allConversations = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.createdAt));

  if (allConversations.length > keepCount) {
    // Delete oldest conversations
    const toDelete = allConversations.slice(keepCount);
    const idsToDelete = toDelete.map((c) => c.id);

    // Delete in batches to avoid query size limits
    for (let i = 0; i < idsToDelete.length; i += 100) {
      const batch = idsToDelete.slice(i, i + 100);
      await db.delete(conversations).where(eq(conversations.id, batch[0]));
    }
  }
}
