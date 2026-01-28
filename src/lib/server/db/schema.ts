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

export const subSundayStream = pgTable('SubSundayStream', {
	id: serial().primaryKey(),
	streamId: text().notNull(),
	title: text().notNull(),
	duration: integer().notNull(),
	publishedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
	createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
	updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull()
});

export const subSundayMoment = pgTable('SubSundayMoment', {
	id: serial().primaryKey(),
	streamId: text().notNull(),
	description: text().notNull().default(''),
	durationMilliseconds: integer().notNull(),
	positionMilliseconds: integer().notNull(),
	gameId: integer().notNull(),
	createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
	updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull()
});

export const user = pgTable('User', {
	id: serial().primaryKey(),
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
		id: serial().primaryKey(),
		picture: text().default('').notNull(),
		link: text().default('').notNull(),
		createdAt: timestamp({ precision: 6 }).notNull(),
		updatedAt: timestamp({ precision: 6 }).notNull(),
		categories: jsonb().default({}).notNull(),
		description: text().default('').notNull(),
		dev: text().array().default(["RAY[''::tex"]),
		price: jsonb().default({ final: 'n/a' }).notNull(),
		steamId: integer().default(0).notNull(),
		website: text().default('').notNull(),
		detailedDescription: jsonb().default({}).notNull(),
		movies: jsonb().default({}).notNull(),
		recommendations: integer().default(0).notNull(),
		screenshots: jsonb().default({}).notNull(),
		igdbId: integer().default(0)
	},
	() => {
		const string = `to_tsvector('english', 'Game.name')`;
		return [
			index('name_search_index').using('gin', sql.raw(string))
			// index('name_search_index').using('gin', sql`plainto_tsquery('english', ${table.name})`)
		];
	}
);

export const vote = pgTable(
	'Vote',
	{
		id: serial().primaryKey(),
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
	game,
	subSundayStream,
	subSundayMoment
};
