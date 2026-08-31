"use client";

import { CircleHelp, Plus, Ruler, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MeasurementRow } from "@/types/techpack";

const headers = ["POM", "Description", "XS", "S", "M", "L", "XL"];

export function MeasurementsPanel({ rows }: { rows: MeasurementRow[] }) {
  return (
    <section className="section-card data-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Graded specification</p>
          <h2>Size chart and points of measure</h2>
          <p>Base size M · Centimeters · Tolerance ±0.5 cm</p>
        </div>
        <div className="button-row">
          <Button variant="outline">
            <Ruler /> Grade from M
          </Button>
          <Button>
            <Plus /> Add POM
          </Button>
        </div>
      </div>
      <div className="data-table-wrap">
        <table className="data-table measurement-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td key={index}>
                    {index < 2 ? (
                      cell
                    ) : (
                      <input defaultValue={cell} aria-label={`${row[0]} size ${headers[index]}`} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>
          <CircleHelp /> Grade rules calculate from the approved base-size measurements.
        </span>
        <Button variant="outline">
          <Sparkles /> Validate grading
        </Button>
      </div>
    </section>
  );
}
