"use client";

import { Bell, Menu, Plus, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Topbar({
  onNew,
  onAi,
  onMenu,
}: {
  onNew: () => void;
  onAi: () => void;
  onMenu: () => void;
}) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open navigation">
        <Menu />
      </button>
      <div className="global-search">
        <Search />
        <input aria-label="Search workspace" placeholder="Search styles, codes, materials…" />
        <kbd>⌘ K</kbd>
      </div>
      <div className="top-actions">
        <Button className="ai-button" variant="outline" onClick={onAi}>
          <Sparkles /> Ask AI
        </Button>
        <button className="icon-button" aria-label="Notifications">
          <Bell />
          <span className="notification-dot" />
        </button>
        <Button onClick={onNew}>
          <Plus /> New tech pack
        </Button>
      </div>
    </header>
  );
}
