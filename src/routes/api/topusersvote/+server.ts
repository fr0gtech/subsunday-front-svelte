import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user, vote } from '$lib/server/db/schema';
import { desc, sql } from 'drizzle-orm';

export async function GET({ url }: { url: URL }) {
	const page = parseInt(url.searchParams.get('p') as string) - 1 || 0;
	const pageSize = 10;
	const topVoters = await db
		.select({
			name: user.name,
			id: user.id,
			voteCount: sql<number>`count(${vote.id})`.as('voteCount')
		})
		.from(user)
		.leftJoin(vote, sql`${vote.fromId} = ${user.id}`)
		.groupBy(user.id)
		.orderBy(desc(sql`count(${vote.id})`))
		.offset(page * pageSize)
		.limit(pageSize);

	return json(topVoters);
}
