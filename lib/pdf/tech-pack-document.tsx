import { Document, type DocumentProps, Page, Text, View } from "@react-pdf/renderer";
import type { ReactElement, ReactNode } from "react";

import { PRODUCT_NAME_TM } from "@/lib/brand";
import { FlatDrawing } from "@/lib/pdf/flat";
import {
  BOM_COLUMNS,
  DOCUMENT_SECTIONS,
  type TechPackDocumentData,
} from "@/lib/pdf/tech-pack-data";
import { COLORS, FONTS, PAGE, SPACE, TYPE, readableInkOn } from "@/lib/pdf/theme";

/**
 * The factory tech pack, as a PDF.
 *
 * Section order follows master prompt section 8 and is asserted in
 * `tests/pdf.test.ts` against the extracted text, so a section cannot be
 * dropped silently.
 *
 * Two React PDF mechanics carry most of the layout requirements:
 *
 * - `fixed` on a View repeats it on every page the parent spans. That is how
 *   the footer appears on every page and how a table header repeats when a
 *   long BOM or measurement table breaks across pages — a table whose header
 *   does not repeat is unreadable on page two, and this document is printed.
 * - `wrap={false}` keeps a block whole. Applied to table rows so a row never
 *   splits across a page boundary, which would put a measurement value on a
 *   different page from its point-of-measure code.
 */

// ---------------------------------------------------------------- primitives

function Rule({ strong = false }: { strong?: boolean }): ReactElement {
  return (
    <View
      style={{
        borderBottomWidth: strong ? 1 : 0.5,
        borderBottomColor: strong ? COLORS.ink : COLORS.rule,
        marginVertical: SPACE.sm,
      }}
    />
  );
}

function SectionHeading({ index, title }: { index: number; title: string }): ReactElement {
  return (
    <View style={{ marginBottom: SPACE.sm }} wrap={false}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: SPACE.sm }}>
        <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.small, color: COLORS.cobalt }}>
          {String(index).padStart(2, "0")}
        </Text>
        <Text
          style={{
            fontFamily: FONTS.bold,
            fontSize: TYPE.section,
            color: COLORS.ink,
            letterSpacing: 0.2,
          }}
        >
          {title}
        </Text>
      </View>
      <View
        style={{ borderBottomWidth: 1, borderBottomColor: COLORS.ink, marginTop: SPACE.xs }}
      />
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <View style={{ width: "33.33%", paddingRight: SPACE.md, marginBottom: SPACE.md }}>
      <Text
        style={{
          fontFamily: FONTS.bold,
          fontSize: TYPE.micro,
          color: COLORS.inkFaint,
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: TYPE.body, color: COLORS.ink, marginTop: 2 }}>{value}</Text>
    </View>
  );
}

/**
 * A table with a header that repeats on every page it spans.
 *
 * `widths` are flex ratios rather than absolute points so the table fits any
 * page margin without a second set of numbers to keep in sync.
 */
function Table({
  columns,
  widths,
  rows,
}: {
  columns: readonly string[];
  widths: number[];
  rows: readonly (readonly string[])[];
}): ReactElement {
  return (
    <View>
      <View
        fixed
        style={{
          flexDirection: "row",
          backgroundColor: COLORS.ink,
          paddingVertical: 5,
          paddingHorizontal: SPACE.sm,
        }}
      >
        {columns.map((column, index) => (
          <Text
            key={column}
            style={{
              flex: widths[index] ?? 1,
              fontFamily: FONTS.bold,
              fontSize: TYPE.micro,
              color: COLORS.surface,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {column}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          wrap={false}
          style={{
            flexDirection: "row",
            paddingVertical: 5,
            paddingHorizontal: SPACE.sm,
            backgroundColor: rowIndex % 2 === 1 ? COLORS.surfaceAlt : COLORS.surface,
            borderBottomWidth: 0.5,
            borderBottomColor: COLORS.ruleFaint,
          }}
        >
          {row.map((cell, cellIndex) => (
            <Text
              key={cellIndex}
              style={{ flex: widths[cellIndex] ?? 1, fontSize: TYPE.small, color: COLORS.ink }}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function NumberedList({ items }: { items: string[] }): ReactElement {
  return (
    <View>
      {items.map((item, index) => (
        <View
          key={item}
          wrap={false}
          style={{ flexDirection: "row", marginBottom: SPACE.sm, gap: SPACE.sm }}
        >
          <View
            style={{
              width: 15,
              height: 15,
              borderRadius: 7.5,
              backgroundColor: COLORS.surfaceAlt,
              borderWidth: 0.5,
              borderColor: COLORS.rule,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: TYPE.micro, fontFamily: FONTS.bold, color: COLORS.ink }}>
              {index + 1}
            </Text>
          </View>
          <Text style={{ flex: 1, fontSize: TYPE.body, color: COLORS.ink, paddingTop: 2 }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

// -------------------------------------------------------------------- pages

function Footer({ data }: { data: TechPackDocumentData }): ReactElement {
  return (
    <View
      fixed
      style={{
        position: "absolute",
        bottom: 22,
        left: PAGE.paddingHorizontal,
        right: PAGE.paddingHorizontal,
        borderTopWidth: 0.5,
        borderTopColor: COLORS.rule,
        paddingTop: SPACE.xs,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: TYPE.micro, color: COLORS.inkFaint }}>
          {data.style.name} · {data.style.code} · {data.version.label}
        </Text>
        <Text
          style={{ fontSize: TYPE.micro, color: COLORS.inkFaint }}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </View>
      <Text style={{ fontSize: TYPE.micro, color: COLORS.inkFaint, marginTop: 1 }}>
        {data.disclaimer}
      </Text>
    </View>
  );
}

function ContentPage({
  data,
  children,
}: {
  data: TechPackDocumentData;
  children: ReactNode;
}): ReactElement {
  return (
    <Page
      size={PAGE.size}
      style={{
        paddingTop: PAGE.paddingTop,
        paddingBottom: PAGE.paddingBottom,
        paddingHorizontal: PAGE.paddingHorizontal,
        fontFamily: FONTS.regular,
        color: COLORS.ink,
        backgroundColor: COLORS.surface,
      }}
    >
      {children}
      <Footer data={data} />
    </Page>
  );
}

function CoverPage({ data }: { data: TechPackDocumentData }): ReactElement {
  const { brand, style, version } = data;
  return (
    <Page
      size={PAGE.size}
      style={{
        paddingTop: 54,
        paddingBottom: PAGE.paddingBottom,
        paddingHorizontal: PAGE.paddingHorizontal,
        fontFamily: FONTS.regular,
        color: COLORS.ink,
        backgroundColor: COLORS.surface,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View>
          {/* TODO(Phase 2): a real brand logo from `brands`. Until then the
              brand wordmark stands in — an invented logo would be worse. */}
          <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.title, color: brand.primaryColor }}>
            {brand.name}
          </Text>
          <Text style={{ fontSize: TYPE.small, color: COLORS.inkFaint, marginTop: 2 }}>
            {brand.organizationName}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              fontFamily: FONTS.bold,
              fontSize: TYPE.micro,
              letterSpacing: 1.2,
              color: COLORS.inkFaint,
              textTransform: "uppercase",
            }}
          >
            Technical package
          </Text>
          <Text style={{ fontSize: TYPE.small, color: COLORS.ink, marginTop: 2 }}>
            {version.label}
          </Text>
        </View>
      </View>

      <Rule strong />

      <View style={{ marginTop: SPACE.xl }}>
        <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.hero, color: COLORS.ink }}>
          {style.name}
        </Text>
        <Text style={{ fontSize: TYPE.title, color: COLORS.inkSoft, marginTop: SPACE.xs }}>
          {style.code}
        </Text>
      </View>

      <View style={{ alignItems: "center", marginTop: SPACE.lg, marginBottom: SPACE.lg }}>
        <FlatDrawing spec={data.flat.spec} view="front" width={230} fill={data.flat.colorHex} />
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <Field label="Season" value={style.season} />
        <Field label="Collection" value={style.collection} />
        <Field label="Category" value={style.category} />
        <Field label="Supplier" value={style.supplier} />
        <Field label="Status" value={style.status} />
        <Field label="Approval" value={version.approval} />
        <Field label="Prepared by" value={version.preparedBy} />
        <Field label="Issued" value={formatDate(version.createdAt)} />
        <Field label="Target cost" value={`${style.targetCost} ${style.currency}`} />
      </View>

      <Footer data={data} />
    </Page>
  );
}

function ContentsPage({ data }: { data: TechPackDocumentData }): ReactElement {
  return (
    <ContentPage data={data}>
      <SectionHeading index={0} title="Contents" />
      {DOCUMENT_SECTIONS.map((section, index) => (
        <View
          key={section}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 4,
            borderBottomWidth: 0.5,
            borderBottomColor: COLORS.ruleFaint,
          }}
        >
          <Text style={{ fontSize: TYPE.body, color: COLORS.ink }}>
            {String(index + 1).padStart(2, "0")}  {section}
          </Text>
        </View>
      ))}
      <View style={{ marginTop: SPACE.lg }}>
        <Text style={{ fontSize: TYPE.small, color: COLORS.inkSoft, lineHeight: 1.5 }}>
          {data.disclaimer}
        </Text>
      </View>
    </ContentPage>
  );
}

// ------------------------------------------------------------------ document

function formatDate(iso: string): string {
  // Fixed format rather than a locale format: the same document must render
  // identically on a developer's Mac and in a Vercel function set to UTC.
  const date = new Date(iso);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${String(date.getUTCDate()).padStart(2, "0")} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function techPackDocument(data: TechPackDocumentData): ReactElement<DocumentProps> {
  const section = (title: (typeof DOCUMENT_SECTIONS)[number]) =>
    DOCUMENT_SECTIONS.indexOf(title) + 1;

  return (
    <Document
      title={`${data.style.name} — ${data.style.code} — ${data.version.label}`}
      author={data.brand.organizationName}
      subject="Factory technical package"
      creator={PRODUCT_NAME_TM}
      producer={PRODUCT_NAME_TM}
    >
      <CoverPage data={data} />
      <ContentsPage data={data} />

      <ContentPage data={data}>
        <SectionHeading index={section("Style overview")} title="Style overview" />
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Field label="Style name" value={data.style.name} />
          <Field label="Article code" value={data.style.code} />
          <Field label="Category" value={data.style.category} />
          <Field label="Season" value={data.style.season} />
          <Field label="Collection" value={data.style.collection} />
          <Field label="Status" value={data.style.status} />
          <Field label="Supplier" value={data.style.supplier} />
          <Field label="Target cost" value={`${data.style.targetCost} ${data.style.currency}`} />
          <Field label="MOQ" value={data.style.moq} />
          <Field label="Lead time" value={data.style.leadTime} />
        </View>
        <Rule />
        <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.small, marginBottom: 2 }}>
          Description
        </Text>
        <Text style={{ fontSize: TYPE.body, lineHeight: 1.5, marginBottom: SPACE.md }}>
          {data.style.description}
        </Text>
        <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.small, marginBottom: 2 }}>
          Design intent
        </Text>
        <Text style={{ fontSize: TYPE.body, lineHeight: 1.5 }}>{data.style.designIntent}</Text>
      </ContentPage>

      <ContentPage data={data}>
        <SectionHeading index={section("Technical flats")} title="Technical flats" />
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: SPACE.md }}>
          {(["front", "back"] as const).map((view) => (
            <View key={view} style={{ alignItems: "center" }}>
              <FlatDrawing spec={data.flat.spec} view={view} width={215} fill={data.flat.colorHex} />
              <Text
                style={{
                  fontFamily: FONTS.bold,
                  fontSize: TYPE.small,
                  marginTop: SPACE.sm,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  color: COLORS.inkSoft,
                }}
              >
                {view}
              </Text>
            </View>
          ))}
        </View>
        <Rule />
        <Text style={{ fontSize: TYPE.small, color: COLORS.inkSoft, lineHeight: 1.5 }}>
          Flats are schematic and drawn to proportion, not to scale. Finished-garment
          dimensions are specified in the measurement table and take precedence over
          anything read off the drawing.
        </Text>
      </ContentPage>

      <ContentPage data={data}>
        <SectionHeading index={section("Colorways")} title="Colorways" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACE.md }}>
          {data.colorways.map((colorway) => (
            <View key={colorway.name} style={{ width: "47%", marginBottom: SPACE.md }} wrap={false}>
              <View
                style={{
                  height: 54,
                  backgroundColor: colorway.hex,
                  borderWidth: 0.5,
                  borderColor: COLORS.rule,
                  borderRadius: 4,
                  justifyContent: "flex-end",
                  padding: SPACE.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: TYPE.micro,
                    fontFamily: FONTS.bold,
                    color: readableInkOn(colorway.hex),
                  }}
                >
                  {colorway.hex.toUpperCase()}
                </Text>
              </View>
              <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.body, marginTop: SPACE.xs }}>
                {colorway.name}
              </Text>
              <Text style={{ fontSize: TYPE.small, color: COLORS.inkSoft }}>{colorway.code}</Text>
            </View>
          ))}
        </View>
        <Rule />
        <Text style={{ fontSize: TYPE.small, color: COLORS.inkSoft, lineHeight: 1.5 }}>
          Screen and print colour are indicative only. Match to the stated Pantone or an
          approved lab dip; the swatch above is not a colour standard.
        </Text>
      </ContentPage>

      <ContentPage data={data}>
        <SectionHeading index={section("Artwork and placement")} title="Artwork and placement" />
        <Table
          columns={["Artwork", "Placement", "Technique", "Dimensions", "Colours"]}
          widths={[2, 1.4, 1.4, 1.2, 1.2]}
          rows={data.artwork.map((a) => [a.name, a.placement, a.technique, a.dimensions, a.colors])}
        />
      </ContentPage>

      <ContentPage data={data}>
        <SectionHeading index={section("Bill of materials")} title="Bill of materials" />
        <Table columns={BOM_COLUMNS} widths={[1, 2.4, 2, 1.5, 1.3]} rows={data.bom} />
      </ContentPage>

      <ContentPage data={data}>
        <SectionHeading
          index={section("Measurement specification")}
          title="Measurement specification"
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Field label="Unit" value={data.measurements.unit} />
          <Field label="Base size" value={data.measurements.baseSize} />
          <Field label="Tolerance" value={data.measurements.tolerance} />
        </View>
        <Table
          columns={["POM", "Description", ...data.measurements.sizes]}
          widths={[0.7, 3.4, ...data.measurements.sizes.map(() => 0.7)]}
          rows={data.measurements.rows}
        />
      </ContentPage>

      <ContentPage data={data}>
        <SectionHeading index={section("Construction")} title="Construction" />
        <NumberedList items={data.construction} />
        <Rule />
        <SectionHeading
          index={section("Packaging and labelling")}
          title="Packaging and labelling"
        />
        <NumberedList items={data.packaging} />
      </ContentPage>

      <ContentPage data={data}>
        <SectionHeading index={section("Sampling and approval")} title="Sampling and approval" />
        <Table
          columns={["Round", "Requested", "Received", "Decision"]}
          widths={[2, 1.2, 1.2, 1.4]}
          rows={data.sampling.map((r) => [r.round, r.requested, r.received, r.decision])}
        />
        <Rule />
        <View style={{ marginTop: SPACE.md, flexDirection: "row", gap: SPACE.lg }}>
          {["Factory acknowledgement", "Brand approval"].map((label) => (
            <View key={label} style={{ flex: 1 }}>
              <View style={{ height: 34, borderBottomWidth: 0.5, borderBottomColor: COLORS.ink }} />
              <Text style={{ fontSize: TYPE.micro, color: COLORS.inkFaint, marginTop: SPACE.xs }}>
                {label} — name, signature, date
              </Text>
            </View>
          ))}
        </View>
      </ContentPage>
    </Document>
  );
}
