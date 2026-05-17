/**
 * Analytics Service - Untuk tracking dan analyzing conversation patterns
 */

import { getDb } from "../db";
import { conversations } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export interface ConversationAnalytics {
  totalMessages: number;
  totalConversations: number;
  averageMessageLength: number;
  modeDistribution: {
    normal: number;
    deep: number;
    close: number;
  };
  emotionalStateDistribution: {
    [key: string]: number;
  };
  butterflyMentionCount: number;
  topicDistribution: {
    [key: string]: number;
  };
  engagementScore: number;
  lastActivityDate: Date | null;
}

export interface UserInsights {
  userId: number;
  totalInteractions: number;
  averageResponseTime: number;
  preferredMode: "normal" | "deep" | "close";
  emotionalTrend: "improving" | "stable" | "declining";
  engagementLevel: "low" | "medium" | "high";
  topicInterests: string[];
  relationshipProgression: number; // 0-100
}

export class AnalyticsService {
  /**
   * Get comprehensive conversation analytics untuk user
   */
  static async getConversationAnalytics(
    userId: number,
    timeRange?: { startDate: Date; endDate: Date }
  ): Promise<ConversationAnalytics> {
    const db = await getDb();
    if (!db) {
      return this.getEmptyAnalytics();
    }

    try {
      let query = db
        .select()
        .from(conversations)
        .where(eq(conversations.userId, userId));

      // Apply time range if provided
      if (timeRange) {
        query = db
          .select()
          .from(conversations)
          .where(
            and(
              eq(conversations.userId, userId),
              gte(conversations.createdAt, timeRange.startDate),
              lte(conversations.createdAt, timeRange.endDate)
            )
          );
      }

      const messages = await query;

      return this.processAnalytics(messages);
    } catch (error) {
      console.error("Error getting conversation analytics:", error);
      return this.getEmptyAnalytics();
    }
  }

  /**
   * Get user insights berdasarkan conversation history
   */
  static async getUserInsights(userId: number): Promise<UserInsights> {
    const db = await getDb();
    if (!db) {
      return this.getEmptyInsights(userId);
    }

    try {
      const messages = await db
        .select()
        .from(conversations)
        .where(eq(conversations.userId, userId));

      const analytics = this.processAnalytics(messages);

      // Determine preferred mode
      const modeDistribution = analytics.modeDistribution;
      const preferredMode = (
        Object.entries(modeDistribution).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "normal"
      ) as "normal" | "deep" | "close";

      // Calculate engagement level
      const engagementLevel =
        analytics.engagementScore > 70
          ? "high"
          : analytics.engagementScore > 40
            ? "medium"
            : "low";

      // Determine emotional trend (simplified)
      const recentMessages = messages.slice(-10);
      const oldMessages = messages.slice(0, 10);

      const recentPositive = recentMessages.filter(
        (m) => m.emotionalState === "happy" || m.emotionalState === "warm"
      ).length;
      const oldPositive = oldMessages.filter(
        (m) => m.emotionalState === "happy" || m.emotionalState === "warm"
      ).length;

      const emotionalTrend =
        recentPositive > oldPositive
          ? "improving"
          : recentPositive < oldPositive
            ? "declining"
            : "stable";

      return {
        userId,
        totalInteractions: analytics.totalMessages,
        averageResponseTime: 1200, // Placeholder
        preferredMode,
        emotionalTrend,
        engagementLevel,
        topicInterests: this.extractTopics(messages),
        relationshipProgression: Math.min(
          100,
          Math.floor((analytics.totalMessages / 100) * 50)
        ),
      };
    } catch (error) {
      console.error("Error getting user insights:", error);
      return this.getEmptyInsights(userId);
    }
  }

  /**
   * Process raw messages ke analytics
   */
  private static processAnalytics(
    messages: typeof conversations.$inferSelect[]
  ): ConversationAnalytics {
    const modeDistribution = { normal: 0, deep: 0, close: 0 };
    const emotionalStateDistribution: { [key: string]: number } = {};
    let butterflyMentionCount = 0;
    let totalLength = 0;

    messages.forEach((msg) => {
      // Count modes
      if (msg.mode in modeDistribution) {
        modeDistribution[msg.mode as keyof typeof modeDistribution]++;
      }

      // Count emotional states
      if (msg.emotionalState) {
        emotionalStateDistribution[msg.emotionalState] =
          (emotionalStateDistribution[msg.emotionalState] || 0) + 1;
      }

      // Count butterfly mentions
      if (msg.containsButterflyMention) {
        butterflyMentionCount++;
      }

      // Sum message lengths
      totalLength += msg.content.length;
    });

    const engagementScore = Math.min(
      100,
      Math.floor((messages.length / 10) * 20 + (butterflyMentionCount / 5) * 10)
    );

    return {
      totalMessages: messages.length,
      totalConversations: 1, // Simplified
      averageMessageLength: messages.length > 0 ? totalLength / messages.length : 0,
      modeDistribution,
      emotionalStateDistribution,
      butterflyMentionCount,
      topicDistribution: {}, // Placeholder
      engagementScore,
      lastActivityDate:
        messages.length > 0
          ? messages[messages.length - 1]?.createdAt || null
          : null,
    };
  }

  /**
   * Extract topics dari messages
   */
  private static extractTopics(
    messages: typeof conversations.$inferSelect[]
  ): string[] {
    const topics: { [key: string]: number } = {};
    const keywords = [
      "code",
      "bug",
      "algorithm",
      "design",
      "optimization",
      "debugging",
      "performance",
      "database",
      "api",
      "security",
    ];

    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();
      keywords.forEach((keyword) => {
        if (content.includes(keyword)) {
          topics[keyword] = (topics[keyword] || 0) + 1;
        }
      });
    });

    return Object.entries(topics)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  /**
   * Get empty analytics
   */
  private static getEmptyAnalytics(): ConversationAnalytics {
    return {
      totalMessages: 0,
      totalConversations: 0,
      averageMessageLength: 0,
      modeDistribution: { normal: 0, deep: 0, close: 0 },
      emotionalStateDistribution: {},
      butterflyMentionCount: 0,
      topicDistribution: {},
      engagementScore: 0,
      lastActivityDate: null,
    };
  }

  /**
   * Get empty insights
   */
  private static getEmptyInsights(userId: number): UserInsights {
    return {
      userId,
      totalInteractions: 0,
      averageResponseTime: 0,
      preferredMode: "normal",
      emotionalTrend: "stable",
      engagementLevel: "low",
      topicInterests: [],
      relationshipProgression: 0,
    };
  }
}
