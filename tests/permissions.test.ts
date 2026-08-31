import { describe, expect, it } from "vitest";

import {
  AuthorizationError,
  CAPABILITIES,
  ROLES,
  assertCan,
  can,
  capabilitiesFor,
} from "@/lib/auth/permissions";

describe("role capabilities", () => {
  it("gives the owner every capability", () => {
    for (const capability of CAPABILITIES) {
      expect(can("owner", capability)).toBe(true);
    }
  });

  it("withholds billing and deletion from admins", () => {
    expect(can("admin", "billing:manage")).toBe(false);
    expect(can("admin", "organization:delete")).toBe(false);
    expect(can("admin", "team:manage")).toBe(true);
  });

  it("lets designers edit products but not manage the team or approve", () => {
    expect(can("designer", "product:update")).toBe(true);
    expect(can("designer", "team:manage")).toBe(false);
    expect(can("designer", "approval:decide")).toBe(false);
    expect(can("designer", "product:delete")).toBe(false);
  });

  it("lets product developers manage suppliers and purchase orders", () => {
    expect(can("product_developer", "supplier:write")).toBe(true);
    expect(can("product_developer", "purchase_order:write")).toBe(true);
    expect(can("designer", "supplier:write")).toBe(false);
  });

  it("makes reviewers read-only apart from comments and approvals", () => {
    expect(can("reviewer", "product:read")).toBe(true);
    expect(can("reviewer", "comment:create")).toBe(true);
    expect(can("reviewer", "approval:decide")).toBe(true);
    expect(can("reviewer", "product:update")).toBe(false);
    expect(can("reviewer", "export:create")).toBe(false);
  });

  it("confines factory guests to reading and commenting", () => {
    expect(capabilitiesFor("factory_guest")).toEqual(["product:read", "comment:create"]);
    for (const capability of CAPABILITIES) {
      if (capability === "product:read" || capability === "comment:create") continue;
      expect(can("factory_guest", capability)).toBe(false);
    }
  });

  it("never grants a capability outside the declared list", () => {
    for (const role of ROLES) {
      for (const capability of capabilitiesFor(role)) {
        expect(CAPABILITIES).toContain(capability);
      }
    }
  });

  it("denies organization management to every non-admin role", () => {
    for (const role of ["designer", "product_developer", "reviewer", "factory_guest"] as const) {
      expect(can(role, "organization:manage")).toBe(false);
    }
  });
});

describe("assertCan", () => {
  it("passes through when the role holds the capability", () => {
    expect(() => assertCan("owner", "billing:manage")).not.toThrow();
  });

  it("throws AuthorizationError naming the role and capability", () => {
    try {
      assertCan("reviewer", "product:update");
      throw new Error("expected assertCan to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(AuthorizationError);
      expect((error as AuthorizationError).role).toBe("reviewer");
      expect((error as AuthorizationError).capability).toBe("product:update");
    }
  });
});
