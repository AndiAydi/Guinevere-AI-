/**
 * User Preferences Service - Untuk manage user settings
 */

import { getDb } from "../db";
import { userPreferences } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface UserPreferences {
  userId: number;
  theme: "light" | "dark" | "auto";
  language: "id" | "en" | "ja";
  personalityIntensity: "subtle" | "normal" | "intense";
  autoSaveConversations: number;
  notificationsEnabled: number;
  responseStreamingEnabled: number;
}

export class UserPreferencesService {
  /**
   * Get user preferences dengan default values
   */
  static async getUserPreferences(userId: number): Promise<UserPreferences> {
    const db = await getDb();
    if (!db) {
      return this.getDefaultPreferences(userId);
    }

    try {
      const prefs = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1);

      if (prefs.length > 0) {
        return prefs[0] as UserPreferences;
      }

      // Create default preferences jika tidak ada
      return await this.createDefaultPreferences(userId);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    userId: number,
    updates: Partial<Omit<UserPreferences, "userId">>
  ): Promise<UserPreferences> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      await db
        .update(userPreferences)
        .set(updates)
        .where(eq(userPreferences.userId, userId));

      return this.getUserPreferences(userId);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      throw error;
    }
  }

  /**
   * Create default preferences untuk user baru
   */
  private static async createDefaultPreferences(
    userId: number
  ): Promise<UserPreferences> {
    const db = await getDb();
    if (!db) {
      return this.getDefaultPreferences(userId);
    }

    const defaults = this.getDefaultPreferences(userId);

    try {
      await db.insert(userPreferences).values(defaults);
      return defaults;
    } catch (error) {
      console.error("Error creating default preferences:", error);
      return defaults;
    }
  }

  /**
   * Get default preferences
   */
  private static getDefaultPreferences(userId: number): UserPreferences {
    return {
      userId,
      theme: "light",
      language: "id",
      personalityIntensity: "normal",
      autoSaveConversations: 1,
      notificationsEnabled: 1,
      responseStreamingEnabled: 1,
    };
  }

  /**
   * Get personality intensity multiplier untuk adjust response behavior
   */
  static getPersonalityIntensityMultiplier(
    intensity: "subtle" | "normal" | "intense"
  ): number {
    switch (intensity) {
      case "subtle":
        return 0.7;
      case "normal":
        return 1.0;
      case "intense":
        return 1.3;
      default:
        return 1.0;
    }
  }

  /**
   * Get language code untuk LLM prompts
   */
  static getLanguageCode(language: "id" | "en" | "ja"): string {
    const codes: Record<string, string> = {
      id: "Indonesian",
      en: "English",
      ja: "Japanese",
    };
    return codes[language] || "Indonesian";
  }

  /**
   * Validate preferences values
   */
  static validatePreferences(
    prefs: Partial<UserPreferences>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (prefs.theme && !["light", "dark", "auto"].includes(prefs.theme)) {
      errors.push("Invalid theme value");
    }

    if (prefs.language && !["id", "en", "ja"].includes(prefs.language)) {
      errors.push("Invalid language value");
    }

    if (
      prefs.personalityIntensity &&
      !["subtle", "normal", "intense"].includes(prefs.personalityIntensity)
    ) {
      errors.push("Invalid personality intensity value");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
