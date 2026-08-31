/**
 * Central authorization service.
 *
 * Every server action, route handler, background job, export, and upload asks
 * this module — never the UI. Roles map to an explicit capability set so a new
 * capability has to be granted deliberately rather than inherited by accident.
 *
 * Roles come from master prompt section 6.
 */

export const ROLES = [
  "owner",
  "admin",
  "designer",
  "product_developer",
  "reviewer",
  "factory_guest",
] as const;

export type Role = (typeof ROLES)[number];

export const CAPABILITIES = [
  // Organization and billing
  "organization:manage",
  "organization:delete",
  "billing:manage",
  "team:manage",
  // Products
  "product:read",
  "product:create",
  "product:update",
  "product:delete",
  // Libraries and suppliers
  "library:read",
  "library:write",
  "supplier:read",
  "supplier:write",
  "purchase_order:write",
  // Collaboration
  "comment:create",
  "approval:decide",
  "share:create",
  "share:revoke",
  // Exports and AI
  "export:create",
  "ai:run",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

const DESIGNER: Capability[] = [
  "product:read",
  "product:create",
  "product:update",
  "library:read",
  "library:write",
  "supplier:read",
  "comment:create",
  "export:create",
  "ai:run",
];

const PRODUCT_DEVELOPER: Capability[] = [
  "product:read",
  "product:create",
  "product:update",
  "library:read",
  "library:write",
  "supplier:read",
  "supplier:write",
  "purchase_order:write",
  "comment:create",
  "export:create",
  "ai:run",
];

const ADMIN: Capability[] = [
  ...new Set<Capability>([
    ...PRODUCT_DEVELOPER,
    "organization:manage",
    "team:manage",
    "product:delete",
    "approval:decide",
    "share:create",
    "share:revoke",
  ]),
];

const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = {
  owner: CAPABILITIES,
  admin: ADMIN,
  designer: DESIGNER,
  product_developer: PRODUCT_DEVELOPER,
  reviewer: ["product:read", "library:read", "supplier:read", "comment:create", "approval:decide"],
  // Token-scoped: sees one shared specification, never the organization.
  factory_guest: ["product:read", "comment:create"],
};

export function capabilitiesFor(role: Role): readonly Capability[] {
  return ROLE_CAPABILITIES[role];
}

export function can(role: Role, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability);
}

export class AuthorizationError extends Error {
  constructor(
    readonly role: Role,
    readonly capability: Capability,
  ) {
    super(`Role "${role}" is not permitted to ${capability}`);
    this.name = "AuthorizationError";
  }
}

/** Throwing guard for call sites that must not continue without the capability. */
export function assertCan(role: Role, capability: Capability): void {
  if (!can(role, capability)) {
    throw new AuthorizationError(role, capability);
  }
}
