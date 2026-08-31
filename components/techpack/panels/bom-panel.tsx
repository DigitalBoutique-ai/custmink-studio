"use client";

import { useState } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BomRow } from "@/types/techpack";

const headers = ["Type", "Material", "Composition", "Placement", "Color", ""];

export function BomPanel({ initialRows }: { initialRows: BomRow[] }) {
  const [rows, setRows] = useState<string[][]>(() => initialRows.map((row) => [...row]));

  const updateCell = (rowIndex: number, cellIndex: number, value: string) => {
    setRows((current) =>
      current.map((row, index) =>
        index === rowIndex ? row.map((cell, col) => (col === cellIndex ? value : cell)) : row,
      ),
    );
  };

  return (
    <section className="section-card data-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Bill of materials</p>
          <h2>Fabric, trims, and labels</h2>
          <p>Every item the factory needs to source or produce.</p>
        </div>
        <div className="button-row">
          <Button variant="outline">
            <Sparkles /> Suggest with AI
          </Button>
          <Button onClick={() => setRows([...rows, ["New", "Untitled component", "", "", ""]])}>
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
              <tr key={`${row[1]}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>
                    <input
                      value={cell}
                      aria-label={`${headers[cellIndex]} for row ${index + 1}`}
                      onChange={(event) => updateCell(index, cellIndex, event.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <button
                    className="icon-button"
                    aria-label={`Delete row ${index + 1}`}
                    onClick={() => setRows(rows.filter((_, rowIndex) => rowIndex !== index))}
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
