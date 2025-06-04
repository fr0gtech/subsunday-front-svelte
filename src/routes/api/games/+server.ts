import { db } from '$lib/server/db';
import { game, vote } from '$lib/server/db/schema';
import { getDateRange } from '$lib/utils';
import { json } from '@sveltejs/kit';
import { and, asc, between, desc, eq, sql } from 'drizzle-orm';

const amoutPerPage = 5;
const maxItems = 50;

export async function GET({ url }: { url: URL }) {
	const page = parseInt(url.searchParams.get('page') as string);
	const range = getDateRange();
	if (maxItems <= page * amoutPerPage) return json({ hasMore: false, games: [] });
	const games = await db
		.select({
			id: game.id,
			steamId: game.steamId,
			name: game.name,
			picture: game.picture,
			categories: game.categories,
			price: game.price,
			voteCount: sql<number>`COUNT(${vote.id})`.as('voteCount')
		})
		.from(game)
		.innerJoin(
			vote,
			and(
				eq(vote.forId, game.id),
				between(
					vote.createdAt,
					range.currentPeriod.startDate.toDateString(),
					range.currentPeriod.endDate.toDateString()
				)
			)
		)
		.groupBy(game.id)
		.orderBy(desc(sql`COUNT(${vote.id})`), asc(game.name))
		.offset(page * amoutPerPage)
		.limit(amoutPerPage);

	return json({ hasMore: games.length === amoutPerPage, games: games });
}
