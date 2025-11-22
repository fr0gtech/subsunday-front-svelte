import { vote } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { and, count, eq, gte, lte, sql } from 'drizzle-orm';
import { addDays, isSameDay, subDays } from 'date-fns';
import { getDateRange } from '@/utils';

// TODO: pert all to an api and maybe cache it so it does not take that long to get all of the data
// const getAll = async (offset: Date, acc?: unknown[]) => {
// 	const range = getDateRange({ offset });
// 	const data = await db
// 		.select({ count: count(), date: sql`DATE(${vote.createdAt})`.as('createdAt') })
// 		.from(vote)
// 		.where(
// 			and(
// 				gte(vote.createdAt, range.currentPeriod.startDate),
// 				lte(vote.createdAt, range.currentPeriod.endDate)
// 			)
// 		)
// 		.groupBy(sql`DATE(${vote.createdAt})`)
// 		.orderBy(sql`DATE(${vote.createdAt})`);

// 	if (data.length > 0) {
// 		const countForPeriod = data.reduce((acc, e) => acc + e.count, 0);
// 		const toReturn = {
// 			date: range.currentPeriod.startDate,
// 			count: countForPeriod
// 		};
// 		return await getAll(range.lastPeriod.startDate, acc ? [...acc, toReturn] : [toReturn]);
// 	} else {
// 		return acc;
// 	}
// };

export const load = async () => {
	const game = 0;
	const range = getDateRange();
	const votesLast7Days = await getVotesBetween(range.currentPeriod.startDate, 7, game);
	const voteLastWeek = await getVotesBetween(subDays(range.currentPeriod.startDate, 14), 7, game);
	// create a graph of all subsundays to see trend
	// we loop from today back each range and count
	// const all = await getAll(new Date());

	return {
		// historical: all?.sort((a, b) => a.date.getTime() - b.date.getTime()),
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
