import { createAssignmentSchema } from "@/schemas/createAssignment.schema";
import { describe, expect, it } from "@jest/globals";

describe("createAssignmentSchema", () => {
  describe("assetId", () => {
    it("should validate a valid assetId", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        userId: 1,
        assignedDate: new Date(),
      });
      expect(result.success).toBe(true);
    });

    it("should reject when assetId is missing", () => {
      const result = createAssignmentSchema.safeParse({
        userId: 1,
        assignedDate: new Date(),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Asset is required");
      }
    });

    it("should reject when assetId is not a number", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: "1",
        userId: 1,
        assignedDate: new Date(),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Asset must be a number");
      }
    });
  });

  describe("userId", () => {
    it("should validate a valid userId", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        userId: 1,
        assignedDate: new Date(),
      });
      expect(result.success).toBe(true);
    });

    it("should reject when userId is missing", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        assignedDate: new Date(),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Assignee is required");
      }
    });

    it("should reject when userId is not a number", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        userId: "1",
        assignedDate: new Date(),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("AssignedTo must be a number");
      }
    });
  });

  describe("assignedDate", () => {
    it("should validate a valid assignedDate", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        userId: 1,
        assignedDate: new Date(),
      });
      expect(result.success).toBe(true);
    });

    it("should reject when assignedDate is missing", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        userId: 1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Assigned date is required");
      }
    });

    it("should reject when assignedDate is not a valid date", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        userId: 1,
        assignedDate: new Date("invalid-date"),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid date");
      }
    });

    it("should reject when assignedDate is more than 1 year in the future", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        userId: 1,
        assignedDate: futureDate,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Assigned date cannot be more than 1 year in the future");
      }
    });
  });

  describe("note", () => {
    it("should validate when note is missing", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        userId: 1,
        assignedDate: new Date(),
      });
      expect(result.success).toBe(true);
    });

    it("should validate when note is empty string", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        userId: 1,
        assignedDate: new Date(),
        note: "",
      });
      expect(result.success).toBe(true);
    });

    it("should validate when note is within 500 characters", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        userId: 1,
        assignedDate: new Date(),
        note: "a".repeat(500),
      });
      expect(result.success).toBe(true);
    });

    it("should reject when note exceeds 500 characters", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        userId: 1,
        assignedDate: new Date(),
        note: "a".repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Note must be less than or 500 characters");
      }
    });
  });

  describe("complete form validation", () => {
    it("should validate a complete valid form", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        userId: 1,
        assignedDate: new Date(),
        note: "Test note",
      });
      expect(result.success).toBe(true);
    });

    it("should reject an incomplete form", () => {
      const result = createAssignmentSchema.safeParse({
        assetId: 1,
        userId: 1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Assigned date is required");
      }
    });
  });
});
