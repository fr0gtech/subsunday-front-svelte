import { db } from '$lib/server/db';
import { vote } from '$lib/server/db/schema';
import { getDateRange } from '@/utils';
import { json } from '@sveltejs/kit';
import { and, count, gte, lte, sql } from 'drizzle-orm';

type VoteForPeriod = {
	date: Date;
	count: number;
};

export async function GET() {
	const all: VoteForPeriod[] = await getAll(new Date());

	async function getAll(offset: Date, acc?: unknown[]): Promise<VoteForPeriod[]> {
		const range = getDateRange({ offset });
		const data = await db
			.select({ count: count(), date: sql`DATE(${vote.createdAt})`.as('createdAt') })
			.from(vote)
			.where(
				and(
					gte(vote.createdAt, range.currentPeriod.startDate),
					lte(vote.createdAt, range.currentPeriod.endDate)
				)
			)
			.groupBy(sql`DATE(${vote.createdAt})`)
			.orderBy(sql`DATE(${vote.createdAt})`);

		if (data.length > 0) {
			const countForPeriod = data.reduce((acc, e) => acc + e.count, 0);
			const toReturn = {
				date: range.currentPeriod.startDate,
				count: countForPeriod
			};
			return await getAll(range.lastPeriod.startDate, acc ? [...acc, toReturn] : [toReturn]);
		} else {
			return acc as VoteForPeriod[];
		}
	}
	const sorted = all?.sort(
		(a: VoteForPeriod, b: VoteForPeriod) => a.date.getTime() - b.date.getTime()
	);
	return json({ sorted });
}
