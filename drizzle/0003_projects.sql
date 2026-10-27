CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title_fr" text NOT NULL,
	"city" text,
	"date" text DEFAULT '' NOT NULL,
	"client" text,
	"description_fr" text,
	"note_fr" text,
	"kwc" double precision,
	"panels_count" integer,
	"panels_watts" integer,
	"storage_kwh" double precision,
	"storage_kind" text,
	"inverter_kva" double precision,
	"capacity_l" double precision,
	"coverage_pct" double precision,
	"autonomy_hours" double precision,
	"annual_kwh" double precision,
	"roi_years" double precision,
	"warranty_years" integer,
	"co2" double precision,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
-- Même protection que les autres tables (voir 0001) : pas d'accès par l'API REST publique de Supabase.
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE public.projects FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE public.projects FROM authenticated;
  END IF;
END $$;
