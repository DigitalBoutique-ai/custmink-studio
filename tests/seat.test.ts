import { describe, expect, it } from "vitest";

import { decideClaim, normalizeEmail, pendingExternalId, pickMembership } from "@/lib/seats/rules";

const identity = { userId: "user_2abc", email: "ana@exora.ink", name: "Ana", avatarUrl: null };

describe("seat claiming", () => {
  it("links an unclaimed seat provisioned for the email", () => {
    const row = { externalId: pendingExternalId("Ana@Exora.ink"), email: "ana@exora.ink" };
    expect(decideClaim(row, identity)).toEqual({ kind: "link" });
  });

  it("is a no-op when the seat is already linked to this identity", () => {
    expect(decideClaim({ externalId: "user_2abc", email: "ana@exora.ink" }, identity)).toEqual({
      kind: "linked",
    });
  });

  it("refuses to reassign a seat linked to a different identity", () => {
    expect(decideClaim({ externalId: "user_other", email: "ana@exora.ink" }, identity)).toEqual({
      kind: "conflict",
    });
  });

  it("reports when nobody provisioned a seat", () => {
    expect(decideClaim(null, identity)).toEqual({ kind: "none" });
  });

  it("normalizes email case and whitespace so provisioning and Clerk agree", () => {
    expect(normalizeEmail("  Ana@Exora.INK ")).toBe("ana@exora.ink");
    expect(pendingExternalId("Ana@Exora.INK")).toBe("pending:ana@exora.ink");
  });

  it("runs a session under the first membership", () => {
    expect(pickMembership([])).toBeNull();
    expect(
      pickMembership([
        { organizationId: "org-1", role: "owner" },
        { organizationId: "org-2", role: "designer" },
      ]),
    ).toEqual({ organizationId: "org-1", role: "owner" });
  });
});
