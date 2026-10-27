CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"status" text DEFAULT 'subscribed' NOT NULL,
	"source" text DEFAULT 'site' NOT NULL,
	"mailchimp_status" text,
	"mailchimp_synced_at" timestamp with time zone,
	"mailchimp_error" text,
	"consent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "subscribers_email_uq" ON "subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "subscribers_status_idx" ON "subscribers" USING btree ("status");--> statement-breakpoint
-- Même protection que les autres tables (voir 0001) : pas d'accès par l'API REST publique de Supabase.
ALTER TABLE "subscribers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE public.subscribers FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE public.subscribers FROM authenticated;
  END IF;
END $$;
