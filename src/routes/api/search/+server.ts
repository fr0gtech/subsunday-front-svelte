import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { game, user } from '$lib/server/db/schema';
import { ilike } from 'drizzle-orm';

export async function GET({ url }: { url: URL }) {
	const searchParam = url.searchParams.get('q') as string;

	const games = await db
		.select({
			id: game.id,
			steamId: game.steamId,
			name: game.name,
			picture: game.picture,
			categories: game.categories,
			price: game.price
		})
		.from(game)
		.where(ilike(game.name, `%${searchParam}%`))
		.limit(50);

	const users = await db
		.select({
			name: user.name,
			id: user.id
		})
		.from(user)
		.where(ilike(user.name, `%${searchParam}%`))
		.limit(50);

	return json({
		games: games,
		users: users
	});
}
