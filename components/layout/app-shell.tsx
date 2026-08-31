"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { Toaster } from "sonner";

import { AiPanel } from "@/components/ai/ai-panel";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CreateTechPackDialog } from "@/components/techpack/create-tech-pack-dialog";

/**
 * The authenticated workspace shell.
 *
 * The prototype held sidebar, copilot, and wizard state in one root component.
 * Routing now owns page selection, so the shell keeps only the state that must
 * survive navigation, and exposes it to descendants through a context rather
 * than prop-drilling through server layouts.
 */

type StudioShell = {
  openAi: () => void;
  openCreate: () => void;
};

const StudioShellContext = createContext<StudioShell | null>(null);

export function useStudioShell(): StudioShell {
  const context = useContext(StudioShellContext);
  if (!context) {
    throw new Error("useStudioShell must be used inside <AppShell>");
  }
  return context;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const shell = useMemo<StudioShell>(
    () => ({ openAi: () => setAiOpen(true), openCreate: () => setCreateOpen(true) }),
    [],
  );

  return (
    <StudioShellContext.Provider value={shell}>
      <div className="studio-app">
        <Toaster position="bottom-right" richColors />
        <AppSidebar collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
        <div className="app-main">
          <Topbar
            onNew={() => setCreateOpen(true)}
            onAi={() => setAiOpen(true)}
            onMenu={() => setCollapsed(!collapsed)}
          />
          {children}
        </div>
        <CreateTechPackDialog open={createOpen} onOpenChange={setCreateOpen} />
        <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
      </div>
    </StudioShellContext.Provider>
  );
}
