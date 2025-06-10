import {
	pgTable,
	integer,
	text,
	boolean,
	timestamp,
	foreignKey,
	serial,
	jsonb,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const user = pgTable('User', {
	id: integer().primaryKey().notNull(),
	name: text().notNull(),
	sub: boolean().default(false).notNull(),
	createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
	updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
	streak: integer().default(0).notNull()
});

export const game = pgTable(
	'Game',
	{
		name: text().notNull(),
		id: serial().primaryKey().notNull(),
		picture: text().default('').notNull(),
		link: text().default('').notNull(),
		createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
		updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
		categories: jsonb().default({}).notNull(),
		description: text().default('').notNull(),
		dev: text().array().default(["RAY[''::tex"]),
		price: jsonb().default({ final: 'n/a' }).notNull(),
		steamId: integer().default(0).notNull(),
		website: text().default('').notNull(),
		detailedDescription: jsonb().default({}).notNull(),
		movies: jsonb().default({}).notNull(),
		recommendations: integer().default(0).notNull(),
		screenshots: jsonb().default({}).notNull()
	},
	(table) => [
		index('name_search_index').using('gin', sql`plainto_tsquery('english', ${table.name})`)
	]
);

export const vote = pgTable(
	'Vote',
	{
		id: serial().primaryKey().notNull(),
		fromId: integer().notNull(),
		forId: integer().notNull(),
		voteText: text().notNull(),
		createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
		updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull()
	},
	(table) => [
		foreignKey({
			columns: [table.fromId],
			foreignColumns: [user.id],
			name: 'Vote_fromId_fkey'
		})
			.onUpdate('cascade')
			.onDelete('restrict'),
		foreignKey({
			columns: [table.forId],
			foreignColumns: [game.id],
			name: 'Vote_forId_fkey'
		})
			.onUpdate('cascade')
			.onDelete('restrict')
	]
);

export const schema = {
	user,
	vote,
	game
};
