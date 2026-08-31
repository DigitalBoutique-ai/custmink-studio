"use client";

import { Check, ChevronRight, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SectionKey, WorkflowContent } from "@/types/techpack";

/** Shared list layout for the sampling, construction, packaging, and history sections. */
export function WorkflowPanel({
  section,
  content,
}: {
  section: SectionKey;
  content: WorkflowContent;
}) {
  return (
    <section className="section-card workflow-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Production workflow</p>
          <h2>{content.title}</h2>
          <p>{content.subtitle}</p>
        </div>
        <Button>
          <Plus /> Add item
        </Button>
      </div>
      <div className="workflow-list">
        {content.items.map((item, index) => {
          const complete = index === 0 || section === "history";
          return (
            <article key={item}>
              <span className={complete ? "step-number complete" : "step-number"}>
                {complete ? <Check /> : index + 1}
              </span>
              <div>
                <strong>{item}</strong>
                <p>
                  {section === "history"
                    ? `Saved by Tim · ${index + 1} day${index ? "s" : ""} ago`
                    : index === 0
                      ? "Complete and approved"
                      : "Ready for details"}
                </p>
              </div>
              <Badge variant="outline">{complete ? "Complete" : "Pending"}</Badge>
              <ChevronRight />
            </article>
          );
        })}
      </div>
    </section>
  );
}
