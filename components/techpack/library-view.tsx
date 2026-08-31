"use client";

import { useState } from "react";
import { ChevronDown, MoreHorizontal, Plus, Search, Tags } from "lucide-react";

import { Icon } from "@/components/icon";
import { useStudioShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colorways } from "@/lib/demo-data";
import { libraryIcons } from "@/lib/navigation";
import type { LibraryContent, LibraryKey } from "@/types/techpack";

/** Shared presentation for every `/libraries/*`, `/collections`, `/suppliers`, and `/purchase-orders` page. */
export function LibraryView({
  libraryKey,
  content,
}: {
  libraryKey: LibraryKey;
  content: LibraryContent;
}) {
  const { openCreate } = useStudioShell();
  const [query, setQuery] = useState("");

  const filtered = content.items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );

  const badgeLabel =
    libraryKey === "suppliers" ? "Approved" : libraryKey === "purchase-orders" ? "Open" : "Library";

  return (
    <main className="page-scroll">
      <div className="content-wrap library-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Workspace library</p>
            <h1>{content.title}</h1>
            <p>{content.subtitle}</p>
          </div>
          <Button onClick={openCreate}>
            <Plus /> Add new
          </Button>
        </div>
        <div className="library-toolbar">
          <div className="inline-search">
            <Search />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${content.title.toLowerCase()}…`}
              aria-label={`Search ${content.title.toLowerCase()}`}
            />
          </div>
          <Button variant="outline">
            <Tags /> Filter
          </Button>
          <Button variant="outline">
            <ChevronDown /> Sort
          </Button>
        </div>
        <div className="library-grid">
          {filtered.map((item, index) => (
            <article className="library-card" key={item}>
              <div className="library-preview">
                <Icon name={libraryIcons[libraryKey]} />
                {libraryKey === "colors" && (
                  <span className="swatch-preview" style={{ background: colorways[index]?.hex }} />
                )}
              </div>
              <div>
                <Badge variant="outline">{badgeLabel}</Badge>
                <h3>{item}</h3>
                <p>
                  Updated {index + 1} day{index ? "s" : ""} ago
                </p>
              </div>
              <button className="icon-button" aria-label={`More actions for ${item}`}>
                <MoreHorizontal />
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
