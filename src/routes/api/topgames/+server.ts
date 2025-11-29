import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user, vote, game } from '$lib/server/db/schema';
import { desc, sql } from 'drizzle-orm';

export async function GET({ url }: { url: URL }) {
	const page = (parseInt(url.searchParams.get('p') as string) - 1) || 0;
	const pageSize = 10
	const games = await db
		.select({
			name: game.name,
			id: game.id,
			voteCount: sql<number>`count(${vote.id})`.as('voteCount'),
			picture: game.picture
		})
		.from(game)
		.leftJoin(vote, sql`${vote.forId} = ${game.id}`)
		.groupBy(game.id)
		.orderBy(desc(sql`count(${vote.id})`))
		.offset(pageSize * page)
		.limit(pageSize);
	
	return json( games );


}
