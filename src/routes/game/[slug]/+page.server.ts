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
			categories: game.categories
		})
		.from(game)
		.where(eq(game.id, parseInt(params.slug)))
		.limit(1);

	if (gameOnDb) {
		return gameOnDb[0];
	}

	error(404, 'Not found');
};
