import { error } from '@sveltejs/kit';
import { game } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const load = async ({ params }) => {
	const gameOnDb = await db
		.select({
			name: game.name,
			description: game.description,
			price: game.price,
			detailedDescription: game.detailedDescription,
			recommendations: game.recommendations,
			screenshots: game.screenshots,
			movies: game.movies,
			picture: game.picture,
			steamId: game.steamId,
			categories: game.categories
		})
		.from(game)
		.where(eq(game.id, parseInt(params.slug)))
		.limit(1);

	// const gameOnDb2 = await db.query.game.findFirst({
	// 	where: eq(game.id, parseInt(params.slug))
	// })
	// const votes = await db
	// .select()
	// .from(vote)
	// .where(eq(vote.forId, parseInt(params.slug))) // or eq(vote.gameName, gameOnDb.name)
	// .orderBy(desc(vote.createdAt))
	// .limit(6);

	if (gameOnDb) {
		return {
			gameData: { ...gameOnDb[0], id: params.slug },
			meta: [
				{ name: 'title', content: `Sub-Sunday.com - ${gameOnDb[0].name}` },
				{ name: 'description', content: gameOnDb[0].description }
			]
		};
	}
	error(404, 'Not found');
};
