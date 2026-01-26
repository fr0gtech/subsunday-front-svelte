import { db } from '@/server/db';

const site = 'https://sub-sunday.com';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const games = await db.query.game.findMany({
		columns: {
			id: true,
			updatedAt: true
		}
	});

	const body = sitemap(games);
	const response = new Response(body);
	response.headers.set('Cache-Control', 'max-age=0, s-maxage=3600');
	response.headers.set('Content-Type', 'application/xml');
	return response;
}

const sitemap = (
	games: { id: number; updatedAt: Date }[]
) => `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
  xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="https://www.w3.org/1999/xhtml"
  xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
>

  ${games
		.map(
			(game) => `
        <url>
          <loc>${site}/game/${game.id}</loc>
          <changefreq>${game.updatedAt.toISOString()}</changefreq>
          <priority>0.5</priority>
        </url>
        `
		)
		.join('')}
</urlset>`;
