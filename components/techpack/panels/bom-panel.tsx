"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  createBomItem,
  deleteBomItem,
  updateBomItem,
  type ActionResult,
} from "@/lib/actions/bom";
import type { BomItem } from "@/lib/data/bom";
import type { BomRow } from "@/types/techpack";

const headers = ["Type", "Material", "Composition", "Placement", "Color", ""];

/** The editable fields, in column order, so a cell edit maps to one field. */
const FIELDS = ["rowType", "name", "composition", "placement", "colorName"] as const;
type Field = (typeof FIELDS)[number];

function toCells(item: BomItem): string[] {
  return [
    item.rowType,
    item.name,
    item.composition ?? "",
    item.placement ?? "",
    item.colorName ?? "",
  ];
}

/**
 * Bill of materials grid.
 *
 * Edits save on blur rather than on every keystroke: a server action per
 * character would be one database write per character, and Neon bills by
 * wake-time. The local draft state is what keeps the field responsive between
 * saves.
 *
 * `editable` is false when there is no session — production renders the demo
 * dataset, and rows without ids cannot be written to. A disabled grid is more
 * honest than inputs whose edits silently vanish.
 */
export function BomPanel({
  productId,
  items,
  demoRows,
  editable,
}: {
  productId: string;
  items: BomItem[];
  demoRows: BomRow[];
  editable: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(items.map((item) => [item.id, toCells(item)])),
  );

  const rows = editable
    ? items.map((item) => ({ id: item.id, cells: draft[item.id] ?? toCells(item), item }))
    : demoRows.map((row, index) => ({ id: `demo-${index}`, cells: [...row], item: null }));

  const handle = (result: Promise<ActionResult>, success: string) => {
    startTransition(async () => {
      const outcome = await result;
      if (outcome.ok) {
        toast.success(success);
        router.refresh();
      } else {
        toast.error(outcome.error);
      }
    });
  };

  const updateCell = (id: string, cellIndex: number, value: string) => {
    setDraft((current) => {
      const cells = [...(current[id] ?? [])];
      cells[cellIndex] = value;
      return { ...current, [id]: cells };
    });
  };

  const saveRow = (item: BomItem) => {
    const cells = draft[item.id];
    if (!cells) return;
    // Nothing changed — do not spend a write, or a database wake, on a blur.
    if (cells.join(" ") === toCells(item).join(" ")) return;

    const values = Object.fromEntries(
      FIELDS.map((field, index) => [field, cells[index] ?? ""]),
    ) as Record<Field, string>;

    handle(
      updateBomItem(item.id, {
        productId,
        rowType: values.rowType as never,
        name: values.name,
        composition: values.composition,
        placement: values.placement,
        colorName: values.colorName,
      }),
      "BOM row saved",
    );
  };

  return (
    <section className="section-card data-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Bill of materials</p>
          <h2>Fabric, trims, and labels</h2>
          <p>
            {editable
              ? "Every item the factory needs to source or produce. Edits save when you leave a field."
              : "Every item the factory needs to source or produce. Sign in to edit this specification."}
          </p>
        </div>
        <div className="button-row">
          <Button variant="outline" disabled>
            <Sparkles /> Suggest with AI
          </Button>
          <Button
            disabled={!editable || pending}
            onClick={() =>
              handle(
                createBomItem({ productId, rowType: "misc", name: "Untitled component" }),
                "BOM row added",
              )
            }
          >
            <Plus /> Add row
          </Button>
        </div>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={header || `actions-${index}`}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                {row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex}>
                    <input
                      value={cell}
                      readOnly={!editable}
                      aria-label={`${headers[cellIndex]} for row ${index + 1}`}
                      onChange={(event) => updateCell(row.id, cellIndex, event.target.value)}
                      onBlur={() => row.item && saveRow(row.item)}
                    />
                  </td>
                ))}
                <td>
                  <button
                    className="icon-button"
                    aria-label={`Delete row ${index + 1}`}
                    disabled={!editable || pending}
                    onClick={() => row.item && handle(deleteBomItem(row.item.id), "BOM row removed")}
                  >
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
