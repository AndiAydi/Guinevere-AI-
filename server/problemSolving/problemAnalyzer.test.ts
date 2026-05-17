import { describe, it, expect } from "vitest";
import { ProblemAnalyzer } from "./problemAnalyzer";

describe("ProblemAnalyzer", () => {
  describe("analyzeProblem", () => {
    it("should detect coding problems", () => {
      const message = "Tulis code JavaScript untuk menghitung factorial";
      const context = ProblemAnalyzer.analyzeProblem(message);

      expect(context.language).toBe("javascript");
      expect(context.description).toBe(message);
      expect(["coding", "explanation", "algorithm"]).toContain(context.category);
    });

    it("should detect debugging problems", () => {
      const message = "Ada error: TypeError: Cannot read property of undefined";
      const context = ProblemAnalyzer.analyzeProblem(message);

      expect(context.category).toBe("debugging");
      expect(context.errorMessage).toContain("TypeError");
    });

    it("should detect algorithm problems", () => {
      const message = "Bagaimana cara implementasi binary search algorithm?";
      const context = ProblemAnalyzer.analyzeProblem(message);

      expect(context.category).toBe("algorithm");
    });

    it("should detect optimization problems", () => {
      const message = "Bagaimana cara optimize performance dari code ini?";
      const context = ProblemAnalyzer.analyzeProblem(message);

      expect(context.category).toBe("optimization");
    });

    it("should detect Python language", () => {
      const message = "```python\ndef hello():\n    print('hello')\n```";
      const context = ProblemAnalyzer.analyzeProblem(message);

      expect(context.language).toBe("python");
      expect(context.codeSnippet).toContain("def hello");
    });

    it("should extract code blocks", () => {
      const message = "Ada bug di code ini:\n```javascript\nconst x = undefined;\nconsole.log(x.name);\n```";
      const context = ProblemAnalyzer.analyzeProblem(message);

      expect(context.codeSnippet).toContain("const x");
      expect(context.codeSnippet).toContain("console.log");
    });

    it("should estimate complexity levels", () => {
      const simpleMsg = "Apa itu variable?";
      const moderateMsg = "Bagaimana cara implementasi sorting algorithm dengan berbagai pendekatan?";
      const complexMsg = "Bagaimana cara design distributed system yang scalable dengan concurrent processing dan optimization?";

      expect(ProblemAnalyzer.analyzeProblem(simpleMsg).complexity).toBe("simple");
      expect(ProblemAnalyzer.analyzeProblem(moderateMsg).complexity).toBe("moderate");
      expect(ProblemAnalyzer.analyzeProblem(complexMsg).complexity).toBe("complex");
    });
  });

  describe("createAnalysis", () => {
    it("should create comprehensive analysis", () => {
      const message = "Error: undefined is not a function";
      const context = ProblemAnalyzer.analyzeProblem(message);
      const analysis = ProblemAnalyzer.createAnalysis(context);

      expect(analysis.context).toBeDefined();
      expect(analysis.suggestedApproaches).toBeDefined();
      expect(analysis.difficulty).toBeDefined();
      expect(analysis.relatedConcepts).toBeDefined();
    });

    it("should suggest debugging approaches for errors", () => {
      const message = "Error: Cannot read property 'map' of undefined";
      const context = ProblemAnalyzer.analyzeProblem(message);
      const analysis = ProblemAnalyzer.createAnalysis(context);

      expect(analysis.suggestedApproaches).toContain("Isolate the problematic code section");
      expect(analysis.suggestedApproaches).toContain("Add logging statements to trace execution");
    });

    it("should identify related concepts for algorithms", () => {
      const message = "Bagaimana cara implementasi algorithm quicksort dengan kompleksitas?";
      const context = ProblemAnalyzer.analyzeProblem(message);
      const analysis = ProblemAnalyzer.createAnalysis(context);

      expect(analysis.relatedConcepts.length).toBeGreaterThan(0);
      expect(analysis.context.category).toBe("algorithm");
    });
  });

  describe("detectCategory", () => {
    it("should detect various problem categories", () => {
      const testCases = [
        { msg: "bug di code", expected: "debugging" },
        { msg: "algorithm sorting", expected: "algorithm" },
        { msg: "optimize performance", expected: "optimization" },
        { msg: "design pattern", expected: "design" },
        { msg: "explain recursion", expected: "explanation" },
        { msg: "analyze code", expected: "analysis" },
        { msg: "write function", expected: "coding" },
      ];

      testCases.forEach(({ msg, expected }) => {
        const context = ProblemAnalyzer.analyzeProblem(msg);
        expect(context.category).toBe(expected);
      });
    });
  });

  describe("detectLanguage", () => {
    it("should detect programming languages", () => {
      const testCases = [
        { msg: "python code", expected: "python" },
        { msg: "javascript function", expected: "javascript" },
        { msg: "typescript interface", expected: "typescript" },
        { msg: "java class", expected: "java" },
        { msg: "sql query", expected: "sql" },
      ];

      testCases.forEach(({ msg, expected }) => {
        const context = ProblemAnalyzer.analyzeProblem(msg);
        expect(context.language).toBe(expected);
      });
    });
  });
});
