import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { game, user, vote } from '$lib/server/db/schema';
import { ilike, sql } from 'drizzle-orm';
import { desc } from 'drizzle-orm';
import { asc } from 'drizzle-orm';
const voteCountExpr = sql<number>`CAST(COUNT(${vote.id}) AS INT)`;

export async function GET({ url }: { url: URL }) {
	const searchParam = url.searchParams.get('q') as string;

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
		.leftJoin(vote, sql`${vote.forId} = ${game.id}`)
		.groupBy(game.id)
		.where(ilike(game.name, `%${searchParam}%`))
		.orderBy(desc(voteCountExpr), asc(game.id))
		.limit(10);
	console.log();

	const users = await db
		.select({
			name: user.name,
			id: user.id,
			voteCount: voteCountExpr.as('voteCount')
		})
		.from(user)
		.leftJoin(vote, sql`${vote.fromId} = ${user.id}`)
		.groupBy(user.id)
		.where(ilike(user.name, `%${searchParam}%`))
		.orderBy(desc(voteCountExpr), asc(user.id))
		.limit(10);

	return json({
		games: games,
		users: users
	});
}
