import { db } from '$lib/server/db';
import { subSundayMoment, subSundayStream } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { addWeeks, endOfDay, lastDayOfWeek, startOfDay } from 'date-fns';
import { and, gte, lte, ne } from 'drizzle-orm';

export async function GET({ url }: { url: URL }) {
	const period = parseInt(url.searchParams.get('p') as string);
	const sunday = addWeeks(lastDayOfWeek(new Date(period), { weekStartsOn: 1 }), 1);

	const stream = await db.query.subSundayStream.findFirst({
		where: and(
			gte(subSundayStream.publishedAt, startOfDay(sunday)),
			lte(subSundayStream.publishedAt, endOfDay(sunday))
		),
		with: {
			moments: {
				where: and(
					gte(subSundayMoment.durationMilliseconds, 10000),
					ne(subSundayMoment.description, 'Just Chatting')
				),
				with: {
					game: true
				}
			}
		}
	});

	// let votes;
	// if (game > 0) {
	// 	votes = await db.query.vote.findMany({
	// 		where: eq(vote.forId, game),
	// 		with: {
	// 			user: {
	// 				columns: {
	// 					name: true,
	// 					id: true
	// 				}
	// 			},
	// 			game: {
	// 				columns: {
	// 					name: true,
	// 					id: true
	// 				}
	// 			}
	// 		},
	// 		limit: 10,
	// 		orderBy: desc(vote.createdAt)
	// 	});
	// } else {
	// 	votes = await db.query.vote.findMany({
	// 		with: {
	// 			user: {
	// 				columns: {
	// 					name: true,
	// 					id: true
	// 				}
	// 			},
	// 			game: {
	// 				columns: {
	// 					name: true,
	// 					id: true
	// 				}
	// 			}
	// 		},
	// 		limit: 10,
	// 		orderBy: desc(vote.createdAt)
	// 	});
	// }

	return json({ stream });
}
