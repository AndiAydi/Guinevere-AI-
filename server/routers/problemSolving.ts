/**
 * Problem-Solving Router - tRPC endpoints untuk problem-solving features
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { ProblemSolvingService } from "../problemSolving/problemSolvingService";
import { ProblemAnalyzer } from "../problemSolving/problemAnalyzer";

export const problemSolvingRouter = router({
  /**
   * Solve - Memproses masalah dan menghasilkan solusi lengkap
   */
  solve: protectedProcedure
    .input(
      z.object({
        message: z.string().min(10, "Deskripsi masalah terlalu pendek"),
        language: z.string().optional(),
        code: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await ProblemSolvingService.solveProblem(input.message);

        // Save ke database jika diperlukan
        // TODO: Save solution history untuk learning

        return response;
      } catch (error) {
        throw new Error(`Failed to solve problem: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),

  /**
   * Analyze - Menganalisis masalah secara mendalam tanpa menghasilkan solusi penuh
   */
  analyze: protectedProcedure
    .input(
      z.object({
        message: z.string().min(10),
      })
    )
    .query(({ input }) => {
      try {
        return ProblemSolvingService.analyzeProblemDeep(input.message);
      } catch (error) {
        throw new Error(`Failed to analyze problem: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),

  /**
   * Debug - Bantuan debugging untuk code dengan error message
   */
  debug: protectedProcedure
    .input(
      z.object({
        code: z.string().min(5),
        errorMessage: z.string().min(5),
        language: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ProblemSolvingService.debugCode(input.code, input.errorMessage, input.language);
        return result;
      } catch (error) {
        throw new Error(`Failed to debug code: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),

  /**
   * GetSuggestions - Dapatkan saran berdasarkan problem context
   */
  getSuggestions: protectedProcedure
    .input(
      z.object({
        message: z.string().min(10),
      })
    )
    .query(({ input }) => {
      try {
        const context = ProblemAnalyzer.analyzeProblem(input.message);
        const analysis = ProblemAnalyzer.createAnalysis(context);

        return {
          category: context.category,
          difficulty: analysis.difficulty,
          suggestedApproaches: analysis.suggestedApproaches,
          relatedConcepts: analysis.relatedConcepts,
          estimatedTime: analysis.difficulty === "easy" ? "5-10 min" : analysis.difficulty === "medium" ? "15-30 min" : "30+ min",
        };
      } catch (error) {
        throw new Error(`Failed to get suggestions: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),

  /**
   * ValidateCode - Validasi syntax dan security issues dalam code
   */
  validateCode: protectedProcedure
    .input(
      z.object({
        code: z.string().min(5),
        language: z.string(),
      })
    )
    .query(({ input }) => {
      try {
        const { CodeExecutor } = require("../problemSolving/codeExecutor");

        const syntaxCheck = CodeExecutor.validateSyntax(input.code, input.language);
        const securityIssues = CodeExecutor.detectSecurityIssues(input.code, input.language);
        const complexity = CodeExecutor.analyzeComplexity(input.code);

        return {
          syntax: syntaxCheck,
          security: securityIssues,
          complexity,
        };
      } catch (error) {
        throw new Error(`Failed to validate code: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),

  /**
   * GetSolutionHistory - Ambil riwayat solusi yang sudah diberikan
   */
  getSolutionHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Query dari database untuk solution history
        // Untuk saat ini, return empty array
        return [];
      } catch (error) {
        throw new Error(`Failed to get solution history: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
});
