import { error } from '@sveltejs/kit';
import { game, subSundayMoment, vote } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { and } from 'drizzle-orm';
import { gte } from 'drizzle-orm';
import { ne } from 'drizzle-orm';

export const load = async ({ params }) => {
	const gameOnDb = await db.query.game.findFirst({
		where: eq(game.id, Number(params.slug)),
		with: {
			moments: {
				where: and(
					gte(subSundayMoment.durationMilliseconds, 10000),
					ne(subSundayMoment.description, 'Just Chatting')
				),
				with: {
					stream: {
						columns: {
							publishedAt: true
						}
					}
				}
			}
		}
	});
	const voteCount = await db.$count(vote, eq(vote.forId, Number(params.slug)));

	// const gameOnDb2 = await db.query.game.findFirst({
	// 	where: eq(game.id, parseInt(params.slug))
	// })
	// const votes = await db
	// .select()
	// .from(vote)
	// .where(eq(vote.forId, parseInt(params.slug))) // or eq(vote.gameName, gameOnDb.name)
	// .orderBy(desc(vote.createdAt))
	// .limit(6);

	if (gameOnDb) {
		return {
			gameData: { ...gameOnDb, id: params.slug, voteCount }
		};
	}
	error(404, 'Not found');
};
