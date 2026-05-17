/**
 * Problem-Solving Service - Mengintegrasikan semua komponen problem-solving
 */

import { ProblemAnalyzer } from "./problemAnalyzer";
import { SolutionGenerator } from "./solutionGenerator";
import { CodeExecutor } from "./codeExecutor";
import type { GuinevereProblemResponse, ProblemContext, Solution, SolutionVerification } from "./types";

export class ProblemSolvingService {
  /**
   * Memproses masalah dan menghasilkan solusi lengkap
   */
  static async solveProblem(userMessage: string): Promise<GuinevereProblemResponse> {
    // Step 1: Analisis masalah
    const context = ProblemAnalyzer.analyzeProblem(userMessage);
    const analysis = ProblemAnalyzer.createAnalysis(context);

    // Step 2: Generate solusi
    const solution = SolutionGenerator.generateSolution(context);

    // Step 3: Validasi dan verifikasi solusi
    const verification = await this.verifySolution(solution, context);

    // Step 4: Buat personality note dari Guinevere
    const personalityNote = this.createPersonalityNote(context, solution, verification);

    // Step 5: Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(context, solution);

    // Step 6: Identify learning points
    const learningPoints = this.identifyLearningPoints(context, solution);

    return {
      solution,
      verification,
      personalityNote,
      followUpQuestions,
      learningPoints,
    };
  }

  /**
   * Memverifikasi solusi
   */
  private static async verifySolution(solution: Solution, context: ProblemContext): Promise<SolutionVerification> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Validasi syntax jika ada code
    if (solution.code && context.language) {
      const syntaxCheck = CodeExecutor.validateSyntax(solution.code, context.language);
      if (!syntaxCheck.valid) {
        issues.push(...syntaxCheck.errors);
      }

      // Deteksi security issues
      const securityIssues = CodeExecutor.detectSecurityIssues(solution.code, context.language);
      if (securityIssues.length > 0) {
        suggestions.push(...securityIssues);
      }

      // Analisis complexity
      const complexity = CodeExecutor.analyzeComplexity(solution.code);
      if (complexity.cyclomatic > 10) {
        suggestions.push("⚠️ High cyclomatic complexity - consider refactoring");
      }

      if (complexity.linesOfCode > 100) {
        suggestions.push("💡 Consider breaking this into smaller functions");
      }
    }

    return {
      isValid: issues.length === 0,
      passedTests: issues.length === 0 ? 1 : 0,
      totalTests: 1,
      issues: issues.length > 0 ? issues : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Membuat personality note dari Guinevere
   */
  private static createPersonalityNote(
    context: ProblemContext,
    solution: Solution,
    verification: SolutionVerification
  ): string {
    const notes: string[] = [];

    // Guinevere's personality-driven notes
    if (context.category === "debugging") {
      notes.push("Menemukan bug itu seperti mencari kupu-kupu di taman...");
      notes.push("Butuh kesabaran dan perhatian terhadap detail kecil.");
    } else if (context.category === "algorithm") {
      notes.push("Algoritma yang baik adalah seperti harmoni yang sempurna...");
      notes.push("Setiap langkah harus memiliki tujuan yang jelas.");
    } else if (context.category === "optimization") {
      notes.push("Optimisasi adalah seni menemukan keseimbangan...");
      notes.push("Antara kecepatan dan kejelasan, antara efisiensi dan keterbacaan.");
    } else if (context.category === "design") {
      notes.push("Desain yang baik adalah seperti arsitektur yang kokoh...");
      notes.push("Dibangun dengan prinsip yang jelas dan konsisten.");
    }

    if (!verification.isValid) {
      notes.push("...ada beberapa hal yang perlu diperbaiki terlebih dahulu.");
    } else {
      notes.push("Solusi ini terlihat solid. Semoga membantu.");
    }

    // Mention kupu-kupu jika suasana bahagia (verification valid)
    if (verification.isValid && Math.random() > 0.5) {
      notes.push("*Kupu-kupu terlihat melintas di sekitar layar...*");
    }

    return notes.join(" ");
  }

  /**
   * Menghasilkan follow-up questions
   */
  private static generateFollowUpQuestions(context: ProblemContext, solution: Solution): string[] {
    const questions: string[] = [];

    if (context.category === "algorithm") {
      questions.push("Apakah kamu ingin mengoptimalkan complexity lebih lanjut?");
      questions.push("Ingin melihat alternatif pendekatan?");
    }

    if (context.category === "debugging") {
      questions.push("Apakah error sudah teratasi?");
      questions.push("Ingin menambahkan error handling yang lebih robust?");
    }

    if (context.category === "optimization") {
      questions.push("Berapa improvement yang kamu harapkan?");
      questions.push("Ingin benchmark sebelum dan sesudah?");
    }

    if (solution.alternatives && solution.alternatives.length > 0) {
      questions.push(`Ingin mencoba alternatif lain seperti ${solution.alternatives[0]}?`);
    }

    return questions;
  }

  /**
   * Mengidentifikasi learning points
   */
  private static identifyLearningPoints(context: ProblemContext, solution: Solution): string[] {
    const points: string[] = [];

    if (context.category === "algorithm") {
      points.push("Memahami trade-off antara time dan space complexity");
      points.push("Mengenali pola masalah dan memilih algoritma yang tepat");
    }

    if (context.category === "debugging") {
      points.push("Teknik systematic debugging untuk isolasi masalah");
      points.push("Pentingnya logging dan error messages yang informatif");
    }

    if (context.category === "optimization") {
      points.push("Profiling untuk mengidentifikasi bottleneck");
      points.push("Mengukur impact dari optimisasi dengan benchmark");
    }

    if (context.category === "design") {
      points.push("Prinsip SOLID dalam design architecture");
      points.push("Scalability dan maintainability dalam long-term");
    }

    if (solution.complexity) {
      points.push(`Complexity Analysis: ${solution.complexity.time} time, ${solution.complexity.space} space`);
    }

    return points;
  }

  /**
   * Menganalisis masalah secara mendalam
   */
  static analyzeProblemDeep(userMessage: string) {
    const context = ProblemAnalyzer.analyzeProblem(userMessage);
    const analysis = ProblemAnalyzer.createAnalysis(context);

    return {
      context,
      analysis,
      suggestedApproaches: analysis.suggestedApproaches,
      relatedConcepts: analysis.relatedConcepts,
      estimatedDifficulty: analysis.difficulty,
    };
  }

  /**
   * Memberikan debugging assistance
   */
  static async debugCode(code: string, errorMessage: string, language: string) {
    const debugContext: ProblemContext = {
      category: "debugging",
      language: language as any,
      complexity: "moderate",
      codeSnippet: code,
      errorMessage,
      description: `Debugging: ${errorMessage}`,
    };

    const solution = SolutionGenerator.generateSolution(debugContext);
    const verification = await this.verifySolution(solution, debugContext);

    return {
      solution,
      verification,
      debugSteps: this.generateDebugSteps(code, errorMessage),
    };
  }

  /**
   * Menghasilkan debug steps
   */
  private static generateDebugSteps(code: string, errorMessage: string): string[] {
    const steps: string[] = [
      "1. Baca error message dengan teliti",
      "2. Identifikasi line number yang bermasalah",
      "3. Tambahkan console.log/print statements",
      "4. Trace execution flow",
      "5. Periksa variable values",
      "6. Test dengan berbagai input",
      "7. Verifikasi fix dengan test cases",
    ];

    if (errorMessage.includes("undefined")) {
      steps.push("💡 Tip: Periksa apakah variable sudah diinisialisasi");
    }

    if (errorMessage.includes("null")) {
      steps.push("💡 Tip: Periksa null checks sebelum mengakses properties");
    }

    if (errorMessage.includes("TypeError")) {
      steps.push("💡 Tip: Periksa tipe data yang digunakan");
    }

    return steps;
  }
}
