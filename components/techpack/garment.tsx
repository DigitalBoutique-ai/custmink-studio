import { Shirt } from "lucide-react";

/**
 * The technical-flat stand-in used across the dashboard, product cards, canvas,
 * colorways, and artwork map. Phase 3 replaces this with the real Fabric/Konva
 * canvas document; the markup and callout positions are preserved so the
 * surrounding layout does not shift when that lands.
 */
export function Garment({
  color,
  artworkSize = 38,
  showCallouts = true,
}: {
  color: string;
  artworkSize?: number;
  showCallouts?: boolean;
}) {
  return (
    <div className="garment-stage">
      <div className="garment-object">
        <Shirt style={{ color, fill: color }} strokeWidth={1.2} />
        <strong style={{ fontSize: `${Math.max(9, artworkSize / 3)}px` }}>CUSTM</strong>
        <span className="garment-seam seam-a" />
        <span className="garment-seam seam-b" />
      </div>
      {showCallouts && (
        <>
          <span className="callout callout-left">
            460 GSM
            <br />
            organic cotton
          </span>
          <span className="callout callout-right">
            Screen print
            <br />
            28 cm wide
          </span>
        </>
      )}
    </div>
  );
}
