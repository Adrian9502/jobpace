CREATE TABLE "notification_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"applicationId" text,
	"notificationType" text NOT NULL,
	"sentAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notifyInterview" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notifyFollowUp" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notifyStale" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;