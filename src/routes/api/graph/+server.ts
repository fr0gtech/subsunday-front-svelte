import { vote } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { and, count, eq, gte, lte, sql } from 'drizzle-orm';
import { TZDate } from '@date-fns/tz';
import { addDays, isSameDay, subDays } from 'date-fns';
import { json } from '@sveltejs/kit';
import { getDateRange } from '@/utils';

export async function GET({ url }: { url: URL }) {
	const game = parseInt(url.searchParams.get('game') as string) || 0;

	const range = getDateRange();

	const votesLast7Days = await getVotesBetween(range.currentPeriod.startDate, 7, game);
	const voteLastWeek = await getVotesBetween(subDays(range.currentPeriod.startDate, 7), 7, game);

	return json({
		votes: votesLast7Days.map((e, i) => {
			return {
				date: new Date(e.date),
				votesLast7Days: parseInt(e.count as unknown as string),
				votesLastWeek: parseInt(voteLastWeek[i].count as unknown as string)
			};
		})
	});
}

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
