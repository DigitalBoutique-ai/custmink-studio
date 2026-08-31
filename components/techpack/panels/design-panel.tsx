"use client";

import { useState } from "react";
import { ArrowLeft, History, Save, WandSparkles, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";

import { Garment } from "@/components/techpack/garment";
import { useWorkspace } from "@/components/techpack/product-workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Colorway } from "@/types/techpack";

export function DesignPanel({ colorways }: { colorways: Colorway[] }) {
  const { color, setColor, artworkSize, setArtworkSize } = useWorkspace();
  const [zoom, setZoom] = useState(100);

  return (
    <div className="canvas-layout">
      <div className="canvas-toolbar">
        <Button variant="ghost" size="sm">
          <ArrowLeft /> Back
        </Button>
        <span />
        <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(70, zoom - 10))} aria-label="Zoom out">
          <ZoomOut />
        </Button>
        <strong>{zoom}%</strong>
        <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(140, zoom + 10))} aria-label="Zoom in">
          <ZoomIn />
        </Button>
        <Button variant="outline" size="sm">
          <History /> Undo
        </Button>
        <Button size="sm" onClick={() => toast.success("Canvas changes saved")}>
          <Save /> Save
        </Button>
      </div>
      <div className="design-canvas">
        <div style={{ transform: `scale(${zoom / 100})` }}>
          <Garment color={color} artworkSize={artworkSize} />
        </div>
      </div>
      <aside className="properties-panel">
        <div className="properties-heading">
          <div>
            <p className="eyebrow">Selected layer</p>
            <h3>CUSTM wordmark</h3>
          </div>
          <Badge>Artwork</Badge>
        </div>
        <label>
          Placement
          <Input value="Front chest" readOnly />
        </label>
        <label>
          Decoration
          <select defaultValue="Screen print">
            <option>Screen print</option>
            <option>Embroidery</option>
            <option>Heat transfer</option>
          </select>
        </label>
        <label>
          Print width <span>{artworkSize} cm</span>
          <input
            type="range"
            min="20"
            max="52"
            value={artworkSize}
            onChange={(event) => setArtworkSize(Number(event.target.value))}
          />
        </label>
        <label>
          Garment color
          <div className="mini-swatches">
            {colorways.map((item) => (
              <button
                key={item.hex}
                className={color === item.hex ? "active" : ""}
                style={{ background: item.hex }}
                onClick={() => setColor(item.hex)}
                aria-label={item.name}
              />
            ))}
          </div>
        </label>
        <Textarea defaultValue="Center artwork on the body, 8 cm below neck seam. Confirm artwork size before bulk." />
        <Button variant="outline">
          <WandSparkles /> AI suggest placement
        </Button>
      </aside>
    </div>
  );
}
