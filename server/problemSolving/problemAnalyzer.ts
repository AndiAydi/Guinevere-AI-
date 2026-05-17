/**
 * Problem Analyzer - Mendeteksi dan mengklasifikasi masalah yang diajukan user
 */

import type { ProblemContext, ProblemCategory, ProgrammingLanguage, ProblemAnalysis } from "./types";

export class ProblemAnalyzer {
  /**
   * Menganalisis pesan user untuk mendeteksi masalah
   */
  static analyzeProblem(message: string): ProblemContext {
    const category = this.detectCategory(message);
    const language = this.detectLanguage(message);
    const complexity = this.estimateComplexity(message);
    const codeSnippet = this.extractCode(message);
    const errorMessage = this.extractError(message);

    return {
      category,
      language,
      complexity,
      codeSnippet,
      errorMessage,
      description: message,
    };
  }

  /**
   * Mendeteksi kategori masalah dari pesan
   */
  private static detectCategory(message: string): ProblemCategory {
    const lowerMsg = message.toLowerCase();

    if (
      lowerMsg.includes("error") ||
      lowerMsg.includes("bug") ||
      lowerMsg.includes("tidak bekerja") ||
      lowerMsg.includes("error message") ||
      lowerMsg.includes("exception")
    ) {
      return "debugging";
    }

    if (
      lowerMsg.includes("algorithm") ||
      lowerMsg.includes("struktur data") ||
      lowerMsg.includes("sorting") ||
      lowerMsg.includes("searching")
    ) {
      return "algorithm";
    }

    if (
      lowerMsg.includes("optimize") ||
      lowerMsg.includes("optimize") ||
      lowerMsg.includes("faster") ||
      lowerMsg.includes("efficient") ||
      lowerMsg.includes("performance")
    ) {
      return "optimization";
    }

    if (
      lowerMsg.includes("design") ||
      lowerMsg.includes("architecture") ||
      lowerMsg.includes("pattern")
    ) {
      return "design";
    }

    if (
      lowerMsg.includes("explain") ||
      lowerMsg.includes("bagaimana") ||
      lowerMsg.includes("apa itu") ||
      lowerMsg.includes("gimana")
    ) {
      return "explanation";
    }

    if (
      lowerMsg.includes("analyze") ||
      lowerMsg.includes("analisis") ||
      lowerMsg.includes("review")
    ) {
      return "analysis";
    }

    if (
      lowerMsg.includes("code") ||
      lowerMsg.includes("function") ||
      lowerMsg.includes("method") ||
      lowerMsg.includes("class") ||
      lowerMsg.includes("write") ||
      lowerMsg.includes("buat") ||
      lowerMsg.includes("tulis")
    ) {
      return "coding";
    }

    return "general";
  }

  /**
   * Mendeteksi bahasa pemrograman dari pesan
   */
  private static detectLanguage(message: string): ProgrammingLanguage | undefined {
    const lowerMsg = message.toLowerCase();

    const languagePatterns: Record<ProgrammingLanguage, string[]> = {
      python: ["python", "py", ".py"],
      javascript: ["javascript", "js", ".js", "node"],
      typescript: ["typescript", "ts", ".ts"],
      java: ["java", ".java"],
      cpp: ["c++", "cpp", ".cpp", "c plus plus"],
      csharp: ["c#", "csharp", ".cs"],
      go: ["golang", "go", ".go"],
      rust: ["rust", ".rs"],
      sql: ["sql", "database", "query"],
      html: ["html", ".html"],
      css: ["css", ".css"],
      bash: ["bash", "shell", "script", ".sh"],
      other: [],
    };

    for (const [lang, patterns] of Object.entries(languagePatterns)) {
      if (patterns.some((pattern) => lowerMsg.includes(pattern))) {
        return lang as ProgrammingLanguage;
      }
    }

    return undefined;
  }

  /**
   * Memperkirakan kompleksitas masalah
   */
  private static estimateComplexity(message: string): "simple" | "moderate" | "complex" {
    const lowerMsg = message.toLowerCase();
    const wordCount = message.split(/\s+/).length;

    // Indikator kompleksitas tinggi
    if (
      lowerMsg.includes("distributed") ||
      lowerMsg.includes("concurrent") ||
      lowerMsg.includes("optimization") ||
      lowerMsg.includes("architecture") ||
      lowerMsg.includes("scalable") ||
      wordCount > 200
    ) {
      return "complex";
    }

    // Indikator kompleksitas sedang
    if (
      lowerMsg.includes("algorithm") ||
      lowerMsg.includes("data structure") ||
      lowerMsg.includes("design pattern") ||
      wordCount > 100
    ) {
      return "moderate";
    }

    return "simple";
  }

  /**
   * Mengekstrak code snippet dari pesan
   */
  private static extractCode(message: string): string | undefined {
    // Cari code block dengan markdown syntax
    const codeBlockRegex = /```[\s\S]*?```/g;
    const matches = message.match(codeBlockRegex);

    if (matches && matches.length > 0) {
      return matches[0].replace(/```/g, "").trim();
    }

    // Cari inline code
    const inlineCodeRegex = /`[^`]+`/g;
    const inlineMatches = message.match(inlineCodeRegex);

    if (inlineMatches && inlineMatches.length > 0) {
      return inlineMatches.map((m) => m.replace(/`/g, "")).join("\n");
    }

    return undefined;
  }

  /**
   * Mengekstrak error message dari pesan
   */
  private static extractError(message: string): string | undefined {
    // Cari error message patterns
    const errorPatterns = [
      /Error:?\s*(.+?)(?:\n|$)/i,
      /Exception:?\s*(.+?)(?:\n|$)/i,
      /TypeError:?\s*(.+?)(?:\n|$)/i,
      /SyntaxError:?\s*(.+?)(?:\n|$)/i,
      /ReferenceError:?\s*(.+?)(?:\n|$)/i,
    ];

    for (const pattern of errorPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Membuat analisis lengkap tentang masalah
   */
  static createAnalysis(context: ProblemContext): ProblemAnalysis {
    const detectedIssues = this.detectIssues(context);
    const suggestedApproaches = this.suggestApproaches(context);
    const difficulty = this.assessDifficulty(context);
    const relatedConcepts = this.identifyRelatedConcepts(context);

    return {
      context,
      detectedIssues,
      suggestedApproaches,
      difficulty,
      relatedConcepts,
    };
  }

  /**
   * Mendeteksi masalah potensial dalam code
   */
  private static detectIssues(context: ProblemContext): string[] {
    const issues: string[] = [];

    if (context.errorMessage) {
      issues.push(`Error detected: ${context.errorMessage}`);
    }

    if (context.codeSnippet) {
      // Deteksi common issues
      if (context.codeSnippet.includes("console.log") && context.language === "javascript") {
        issues.push("Using console.log for debugging - consider removing in production");
      }

      if (context.codeSnippet.match(/for\s*\(/g) && context.codeSnippet.match(/while\s*\(/g)) {
        issues.push("Multiple loop structures detected - check for optimization opportunities");
      }

      if (context.codeSnippet.includes("eval(")) {
        issues.push("Security concern: eval() usage detected");
      }
    }

    return issues;
  }

  /**
   * Menyarankan pendekatan untuk menyelesaikan masalah
   */
  private static suggestApproaches(context: ProblemContext): string[] {
    const approaches: string[] = [];

    if (context.category === "debugging") {
      approaches.push("Isolate the problematic code section");
      approaches.push("Add logging statements to trace execution");
      approaches.push("Use debugger to step through code");
      approaches.push("Check variable values at each step");
    }

    if (context.category === "algorithm") {
      approaches.push("Start with brute force solution");
      approaches.push("Identify optimization opportunities");
      approaches.push("Consider time/space tradeoffs");
      approaches.push("Test with edge cases");
    }

    if (context.category === "optimization") {
      approaches.push("Profile current implementation");
      approaches.push("Identify bottlenecks");
      approaches.push("Consider algorithmic improvements");
      approaches.push("Benchmark before and after");
    }

    if (context.category === "design") {
      approaches.push("Identify design patterns");
      approaches.push("Consider scalability");
      approaches.push("Plan for maintainability");
      approaches.push("Document architecture");
    }

    return approaches;
  }

  /**
   * Menilai tingkat kesulitan masalah
   */
  private static assessDifficulty(context: ProblemContext): "easy" | "medium" | "hard" {
    if (context.complexity === "simple") return "easy";
    if (context.complexity === "moderate") return "medium";
    return "hard";
  }

  /**
   * Mengidentifikasi konsep terkait
   */
  private static identifyRelatedConcepts(context: ProblemContext): string[] {
    const concepts: string[] = [];

    if (context.category === "algorithm") {
      concepts.push("Time Complexity", "Space Complexity", "Big O Notation");
    }

    if (context.category === "debugging") {
      concepts.push("Debugging Techniques", "Error Handling", "Logging");
    }

    if (context.category === "design") {
      concepts.push("Design Patterns", "SOLID Principles", "Architecture");
    }

    if (context.language === "javascript" || context.language === "typescript") {
      concepts.push("Async/Await", "Promises", "Event Loop");
    }

    if (context.language === "python") {
      concepts.push("Generators", "Decorators", "Context Managers");
    }

    return concepts;
  }
}
