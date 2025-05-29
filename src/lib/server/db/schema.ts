import {
	pgTable,
	integer,
	text,
	boolean,
	timestamp,
	foreignKey,
	serial,
	jsonb
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const user = pgTable('User', {
	id: integer().notNull(),
	name: text().notNull(),
	sub: boolean().default(false).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	streak: integer().default(0).notNull()
});

export const vote = pgTable(
	'Vote',
	{
		id: serial().primaryKey().notNull(),
		fromId: integer().notNull(),
		gameName: text().notNull(),
		createdAt: timestamp({ precision: 3, mode: 'string' })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull()
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
			columns: [table.gameName],
			foreignColumns: [game.name],
			name: 'Vote_gameName_fkey'
		})
			.onUpdate('cascade')
			.onDelete('restrict')
	]
);

export const game = pgTable('Game', {
	name: text().notNull(),
	id: serial().primaryKey().notNull(),
	picture: text().default('').notNull(),
	link: text().default('').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
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
});
