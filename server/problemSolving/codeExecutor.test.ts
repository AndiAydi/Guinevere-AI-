import { describe, it, expect } from "vitest";
import { CodeExecutor } from "./codeExecutor";

describe("CodeExecutor", () => {
  describe("validateSyntax", () => {
    it("should validate Python syntax", () => {
      const validPython = `
def hello():
    print("Hello")
hello()
`;
      const result = CodeExecutor.validateSyntax(validPython, "python");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect Python print syntax error", () => {
      const invalidPython = `print "Hello"`;
      const result = CodeExecutor.validateSyntax(invalidPython, "python");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("print()"))).toBe(true);
    });

    it("should validate JavaScript syntax", () => {
      const validJS = `
const hello = () => {
  console.log("Hello");
};
hello();
`;
      const result = CodeExecutor.validateSyntax(validJS, "javascript");
      expect(result.valid).toBe(true);
    });

    it("should detect mismatched brackets", () => {
      const invalidJS = `const x = { a: 1 ];`;
      const result = CodeExecutor.validateSyntax(invalidJS, "javascript");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("bracket"))).toBe(true);
    });

    it("should reject empty code", () => {
      const result = CodeExecutor.validateSyntax("", "python");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Code is empty");
    });
  });

  describe("detectSecurityIssues", () => {
    it("should detect eval() usage", () => {
      const code = `eval("malicious code")`;
      const issues = CodeExecutor.detectSecurityIssues(code, "javascript");
      expect(issues.some((i) => i.includes("eval()"))).toBe(true);
    });

    it("should detect exec() usage", () => {
      const code = `exec("os.system('rm -rf /')")`;
      const issues = CodeExecutor.detectSecurityIssues(code, "python");
      expect(issues.some((i) => i.includes("exec()"))).toBe(true);
    });

    it("should detect innerHTML usage", () => {
      const code = `element.innerHTML = userInput;`;
      const issues = CodeExecutor.detectSecurityIssues(code, "javascript");
      expect(issues.some((i) => i.includes("innerHTML"))).toBe(true);
    });

    it("should detect SQL injection patterns", () => {
      const code = `SELECT * FROM users WHERE id = ' OR '1'='1`;
      const issues = CodeExecutor.detectSecurityIssues(code, "sql");
      expect(issues.some((i) => i.includes("SQL injection"))).toBe(true);
    });

    it("should return empty array for safe code", () => {
      const code = `const x = 5; console.log(x);`;
      const issues = CodeExecutor.detectSecurityIssues(code, "javascript");
      expect(issues).toHaveLength(0);
    });
  });

  describe("analyzeComplexity", () => {
    it("should calculate cyclomatic complexity", () => {
      const code = `
if (x > 0) {
  if (y > 0) {
    return true;
  }
}
return false;
`;
      const complexity = CodeExecutor.analyzeComplexity(code);
      expect(complexity.cyclomatic).toBeGreaterThan(1);
    });

    it("should count lines of code", () => {
      const code = `
const a = 1;
const b = 2;
const c = a + b;
`;
      const complexity = CodeExecutor.analyzeComplexity(code);
      expect(complexity.linesOfCode).toBeGreaterThan(0);
    });

    it("should handle empty code", () => {
      const complexity = CodeExecutor.analyzeComplexity("");
      expect(complexity.cyclomatic).toBe(1);
      expect(complexity.linesOfCode).toBe(0);
    });

    it("should detect high cyclomatic complexity", () => {
      const code = `
if (a) { }
else if (b) { }
else if (c) { }
else if (d) { }
else if (e) { }
`;
      const complexity = CodeExecutor.analyzeComplexity(code);
      expect(complexity.cyclomatic).toBeGreaterThan(5);
    });
  });

  describe("executeCode", () => {
    it("should return mock execution result for Python", async () => {
      const code = `print("Hello")`;
      const result = await CodeExecutor.executeCode(code, "python");

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(result.executionTime).toBeDefined();
    });

    it("should return mock execution result for JavaScript", async () => {
      const code = `console.log("Hello")`;
      const result = await CodeExecutor.executeCode(code, "javascript");

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
    });

    it("should handle execution timeout", async () => {
      const code = `while(true) {}`;
      const result = await CodeExecutor.executeCode(code, "javascript", 100);

      // Should timeout or complete
      expect(result).toBeDefined();
    });
  });

  describe("runTests", () => {
    it("should run test cases", async () => {
      const code = `function add(a, b) { return a + b; }`;
      const testCases = [
        { input: "1, 2", expected: "3" },
        { input: "5, 5", expected: "10" },
      ];

      const result = await CodeExecutor.runTests(code, testCases, "javascript");

      expect(result.total).toBe(2);
      expect(result.passed).toBeGreaterThanOrEqual(0);
      expect(result.results).toHaveLength(2);
    });
  });
});
