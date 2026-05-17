/**
 * Problem-solving types dan interfaces untuk Guinevere AI
 */

export type ProblemCategory = 
  | "coding"
  | "debugging"
  | "algorithm"
  | "analysis"
  | "design"
  | "explanation"
  | "optimization"
  | "general";

export type ProgrammingLanguage =
  | "python"
  | "javascript"
  | "typescript"
  | "java"
  | "cpp"
  | "csharp"
  | "go"
  | "rust"
  | "sql"
  | "html"
  | "css"
  | "bash"
  | "other";

export interface ProblemContext {
  category: ProblemCategory;
  language?: ProgrammingLanguage;
  complexity: "simple" | "moderate" | "complex";
  codeSnippet?: string;
  errorMessage?: string;
  description: string;
  constraints?: string[];
  examples?: string[];
}

export interface Solution {
  approach: string;
  code?: string;
  explanation: string;
  complexity?: {
    time: string;
    space: string;
  };
  tradeoffs?: string[];
  alternatives?: string[];
  testCases?: TestCase[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface ProblemAnalysis {
  context: ProblemContext;
  detectedIssues?: string[];
  suggestedApproaches: string[];
  difficulty: "easy" | "medium" | "hard";
  relatedConcepts: string[];
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
  memoryUsed?: number;
}

export interface SolutionVerification {
  isValid: boolean;
  passedTests: number;
  totalTests: number;
  issues?: string[];
  suggestions?: string[];
}

export interface GuinevereProblemResponse {
  solution: Solution;
  verification: SolutionVerification;
  personalityNote: string;
  followUpQuestions?: string[];
  learningPoints?: string[];
}
