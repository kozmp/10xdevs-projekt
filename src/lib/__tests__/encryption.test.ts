import { describe, it, expect, beforeEach } from "vitest";
import { encryptApiKey, decryptApiKey } from "../encryption";

describe("Encryption Module", () => {
  const testApiKey = "test-api-key-12345";
  let encryptedData: { encrypted: string; iv: string };

  describe("encryptApiKey", () => {
    it("should encrypt API key and return encrypted string with IV", () => {
      const result = encryptApiKey(testApiKey);
      expect(result).toHaveProperty("encrypted");
      expect(result).toHaveProperty("iv");
      expect(result.encrypted).not.toBe(testApiKey);
      expect(result.iv).toBeTruthy();
    });

    it("should generate different encrypted values for same input", () => {
      const result1 = encryptApiKey(testApiKey);
      const result2 = encryptApiKey(testApiKey);
      expect(result1.encrypted).not.toBe(result2.encrypted);
      expect(result1.iv).not.toBe(result2.iv);
    });

    it("should handle empty string", () => {
      expect(() => encryptApiKey("")).not.toThrow();
    });

    it("should handle special characters", () => {
      const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      expect(() => encryptApiKey(specialChars)).not.toThrow();
    });
  });

  describe("decryptApiKey", () => {
    beforeEach(() => {
      encryptedData = encryptApiKey(testApiKey);
    });

    it("should correctly decrypt encrypted API key", () => {
      const decrypted = decryptApiKey(encryptedData.encrypted, encryptedData.iv);
      expect(decrypted).toBe(testApiKey);
    });

    it("should throw error for invalid encrypted data", () => {
      expect(() => decryptApiKey("invalid-data", encryptedData.iv)).toThrow();
    });

    it("should throw error for invalid IV", () => {
      expect(() => decryptApiKey(encryptedData.encrypted, "invalid-iv")).toThrow();
    });

    it("should handle encryption/decryption of large strings", () => {
      const largeString = "x".repeat(1000);
      const encrypted = encryptApiKey(largeString);
      const decrypted = decryptApiKey(encrypted.encrypted, encrypted.iv);
      expect(decrypted).toBe(largeString);
    });
  });

  describe("Edge Cases and Security", () => {
    it("should not expose original key in encrypted form", () => {
      const result = encryptApiKey(testApiKey);
      expect(result.encrypted).not.toContain(testApiKey);
    });

    it("should handle unicode characters", () => {
      const unicodeString = "🔑こんにちは世界";
      const encrypted = encryptApiKey(unicodeString);
      const decrypted = decryptApiKey(encrypted.encrypted, encrypted.iv);
      expect(decrypted).toBe(unicodeString);
    });

    it("should fail gracefully with null input", () => {
      expect(() => encryptApiKey(null as any)).toThrow();
    });

    it("should fail gracefully with undefined input", () => {
      expect(() => encryptApiKey(undefined as any)).toThrow();
    });
  });
});
