CREATE TABLE `product_records` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
