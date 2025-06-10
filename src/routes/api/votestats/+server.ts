import { db } from '$lib/server/db';
import { vote } from '$lib/server/db/schema';
import { getDateRange, getNowTZ } from '$lib/utils';
import { json } from '@sveltejs/kit';
import { endOfDay, startOfDay } from 'date-fns';
import { and, between, eq } from 'drizzle-orm';

export async function GET({ url }: { url: URL }) {
	const game = parseInt(url.searchParams.get('game') as string) || 0;
	const range = getDateRange();
	let votes;

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
	return json({ votesThisPeriod: votes[0].voteCount, votesToday: votesToday[0].voteCount });
}
