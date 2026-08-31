"use client";

import { Check, Plus } from "lucide-react";

import { Garment } from "@/components/techpack/garment";
import { useWorkspace } from "@/components/techpack/product-workspace";
import { Button } from "@/components/ui/button";
import type { Colorway } from "@/types/techpack";

export function ColorwaysPanel({ colorways }: { colorways: Colorway[] }) {
  const { color, setColor } = useWorkspace();

  return (
    <div className="section-stack">
      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Approved palette</p>
            <h2>Product colorways</h2>
            <p>Keep garment, artwork, trims, and factory color codes aligned.</p>
          </div>
          <Button>
            <Plus /> Add colorway
          </Button>
        </div>
        <div className="colorway-grid">
          {colorways.map((item) => (
            <button
              className={color === item.hex ? "colorway-card selected" : "colorway-card"}
              key={item.hex}
              onClick={() => setColor(item.hex)}
            >
              <div className="colorway-garment" style={{ background: `${item.hex}20` }}>
                <Garment color={item.hex} showCallouts={false} />
              </div>
              <div>
                <span className="large-swatch" style={{ background: item.hex }} />
                <strong>{item.name}</strong>
                <small>
                  {item.code} · {item.hex.toUpperCase()}
                </small>
              </div>
              {color === item.hex && (
                <span className="selected-check">
                  <Check />
                </span>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
