import { db } from '$lib/server/db';
import { game, vote } from '$lib/server/db/schema';
import { getDateRange, getNowTZ } from '$lib/utils';
import { json } from '@sveltejs/kit';
import { and, asc, between, desc, eq, sql } from 'drizzle-orm';

const amoutPerPage = 5;
const maxItems = 50;

export async function GET({ url }: { url: URL }) {
	const page = parseInt(url.searchParams.get('page') as string);
	const periodStart = url.searchParams.get('period');
	const range = getDateRange({ offset: periodStart ? new Date(periodStart) : getNowTZ() });
	if (maxItems <= page * amoutPerPage) return json({ hasMore: false, games: [] });
	const voteCountExpr = sql<number>`CAST(COUNT(${vote.id}) AS INT)`;

	const games = await db
		.select({
			id: game.id,
			steamId: game.steamId,
			name: game.name,
			picture: game.picture,
			categories: game.categories,
			price: game.price,
			voteCount: voteCountExpr.as('voteCount')
		})
		.from(game)
		.innerJoin(
			vote,
			and(
				eq(vote.forId, game.id),
				between(vote.createdAt, range.currentPeriod.startDate, range.currentPeriod.endDate)
			)
		)
		.groupBy(game.id)
		.orderBy(desc(voteCountExpr), asc(game.id))
		.offset(page * amoutPerPage)
		.limit(amoutPerPage);
	// cant get this to reliably return ordered data by vote....

	return json({ hasMore: games.length === amoutPerPage, games: games });
}
