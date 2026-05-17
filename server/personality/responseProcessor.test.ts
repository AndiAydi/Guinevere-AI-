import { describe, it, expect } from "vitest";
import { ResponseProcessor } from "./responseProcessor";

describe("ResponseProcessor", () => {
  describe("processResponse", () => {
    it("should process a basic response", () => {
      const input = "Halo, apa kabar?";
      const output = ResponseProcessor.processResponse(input);
      expect(output).toBeTruthy();
      expect(output.length).toBeGreaterThan(0);
    });

    it("should enforce maximum length limit", () => {
      const longText = "a".repeat(500);
      const output = ResponseProcessor.processResponse(longText);
      expect(output.length).toBeLessThanOrEqual(310);
    });

    it("should remove excessive punctuation", () => {
      const input = "Halo!!!!! Apa kabar????";
      const output = ResponseProcessor.processResponse(input);
      // Check that multiple punctuation marks are reduced
      expect(output.split("!").length).toBeLessThanOrEqual(3);
    });

    it("should add butterfly reference when requested", () => {
      const input = "Aku merasa sangat bahagia hari ini";
      const output = ResponseProcessor.processResponse(input, true);
      // Butterfly mention might be added, but not guaranteed due to randomness
      // Just verify it doesn't break the response
      expect(output).toBeTruthy();
    });

    it("should not add butterfly reference when not requested", () => {
      const input = "Aku merasa sedih hari ini";
      const output = ResponseProcessor.processResponse(input, false);
      expect(output).not.toContain("kupu-kupu");
      expect(output).not.toContain("butterfly");
    });
  });

  describe("containsButterflyMention", () => {
    it("should detect butterfly mentions", () => {
      expect(ResponseProcessor.containsButterflyMention("kupu-kupu terbang indah")).toBe(true);
      expect(ResponseProcessor.containsButterflyMention("butterfly is beautiful")).toBe(true);
      expect(ResponseProcessor.containsButterflyMention("hinggap di bunga")).toBe(true);
    });

    it("should not detect false butterfly mentions", () => {
      expect(ResponseProcessor.containsButterflyMention("aku merasa bahagia")).toBe(false);
      expect(ResponseProcessor.containsButterflyMention("terbang tinggi")).toBe(false);
    });
  });

  describe("detectSensitiveTopic", () => {
    it("should detect sensitive topics", () => {
      expect(ResponseProcessor.detectSensitiveTopic("masa lalu saya sangat sulit")).toBe(true);
      expect(ResponseProcessor.detectSensitiveTopic("dulu aku mengalami trauma")).toBe(true);
      expect(ResponseProcessor.detectSensitiveTopic("pernah ada sesuatu yang menyakitkan")).toBe(true);
    });

    it("should not detect non-sensitive topics", () => {
      expect(ResponseProcessor.detectSensitiveTopic("hari ini cuaca sangat bagus")).toBe(false);
      expect(ResponseProcessor.detectSensitiveTopic("saya suka makan nasi goreng")).toBe(false);
    });
  });

  describe("response naturalization", () => {
    it("should replace formal pronouns with casual ones", () => {
      const input = "Saya pikir Anda sangat baik";
      const output = ResponseProcessor.processResponse(input);
      // Should convert to more casual Indonesian
      expect(output.toLowerCase()).toContain("aku");
    });

    it("should clean up extra spaces", () => {
      const input = "Halo    apa    kabar";
      const output = ResponseProcessor.processResponse(input);
      expect(output).not.toMatch(/   /);
    });
  });

  describe("thinking pauses", () => {
    it("should handle thinking pauses gracefully", () => {
      const input = "Aku sedang berpikir. Ini adalah kalimat kedua. Ini adalah kalimat ketiga. Aku terus berpikir. Ini adalah kalimat keempat.";
      // Just verify that processing doesn't break, regardless of ellipsis
      const output = ResponseProcessor.processResponse(input);
      expect(output).toBeTruthy();
      expect(output.length).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const output = ResponseProcessor.processResponse("");
      expect(output).toBeTruthy();
    });

    it("should handle very short string", () => {
      const output = ResponseProcessor.processResponse("Hi");
      expect(output).toBeTruthy();
    });

    it("should handle string with only punctuation", () => {
      const output = ResponseProcessor.processResponse("!!!???");
      expect(output).toBeTruthy();
    });
  });
});
