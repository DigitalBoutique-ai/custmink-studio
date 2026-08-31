import "server-only";

import { cache } from "react";

import { libraryContent, workflowContent } from "@/lib/demo-data";
import type { LibraryContent, LibraryKey, SectionKey, WorkflowContent } from "@/types/techpack";

/** Server-only readers for the workspace libraries and product workflow sections. */

export const getLibrary = cache(async (key: LibraryKey): Promise<LibraryContent> => {
  return libraryContent[key];
});

type WorkflowSection = Extract<SectionKey, "sampling" | "construction" | "packaging" | "history">;

export const getWorkflow = cache(async (section: WorkflowSection): Promise<WorkflowContent> => {
  return workflowContent[section];
});
