import "server-only";

import { cache } from "react";

import { assertCan } from "@/lib/auth/permissions";
import { getSession } from "@/lib/auth/session";
import { libraryContent, workflowContent } from "@/lib/demo-data";
import type { LibraryContent, LibraryKey, SectionKey, WorkflowContent } from "@/types/techpack";

/** Server-only readers for the workspace libraries and product workflow sections. */

export const getLibrary = cache(async (key: LibraryKey): Promise<LibraryContent> => {
  const session = await getSession();
  // Without a session there is no tenant, so the demo dataset is all there is
  // to show. Phase 2 makes libraries organization-scoped rows and this becomes
  // a scoped query behind the same capability check.
  if (session) {
    assertCan(session.role, "library:read");
  }
  return libraryContent[key];
});

type WorkflowSection = Extract<SectionKey, "sampling" | "construction" | "packaging" | "history">;

export const getWorkflow = cache(async (section: WorkflowSection): Promise<WorkflowContent> => {
  const session = await getSession();
  if (session) {
    assertCan(session.role, "product:read");
  }
  return workflowContent[section];
});
