import { describe, it, expect } from "vitest";
import { getUserBucket, isUserInRollout } from "../hash";

describe("Feature Flags - Hash", () => {
  describe("getUserBucket", () => {
    it("should return consistent hash for same userId and feature", () => {
      const userId = "user-123";
      const featureName = "auth";

      const bucket1 = getUserBucket(userId, featureName);
      const bucket2 = getUserBucket(userId, featureName);

      expect(bucket1).toBe(bucket2);
    });

    it("should return value between 0 and 100", () => {
      const bucket = getUserBucket("user-123", "auth");

      expect(bucket).toBeGreaterThanOrEqual(0);
      expect(bucket).toBeLessThan(100);
    });

    it("should return different values for different users", () => {
      const bucket1 = getUserBucket("user-123", "auth");
      const bucket2 = getUserBucket("user-456", "auth");

      // Z bardzo wysokim prawdopodobieństwem będą różne
      expect(bucket1).not.toBe(bucket2);
    });

    it("should return different values for different features", () => {
      const userId = "user-123";

      const bucket1 = getUserBucket(userId, "auth");
      const bucket2 = getUserBucket(userId, "collections");

      expect(bucket1).not.toBe(bucket2);
    });

    it("should return different values for different salts", () => {
      const userId = "user-123";
      const featureName = "auth";

      const bucket1 = getUserBucket(userId, featureName, "salt1");
      const bucket2 = getUserBucket(userId, featureName, "salt2");

      expect(bucket1).not.toBe(bucket2);
    });

    it("should provide uniform distribution (statistical test)", () => {
      const buckets: number[] = [];
      const sampleSize = 1000;

      // Generate 1000 buckets for different users
      for (let i = 0; i < sampleSize; i++) {
        const bucket = getUserBucket(`user-${i}`, "auth");
        buckets.push(bucket);
      }

      // Check that buckets are distributed across 0-100 range
      // Split into 10 bins (0-10, 10-20, ..., 90-100)
      const bins = Array(10).fill(0);

      buckets.forEach((bucket) => {
        const binIndex = Math.min(Math.floor(bucket / 10), 9);
        bins[binIndex]++;
      });

      // Each bin should have roughly 100 items (1000 / 10)
      // Allow ±30% variance for statistical noise
      bins.forEach((count) => {
        expect(count).toBeGreaterThan(70);
        expect(count).toBeLessThan(130);
      });
    });
  });

  describe("isUserInRollout", () => {
    it("should return true when bucket < rolloutPercentage", () => {
      const userId = "user-123";
      const featureName = "auth";

      const bucket = getUserBucket(userId, featureName);

      // User powinien być included gdy rollout > bucket
      expect(isUserInRollout(userId, featureName, bucket + 1)).toBe(true);
    });

    it("should return false when bucket >= rolloutPercentage", () => {
      const userId = "user-123";
      const featureName = "auth";

      const bucket = getUserBucket(userId, featureName);

      // User powinien być excluded gdy rollout <= bucket
      expect(isUserInRollout(userId, featureName, bucket)).toBe(false);
    });

    it("should include all users when rollout is 100%", () => {
      expect(isUserInRollout("user-1", "auth", 100)).toBe(true);
      expect(isUserInRollout("user-2", "auth", 100)).toBe(true);
      expect(isUserInRollout("user-999", "auth", 100)).toBe(true);
    });

    it("should exclude all users when rollout is 0%", () => {
      expect(isUserInRollout("user-1", "auth", 0)).toBe(false);
      expect(isUserInRollout("user-2", "auth", 0)).toBe(false);
      expect(isUserInRollout("user-999", "auth", 0)).toBe(false);
    });

    it("should include approximately 50% users when rollout is 50%", () => {
      const sampleSize = 1000;
      let includedCount = 0;

      for (let i = 0; i < sampleSize; i++) {
        if (isUserInRollout(`user-${i}`, "auth", 50)) {
          includedCount++;
        }
      }

      // Expect ~500 users included, allow ±10% variance
      expect(includedCount).toBeGreaterThan(450);
      expect(includedCount).toBeLessThan(550);
    });

    it("should be consistent across multiple checks", () => {
      const userId = "user-stable";
      const featureName = "auth";
      const rollout = 50;

      const result1 = isUserInRollout(userId, featureName, rollout);
      const result2 = isUserInRollout(userId, featureName, rollout);
      const result3 = isUserInRollout(userId, featureName, rollout);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });
});
