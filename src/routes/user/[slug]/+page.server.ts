import { error } from '@sveltejs/kit';
import { user, vote } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq, sql } from 'drizzle-orm';

export const load = async ({ params }) => {
	const userDb = await db.query.user.findFirst({
		where: eq(user?.id, parseInt(params.slug)),
		with: {
			votes: {
				columns: {
					voteText: true,
					createdAt: true,
					id: true
				},
				with: {
					game: {
						columns: {
							name: true,
							id: true
						}
					}
				}
			}
		}
	});

	// todo this is slow and we should index on db to make this faster
	// CREATE INDEX idx_user_streak ON "user"(streak DESC);
	const targetUser = await db.query.user.findFirst({
		where: eq(user.id, parseInt(params.slug))
	});

	const higherCountStreak = await db
		.select({ count: sql<number>`count(*)` })
		.from(user)
		.where(sql`${user.streak} > ${targetUser?.streak}`)
		.then((r) => r[0].count);

	const streakRank = higherCountStreak ?? 0;

	const higherCountResult = await db
		.select({
			count: sql<number>`count(*)`
		})
		.from(user)
		.leftJoin(vote, eq(vote.fromId, user.id))
		.groupBy(user.id)
		.having(sql`count(${vote.id}) > ${userDb?.votes.length}`)
		.then((r) => r.length);

	const voteRank = higherCountResult ?? 0;
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
		return {
			user: { ...userDb, streakRank: streakRank, voteRank: voteRank },
			meta: [
				{ name: 'title', content: `${userDb.name}` },
				{
					name: 'description',
					content:
						"A website to track lirik's sub sunday votes. With game info, direct link to steam and more."
				}
			]
		};
	}

	error(404, 'Not found');
};
