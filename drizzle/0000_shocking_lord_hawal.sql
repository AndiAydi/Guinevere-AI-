CREATE TYPE "public"."conversation_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."personalityIntensity" AS ENUM('subtle', 'normal', 'intense');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('id', 'en', 'ja');--> statement-breakpoint
CREATE TYPE "public"."mode" AS ENUM('normal', 'deep', 'close', 'casual');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."theme" AS ENUM('light', 'dark', 'auto');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conversations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"role" "conversation_role" NOT NULL,
	"content" text NOT NULL,
	"mode" "mode" DEFAULT 'normal' NOT NULL,
	"emotionalState" varchar(50) DEFAULT 'neutral',
	"containsButterflyMention" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userPreferences" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "userPreferences_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"theme" "theme" DEFAULT 'light' NOT NULL,
	"language" "language" DEFAULT 'id' NOT NULL,
	"personalityIntensity" "personalityIntensity" DEFAULT 'normal' NOT NULL,
	"autoSaveConversations" integer DEFAULT 1 NOT NULL,
	"notificationsEnabled" integer DEFAULT 1 NOT NULL,
	"responseStreamingEnabled" integer DEFAULT 1 NOT NULL,
	"deepLearningEnabled" integer DEFAULT 1 NOT NULL,
	"eleganceDisabled" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userPreferences_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "userRelationships" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "userRelationships_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"relationshipLevel" integer DEFAULT 0 NOT NULL,
	"currentMode" "mode" DEFAULT 'normal' NOT NULL,
	"totalInteractions" integer DEFAULT 0 NOT NULL,
	"lastInteractionAt" timestamp,
	"hasBeenHurt" integer DEFAULT 0,
	"happinessLevel" integer DEFAULT 50 NOT NULL,
	"lastButterflyMentionAt" timestamp,
	"personalityNotes" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userRelationships_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userPreferences" ADD CONSTRAINT "userPreferences_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userRelationships" ADD CONSTRAINT "userRelationships_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;