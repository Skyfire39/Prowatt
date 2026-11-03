ALTER TABLE "quote_requests" ADD COLUMN "mail_sales" text;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD COLUMN "mail_customer" text;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD COLUMN "mail_error" text;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD COLUMN "mailed_at" timestamp with time zone;