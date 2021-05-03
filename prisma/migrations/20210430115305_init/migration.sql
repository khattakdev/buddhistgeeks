-- CreateEnum
CREATE TYPE "course_status" AS ENUM ('draft', 'live', 'archived');

-- CreateEnum
CREATE TYPE "discount_types" AS ENUM ('percentage', 'absolute');

-- CreateEnum
CREATE TYPE "template_types" AS ENUM ('prepopulated', 'triggered');

-- CreateEnum
CREATE TYPE "course_types" AS ENUM ('course', 'club');

-- CreateTable
CREATE TABLE "activation_keys" (
    "key_hash" TEXT NOT NULL,
    "created_time" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "newsletter" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("key_hash")
);

-- CreateTable
CREATE TABLE "admins" (
    "person" TEXT NOT NULL,

    PRIMARY KEY ("person")
);

-- CreateTable
CREATE TABLE "course_cohorts" (
    "start_date" TEXT NOT NULL,
    "facilitator" TEXT NOT NULL,
    "completed" TEXT,
    "live" BOOLEAN NOT NULL DEFAULT false,
    "course" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "cohort_group" INTEGER NOT NULL,
    "paid_out" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_discounts" (
    "name" TEXT NOT NULL,
    "type" "discount_types" NOT NULL,
    "course" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "max_redeems" INTEGER NOT NULL DEFAULT 0,
    "redeems" INTEGER NOT NULL DEFAULT 0,
    "amount" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("course","code")
);

-- CreateTable
CREATE TABLE "course_invites" (
    "email" TEXT NOT NULL,
    "course" INTEGER NOT NULL,

    PRIMARY KEY ("course","email")
);

-- CreateTable
CREATE TABLE "course_maintainers" (
    "maintainer" TEXT NOT NULL,
    "course" INTEGER NOT NULL,

    PRIMARY KEY ("course","maintainer")
);

-- CreateTable
CREATE TABLE "courses" (
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "prerequisites" TEXT NOT NULL,
    "invite_only" BOOLEAN NOT NULL DEFAULT false,
    "status" "course_status" NOT NULL DEFAULT E'draft',
    "slug" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "cohort_max_size" INTEGER NOT NULL DEFAULT 0,
    "card_image" TEXT NOT NULL DEFAULT E'/img/new_course.png',
    "type" "course_types" NOT NULL DEFAULT E'course',
    "course_group" INTEGER NOT NULL,
    "maintainer_group" INTEGER NOT NULL,
    "small_image" TEXT NOT NULL DEFAULT E'https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/course-illustrations/new-course-small.png',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_templates" (
    "content" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "template_types" NOT NULL DEFAULT E'prepopulated',
    "title" TEXT NOT NULL,
    "required" BOOLEAN DEFAULT false,
    "course" INTEGER NOT NULL,

    PRIMARY KEY ("name","course")
);

-- CreateTable
CREATE TABLE "password_reset_keys" (
    "key_hash" TEXT NOT NULL,
    "created_time" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    PRIMARY KEY ("key_hash")
);

-- CreateTable
CREATE TABLE "people" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT NOT NULL DEFAULT E'',
    "password_hash" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT E'',
    "link" TEXT NOT NULL DEFAULT E'',
    "calendar_id" TEXT NOT NULL,
    "pronouns" TEXT NOT NULL DEFAULT E'',
    "stripe_customer_id" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people_in_cohorts" (
    "person" TEXT NOT NULL,
    "cohort" INTEGER NOT NULL,
    "discount_used" TEXT,
    "amount_paid" INTEGER NOT NULL,
    "payment_intent" TEXT,

    PRIMARY KEY ("person","cohort")
);

-- CreateTable
CREATE TABLE "cohort_events" (
    "cohort" INTEGER NOT NULL,
    "event" INTEGER NOT NULL,
    "everyone" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("cohort","event")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_by" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "discourse_groups" (
    "name" TEXT NOT NULL,
    "id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watching_courses" (
    "email" TEXT NOT NULL,
    "course" INTEGER NOT NULL,

    PRIMARY KEY ("email","course")
);

-- CreateTable
CREATE TABLE "people_watching_courses" (
    "person" TEXT NOT NULL,
    "course" INTEGER NOT NULL,

    PRIMARY KEY ("course","person")
);

-- CreateTable
CREATE TABLE "stripe_connected_accounts" (
    "person" TEXT NOT NULL,
    "stripe_account" TEXT NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "payouts_enabled" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT NOT NULL,

    PRIMARY KEY ("stripe_account")
);

-- CreateTable
CREATE TABLE "people_in_events" (
    "person" TEXT NOT NULL,
    "event" INTEGER NOT NULL,

    PRIMARY KEY ("person","event")
);

-- CreateTable
CREATE TABLE "standalone_events" (
    "event" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "max_attendees" INTEGER,

    PRIMARY KEY ("event")
);

-- CreateTable
CREATE TABLE "standalone_events_in_courses" (
    "course" INTEGER NOT NULL,
    "standalone_event" INTEGER NOT NULL,

    PRIMARY KEY ("course","standalone_event")
);

-- CreateTable
CREATE TABLE "no_account_rsvps" (
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "event" INTEGER NOT NULL,

    PRIMARY KEY ("email","event")
);

-- CreateTable
CREATE TABLE "cohort_refunds" (
    "refund" TEXT NOT NULL,
    "person" TEXT,
    "cohort" INTEGER,

    PRIMARY KEY ("refund")
);

-- CreateTable
CREATE TABLE "refunds" (
    "payment_intent" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    PRIMARY KEY ("payment_intent")
);

-- CreateTable
CREATE TABLE "cohort_facilitators" (
    "cohort" INTEGER NOT NULL,
    "facilitator" TEXT NOT NULL,

    PRIMARY KEY ("cohort","facilitator")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_cohorts.category_id_unique" ON "course_cohorts"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_discounts.code_unique" ON "course_discounts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "courses.slug_unique" ON "courses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "people.email_unique" ON "people"("email");

-- CreateIndex
CREATE UNIQUE INDEX "people.password_hash_unique" ON "people"("password_hash");

-- CreateIndex
CREATE UNIQUE INDEX "people.username_unique" ON "people"("username");

-- CreateIndex
CREATE UNIQUE INDEX "people.calendar_id_unique" ON "people"("calendar_id");

-- CreateIndex
CREATE UNIQUE INDEX "events.id_unique" ON "events"("id");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_connected_accounts.person_unique" ON "stripe_connected_accounts"("person");

-- AddForeignKey
ALTER TABLE "admins" ADD FOREIGN KEY ("person") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_cohorts" ADD FOREIGN KEY ("cohort_group") REFERENCES "discourse_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_cohorts" ADD FOREIGN KEY ("course") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_cohorts" ADD FOREIGN KEY ("facilitator") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_discounts" ADD FOREIGN KEY ("course") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_invites" ADD FOREIGN KEY ("course") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_maintainers" ADD FOREIGN KEY ("course") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_maintainers" ADD FOREIGN KEY ("maintainer") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD FOREIGN KEY ("course_group") REFERENCES "discourse_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD FOREIGN KEY ("maintainer_group") REFERENCES "discourse_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_templates" ADD FOREIGN KEY ("course") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people_in_cohorts" ADD FOREIGN KEY ("cohort") REFERENCES "course_cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people_in_cohorts" ADD FOREIGN KEY ("discount_used") REFERENCES "course_discounts"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people_in_cohorts" ADD FOREIGN KEY ("person") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_events" ADD FOREIGN KEY ("cohort") REFERENCES "course_cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_events" ADD FOREIGN KEY ("event") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD FOREIGN KEY ("created_by") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watching_courses" ADD FOREIGN KEY ("course") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people_watching_courses" ADD FOREIGN KEY ("course") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people_watching_courses" ADD FOREIGN KEY ("person") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stripe_connected_accounts" ADD FOREIGN KEY ("person") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people_in_events" ADD FOREIGN KEY ("event") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people_in_events" ADD FOREIGN KEY ("person") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standalone_events" ADD FOREIGN KEY ("event") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standalone_events_in_courses" ADD FOREIGN KEY ("course") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standalone_events_in_courses" ADD FOREIGN KEY ("standalone_event") REFERENCES "standalone_events"("event") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "no_account_rsvps" ADD FOREIGN KEY ("event") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_refunds" ADD FOREIGN KEY ("cohort") REFERENCES "course_cohorts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_refunds" ADD FOREIGN KEY ("person") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_refunds" ADD FOREIGN KEY ("refund") REFERENCES "refunds"("payment_intent") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_facilitators" ADD FOREIGN KEY ("cohort") REFERENCES "course_cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_facilitators" ADD FOREIGN KEY ("facilitator") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;
