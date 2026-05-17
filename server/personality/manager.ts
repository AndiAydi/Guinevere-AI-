import { PERSONALITY_MODES, RELATIONSHIP_LEVEL_FACTORS, BUTTERFLY_TRIGGERS, PersonalityMode, EmotionalState } from "./constants";
import type { UserRelationship } from "../../drizzle/schema";

/**
 * PersonalityManager - Mengelola personality state, mode switching, dan emotional responses
 */
export class PersonalityManager {
  private userRelationship: UserRelationship;

  constructor(userRelationship: UserRelationship) {
    this.userRelationship = userRelationship;
  }

  /**
   * Determine current mode berdasarkan relationship level
   */
  getCurrentMode(): PersonalityMode {
    const level = this.userRelationship.relationshipLevel;

    if (level >= PERSONALITY_MODES.close.relationshipThreshold) {
      return "close";
    } else if (level >= PERSONALITY_MODES.deep.relationshipThreshold) {
      return "deep";
    } else {
      return "normal";
    }
  }

  /**
   * Determine emotional state berdasarkan berbagai faktor
   */
  getEmotionalState(): EmotionalState {
    // Jika user baru-baru ini hurt, tetap withdrawn
    if (this.userRelationship.hasBeenHurt) {
      return "withdrawn";
    }

    // Jika happiness level tinggi, happy state
    if (this.userRelationship.happinessLevel >= 75) {
      return "happy";
    }

    // Jika happiness level sedang-sedang, comfortable
    if (this.userRelationship.happinessLevel >= 50) {
      return "comfortable";
    }

    // Default neutral
    return "neutral";
  }

  /**
   * Update relationship level berdasarkan interaksi
   */
  updateRelationshipLevel(
    messageLength: number,
    isPositiveInteraction: boolean = true,
    isNegativeInteraction: boolean = false
  ): number {
    let newLevel = this.userRelationship.relationshipLevel;

    // Add base points for message
    newLevel += RELATIONSHIP_LEVEL_FACTORS.messageCount;

    // Add/subtract based on interaction type
    if (isPositiveInteraction) {
      newLevel += RELATIONSHIP_LEVEL_FACTORS.positiveInteraction;
    }
    if (isNegativeInteraction) {
      newLevel += RELATIONSHIP_LEVEL_FACTORS.negativeInteraction;
    }

    // Clamp between min and max
    newLevel = Math.max(
      RELATIONSHIP_LEVEL_FACTORS.minLevel,
      Math.min(newLevel, RELATIONSHIP_LEVEL_FACTORS.maxLevel)
    );

    this.userRelationship.relationshipLevel = newLevel;
    return newLevel;
  }

  /**
   * Update happiness level
   */
  updateHappinessLevel(delta: number): number {
    let newLevel = this.userRelationship.happinessLevel + delta;
    newLevel = Math.max(0, Math.min(100, newLevel));
    this.userRelationship.happinessLevel = newLevel;
    return newLevel;
  }

  /**
   * Mark user as hurt (emotional withdrawal)
   */
  markAsHurt(): void {
    this.userRelationship.hasBeenHurt = 1;
  }

  /**
   * Heal from hurt (gradually)
   */
  healFromHurt(): void {
    if (this.userRelationship.relationshipLevel > 50) {
      this.userRelationship.hasBeenHurt = 0;
    }
  }

  /**
   * Check if should mention butterflies
   */
  shouldMentionButterflies(): boolean {
    // Conditions untuk butterfly mention:
    // 1. Happiness level tinggi
    // 2. Relationship level cukup dekat
    // 3. Random chance
    const happinessCondition = this.userRelationship.happinessLevel >= BUTTERFLY_TRIGGERS.happiness;
    const comfortCondition = this.userRelationship.relationshipLevel >= BUTTERFLY_TRIGGERS.comfortLevel;
    const randomCondition = Math.random() < BUTTERFLY_TRIGGERS.randomChance;

    return happinessCondition && comfortCondition && randomCondition;
  }

  /**
   * Record butterfly mention
   */
  recordButterflyMention(): void {
    this.userRelationship.lastButterflyMentionAt = new Date();
  }

  /**
   * Get personality notes untuk context
   */
  getPersonalityNotes(): string | null {
    return this.userRelationship.personalityNotes;
  }

  /**
   * Update personality notes dengan observasi baru
   */
  updatePersonalityNotes(observation: string): void {
    const existing = this.userRelationship.personalityNotes || "";
    const timestamp = new Date().toISOString().split("T")[0];
    const newNote = `[${timestamp}] ${observation}`;

    // Keep last 5 observations
    const notes = existing ? existing.split("\n").filter((n) => n.trim()) : [];
    notes.push(newNote);
    const recentNotes = notes.slice(-5);

    this.userRelationship.personalityNotes = recentNotes.join("\n");
  }

  /**
   * Get current state sebagai object
   */
  getState() {
    return {
      relationshipLevel: this.userRelationship.relationshipLevel,
      currentMode: this.getCurrentMode(),
      emotionalState: this.getEmotionalState(),
      happinessLevel: this.userRelationship.happinessLevel,
      totalInteractions: this.userRelationship.totalInteractions,
      hasBeenHurt: this.userRelationship.hasBeenHurt === 1,
      lastInteractionAt: this.userRelationship.lastInteractionAt,
    };
  }

  /**
   * Get updated user relationship untuk di-save ke database
   */
  getUpdatedRelationship(): UserRelationship {
    this.userRelationship.updatedAt = new Date();
    return this.userRelationship;
  }
}
