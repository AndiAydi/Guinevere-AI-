import { invokeLLM } from "../_core/llm";

import { PersonalityManager } from "../personality/manager";
import { generateSystemPrompt } from "../personality/systemPrompt";
import { ResponseProcessor } from "../personality/responseProcessor";
import { getOrCreateUserRelationship, getRecentConversationContext, addConversationMessage } from "../db-helpers";
import type { UserRelationship } from "../../drizzle/schema";

export interface ChatRequest {
  userId: number;
  userMessage: string;
}

export interface ChatResponse {
  message: string;
  mode: string;
  emotionalState: string;
  relationshipLevel: number;
  containsButterfly: boolean;
}

/**
 * ChatService - Main service untuk chat processing dengan Guinevere
 */
export class ChatService {
  /**
   * Process user message dan generate Guinevere response
   */
  static async processChat(request: ChatRequest): Promise<ChatResponse> {
    const { userId, userMessage } = request;

    // 1. Get atau create user relationship
    const userRelationship = await getOrCreateUserRelationship(userId);
    const personalityManager = new PersonalityManager(userRelationship);

    // 2. Determine current personality state
    const currentMode = personalityManager.getCurrentMode();
    const emotionalState = personalityManager.getEmotionalState();
    const shouldMentionButterfly = personalityManager.shouldMentionButterflies();

    // 3. Get conversation context
    const conversationHistory = await getRecentConversationContext(userId, 10);

    // 4. Generate system prompt
    const systemPrompt = generateSystemPrompt(
      currentMode,
      emotionalState,
      userRelationship.relationshipLevel,
      userRelationship.personalityNotes || undefined
    );

    // 5. Build messages for LLM
    const messages = [
      ...conversationHistory,
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    // 6. Call LLM
    let llmResponse: string;
    try {
      const llmMessages: any[] = [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "system" | "user" | "assistant",
          content: m.content,
        })),
      ];

      const result = await invokeLLM({
        messages: llmMessages,
      });

      const content = result.choices[0]?.message?.content;
      llmResponse = typeof content === "string" ? content : JSON.stringify(content) || "...";
    } catch (error) {
      console.error("LLM Error:", error);
      llmResponse = "Maaf, aku sedang tidak bisa berpikir dengan jernih saat ini...";
    }

    // 7. Process response sesuai personality rules
    const processedResponse = ResponseProcessor.processResponse(llmResponse, shouldMentionButterfly, currentMode);

    // 8. Check for butterfly mention
    const containsButterfly = ResponseProcessor.containsButterflyMention(processedResponse);
    if (containsButterfly) {
      personalityManager.recordButterflyMention();
    }

    // 9. Update relationship level
    const isPositiveInteraction = this.detectPositiveInteraction(userMessage, processedResponse);
    const isNegativeInteraction = this.detectNegativeInteraction(userMessage);

    personalityManager.updateRelationshipLevel(userMessage.length, isPositiveInteraction, isNegativeInteraction);

    // 10. Update happiness level based on interaction
    if (isPositiveInteraction) {
      personalityManager.updateHappinessLevel(5);
    }
    if (isNegativeInteraction) {
      personalityManager.updateHappinessLevel(-10);
      personalityManager.markAsHurt();
    }

    // 11. Save to database
    const updatedRelationship = personalityManager.getUpdatedRelationship();
    await this.saveInteraction(userId, userMessage, processedResponse, currentMode, emotionalState, containsButterfly, updatedRelationship);

    // 12. Return response
    return {
      message: processedResponse,
      mode: currentMode,
      emotionalState,
      relationshipLevel: personalityManager.getState().relationshipLevel,
      containsButterfly,
    };
  }

  /**
   * Detect positive interaction
   */
  private static detectPositiveInteraction(userMessage: string, response: string): boolean {
    const positiveKeywords = ["terima kasih", "thanks", "bagus", "cantik", "indah", "suka", "love", "hebat", "amazing"];
    const userHasPositive = positiveKeywords.some((keyword) => userMessage.toLowerCase().includes(keyword));

    // If response is not withdrawn/brief, it's likely positive
    const responseIsEngaged = response.length > 50;

    return userHasPositive || responseIsEngaged;
  }

  /**
   * Detect negative interaction
   */
  private static detectNegativeInteraction(userMessage: string): boolean {
    const negativeKeywords = ["benci", "hate", "jelek", "buruk", "stupid", "bodoh", "marah", "angry"];
    return negativeKeywords.some((keyword) => userMessage.toLowerCase().includes(keyword));
  }

  /**
   * Save interaction ke database
   */
  private static async saveInteraction(
    userId: number,
    userMessage: string,
    assistantMessage: string,
    mode: string,
    emotionalState: string,
    containsButterfly: boolean,
    updatedRelationship: UserRelationship
  ) {
    try {
      // Save user message
      await addConversationMessage(userId, "user", userMessage, mode as any, emotionalState);

      // Save assistant message
      await addConversationMessage(userId, "assistant", assistantMessage, mode as any, emotionalState, containsButterfly);

      // Update relationship
      const { updateUserRelationship } = await import("../db-helpers");
      await updateUserRelationship(userId, {
        relationshipLevel: updatedRelationship.relationshipLevel,
        currentMode: updatedRelationship.currentMode,
        totalInteractions: (updatedRelationship.totalInteractions || 0) + 1,
        lastInteractionAt: new Date(),
        happinessLevel: updatedRelationship.happinessLevel,
        hasBeenHurt: updatedRelationship.hasBeenHurt,
        lastButterflyMentionAt: updatedRelationship.lastButterflyMentionAt,
        personalityNotes: updatedRelationship.personalityNotes,
      });
    } catch (error) {
      console.error("Error saving interaction:", error);
    }
  }
}
