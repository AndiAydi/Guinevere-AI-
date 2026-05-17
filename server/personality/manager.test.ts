import { describe, it, expect, beforeEach } from "vitest";
import { PersonalityManager } from "./manager";
import type { UserRelationship } from "../../drizzle/schema";

describe("PersonalityManager", () => {
  let mockRelationship: UserRelationship;

  beforeEach(() => {
    mockRelationship = {
      id: 1,
      userId: 1,
      relationshipLevel: 0,
      currentMode: "normal",
      totalInteractions: 0,
      lastInteractionAt: null,
      hasBeenHurt: 0,
      happinessLevel: 50,
      lastButterflyMentionAt: null,
      personalityNotes: null,
      updatedAt: new Date(),
    };
  });

  describe("getCurrentMode", () => {
    it("should return 'normal' mode when relationship level is low", () => {
      mockRelationship.relationshipLevel = 10;
      const manager = new PersonalityManager(mockRelationship);
      expect(manager.getCurrentMode()).toBe("normal");
    });

    it("should return 'deep' mode when relationship level is between 40-70", () => {
      mockRelationship.relationshipLevel = 50;
      const manager = new PersonalityManager(mockRelationship);
      expect(manager.getCurrentMode()).toBe("deep");
    });

    it("should return 'close' mode when relationship level is high", () => {
      mockRelationship.relationshipLevel = 80;
      const manager = new PersonalityManager(mockRelationship);
      expect(manager.getCurrentMode()).toBe("close");
    });
  });

  describe("getEmotionalState", () => {
    it("should return 'comfortable' by default with 50% happiness", () => {
      mockRelationship.happinessLevel = 50;
      const manager = new PersonalityManager(mockRelationship);
      expect(manager.getEmotionalState()).toBe("comfortable");
    });

    it("should return 'withdrawn' when user has been hurt", () => {
      mockRelationship.hasBeenHurt = 1;
      const manager = new PersonalityManager(mockRelationship);
      expect(manager.getEmotionalState()).toBe("withdrawn");
    });

    it("should return 'happy' when happiness level is high", () => {
      mockRelationship.happinessLevel = 80;
      const manager = new PersonalityManager(mockRelationship);
      expect(manager.getEmotionalState()).toBe("happy");
    });

    it("should return 'comfortable' when happiness level is moderate", () => {
      mockRelationship.happinessLevel = 60;
      const manager = new PersonalityManager(mockRelationship);
      expect(manager.getEmotionalState()).toBe("comfortable");
    });
  });

  describe("updateRelationshipLevel", () => {
    it("should increase relationship level on positive interaction", () => {
      const manager = new PersonalityManager(mockRelationship);
      const initialLevel = manager.getState().relationshipLevel;
      manager.updateRelationshipLevel(100, true, false);
      expect(manager.getState().relationshipLevel).toBeGreaterThan(initialLevel);
    });

    it("should decrease relationship level on negative interaction", () => {
      mockRelationship.relationshipLevel = 50;
      const manager = new PersonalityManager(mockRelationship);
      manager.updateRelationshipLevel(100, false, true);
      expect(manager.getState().relationshipLevel).toBeLessThan(50);
    });

    it("should clamp relationship level between 0 and 100", () => {
      const manager = new PersonalityManager(mockRelationship);
      manager.updateRelationshipLevel(1000, true, false);
      expect(manager.getState().relationshipLevel).toBeLessThanOrEqual(100);
      expect(manager.getState().relationshipLevel).toBeGreaterThanOrEqual(0);
    });
  });

  describe("updateHappinessLevel", () => {
    it("should increase happiness level", () => {
      const manager = new PersonalityManager(mockRelationship);
      const initialHappiness = manager.getState().happinessLevel;
      manager.updateHappinessLevel(10);
      expect(manager.getState().happinessLevel).toBe(initialHappiness + 10);
    });

    it("should clamp happiness level between 0 and 100", () => {
      const manager = new PersonalityManager(mockRelationship);
      manager.updateHappinessLevel(100);
      expect(manager.getState().happinessLevel).toBeLessThanOrEqual(100);
      manager.updateHappinessLevel(-200);
      expect(manager.getState().happinessLevel).toBeGreaterThanOrEqual(0);
    });
  });

  describe("shouldMentionButterflies", () => {
    it("should not mention butterflies when conditions are not met", () => {
      mockRelationship.happinessLevel = 30;
      mockRelationship.relationshipLevel = 20;
      const manager = new PersonalityManager(mockRelationship);
      // Multiple calls to test randomness doesn't break logic
      for (let i = 0; i < 10; i++) {
        const shouldMention = manager.shouldMentionButterflies();
        // Should be false because happiness and relationship are too low
        if (shouldMention) {
          // Random chance might allow it, but very unlikely
          expect(mockRelationship.happinessLevel).toBeGreaterThanOrEqual(75);
        }
      }
    });

    it("should potentially mention butterflies when conditions are met", () => {
      mockRelationship.happinessLevel = 80;
      mockRelationship.relationshipLevel = 70;
      const manager = new PersonalityManager(mockRelationship);
      let foundTrue = false;
      // Multiple calls to account for randomness
      for (let i = 0; i < 50; i++) {
        if (manager.shouldMentionButterflies()) {
          foundTrue = true;
          break;
        }
      }
      // With these conditions, we should eventually get true due to 30% chance
      expect(foundTrue).toBe(true);
    });
  });

  describe("markAsHurt and healFromHurt", () => {
    it("should mark user as hurt", () => {
      const manager = new PersonalityManager(mockRelationship);
      manager.markAsHurt();
      expect(manager.getUpdatedRelationship().hasBeenHurt).toBe(1);
    });

    it("should heal from hurt when relationship level is high", () => {
      mockRelationship.hasBeenHurt = 1;
      mockRelationship.relationshipLevel = 60;
      const manager = new PersonalityManager(mockRelationship);
      manager.healFromHurt();
      expect(manager.getUpdatedRelationship().hasBeenHurt).toBe(0);
    });

    it("should not heal from hurt when relationship level is low", () => {
      mockRelationship.hasBeenHurt = 1;
      mockRelationship.relationshipLevel = 30;
      const manager = new PersonalityManager(mockRelationship);
      manager.healFromHurt();
      expect(manager.getUpdatedRelationship().hasBeenHurt).toBe(1);
    });
  });

  describe("getState", () => {
    it("should return current personality state", () => {
      mockRelationship.relationshipLevel = 50;
      mockRelationship.happinessLevel = 70;
      const manager = new PersonalityManager(mockRelationship);
      const state = manager.getState();

      expect(state).toHaveProperty("relationshipLevel");
      expect(state).toHaveProperty("currentMode");
      expect(state).toHaveProperty("emotionalState");
      expect(state).toHaveProperty("happinessLevel");
      expect(state.currentMode).toBe("deep");
      expect(state.emotionalState).toBe("comfortable");
    });
  });
});
