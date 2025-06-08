import { error } from '@sveltejs/kit';
import { game, user } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const load = async ({ params }) => {
	const userDb = await db.query.user.findFirst({
		where: eq(user?.id, parseInt(params.slug)),
		with: {
			votes: {
				with: {
					game: {
						name: true
					}
				}
			}
		}
	});
	// const userOnDb = await db
	// 	.select()
	// 	.from(user)
	// 	.where(eq(user.id, parseInt(params.slug)))
	// 	.limit(1);
	// const gameOnDb2 = await db.query.game.findFirst({
	// 	where: eq(game.id, parseInt(params.slug))
	// })
	// const votes = await db
	// .select()
	// .from(vote)
	// .where(eq(vote.forId, parseInt(params.slug))) // or eq(vote.gameName, gameOnDb.name)
	// .orderBy(desc(vote.createdAt))
	// .limit(6);

	if (userDb) {
		return { user: userDb };
	}

	error(404, 'Not found');
};
