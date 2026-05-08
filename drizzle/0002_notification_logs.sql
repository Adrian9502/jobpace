CREATE TABLE "notification_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"applicationId" text,
	"notificationType" text NOT NULL,
	"sentAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
