import { db } from '$lib/server/db';
import { vote } from '$lib/server/db/schema';
import { getDateRange, getNowTZ } from '$lib/utils';
import { json } from '@sveltejs/kit';
import { endOfDay, startOfDay } from 'date-fns';
import { between } from 'drizzle-orm';

export async function GET() {
	const range = getDateRange();

	const votes = await db
		.select({
			voteCount: db.$count(
				vote,
				between(
					vote.createdAt,
					range.currentPeriod.startDate.toDateString(),
					range.currentPeriod.endDate.toDateString()
				)
			)
		})
		.from(vote)
		.limit(1);
	const today = getNowTZ();
	const votesToday = await db
		.select({
			voteCount: db.$count(
				vote,
				between(vote.createdAt, startOfDay(today).toDateString(), endOfDay(today).toDateString())
			)
		})
		.from(vote)
		.limit(1);

	return json({ votesThisPeriod: votes[0].voteCount, votesToday: votesToday[0].voteCount });
}
