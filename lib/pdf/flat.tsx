import { G, Path, Rect, Svg } from "@react-pdf/renderer";
import type { ReactElement } from "react";

import { renderFlat } from "@/lib/flats/render";
import type { FlatSpecV1 } from "@/lib/flats/spec";
import { strokeProps } from "@/lib/flats/style";
import type { FlatView } from "@/lib/flats/templates/hoodie";

/**
 * The parametric flat, drawn with React PDF primitives.
 *
 * React PDF's SVG support is a subset: no `<style>` element, no CSS classes, no
 * custom properties, no cascade. Every stroke therefore carries its own
 * presentation props, resolved from the same token table the browser stylesheet
 * is generated from (`lib/flats/style.ts`).
 *
 * This is real vector geometry in the PDF, not a rasterized preview. A factory
 * can zoom to any magnification and the cut lines stay sharp, which is the
 * entire argument for the parametric-flats decision — see HANDOFF, "Flats are
 * parametric, never generated as images."
 */
export function FlatDrawing({
  spec,
  view,
  width,
  fill,
  ink,
}: {
  spec: FlatSpecV1;
  view: FlatView;
  width: number;
  fill?: string;
  ink?: string;
}): ReactElement {
  const flat = renderFlat(spec, view);
  // `viewBox` is "0 0 w h" by construction; fall back to square rather than
  // dividing by undefined if a future template ever emits something else.
  const [, , viewWidth = 1, viewHeight = 1] = flat.viewBox.split(" ").map(Number);
  const height = width * (viewHeight / viewWidth);

  return (
    <Svg viewBox={flat.viewBox} style={{ width, height }}>
      {flat.groups.map((group) => (
        // React PDF's <G> takes no id; group identity matters to the browser
        // SVG (callout anchors), not to the printed drawing.
        <G key={group.id}>
          {group.elements.map((element, index) =>
            element.kind === "path" ? (
              <Path key={index} d={element.d} {...strokeProps(element.stroke, { fill, ink })} />
            ) : (
              <Rect
                key={index}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                {...strokeProps(element.stroke, { fill, ink })}
              />
            ),
          )}
        </G>
      ))}
    </Svg>
  );
}
