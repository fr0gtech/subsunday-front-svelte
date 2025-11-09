import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user, vote, game } from '$lib/server/db/schema';
import { desc, sql } from 'drizzle-orm';

export async function GET() {
	// Top 10 voters with vote count and vote details
	const top10voters = await db
		.select({
			name: user.name,
			id: user.id,
			voteCount: sql<number>`count(${vote.id})`.as('voteCount')
		})
		.from(user)
		.leftJoin(vote, sql`${vote.fromId} = ${user.id}`)
		.groupBy(user.id)
		.orderBy(desc(sql`count(${vote.id})`))
		.limit(10);

	// Get detailed votes for each top voter
	const top10votersWithVotes = await Promise.all(
		top10voters.map(async (voter) => {
			const votes = await db
				.select({
					createdAt: vote.createdAt,
					for: vote.forId,
					from: vote.fromId
				})
				.from(vote)
				.where(sql`${vote.fromId} = ${voter.id}`);

			return {
				...voter,
				_count: {
					votes: voter.voteCount
				},
				votes
			};
		})
	);

	// Top 10 games by vote count
	const top10games = await db
		.select({
			name: game.name,
			id: game.id,
			voteCount: sql<number>`count(${vote.id})`.as('voteCount'),
			picture: game.picture
		})
		.from(game)
		.leftJoin(vote, sql`${vote.forId} = ${game.id}`)
		.groupBy(game.id)
		.orderBy(desc(sql`count(${vote.id})`))
		.limit(11);

	const top10gamesFormatted = top10games.map((g) => ({
		name: g.name,
		id: g.id,
		picture: g.picture,
		_count: {
			votes: g.voteCount
		}
	}));

	// Top 10 users by streak
	const top10streak = await db.select().from(user).orderBy(desc(user.streak)).limit(10);

	return json({
		topUsers: top10votersWithVotes,
		topGames: top10gamesFormatted,
		topStreak: top10streak
	});
}
