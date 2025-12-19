import { relations } from 'drizzle-orm/relations';
import { user, vote, game, subSundayStream, subSundayMoment } from './schema';

export const streamMomentRelations = relations(subSundayStream, ({ many }) => ({
	moments: many(subSundayMoment)
}));

export const gameMomentRelations = relations(subSundayMoment, ({ one }) => ({
	game: one(game, {
		fields: [subSundayMoment.gameId],
		references: [game.id]
	}),
	stream: one(subSundayStream, {
		fields: [subSundayMoment.streamId],
		references: [subSundayStream.streamId]
	})
}));

export const voteRelations = relations(vote, ({ one }) => ({
	user: one(user, {
		fields: [vote.fromId],
		references: [user.id]
	}),
	game: one(game, {
		fields: [vote.forId],
		references: [game.id]
	})
}));

export const userRelations = relations(user, ({ many }) => ({
	votes: many(vote)
}));

export const gameRelations = relations(game, ({ many }) => ({
	votes: many(vote),
	moments: many(subSundayMoment)
}));
