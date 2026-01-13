import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function GET({ url }: { url: URL }) {
	const page = parseInt(url.searchParams.get('p') as string) - 1 || 0;
	const pageSize = 10;

	const stream = await db.query.subSundayMoment.findMany({
		with: {
			game: {
				columns: {
					id: true,
					name: true,
					picture: true
				}
			}
		},
		limit: pageSize,
		offset: page * pageSize,
		orderBy: (t, { desc }) => desc(t.durationMilliseconds)
	});

	return json(stream);
}
