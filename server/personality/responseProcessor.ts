import { RESPONSE_CHARACTERISTICS } from "./constants";

/**
 * ResponseProcessor - Memproses response dari LLM untuk memastikan sesuai dengan personality Guinevere
 */
export class ResponseProcessor {
  /**
   * Process response dari LLM untuk memastikan sesuai dengan karakteristik Guinevere
   */
  static processResponse(
    rawResponse: string,
    shouldIncludeButterfly: boolean = false,
    mode: "normal" | "deep" | "close" | "casual" = "normal"
  ): string {
    let processed = rawResponse.trim();

    // Remove excessive punctuation
    processed = this.removeExcessivePunctuation(processed);

    // Enforce length limits
    processed = this.enforceLengthLimits(processed);

    // Add thinking pauses if appropriate
    processed = this.addThinkingPauses(processed);

    // Add butterfly reference if appropriate
    if (shouldIncludeButterfly) {
      processed = this.addButterflyReference(processed);
    }

    // Ensure natural flow
    processed = this.ensureNaturalFlow(processed);

    return processed;
  }

  /**
   * Remove excessive punctuation dan emoji
   */
  private static removeExcessivePunctuation(text: string): string {
    // Remove emoji (simplified for compatibility)
    text = text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "");

    // Replace multiple punctuation dengan single
    text = text.replace(/([!?.]){2,}/g, "$1");

    // Remove excessive exclamation marks
    text = text.replace(/!+/g, ".");

    return text;
  }

  /**
   * Enforce length limits untuk response
   */
  private static enforceLengthLimits(text: string): string {
    if (text.length > RESPONSE_CHARACTERISTICS.maxLength) {
      // Truncate at word boundary
      const truncated = text.substring(0, RESPONSE_CHARACTERISTICS.maxLength);
      const lastSpace = truncated.lastIndexOf(" ");
      return truncated.substring(0, lastSpace > 0 ? lastSpace : RESPONSE_CHARACTERISTICS.maxLength) + "...";
    }

    if (text.length < RESPONSE_CHARACTERISTICS.minLength) {
      // If too short, it might be incomplete - add minimal response
      return text || "...";
    }

    return text;
  }

  /**
   * Add thinking pauses dengan '...' untuk menunjukkan pemikiran
   */
  private static addThinkingPauses(text: string): string {
    if (!RESPONSE_CHARACTERISTICS.useEllipsis) {
      return text;
    }

    // Randomly add ellipsis at sentence breaks untuk menunjukkan thinking
    if (Math.random() < RESPONSE_CHARACTERISTICS.ellipsisChance) {
      const sentences = text.split(/([.!?])/);
      if (sentences.length > 2) {
        // Insert ellipsis after first or second sentence
        const insertAt = Math.random() > 0.5 ? 2 : 4;
        if (sentences[insertAt]) {
          sentences.splice(insertAt, 0, "\n\n...\n\n");
        }
      }
    }

    return text;
  }

  /**
   * Add butterfly reference secara subtle
   */
  private static addButterflyReference(text: string): string {
    const butterflyReferences = [
      "Seperti kupu-kupu yang hinggap di dekat...",
      "Ada sesuatu yang indah dalam ketenangan ini, seperti kupu-kupu...",
      "Kupu-kupu terbang di sekitar saat aku berpikir tentang ini...",
      "Entah mengapa, kupu-kupu selalu datang saat aku merasa seperti ini...",
      "Aku tidak tahu mengapa, tapi kupu-kupu...",
    ];

    // Randomly choose a butterfly reference
    const ref = butterflyReferences[Math.floor(Math.random() * butterflyReferences.length)];

    // Add at the end or middle of response
    if (Math.random() > 0.5) {
      return `${text}\n\n${ref}`;
    } else {
      // Insert in middle
      const midpoint = Math.floor(text.length / 2);
      const lastSpace = text.lastIndexOf(" ", midpoint);
      return `${text.substring(0, lastSpace)}\n\n${ref}\n\n${text.substring(lastSpace)}`;
    }
  }

  /**
   * Ensure natural flow dan consistency
   */
  private static ensureNaturalFlow(text: string): string {
    // Replace overly formal phrases dengan yang lebih natural
    const replacements: [RegExp, string][] = [
      [/Saya merasa/gi, "Aku merasa"],
      [/Saya pikir/gi, "Aku pikir"],
      [/Anda/gi, "kamu"],
      [/Anda\s/gi, "kamu "],
      [/Saya/gi, "Aku"],
    ];

    let processed = text;
    for (const [pattern, replacement] of replacements) {
      processed = processed.replace(pattern, replacement);
    }

    // Ensure sentences don't end with multiple punctuation
    processed = processed.replace(/[.!?]{2,}/g, ".");

    // Clean up extra spaces
    processed = processed.replace(/\s{2,}/g, " ");

    return processed.trim();
  }

  /**
   * Check if response contains butterfly mention
   */
  static containsButterflyMention(text: string): boolean {
    const butterflyKeywords = ["kupu-kupu", "butterfly", "hinggap"];
    return butterflyKeywords.some((keyword) => text.toLowerCase().includes(keyword));
  }

  /**
   * Detect if response seems to be about past/sensitive topic
   */
  static detectSensitiveTopic(text: string): boolean {
    const sensitiveKeywords = ["masa lalu", "dulu", "dulu aku", "sebelumnya", "pernah", "trauma"];
    return sensitiveKeywords.some((keyword) => text.toLowerCase().includes(keyword));
  }
}
