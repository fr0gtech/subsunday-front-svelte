import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { subSundayMoment } from '$lib/server/db/schema';
import { and, gte, ne } from 'drizzle-orm';

export async function GET({ url }: { url: URL }) {
	const page = parseInt(url.searchParams.get('p') as string) - 1 || 0;
	const pageSize = 10;

	const stream = await db.query.subSundayStream.findMany({
		with: {
			moments: {
				where: and(
					gte(subSundayMoment.durationMilliseconds, 10000),
					ne(subSundayMoment.description, 'Just Chatting')
				),
				with: {
					game: {
						columns: {
							id: true
						}
					}
				}
			}
		},
		limit: pageSize,
		offset: page * pageSize,
		orderBy: (t, { desc }) => desc(t.publishedAt)
	});

	return json(stream);
}
