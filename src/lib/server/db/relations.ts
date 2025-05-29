import { relations } from "drizzle-orm/relations";
import { user, vote, game } from "./schema";

export const voteRelations = relations(vote, ({one}) => ({
	user: one(user, {
		fields: [vote.fromId],
		references: [user.id]
	}),
	game: one(game, {
		fields: [vote.gameName],
		references: [game.name]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	votes: many(vote),
}));

export const gameRelations = relations(game, ({many}) => ({
	votes: many(vote),
}));