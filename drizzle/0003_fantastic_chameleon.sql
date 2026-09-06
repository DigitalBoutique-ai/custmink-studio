CREATE TYPE "public"."bom_row_type" AS ENUM('fabric', 'lining', 'rib', 'trim', 'thread', 'label', 'packaging', 'misc');--> statement-breakpoint
CREATE TABLE "bom_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"material_id" uuid,
	"row_type" "bom_row_type" DEFAULT 'fabric' NOT NULL,
	"name" text NOT NULL,
	"composition" text,
	"placement" text,
	"color_name" text,
	"supplier_name" text,
	"quantity" text,
	"unit" text DEFAULT 'm' NOT NULL,
	"cost_minor" integer,
	"currency" text DEFAULT 'USD' NOT NULL,
	"lead_time_days" integer,
	"moq" integer,
	"certification" text,
	"notes" text,
	"position" integer DEFAULT 0 NOT NULL,
	"source" "row_source" DEFAULT 'manual' NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"brand_id" uuid NOT NULL,
	"row_type" "bom_row_type" DEFAULT 'fabric' NOT NULL,
	"name" text NOT NULL,
	"composition" text,
	"supplier_name" text,
	"weight_gsm" integer,
	"width_cm" integer,
	"default_unit" text DEFAULT 'm' NOT NULL,
	"cost_minor" integer,
	"currency" text DEFAULT 'USD' NOT NULL,
	"lead_time_days" integer,
	"moq" integer,
	"certification" text,
	"notes" text,
	"source" "row_source" DEFAULT 'manual' NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bom_items_org_idx" ON "bom_items" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "bom_items_product_position_idx" ON "bom_items" USING btree ("product_id","position");--> statement-breakpoint
CREATE INDEX "materials_org_idx" ON "materials" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "materials_brand_type_idx" ON "materials" USING btree ("brand_id","row_type");