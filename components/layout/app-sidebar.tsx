"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, MoreHorizontal, PanelLeftClose } from "lucide-react";

import { Icon } from "@/components/icon";
import { BrandMark } from "@/components/layout/brand-mark";
import { Wordmark } from "@/components/layout/wordmark";
import { navGroups } from "@/lib/navigation";

/** Active state is derived from the URL instead of the prototype's `activeNav` state. */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({
  collapsed,
  onCollapse,
}: {
  collapsed: boolean;
  onCollapse: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={collapsed ? "app-sidebar collapsed" : "app-sidebar"}>
      <div className="sidebar-brand">
        <BrandMark />
        {!collapsed && (
          <div>
            <Wordmark />
          </div>
        )}
        <button className="icon-button collapse-button" onClick={onCollapse} aria-label="Collapse sidebar">
          <PanelLeftClose />
        </button>
      </div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            {!collapsed && <p>{group.label}</p>}
            {group.items.map((item) => (
              <Link
                className={isActive(pathname, item.href) ? "nav-item active" : "nav-item"}
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                <Icon name={item.icon} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item">
          <CircleHelp />
          {!collapsed && <span>Help center</span>}
        </button>
        <Link className="account-card" href="/settings/organization">
          <span className="avatar">TD</span>
          {!collapsed && (
            <span className="account-copy">
              <strong>Tim de Vallée</strong>
              <small>Owner</small>
            </span>
          )}
          {!collapsed && <MoreHorizontal />}
        </Link>
      </div>
    </aside>
  );
}
