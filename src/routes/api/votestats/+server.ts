import { db } from '$lib/server/db';
import { vote } from '$lib/server/db/schema';
import { getDateRange, getNowTZ } from '$lib/utils';
import { json } from '@sveltejs/kit';
import { endOfDay, startOfDay } from 'date-fns';
import { and, between, count, eq } from 'drizzle-orm';

export async function GET({ url }: { url: URL }) {
	const game = parseInt(url.searchParams.get('game') as string) || 0;

	const periodStart = url.searchParams.get('period');

	const range = getDateRange({ offset: periodStart ? new Date(periodStart) : getNowTZ() });
	let votes;
	let totalVotes;
	if (game > 0) {
		votes = await db
			.select({
				voteCount: db.$count(
					vote,
					and(
						between(vote.createdAt, range.currentPeriod.startDate, range.currentPeriod.endDate),
						eq(vote.forId, game)
					)
				)
			})
			.from(vote)
			.limit(1);
	} else {
		votes = await db
			.select({
				voteCount: db.$count(
					vote,
					between(vote.createdAt, range.currentPeriod.startDate, range.currentPeriod.endDate)
				)
			})
			.from(vote)
			.limit(1);
		totalVotes = await db.select({ count: count() }).from(vote);
	}

	const today = getNowTZ();
	let votesToday;
	if (game > 0) {
		votesToday = await db
			.select({
				voteCount: db.$count(vote, between(vote.createdAt, startOfDay(today), endOfDay(today)))
			})
			.from(vote)
			.limit(1);
	} else {
		votesToday = await db
			.select({
				voteCount: db.$count(
					vote,
					and(between(vote.createdAt, startOfDay(today), endOfDay(today)), eq(vote.forId, game))
				)
			})
			.from(vote)
			.limit(1);
	}
	return json({
		votesThisPeriod: votes[0] ? votes[0].voteCount : 0,
		votesToday: votesToday[0] ? votesToday[0].voteCount : 0,
		totalVotes: totalVotes ? totalVotes[0].count : 0
	});
}
