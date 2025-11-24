import { vote } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { and, count, eq, gte, lte, sql } from 'drizzle-orm';
import { addDays, isSameDay, subDays } from 'date-fns';

export const load = async () => {
	const game = 0;
	const now = new Date();
	const votesLast7Days = await getVotesBetween(subDays(now, 7), 7, game);
	const voteLastWeek = await getVotesBetween(subDays(now, 14), 7, game);
	console.log(votesLast7Days, voteLastWeek);

	return {
		thisWeekVsLastWeek: votesLast7Days.map((e, i) => {
			return {
				date: new Date(e.date),
				votesLast7Days: parseInt(e.count as unknown as string),
				votesLastWeek: parseInt(voteLastWeek[i].count as unknown as string)
			};
		})
	};
};

const getVotesBetween = async (from: Date, daysBack: number, game: number) => {
	let result;
	if (game > 0) {
		result = await db
			.select({ count: count(), date: sql`DATE(${vote.createdAt})`.as('createdAt') })
			.from(vote)
			.where(
				and(
					eq(vote.forId, game),
					gte(vote.createdAt, from),
					lte(vote.createdAt, addDays(from, daysBack))
				)
			)
			.groupBy(sql`DATE(${vote.createdAt})`)
			.orderBy(sql`DATE(${vote.createdAt})`);
	} else {
		result = await db
			.select({ count: count(), date: sql`DATE(${vote.createdAt})`.as('createdAt') })
			.from(vote)
			.where(and(gte(vote.createdAt, from), lte(vote.createdAt, addDays(from, daysBack))))
			.groupBy(sql`DATE(${vote.createdAt})`)
			.orderBy(sql`DATE(${vote.createdAt})`);
	}

	const votes = Array(daysBack).fill(0);

	const mappedVotes = votes.map((e, i) => {
		const day = addDays(from, i);
		const votes = result.filter((a) => {
			return isSameDay(new Date(day), new Date(a.date as string));
		});
		return {
			count: votes.reduce((acc, e) => acc + e.count, 0) || 0,
			date: day.toISOString()
		};
	});

	return mappedVotes;
};
