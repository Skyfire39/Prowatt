ALTER TABLE "ecooters" ADD COLUMN "options" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "options" jsonb DEFAULT '[]'::jsonb NOT NULL;