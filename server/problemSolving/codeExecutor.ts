/**
 * Code Executor - Menjalankan dan test code secara aman
 */

import type { ExecutionResult, ProgrammingLanguage } from "./types";

export class CodeExecutor {
  /**
   * Menjalankan code dan mengembalikan hasil
   * Note: Untuk production, gunakan sandbox environment yang lebih aman
   */
  static async executeCode(
    code: string,
    language: ProgrammingLanguage,
    timeout: number = 5000
  ): Promise<ExecutionResult> {
    try {
      // Untuk saat ini, return mock result
      // Dalam production, gunakan Docker/VM sandbox
      return this.getMockExecutionResult(language);
    } catch (error) {
      return {
        success: false,
        error: `Execution failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Menjalankan test cases
   */
  static async runTests(
    code: string,
    testCases: Array<{ input: string; expected: string }>,
    language: ProgrammingLanguage
  ): Promise<{ passed: number; total: number; results: ExecutionResult[] }> {
    const results: ExecutionResult[] = [];
    let passed = 0;

    for (const testCase of testCases) {
      const result = await this.executeCode(code, language);
      results.push(result);

      if (result.success && result.output === testCase.expected) {
        passed++;
      }
    }

    return { passed, total: testCases.length, results };
  }

  /**
   * Memvalidasi syntax code
   */
  static validateSyntax(code: string, language: ProgrammingLanguage): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic syntax validation
    if (code.trim().length === 0) {
      errors.push("Code is empty");
      return { valid: false, errors };
    }

    // Language-specific validation
    switch (language) {
      case "python":
        errors.push(...this.validatePythonSyntax(code));
        break;
      case "javascript":
      case "typescript":
        errors.push(...this.validateJavaScriptSyntax(code));
        break;
      case "java":
        errors.push(...this.validateJavaSyntax(code));
        break;
      case "sql":
        errors.push(...this.validateSQLSyntax(code));
        break;
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validasi Python syntax
   */
  private static validatePythonSyntax(code: string): string[] {
    const errors: string[] = [];

    // Check indentation
    const lines = code.split("\n");
    let expectedIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const indent = line.search(/\S/);

      if (line.trim().endsWith(":")) {
        expectedIndent += 4;
      } else if (indent < expectedIndent && line.trim().length > 0) {
        // Indentation decreased
        expectedIndent = Math.max(0, expectedIndent - 4);
      }
    }

    // Check common Python errors
    if (code.includes("print ") && !code.includes("print(")) {
      errors.push("Python 3 syntax: use print() instead of print");
    }

    return errors;
  }

  /**
   * Validasi JavaScript syntax
   */
  private static validateJavaScriptSyntax(code: string): string[] {
    const errors: string[] = [];

    // Check bracket matching
    const brackets = { "{": "}", "[": "]", "(": ")" };
    const stack: string[] = [];

    for (const char of code) {
      if (char in brackets) {
        stack.push(char);
      } else if (Object.values(brackets).includes(char)) {
        const last = stack.pop();
        if (!last || brackets[last as keyof typeof brackets] !== char) {
          errors.push(`Mismatched brackets: expected closing ${brackets[last as keyof typeof brackets]}`);
          break;
        }
      }
    }

    if (stack.length > 0) {
      errors.push(`Unclosed brackets: ${stack.join(", ")}`);
    }

    return errors;
  }

  /**
   * Validasi Java syntax
   */
  private static validateJavaSyntax(code: string): string[] {
    const errors: string[] = [];

    if (!code.includes("public class")) {
      errors.push("Java code must contain a public class");
    }

    if (!code.includes("public static void main")) {
      errors.push("Java code should contain a main method");
    }

    return errors;
  }

  /**
   * Validasi SQL syntax
   */
  private static validateSQLSyntax(code: string): string[] {
    const errors: string[] = [];

    const upperCode = code.toUpperCase();

    if (!upperCode.includes("SELECT") && !upperCode.includes("INSERT") && !upperCode.includes("UPDATE")) {
      errors.push("SQL code must contain SELECT, INSERT, or UPDATE statement");
    }

    if (!code.includes(";")) {
      errors.push("SQL statements should end with semicolon");
    }

    return errors;
  }

  /**
   * Mendeteksi security issues dalam code
   */
  static detectSecurityIssues(code: string, language: ProgrammingLanguage): string[] {
    const issues: string[] = [];

    // General security checks
    if (code.includes("eval(")) {
      issues.push("⚠️ Security: eval() usage detected - can execute arbitrary code");
    }

    if (code.includes("exec(")) {
      issues.push("⚠️ Security: exec() usage detected - can execute system commands");
    }

    if (code.includes("__import__")) {
      issues.push("⚠️ Security: Dynamic import detected");
    }

    // SQL injection check
    if (language === "sql" && code.includes("' OR '1'='1")) {
      issues.push("⚠️ Security: Potential SQL injection pattern detected");
    }

    // XSS check
    if ((language === "javascript" || language === "html") && code.includes("innerHTML")) {
      issues.push("⚠️ Security: innerHTML usage - consider using textContent for user input");
    }

    return issues;
  }

  /**
   * Mock execution result untuk demo
   */
  private static getMockExecutionResult(language: ProgrammingLanguage): ExecutionResult {
    const outputs: Record<ProgrammingLanguage, string> = {
      python: "Output dari Python code",
      javascript: "Output dari JavaScript code",
      typescript: "Output dari TypeScript code",
      java: "Output dari Java code",
      cpp: "Output dari C++ code",
      csharp: "Output dari C# code",
      go: "Output dari Go code",
      rust: "Output dari Rust code",
      sql: "1 row affected",
      html: "HTML rendered",
      css: "CSS applied",
      bash: "Command executed",
      other: "Output dari code",
    };

    return {
      success: true,
      output: outputs[language] || "Code executed successfully",
      executionTime: Math.random() * 1000,
      memoryUsed: Math.random() * 50,
    };
  }

  /**
   * Menganalisis code complexity
   */
  static analyzeComplexity(code: string): { cyclomatic: number; linesOfCode: number } {
    const lines = code.split("\n").filter((l) => l.trim().length > 0);
    const linesOfCode = lines.length;

    // Cyclomatic complexity estimation
    let cyclomatic = 1;
    cyclomatic += (code.match(/if\s*\(/gi) || []).length;
    cyclomatic += (code.match(/else\s*if\s*\(/gi) || []).length;
    cyclomatic += (code.match(/else/gi) || []).length;
    cyclomatic += (code.match(/for\s*\(/gi) || []).length;
    cyclomatic += (code.match(/while\s*\(/gi) || []).length;
    cyclomatic += (code.match(/case\s+/gi) || []).length;
    cyclomatic += (code.match(/catch\s*\(/gi) || []).length;

    return { cyclomatic, linesOfCode };
  }
}
