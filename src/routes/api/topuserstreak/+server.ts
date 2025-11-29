import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export async function GET({ url }: { url: URL }) {
	const page = parseInt(url.searchParams.get('p') as string) - 1 || 0;
	const pageSize = 10;
	const topStreaks = await db
		.select()
		.from(user)
		.orderBy(desc(user.streak))
		.limit(pageSize)
		.offset(pageSize * page);
	return json(topStreaks);
}
