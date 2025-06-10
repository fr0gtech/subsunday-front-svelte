import { db } from '$lib/server/db';
import { vote } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

export async function GET({ url }: { url: URL }) {
	const game = parseInt(url.searchParams.get('game') as string) || 0;
	let votes;
	if (game > 0) {
		votes = await db.query.vote.findMany({
			where: eq(vote.forId, game),
			with: {
				user: {
					columns: {
						name: true,
						id: true
					}
				},
				game: {
					columns: {
						name: true,
						id: true
					}
				}
			},
			limit: 10,
			orderBy: desc(vote.createdAt)
		});
	} else {
		votes = await db.query.vote.findMany({
			with: {
				user: {
					columns: {
						name: true,
						id: true
					}
				},
				game: {
					columns: {
						name: true,
						id: true
					}
				}
			},
			limit: 10,
			orderBy: desc(vote.createdAt)
		});
	}

	return json({ votes });
}
