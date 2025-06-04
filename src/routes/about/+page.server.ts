import { error } from '@sveltejs/kit';
import { vote } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { gte, sql } from 'drizzle-orm';

export const load = async () => {
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	const voteCounts = await db
		.select({
			voteDate: sql<string>`DATE(${vote.createdAt})`.as('vote_date'),
			voteCount: sql<number>`COUNT(*)`.as('vote_count')
		})
		.from(vote)
		.where(gte(new Date(vote.createdAt).getTime(), sevenDaysAgo.getTime()))
		.groupBy(sql`DATE(${vote.createdAt})`)
		.orderBy(sql`DATE(${vote.createdAt}) ASC`);
	// const gameOnDb2 = await db.query.game.findFirst({
	// 	where: eq(game.id, parseInt(params.slug))
	// })
	// const votes = await db
	// .select()
	// .from(vote)
	// .where(eq(vote.forId, parseInt(params.slug))) // or eq(vote.gameName, gameOnDb.name)
	// .orderBy(desc(vote.createdAt))
	// .limit(6);

	if (voteCounts) {
		return {
			votes: voteCounts.map((e) => {
				return { date: new Date(e.voteDate).toISOString(), value: parseInt(e.voteCount as string) };
			})
		};
	}

	error(404, 'Not found');
};
