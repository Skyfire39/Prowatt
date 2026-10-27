CREATE TABLE "product_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name_fr" text NOT NULL,
	"name_en" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Même protection que les autres tables (voir 0001) : pas d'accès par l'API REST publique de Supabase.
ALTER TABLE "product_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE public.product_categories FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE public.product_categories FROM authenticated;
  END IF;
END $$;
